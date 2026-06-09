// TruthNet — Shared pricing / plan components

function formatPrice(plan) {
  if (plan.price_usd === 0) return "$0";
  return plan.price_label || `$${plan.price_usd.toFixed(2)}/mo`;
}

function PricingGrid({ plans, currentTier, onSelect, loadingTier, compact, ctaLabel }) {
  if (!plans || !plans.length) return null;

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 ${compact ? "xl:grid-cols-2" : "xl:grid-cols-4"} gap-px`}
         style={{ background: TN.border }}>
      {plans.map((plan) => {
        const isCurrent = currentTier === plan.tier;
        const isLoading = loadingTier === plan.tier;
        const highlight = plan.highlight && !compact;

        return (
          <div key={plan.tier} style={{
            background: TN.surface,
            padding: compact ? "20px 18px" : "24px 20px",
            border: highlight ? `2px solid ${TN.ink}` : undefined,
            position: "relative",
          }}>
            {highlight && (
              <span style={{
                position: "absolute", top: 12, right: 12,
                fontFamily: "Inter, sans-serif", fontSize: 9, letterSpacing: "0.14em",
                textTransform: "uppercase", color: TN.accent, fontWeight: 600,
              }}>Recommended</span>
            )}
            {isCurrent && (
              <span style={{
                position: "absolute", top: 12, left: 12,
                fontFamily: "Inter, sans-serif", fontSize: 9, letterSpacing: "0.14em",
                textTransform: "uppercase", color: "var(--v-true-fg)", fontWeight: 600,
                padding: "2px 6px", background: "var(--v-true-bg)",
              }}>Current</span>
            )}
            <SectionLabel>{plan.name}</SectionLabel>
            <div className="mt-2" style={{ fontFamily: "Lora, serif", fontSize: compact ? 24 : 28, fontWeight: 700 }}>
              {formatPrice(plan)}
            </div>
            {plan.tagline && (
              <p className="mt-1" style={{ fontFamily: "Inter, sans-serif", fontSize: 12, color: TN.muted }}>
                {plan.tagline}
              </p>
            )}
            <p className="mt-3" style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 12, color: TN.ink2 }}>
              {plan.daily_limit} questions / day
            </p>
            <ul className="mt-4 space-y-2 mb-6" style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: TN.ink2, lineHeight: 1.45 }}>
              {(plan.features || []).map((f) => <li key={f}>· {f}</li>)}
            </ul>
            {onSelect && (
              <button
                type="button"
                disabled={isCurrent || isLoading}
                onClick={() => onSelect(plan.tier)}
                className={highlight ? "tn-btn-primary w-full" : "tn-btn-ghost w-full"}
              >
                {isLoading ? "Updating…" : isCurrent ? "Current plan" : ctaLabel || (plan.tier === "free" ? "Downgrade to Free" : "Select plan")}
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}

window.PricingGrid = PricingGrid;
window.formatPrice = formatPrice;
