// TruthNet — Quota display, usage meter, upgrade prompts

function UsageMeter({ quota, size }) {
  if (!quota || quota.exempt) return null;
  const { used, limit, tier, tier_name } = quota;
  const pct = limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 0;
  const warn = quota.remaining <= 1;
  const empty = quota.remaining <= 0;

  return (
    <div style={{ width: size === "sm" ? "100%" : "100%", maxWidth: size === "sm" ? 280 : 480 }}>
      <div className="flex justify-between items-baseline mb-2">
        <span style={{ fontFamily: "Inter, sans-serif", fontSize: 11, color: TN.muted, letterSpacing: "0.08em", textTransform: "uppercase" }}>
          Today&apos;s usage
        </span>
        <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 12, color: empty ? "var(--v-false-fg)" : TN.ink }}>
          {used} / {limit}
        </span>
      </div>
      <div style={{ height: 8, background: TN.borderSoft, border: `1px solid ${TN.border}`, overflow: "hidden" }}>
        <div style={{
          height: "100%",
          width: `${pct}%`,
          background: empty ? "var(--v-false-fg)" : warn ? "var(--v-warn-fg)" : TN.accent,
          transition: "width 0.35s ease",
        }} />
      </div>
      <p className="mt-2" style={{ fontFamily: "Inter, sans-serif", fontSize: 11, color: TN.muted }}>
        {tier_name || tier} plan · resets {new Date(quota.resets_at).toLocaleString("en-US", { timeZone: "UTC", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit", timeZoneName: "short" })}
      </p>
    </div>
  );
}

function QuotaBadge({ quota, onClick }) {
  if (!quota || quota.exempt) return null;

  const { remaining, limit } = quota;
  const warn = remaining <= 1;
  const empty = remaining <= 0;

  const inner = (
    <span
      title="View plan & billing"
      style={{
        fontFamily: "Inter, sans-serif",
        fontSize: 11,
        letterSpacing: "0.06em",
        padding: "4px 10px",
        border: `1px solid ${empty ? "var(--v-false-fg)" : warn ? "var(--v-warn-fg)" : TN.border}`,
        background: empty ? "var(--v-false-bg)" : warn ? "var(--v-warn-bg)" : TN.surfaceSoft,
        color: empty ? "var(--v-false-fg)" : warn ? "var(--v-warn-fg)" : TN.ink2,
        whiteSpace: "nowrap",
        cursor: onClick ? "pointer" : "default",
      }}
    >
      {empty ? "0 left today" : `${remaining} / ${limit} left today`}
    </span>
  );

  if (onClick) {
    return <button type="button" onClick={onClick} style={{ background: "none", border: "none", padding: 0 }}>{inner}</button>;
  }
  return inner;
}

function QuotaExceededBanner({ quota, onUpgrade, onCheckout }) {
  if (!quota || quota.exempt || quota.remaining > 0) return null;

  const handleUpgrade = () => {
    if (onCheckout) {
      onCheckout("standard");
      return;
    }
    if (onUpgrade) onUpgrade();
  };

  return (
    <div className="my-6 tn-fade-up" style={{
      background: "var(--v-false-bg)",
      border: `1px solid color-mix(in srgb, var(--v-false-fg) 35%, transparent)`,
      padding: "18px 20px",
    }}>
      <SectionLabel className="mb-2">Daily limit reached</SectionLabel>
      <p style={{ fontFamily: "Lora, serif", fontSize: 16, color: "var(--v-false-fg)", marginBottom: 6 }}>
        You&apos;ve used all {quota.limit} fact-checks on your {quota.tier_name || quota.tier} plan today.
      </p>
      <p style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: TN.ink2, marginBottom: 12 }}>
        Upgrade for a higher daily limit, or wait until midnight UTC.
      </p>
      <button type="button" onClick={handleUpgrade} className="tn-btn-primary">
        {onCheckout ? "Upgrade with Stripe →" : "View plans & upgrade →"}
      </button>
    </div>
  );
}

function UsageHistoryChart({ history, limit }) {
  if (!history || !history.length) return null;
  const max = Math.max(limit || 1, ...history.map((h) => h.count), 1);

  return (
    <div className="flex items-end gap-2" style={{ height: 120 }}>
      {history.map((day) => {
        const h = Math.max(4, Math.round((day.count / max) * 100));
        const label = new Date(day.date + "T12:00:00Z").toLocaleDateString("en-US", { weekday: "short" });
        return (
          <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
            <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 10, color: TN.muted }}>{day.count}</span>
            <div style={{
              width: "100%", maxWidth: 36, height: `${h}%`, minHeight: 4,
              background: day.count > 0 ? TN.accent : TN.borderSoft,
              border: `1px solid ${TN.border}`,
            }} />
            <span style={{ fontFamily: "Inter, sans-serif", fontSize: 9, color: TN.muted }}>{label}</span>
          </div>
        );
      })}
    </div>
  );
}

async function fetchQuota() {
  const res = await fetch("/api/me/quota", { credentials: "include" });
  if (!res.ok) return null;
  return res.json();
}

async function fetchBilling() {
  const res = await fetch("/api/billing/me", { credentials: "include" });
  if (!res.ok) throw new Error("Could not load billing info.");
  return res.json();
}

async function selectTier(tier) {
  const res = await fetch("/api/billing/select-tier", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tier }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data.detail?.message || data.detail || data.message || "Could not update plan.";
    throw new Error(typeof msg === "string" ? msg : JSON.stringify(msg));
  }
  return data;
}

async function fetchBillingStatus() {
  const res = await fetch("/api/billing/status", { credentials: "include" });
  if (!res.ok) return { payments_enabled: false, billing_mode: "manual" };
  return res.json();
}

async function startCheckout(tier) {
  const res = await fetch("/api/billing/checkout", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tier }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const inner = data.detail || data;
    const msg = inner.message || inner.detail || "Could not start checkout.";
    throw new Error(typeof msg === "string" ? msg : JSON.stringify(msg));
  }
  if (data.url) {
    window.location.href = data.url;
    return data;
  }
  throw new Error("Checkout URL missing from server response.");
}

async function openBillingPortal() {
  const res = await fetch("/api/billing/portal", {
    method: "POST",
    credentials: "include",
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.detail || "Could not open billing portal.");
  }
  if (data.url) {
    window.location.href = data.url;
    return data;
  }
  throw new Error("Portal URL missing from server response.");
}

/** Poll quota after Stripe return until tier updates or timeout. */
async function pollQuotaAfterPayment(maxMs = 30000, intervalMs = 2000) {
  const start = Date.now();
  let last = null;
  while (Date.now() - start < maxMs) {
    last = await fetchQuota();
    if (last && !last.exempt && last.tier && last.tier !== "free") {
      return last;
    }
    await new Promise((r) => setTimeout(r, intervalMs));
  }
  return last;
}

window.UsageMeter = UsageMeter;
window.QuotaBadge = QuotaBadge;
window.QuotaExceededBanner = QuotaExceededBanner;
window.UsageHistoryChart = UsageHistoryChart;
window.fetchQuota = fetchQuota;
window.fetchBilling = fetchBilling;
window.fetchBillingStatus = fetchBillingStatus;
window.selectTier = selectTier;
window.startCheckout = startCheckout;
window.openBillingPortal = openBillingPortal;
window.pollQuotaAfterPayment = pollQuotaAfterPayment;
