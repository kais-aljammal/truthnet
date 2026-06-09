// TruthNet — Shared pricing / plan components

function formatPrice(plan) {
  if (plan.price_usd === 0) return "$0";
  return plan.price_label || `$${plan.price_usd.toFixed(2)}/mo`;
}
function PricingGrid({
  plans,
  currentTier,
  onSelect,
  loadingTier,
  compact,
  ctaLabel
}) {
  if (!plans || !plans.length) return null;
  return /*#__PURE__*/React.createElement("div", {
    className: `grid grid-cols-1 sm:grid-cols-2 ${compact ? "xl:grid-cols-2" : "xl:grid-cols-4"} gap-px`,
    style: {
      background: TN.border
    }
  }, plans.map(plan => {
    const isCurrent = currentTier === plan.tier;
    const isLoading = loadingTier === plan.tier;
    const highlight = plan.highlight && !compact;
    return /*#__PURE__*/React.createElement("div", {
      key: plan.tier,
      style: {
        background: TN.surface,
        padding: compact ? "20px 18px" : "24px 20px",
        border: highlight ? `2px solid ${TN.ink}` : undefined,
        position: "relative"
      }
    }, highlight && /*#__PURE__*/React.createElement("span", {
      style: {
        position: "absolute",
        top: 12,
        right: 12,
        fontFamily: "Inter, sans-serif",
        fontSize: 9,
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        color: TN.accent,
        fontWeight: 600
      }
    }, "Recommended"), isCurrent && /*#__PURE__*/React.createElement("span", {
      style: {
        position: "absolute",
        top: 12,
        left: 12,
        fontFamily: "Inter, sans-serif",
        fontSize: 9,
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        color: "var(--v-true-fg)",
        fontWeight: 600,
        padding: "2px 6px",
        background: "var(--v-true-bg)"
      }
    }, "Current"), /*#__PURE__*/React.createElement(SectionLabel, null, plan.name), /*#__PURE__*/React.createElement("div", {
      className: "mt-2",
      style: {
        fontFamily: "Lora, serif",
        fontSize: compact ? 24 : 28,
        fontWeight: 700
      }
    }, formatPrice(plan)), plan.tagline && /*#__PURE__*/React.createElement("p", {
      className: "mt-1",
      style: {
        fontFamily: "Inter, sans-serif",
        fontSize: 12,
        color: TN.muted
      }
    }, plan.tagline), /*#__PURE__*/React.createElement("p", {
      className: "mt-3",
      style: {
        fontFamily: "JetBrains Mono, monospace",
        fontSize: 12,
        color: TN.ink2
      }
    }, plan.daily_limit, " questions / day"), /*#__PURE__*/React.createElement("ul", {
      className: "mt-4 space-y-2 mb-6",
      style: {
        fontFamily: "Inter, sans-serif",
        fontSize: 13,
        color: TN.ink2,
        lineHeight: 1.45
      }
    }, (plan.features || []).map(f => /*#__PURE__*/React.createElement("li", {
      key: f
    }, "\xB7 ", f))), onSelect && /*#__PURE__*/React.createElement("button", {
      type: "button",
      disabled: isCurrent || isLoading,
      onClick: () => onSelect(plan.tier),
      className: highlight ? "tn-btn-primary w-full" : "tn-btn-ghost w-full"
    }, isLoading ? "Updating…" : isCurrent ? "Current plan" : ctaLabel || (plan.tier === "free" ? "Downgrade to Free" : "Select plan")));
  }));
}
window.PricingGrid = PricingGrid;
window.formatPrice = formatPrice;
