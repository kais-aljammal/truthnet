// TruthNet — Account & billing (Stripe-ready foundation, manual tiers for now)

function BillingNav({
  navigate,
  email
}) {
  return /*#__PURE__*/React.createElement("header", {
    style: {
      borderBottom: `1px solid ${TN.border}`,
      background: TN.bg
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "max-w-5xl mx-auto px-6 py-4 flex items-center justify-between gap-4"
  }, /*#__PURE__*/React.createElement("a", {
    href: "/app",
    onClick: e => {
      e.preventDefault();
      navigate("/app");
    },
    style: {
      fontFamily: "Lora, serif",
      fontWeight: 700,
      fontSize: 20,
      color: TN.ink,
      textDecoration: "none"
    }
  }, "\u2190 Back to app"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "Inter, sans-serif",
      fontSize: 12,
      color: TN.muted
    }
  }, email)));
}
function BillingPage({
  user,
  navigate,
  onLogout
}) {
  const [data, setData] = React.useState(null);
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  const [loadingTier, setLoadingTier] = React.useState(null);
  const [toast, setToast] = React.useState("");
  const [paymentsEnabled, setPaymentsEnabled] = React.useState(false);
  const load = React.useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const b = await fetchBilling();
      setData(b);
    } catch (err) {
      setError(err.message || "Failed to load billing.");
    } finally {
      setLoading(false);
    }
  }, []);
  React.useEffect(() => {
    load();
  }, [load]);
  React.useEffect(() => {
    if (typeof fetchBillingStatus === "function") {
      fetchBillingStatus().then(s => setPaymentsEnabled(!!s.payments_enabled)).catch(() => {});
    }
  }, []);
  const handleSelectTier = async tier => {
    setLoadingTier(tier);
    setToast("");
    try {
      if (tier !== "free" && paymentsEnabled && typeof startCheckout === "function") {
        await startCheckout(tier);
        return;
      }
      const result = await selectTier(tier);
      setToast(result.message || "Plan updated.");
      await load();
    } catch (err) {
      setToast(err.message || "Could not change plan.");
    } finally {
      setLoadingTier(null);
    }
  };
  if (loading) {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        minHeight: "100vh",
        background: TN.bg,
        display: "grid",
        placeItems: "center",
        color: TN.muted
      }
    }, "Loading billing\u2026");
  }
  if (error || !data) {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        minHeight: "100vh",
        background: TN.bg,
        padding: 24
      }
    }, /*#__PURE__*/React.createElement("p", {
      style: {
        color: "var(--v-false-fg)"
      }
    }, error || "Unknown error"), /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "tn-btn-ghost mt-4",
      onClick: () => navigate("/login")
    }, "Log in"));
  }
  const quota = data.quota || {};
  return /*#__PURE__*/React.createElement("div", {
    style: {
      minHeight: "100vh",
      background: TN.bg,
      color: TN.ink
    }
  }, /*#__PURE__*/React.createElement(BillingNav, {
    navigate: navigate,
    email: data.email
  }), /*#__PURE__*/React.createElement("main", {
    className: "max-w-5xl mx-auto px-6 py-10"
  }, /*#__PURE__*/React.createElement(SectionLabel, null, "Account"), /*#__PURE__*/React.createElement("h1", {
    style: {
      fontFamily: "Lora, serif",
      fontWeight: 700,
      fontSize: 32,
      marginTop: 8
    }
  }, "Plan & billing"), /*#__PURE__*/React.createElement("p", {
    className: "mt-2",
    style: {
      fontFamily: "Inter, sans-serif",
      fontSize: 14,
      color: TN.ink2,
      maxWidth: 560
    }
  }, "Manage your subscription tier and daily fact-check allowance. Payment processing will connect here later \u2014 for now you can preview any plan."), toast && /*#__PURE__*/React.createElement("div", {
    className: "mt-6 p-4 tn-fade-up",
    style: {
      background: TN.surfaceSoft,
      border: `1px solid ${TN.border}`,
      fontFamily: "Inter, sans-serif",
      fontSize: 13,
      color: TN.ink2
    }
  }, toast), /*#__PURE__*/React.createElement("div", {
    className: "mt-10 grid md:grid-cols-2 gap-6"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: TN.surface,
      border: `1px solid ${TN.border}`,
      padding: "24px 22px"
    }
  }, /*#__PURE__*/React.createElement(SectionLabel, {
    className: "mb-3"
  }, "Current plan"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "Lora, serif",
      fontSize: 28,
      fontWeight: 700
    }
  }, data.tier_name), /*#__PURE__*/React.createElement("p", {
    className: "mt--2",
    style: {
      fontFamily: "JetBrains Mono, monospace",
      fontSize: 13,
      color: TN.ink2
    }
  }, quota.limit, " checks / day \xB7 ", data.subscription_status), data.billing_mode === "manual" && /*#__PURE__*/React.createElement("p", {
    className: "mt-4",
    style: {
      fontFamily: "Inter, sans-serif",
      fontSize: 12,
      color: TN.muted,
      lineHeight: 1.5
    }
  }, "Preview mode \u2014 no charges until Stripe is connected. Select a plan below to test tier limits."), data.stripe_connected ? /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "tn-btn-ghost mt-4",
    onClick: () => openBillingPortal && openBillingPortal()
  }, "Manage subscription in Stripe \u2192") : /*#__PURE__*/React.createElement("div", {
    className: "mt-4 px-3 py-2",
    style: {
      fontFamily: "Inter, sans-serif",
      fontSize: 11,
      color: TN.muted,
      background: TN.surfaceSoft,
      border: `1px dashed ${TN.border}`
    }
  }, "Stripe: not connected \xB7 Card payments coming soon")), /*#__PURE__*/React.createElement("div", {
    style: {
      background: TN.surface,
      border: `1px solid ${TN.border}`,
      padding: "24px 22px"
    }
  }, /*#__PURE__*/React.createElement(SectionLabel, {
    className: "mb-3"
  }, "Today's usage"), /*#__PURE__*/React.createElement(UsageMeter, {
    quota: {
      ...quota,
      tier_name: data.tier_name
    }
  }), /*#__PURE__*/React.createElement("p", {
    className: "mt-6",
    style: {
      fontFamily: "Inter, sans-serif",
      fontSize: 12,
      color: TN.muted
    }
  }, "Lifetime checks: ", data.lifetime_checks))), /*#__PURE__*/React.createElement("div", {
    className: "mt-10",
    style: {
      background: TN.surface,
      border: `1px solid ${TN.border}`,
      padding: "24px 22px"
    }
  }, /*#__PURE__*/React.createElement(SectionLabel, {
    className: "mb-2"
  }, "Last 7 days"), /*#__PURE__*/React.createElement(UsageHistoryChart, {
    history: data.usage_history,
    limit: quota.limit
  })), /*#__PURE__*/React.createElement(Rule, null), /*#__PURE__*/React.createElement(H2, {
    num: "\xA7"
  }, "Choose your plan"), /*#__PURE__*/React.createElement("p", {
    className: "mt-3 mb-8",
    style: {
      fontFamily: "Inter, sans-serif",
      fontSize: 13,
      color: TN.muted
    }
  }, "Daily limits reset at midnight UTC. Only successful fact-checks count toward your quota."), /*#__PURE__*/React.createElement(PricingGrid, {
    plans: data.plans,
    currentTier: data.tier,
    onSelect: handleSelectTier,
    loadingTier: loadingTier
  }), /*#__PURE__*/React.createElement("div", {
    className: "mt-10 flex flex-wrap gap-4"
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "tn-btn-primary",
    onClick: () => navigate("/app")
  }, "Open fact-checker \u2192"), onLogout && /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "tn-btn-ghost",
    onClick: onLogout
  }, "Log out"))));
}
window.BillingPage = BillingPage;
