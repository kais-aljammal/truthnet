// TruthNet — Account & billing (Stripe-ready foundation, manual tiers for now)

function BillingNav({ navigate, email }) {
  return (
    <header style={{ borderBottom: `1px solid ${TN.border}`, background: TN.bg }}>
      <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
        <a href="/app" onClick={(e) => { e.preventDefault(); navigate("/app"); }}
           style={{ fontFamily: "Lora, serif", fontWeight: 700, fontSize: 20, color: TN.ink, textDecoration: "none" }}>
          ← Back to app
        </a>
        <span style={{ fontFamily: "Inter, sans-serif", fontSize: 12, color: TN.muted }}>{email}</span>
      </div>
    </header>
  );
}

function BillingPage({ user, navigate, onLogout }) {
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

  React.useEffect(() => { load(); }, [load]);

  React.useEffect(() => {
    if (typeof fetchBillingStatus === "function") {
      fetchBillingStatus().then((s) => setPaymentsEnabled(!!s.payments_enabled)).catch(() => {});
    }
  }, []);

  const handleSelectTier = async (tier) => {
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
    return (
      <div style={{ minHeight: "100vh", background: TN.bg, display: "grid", placeItems: "center", color: TN.muted }}>
        Loading billing…
      </div>
    );
  }

  if (error || !data) {
    return (
      <div style={{ minHeight: "100vh", background: TN.bg, padding: 24 }}>
        <p style={{ color: "var(--v-false-fg)" }}>{error || "Unknown error"}</p>
        <button type="button" className="tn-btn-ghost mt-4" onClick={() => navigate("/login")}>Log in</button>
      </div>
    );
  }

  const quota = data.quota || {};

  return (
    <div style={{ minHeight: "100vh", background: TN.bg, color: TN.ink }}>
      <BillingNav navigate={navigate} email={data.email} />

      <main className="max-w-5xl mx-auto px-6 py-10">
        <SectionLabel>Account</SectionLabel>
        <h1 style={{ fontFamily: "Lora, serif", fontWeight: 700, fontSize: 32, marginTop: 8 }}>
          Plan & billing
        </h1>
        <p className="mt-2" style={{ fontFamily: "Inter, sans-serif", fontSize: 14, color: TN.ink2, maxWidth: 560 }}>
          Manage your subscription tier and daily fact-check allowance. Payment processing will connect here later — for now you can preview any plan.
        </p>

        {toast && (
          <div className="mt-6 p-4 tn-fade-up" style={{
            background: TN.surfaceSoft, border: `1px solid ${TN.border}`,
            fontFamily: "Inter, sans-serif", fontSize: 13, color: TN.ink2,
          }}>{toast}</div>
        )}

        {/* Current plan summary */}
        <div className="mt-10 grid md:grid-cols-2 gap-6">
          <div style={{ background: TN.surface, border: `1px solid ${TN.border}`, padding: "24px 22px" }}>
            <SectionLabel className="mb-3">Current plan</SectionLabel>
            <div style={{ fontFamily: "Lora, serif", fontSize: 28, fontWeight: 700 }}>{data.tier_name}</div>
            <p className="mt--2" style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 13, color: TN.ink2 }}>
              {quota.limit} checks / day · {data.subscription_status}
            </p>
            {data.billing_mode === "manual" && (
              <p className="mt-4" style={{ fontFamily: "Inter, sans-serif", fontSize: 12, color: TN.muted, lineHeight: 1.5 }}>
                Preview mode — no charges until Stripe is connected. Select a plan below to test tier limits.
              </p>
            )}
            {data.stripe_connected ? (
              <button type="button" className="tn-btn-ghost mt-4" onClick={() => openBillingPortal && openBillingPortal()}>
                Manage subscription in Stripe →
              </button>
            ) : (
              <div className="mt-4 px-3 py-2" style={{
                fontFamily: "Inter, sans-serif", fontSize: 11, color: TN.muted,
                background: TN.surfaceSoft, border: `1px dashed ${TN.border}`,
              }}>
                Stripe: not connected · Card payments coming soon
              </div>
            )}
          </div>

          <div style={{ background: TN.surface, border: `1px solid ${TN.border}`, padding: "24px 22px" }}>
            <SectionLabel className="mb-3">Today&apos;s usage</SectionLabel>
            <UsageMeter quota={{ ...quota, tier_name: data.tier_name }} />
            <p className="mt-6" style={{ fontFamily: "Inter, sans-serif", fontSize: 12, color: TN.muted }}>
              Lifetime checks: {data.lifetime_checks}
            </p>
          </div>
        </div>

        {/* 7-day chart */}
        <div className="mt-10" style={{ background: TN.surface, border: `1px solid ${TN.border}`, padding: "24px 22px" }}>
          <SectionLabel className="mb-2">Last 7 days</SectionLabel>
          <UsageHistoryChart history={data.usage_history} limit={quota.limit} />
        </div>

        <Rule />

        {/* Plan picker */}
        <H2 num="§">Choose your plan</H2>
        <p className="mt-3 mb-8" style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: TN.muted }}>
          Daily limits reset at midnight UTC. Only successful fact-checks count toward your quota.
        </p>

        <PricingGrid
          plans={data.plans}
          currentTier={data.tier}
          onSelect={handleSelectTier}
          loadingTier={loadingTier}
        />

        <div className="mt-10 flex flex-wrap gap-4">
          <button type="button" className="tn-btn-primary" onClick={() => navigate("/app")}>
            Open fact-checker →
          </button>
          {onLogout && (
            <button type="button" className="tn-btn-ghost" onClick={onLogout}>Log out</button>
          )}
        </div>
      </main>
    </div>
  );
}

window.BillingPage = BillingPage;
