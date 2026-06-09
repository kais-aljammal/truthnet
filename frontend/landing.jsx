// TruthNet — Marketing landing page

function LandingNav({ user, navigate }) {
  const loggedIn = user && user.email !== "__guest__@truthnet.local";
  return (
    <header style={{ borderBottom: `1px solid ${TN.border}`, background: TN.bg, position: "sticky", top: 0, zIndex: 50 }}>
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
        <a href="/" onClick={(e) => { e.preventDefault(); navigate("/"); }}
           style={{ fontFamily: "Lora, serif", fontWeight: 700, fontSize: 22, color: TN.ink, textDecoration: "none" }}>
          TruthNet
        </a>
        <nav className="flex items-center gap-3 flex-wrap justify-end">
          {loggedIn ? (
            <>
              <span style={{ fontFamily: "Inter, sans-serif", fontSize: 12, color: TN.muted }}>{user.email}</span>
              <button onClick={() => navigate("/app")} className="tn-btn-primary">Open app</button>
            </>
          ) : (
            <>
              <button onClick={() => navigate("/login")} className="tn-btn-ghost">Log in</button>
              <button onClick={() => navigate("/signup")} className="tn-btn-primary">Get started</button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

function LandingPage({ user, navigate }) {
  const [plans, setPlans] = React.useState([]);
  const [paymentsEnabled, setPaymentsEnabled] = React.useState(false);

  React.useEffect(() => {
    fetch("/api/billing/plans")
      .then((r) => r.json())
      .then((d) => setPlans(d.plans || []))
      .catch(() => {});
    if (typeof fetchBillingStatus === "function") {
      fetchBillingStatus().then((s) => setPaymentsEnabled(!!s.payments_enabled)).catch(() => {});
    }
  }, []);

  const handlePlanCta = async (tier) => {
    if (!user) {
      navigate("/signup");
      return;
    }
    if (tier === "free") {
      navigate("/billing");
      return;
    }
    if (paymentsEnabled && typeof startCheckout === "function") {
      try {
        await startCheckout(tier);
      } catch (err) {
        alert(err.message || "Checkout failed.");
      }
      return;
    }
    navigate("/billing");
  };

  return (
    <div style={{ minHeight: "100vh", background: TN.bg, color: TN.ink }}>
      <LandingNav user={user} navigate={navigate} />

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 py-16 md:py-24 tn-fade-up">
        <SectionLabel>Claim-level fact-checking</SectionLabel>
        <h1 className="mt-4" style={{
          fontFamily: "Lora, serif", fontWeight: 700, fontSize: "clamp(2.2rem, 5vw, 3.5rem)",
          lineHeight: 1.08, letterSpacing: "-0.02em", maxWidth: 720,
        }}>
          Real-time verdicts on any claim — sourced, adversarial, in ~30 seconds.
        </h1>
        <p className="mt-6" style={{ fontFamily: "Inter, sans-serif", fontSize: 18, lineHeight: 1.6, color: TN.ink2, maxWidth: 560 }}>
          TruthNet puts your headline on trial. Four independent AI agents gather evidence,
          argue prosecution and defense, and deliver a transparent judgment with confidence scores and citations.
        </p>
        <div className="mt-10 flex flex-wrap gap-4">
          <button onClick={() => navigate(user ? "/app" : "/signup")} className="tn-btn-primary tn-btn-lg">
            {user ? "Open fact-checker →" : "Get started free →"}
          </button>
          <button onClick={() => navigate("/login")} className="tn-btn-ghost tn-btn-lg">Log in</button>
        </div>
        <p className="mt-6" style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 11, color: TN.muted }}>
          Median judgment time · 16–30s · Powered by Gemini 3 + Google Fact Check
        </p>
      </section>

      <Rule className="max-w-6xl mx-auto" />

      {/* Problem */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <H2 num="I">The problem</H2>
        <div className="mt-8 grid md:grid-cols-2 gap-10">
          <div>
            <p style={{ fontFamily: "Lora, serif", fontSize: 17, lineHeight: 1.65, color: TN.ink }}>
              Misinformation spreads claim-by-claim — a headline, a tweet, a viral post.
              Outlet-level fact-checkers publish weekly; by then the damage is done.
            </p>
            <p className="mt-4" style={{ fontFamily: "Inter, sans-serif", fontSize: 14, lineHeight: 1.6, color: TN.ink2 }}>
              59% of adults encounter misleading news weekly. Tools built for publishers
              don&apos;t help the individual who needs an answer <em>now</em>.
            </p>
          </div>
          <div style={{ background: TN.surface, border: `1px solid ${TN.border}`, padding: "24px 28px" }}>
            <SectionLabel>TruthNet difference</SectionLabel>
            <ul className="mt-4 space-y-3" style={{ fontFamily: "Inter, sans-serif", fontSize: 14, color: TN.ink2, lineHeight: 1.55 }}>
              <li>✓ Paste <strong>any</strong> claim — not just pre-selected articles</li>
              <li>✓ Adversarial agents argue both sides before verdict</li>
              <li>✓ Live pipeline with sourced references</li>
              <li>✓ Confidence score + manipulation detection</li>
            </ul>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-6xl mx-auto px-6 py-16" style={{ background: TN.surfaceSoft, borderTop: `1px solid ${TN.borderSoft}`, borderBottom: `1px solid ${TN.borderSoft}` }}>
        <H2 num="II">How it works</H2>
        <p className="mt-4 mb-8" style={{ fontFamily: "Inter, sans-serif", fontSize: 14, color: TN.ink2, maxWidth: 520 }}>
          A courtroom for claims. Agent A gathers sources; Agents B and C prosecute and defend in parallel;
          Agent D renders the final judgment.
        </p>
        <TruthNetDiagram />
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <H2 num="III">Features</H2>
        <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-px" style={{ background: TN.border }}>
          {[
            { t: "Confidence score", d: "Calibrated 0–100% with transparent error margins." },
            { t: "Source citations", d: "Retrieved documents weighed and linked in the verdict." },
            { t: "Manipulation flags", d: "Detects appeal to authority, false causation, and more." },
            { t: "Live pipeline", d: "Watch agents progress in real time via SSE streaming." },
          ].map((f) => (
            <div key={f.t} style={{ background: TN.surface, padding: "22px 20px" }}>
              <div style={{ fontFamily: "Lora, serif", fontWeight: 600, fontSize: 17, color: TN.ink }}>{f.t}</div>
              <p className="mt-2" style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: TN.ink2, lineHeight: 1.5 }}>{f.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Trust */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <H2 num="IV">Trust & transparency</H2>
        <blockquote className="mt-8" style={{
          borderLeft: `3px solid ${TN.accent}`, padding: "20px 24px", background: TN.surfaceSoft,
          fontFamily: "Lora, serif", fontStyle: "italic", fontSize: 18, lineHeight: 1.55, color: TN.ink,
        }}>
          We don&apos;t claim 100% accuracy. Every verdict shows confidence, sources, and what we
          could not verify. TruthNet is a judgment protocol — not an oracle.
        </blockquote>
        <p className="mt-6" style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: TN.muted }}>
          Production stack: Gemini 3 Flash agents with Google Search grounding and Google Fact Check API pre-search.
        </p>
      </section>

      {/* Pricing */}
      <section id="pricing" className="max-w-6xl mx-auto px-6 py-16 scroll-mt-8" style={{ borderTop: `1px solid ${TN.border}` }}>
        <H2 num="V">Choose your plan</H2>
        <p className="mt-3" style={{ fontFamily: "Inter, sans-serif", fontSize: 14, color: TN.muted }}>
          Daily limits reset at midnight UTC. Successful fact-checks only.
          {paymentsEnabled ? " Paid plans use Stripe Checkout." : " Preview any tier free until Stripe is connected."}
        </p>
        <div className="mt-10">
          <PricingGrid
            plans={plans}
            onSelect={handlePlanCta}
            ctaLabel={
              paymentsEnabled
                ? (user ? "Subscribe" : "Get started")
                : (user ? "Manage plan" : "Get started")
            }
          />
        </div>
      </section>

      <LandingFooter navigate={navigate} />
    </div>
  );
}

function LandingFooter({ navigate }) {
  return (
    <footer style={{ borderTop: `1px solid ${TN.border}`, background: TN.surface }}>
      <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col md:flex-row justify-between gap-6">
        <div>
          <div style={{ fontFamily: "Lora, serif", fontWeight: 700, fontSize: 18 }}>TruthNet</div>
          <p className="mt-2" style={{ fontFamily: "Inter, sans-serif", fontSize: 12, color: TN.muted }}>
            © {new Date().getFullYear()} TruthNet · An open judgment protocol
          </p>
        </div>
        <div className="flex gap-6" style={{ fontFamily: "Inter, sans-serif", fontSize: 12 }}>
          <a href="/privacy" onClick={(e) => { e.preventDefault(); navigate("/privacy"); }}>Privacy</a>
          <a href="/terms" onClick={(e) => { e.preventDefault(); navigate("/terms"); }}>Terms</a>
          <a href="/app" onClick={(e) => { e.preventDefault(); navigate("/app"); }}>App</a>
        </div>
      </div>
    </footer>
  );
}

window.LandingPage = LandingPage;
