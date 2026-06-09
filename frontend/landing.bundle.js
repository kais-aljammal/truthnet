// TruthNet — Marketing landing page

function LandingNav({
  user,
  navigate
}) {
  const loggedIn = user && user.email !== "__guest__@truthnet.local";
  return /*#__PURE__*/React.createElement("header", {
    style: {
      borderBottom: `1px solid ${TN.border}`,
      background: TN.bg,
      position: "sticky",
      top: 0,
      zIndex: 50
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "max-w-6xl mx-auto px-6 py-4 flex items-center justify-between gap-4"
  }, /*#__PURE__*/React.createElement("a", {
    href: "/",
    onClick: e => {
      e.preventDefault();
      navigate("/");
    },
    style: {
      fontFamily: "Lora, serif",
      fontWeight: 700,
      fontSize: 22,
      color: TN.ink,
      textDecoration: "none"
    }
  }, "TruthNet"), /*#__PURE__*/React.createElement("nav", {
    className: "flex items-center gap-3 flex-wrap justify-end"
  }, loggedIn ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "Inter, sans-serif",
      fontSize: 12,
      color: TN.muted
    }
  }, user.email), /*#__PURE__*/React.createElement("button", {
    onClick: () => navigate("/app"),
    className: "tn-btn-primary"
  }, "Open app")) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("button", {
    onClick: () => navigate("/login"),
    className: "tn-btn-ghost"
  }, "Log in"), /*#__PURE__*/React.createElement("button", {
    onClick: () => navigate("/signup"),
    className: "tn-btn-primary"
  }, "Get started")))));
}
function LandingPage({
  user,
  navigate
}) {
  const [plans, setPlans] = React.useState([]);
  const [paymentsEnabled, setPaymentsEnabled] = React.useState(false);
  React.useEffect(() => {
    fetch("/api/billing/plans").then(r => r.json()).then(d => setPlans(d.plans || [])).catch(() => {});
    if (typeof fetchBillingStatus === "function") {
      fetchBillingStatus().then(s => setPaymentsEnabled(!!s.payments_enabled)).catch(() => {});
    }
  }, []);
  const handlePlanCta = async tier => {
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
  return /*#__PURE__*/React.createElement("div", {
    style: {
      minHeight: "100vh",
      background: TN.bg,
      color: TN.ink
    }
  }, /*#__PURE__*/React.createElement(LandingNav, {
    user: user,
    navigate: navigate
  }), /*#__PURE__*/React.createElement("section", {
    className: "max-w-6xl mx-auto px-6 py-16 md:py-24 tn-fade-up"
  }, /*#__PURE__*/React.createElement(SectionLabel, null, "Claim-level fact-checking"), /*#__PURE__*/React.createElement("h1", {
    className: "mt-4",
    style: {
      fontFamily: "Lora, serif",
      fontWeight: 700,
      fontSize: "clamp(2.2rem, 5vw, 3.5rem)",
      lineHeight: 1.08,
      letterSpacing: "-0.02em",
      maxWidth: 720
    }
  }, "Real-time verdicts on any claim \u2014 sourced, adversarial, in ~30 seconds."), /*#__PURE__*/React.createElement("p", {
    className: "mt-6",
    style: {
      fontFamily: "Inter, sans-serif",
      fontSize: 18,
      lineHeight: 1.6,
      color: TN.ink2,
      maxWidth: 560
    }
  }, "TruthNet puts your headline on trial. Four independent AI agents gather evidence, argue prosecution and defense, and deliver a transparent judgment with confidence scores and citations."), /*#__PURE__*/React.createElement("div", {
    className: "mt-10 flex flex-wrap gap-4"
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => navigate(user ? "/app" : "/signup"),
    className: "tn-btn-primary tn-btn-lg"
  }, user ? "Open fact-checker →" : "Get started free →"), /*#__PURE__*/React.createElement("button", {
    onClick: () => navigate("/login"),
    className: "tn-btn-ghost tn-btn-lg"
  }, "Log in")), /*#__PURE__*/React.createElement("p", {
    className: "mt-6",
    style: {
      fontFamily: "JetBrains Mono, monospace",
      fontSize: 11,
      color: TN.muted
    }
  }, "Median judgment time \xB7 16\u201330s \xB7 Powered by Gemini 3 + Google Fact Check")), /*#__PURE__*/React.createElement(Rule, {
    className: "max-w-6xl mx-auto"
  }), /*#__PURE__*/React.createElement("section", {
    className: "max-w-6xl mx-auto px-6 py-16"
  }, /*#__PURE__*/React.createElement(H2, {
    num: "I"
  }, "The problem"), /*#__PURE__*/React.createElement("div", {
    className: "mt-8 grid md:grid-cols-2 gap-10"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: "Lora, serif",
      fontSize: 17,
      lineHeight: 1.65,
      color: TN.ink
    }
  }, "Misinformation spreads claim-by-claim \u2014 a headline, a tweet, a viral post. Outlet-level fact-checkers publish weekly; by then the damage is done."), /*#__PURE__*/React.createElement("p", {
    className: "mt-4",
    style: {
      fontFamily: "Inter, sans-serif",
      fontSize: 14,
      lineHeight: 1.6,
      color: TN.ink2
    }
  }, "59% of adults encounter misleading news weekly. Tools built for publishers don't help the individual who needs an answer ", /*#__PURE__*/React.createElement("em", null, "now"), ".")), /*#__PURE__*/React.createElement("div", {
    style: {
      background: TN.surface,
      border: `1px solid ${TN.border}`,
      padding: "24px 28px"
    }
  }, /*#__PURE__*/React.createElement(SectionLabel, null, "TruthNet difference"), /*#__PURE__*/React.createElement("ul", {
    className: "mt-4 space-y-3",
    style: {
      fontFamily: "Inter, sans-serif",
      fontSize: 14,
      color: TN.ink2,
      lineHeight: 1.55
    }
  }, /*#__PURE__*/React.createElement("li", null, "\u2713 Paste ", /*#__PURE__*/React.createElement("strong", null, "any"), " claim \u2014 not just pre-selected articles"), /*#__PURE__*/React.createElement("li", null, "\u2713 Adversarial agents argue both sides before verdict"), /*#__PURE__*/React.createElement("li", null, "\u2713 Live pipeline with sourced references"), /*#__PURE__*/React.createElement("li", null, "\u2713 Confidence score + manipulation detection"))))), /*#__PURE__*/React.createElement("section", {
    className: "max-w-6xl mx-auto px-6 py-16",
    style: {
      background: TN.surfaceSoft,
      borderTop: `1px solid ${TN.borderSoft}`,
      borderBottom: `1px solid ${TN.borderSoft}`
    }
  }, /*#__PURE__*/React.createElement(H2, {
    num: "II"
  }, "How it works"), /*#__PURE__*/React.createElement("p", {
    className: "mt-4 mb-8",
    style: {
      fontFamily: "Inter, sans-serif",
      fontSize: 14,
      color: TN.ink2,
      maxWidth: 520
    }
  }, "A courtroom for claims. Agent A gathers sources; Agents B and C prosecute and defend in parallel; Agent D renders the final judgment."), /*#__PURE__*/React.createElement(TruthNetDiagram, null)), /*#__PURE__*/React.createElement("section", {
    className: "max-w-6xl mx-auto px-6 py-16"
  }, /*#__PURE__*/React.createElement(H2, {
    num: "III"
  }, "Features"), /*#__PURE__*/React.createElement("div", {
    className: "mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-px",
    style: {
      background: TN.border
    }
  }, [{
    t: "Confidence score",
    d: "Calibrated 0–100% with transparent error margins."
  }, {
    t: "Source citations",
    d: "Retrieved documents weighed and linked in the verdict."
  }, {
    t: "Manipulation flags",
    d: "Detects appeal to authority, false causation, and more."
  }, {
    t: "Live pipeline",
    d: "Watch agents progress in real time via SSE streaming."
  }].map(f => /*#__PURE__*/React.createElement("div", {
    key: f.t,
    style: {
      background: TN.surface,
      padding: "22px 20px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "Lora, serif",
      fontWeight: 600,
      fontSize: 17,
      color: TN.ink
    }
  }, f.t), /*#__PURE__*/React.createElement("p", {
    className: "mt-2",
    style: {
      fontFamily: "Inter, sans-serif",
      fontSize: 13,
      color: TN.ink2,
      lineHeight: 1.5
    }
  }, f.d))))), /*#__PURE__*/React.createElement("section", {
    className: "max-w-6xl mx-auto px-6 py-16"
  }, /*#__PURE__*/React.createElement(H2, {
    num: "IV"
  }, "Trust & transparency"), /*#__PURE__*/React.createElement("blockquote", {
    className: "mt-8",
    style: {
      borderLeft: `3px solid ${TN.accent}`,
      padding: "20px 24px",
      background: TN.surfaceSoft,
      fontFamily: "Lora, serif",
      fontStyle: "italic",
      fontSize: 18,
      lineHeight: 1.55,
      color: TN.ink
    }
  }, "We don't claim 100% accuracy. Every verdict shows confidence, sources, and what we could not verify. TruthNet is a judgment protocol \u2014 not an oracle."), /*#__PURE__*/React.createElement("p", {
    className: "mt-6",
    style: {
      fontFamily: "Inter, sans-serif",
      fontSize: 13,
      color: TN.muted
    }
  }, "Production stack: Gemini 3 Flash agents with Google Search grounding and Google Fact Check API pre-search.")), /*#__PURE__*/React.createElement("section", {
    id: "pricing",
    className: "max-w-6xl mx-auto px-6 py-16 scroll-mt-8",
    style: {
      borderTop: `1px solid ${TN.border}`
    }
  }, /*#__PURE__*/React.createElement(H2, {
    num: "V"
  }, "Choose your plan"), /*#__PURE__*/React.createElement("p", {
    className: "mt-3",
    style: {
      fontFamily: "Inter, sans-serif",
      fontSize: 14,
      color: TN.muted
    }
  }, "Daily limits reset at midnight UTC. Successful fact-checks only.", paymentsEnabled ? " Paid plans use Stripe Checkout." : " Preview any tier free until Stripe is connected."), /*#__PURE__*/React.createElement("div", {
    className: "mt-10"
  }, /*#__PURE__*/React.createElement(PricingGrid, {
    plans: plans,
    onSelect: handlePlanCta,
    ctaLabel: paymentsEnabled ? user ? "Subscribe" : "Get started" : user ? "Manage plan" : "Get started"
  }))), /*#__PURE__*/React.createElement(LandingFooter, {
    navigate: navigate
  }));
}
function LandingFooter({
  navigate
}) {
  return /*#__PURE__*/React.createElement("footer", {
    style: {
      borderTop: `1px solid ${TN.border}`,
      background: TN.surface
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "max-w-6xl mx-auto px-6 py-10 flex flex-col md:flex-row justify-between gap-6"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "Lora, serif",
      fontWeight: 700,
      fontSize: 18
    }
  }, "TruthNet"), /*#__PURE__*/React.createElement("p", {
    className: "mt-2",
    style: {
      fontFamily: "Inter, sans-serif",
      fontSize: 12,
      color: TN.muted
    }
  }, "\xA9 ", new Date().getFullYear(), " TruthNet \xB7 An open judgment protocol")), /*#__PURE__*/React.createElement("div", {
    className: "flex gap-6",
    style: {
      fontFamily: "Inter, sans-serif",
      fontSize: 12
    }
  }, /*#__PURE__*/React.createElement("a", {
    href: "/privacy",
    onClick: e => {
      e.preventDefault();
      navigate("/privacy");
    }
  }, "Privacy"), /*#__PURE__*/React.createElement("a", {
    href: "/terms",
    onClick: e => {
      e.preventDefault();
      navigate("/terms");
    }
  }, "Terms"), /*#__PURE__*/React.createElement("a", {
    href: "/app",
    onClick: e => {
      e.preventDefault();
      navigate("/app");
    }
  }, "App"))));
}
window.LandingPage = LandingPage;
