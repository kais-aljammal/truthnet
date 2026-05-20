from __future__ import annotations

import logging
from datetime import datetime, timezone
from typing import Any

import stripe
from sqlalchemy.orm import Session

from .database import User
from .stripe_config import STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, tier_for_price_id

logger = logging.getLogger("truthnet.stripe")

if STRIPE_SECRET_KEY:
    stripe.api_key = STRIPE_SECRET_KEY


def _period_end(subscription: dict[str, Any]) -> datetime | None:
    raw = subscription.get("current_period_end")
    if not raw:
        return None
    return datetime.fromtimestamp(int(raw), tz=timezone.utc)


def _subscription_tier(subscription: dict[str, Any]) -> str | None:
    items = subscription.get("items", {}).get("data") or []
    if not items:
        return None
    price = items[0].get("price") or {}
    price_id = price.get("id") or items[0].get("price")
    if isinstance(price_id, dict):
        price_id = price_id.get("id")
    return tier_for_price_id(str(price_id or ""))


def _apply_subscription(user: User, subscription: dict[str, Any], db: Session) -> None:
    status = subscription.get("status") or "active"
    tier = _subscription_tier(subscription)
    customer_id = subscription.get("customer")
    sub_id = subscription.get("id")

    if customer_id:
        user.stripe_customer_id = str(customer_id)
    if sub_id:
        user.stripe_subscription_id = str(sub_id)

    user.subscription_status = status
    user.subscription_period_end = _period_end(subscription)

    if status in {"active", "trialing"} and tier:
        user.subscription_tier = tier
    elif status in {"canceled", "unpaid", "incomplete_expired"}:
        user.subscription_tier = "free"
        if status == "canceled":
            user.stripe_subscription_id = None

    db.commit()


def _user_by_customer(db: Session, customer_id: str | None) -> User | None:
    if not customer_id:
        return None
    return db.query(User).filter(User.stripe_customer_id == str(customer_id)).first()


def _user_by_metadata(db: Session, metadata: dict[str, Any] | None) -> User | None:
    if not metadata:
        return None
    raw_id = metadata.get("user_id")
    if not raw_id:
        return None
    try:
        return db.get(User, int(raw_id))
    except (TypeError, ValueError):
        return None


def _event_payload(event: Any) -> tuple[str, dict[str, Any]]:
    if hasattr(event, "type"):
        event_type = str(event.type)
        data_obj = event.data.object if hasattr(event, "data") else {}
    else:
        event_type = str(event.get("type", ""))
        data_obj = (event.get("data") or {}).get("object") or {}
    if hasattr(data_obj, "to_dict"):
        data = data_obj.to_dict()
    elif isinstance(data_obj, dict):
        data = data_obj
    else:
        data = dict(data_obj)
    return event_type, data


def handle_stripe_event(event: Any, db: Session) -> None:
    event_type, data = _event_payload(event)

    if event_type == "checkout.session.completed":
        user = _user_by_metadata(db, data.get("metadata"))
        if user is None:
            user = _user_by_customer(db, data.get("customer"))
        if user is None:
            logger.warning("checkout.session.completed: no user for session %s", data.get("id"))
            return

        if data.get("customer"):
            user.stripe_customer_id = str(data["customer"])
        sub_id = data.get("subscription")
        if sub_id and STRIPE_SECRET_KEY:
            subscription = stripe.Subscription.retrieve(str(sub_id))
            sub_data = subscription.to_dict() if hasattr(subscription, "to_dict") else dict(subscription)
            _apply_subscription(user, sub_data, db)
        else:
            tier = (data.get("metadata") or {}).get("tier")
            if tier:
                user.subscription_tier = tier
                user.subscription_status = "active"
                db.commit()
        return

    if event_type in {
        "customer.subscription.updated",
        "customer.subscription.created",
    }:
        user = _user_by_customer(db, data.get("customer"))
        if user is None:
            logger.warning("%s: unknown customer %s", event_type, data.get("customer"))
            return
        _apply_subscription(user, data, db)
        return

    if event_type == "customer.subscription.deleted":
        user = _user_by_customer(db, data.get("customer"))
        if user is None:
            return
        user.subscription_tier = "free"
        user.subscription_status = "canceled"
        user.stripe_subscription_id = None
        user.subscription_period_end = _period_end(data)
        db.commit()
        return

    if event_type == "invoice.payment_failed":
        user = _user_by_customer(db, data.get("customer"))
        if user is None:
            return
        user.subscription_status = "past_due"
        db.commit()


def verify_and_parse(payload: bytes, sig_header: str | None) -> dict[str, Any]:
    if not STRIPE_WEBHOOK_SECRET:
        raise ValueError("STRIPE_WEBHOOK_SECRET is not configured")
    if not sig_header:
        raise ValueError("Missing Stripe-Signature header")
    return stripe.Webhook.construct_event(payload, sig_header, STRIPE_WEBHOOK_SECRET)
