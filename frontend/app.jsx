// TruthNet — Main App
// Uses React.* hooks explicitly so this file can load after components.jsx without redeclaring globals.

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("TruthNet UI error:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: "100vh", display: "grid", placeItems: "center",
          background: "var(--bg)", color: "var(--ink)", padding: 24,
        }}>
          <div style={{
            maxWidth: 420, textAlign: "center", padding: "28px 24px",
            border: "1px solid var(--border)", background: "var(--surface)",
          }}>
            <div style={{ fontFamily: "Lora, serif", fontSize: 22, fontWeight: 600, marginBottom: 8 }}>
              Something went wrong — please reload
            </div>
            <p style={{ fontFamily: "Inter, sans-serif", fontSize: 14, color: "var(--ink-2)" }}>
              The TruthNet interface hit an unexpected error.
            </p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// =========================================================================
// THEME TOGGLE
// =========================================================================
function ThemeToggle({ theme, onToggle }) {
  return (
    <button
      onClick={onToggle}
      aria-label="Toggle color theme"
      className="relative transition-colors"
      style={{
        display: "inline-flex", alignItems: "center", gap: 8,
        padding: "5px 10px 5px 8px",
        background: "transparent",
        border: `1px solid ${TN.border}`,
        color: TN.ink2,
        fontFamily: "Inter, sans-serif", fontSize: 11,
        letterSpacing: "0.08em",
      }}
      onMouseEnter={(e)=> e.currentTarget.style.background = TN.surfaceSoft}
      onMouseLeave={(e)=> e.currentTarget.style.background = "transparent"}
    >
      <span style={{ display: "inline-grid", placeItems: "center", width: 16, height: 16 }}>
        {theme === "dark" ? (
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="3.2" stroke="currentColor" strokeWidth="1.2"/>
            {[0,45,90,135,180,225,270,315].map((a) => {
              const r1 = 5.4, r2 = 7;
              const rad = (a*Math.PI)/180;
              return <line key={a} x1={8+r1*Math.cos(rad)} y1={8+r1*Math.sin(rad)}
                            x2={8+r2*Math.cos(rad)} y2={8+r2*Math.sin(rad)}
                            stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>;
            })}
          </svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M11.5 9.5 A 5 5 0 0 1 6.5 4.5 A 5 5 0 1 0 11.5 9.5 Z"
                  stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinejoin="round"/>
          </svg>
        )}
      </span>
      <span>{theme === "dark" ? "LIGHT" : "DARK"}</span>
    </button>
  );
}

// =========================================================================
// ANIMATED DIAGRAM — intro graphic explaining the 4-agent pipeline
// =========================================================================
function TruthNetDiagram() {
  return (
    <div className="tn-diagram w-full">
      <svg viewBox="0 0 720 300" className="w-full h-auto block" preserveAspectRatio="xMidYMid meet">
        <defs>
          <marker id="tn-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M0,0 L10,5 L0,10" fill="none" stroke="var(--border)" strokeWidth="1.2" strokeLinejoin="round" strokeLinecap="round"/>
          </marker>
        </defs>

        {/* Connections */}
        <path className="flow" markerEnd="url(#tn-arrow)" d="M 120 150 H 178" />
        <path className="flow" markerEnd="url(#tn-arrow)" d="M 280 150 C 305 150, 305 75, 338 75" />
        <path className="flow" markerEnd="url(#tn-arrow)" d="M 280 150 C 305 150, 305 225, 338 225" />
        <path className="flow" markerEnd="url(#tn-arrow)" d="M 480 75  C 505 75, 505 150, 538 150" />
        <path className="flow" markerEnd="url(#tn-arrow)" d="M 480 225 C 505 225, 505 150, 538 150" />
        <path className="flow" markerEnd="url(#tn-arrow)" d="M 620 150 H 638" />

        {/* CLAIM */}
        <g className="node-claim">
          <rect className="node-bg" x="20" y="118" width="100" height="64" rx="2"/>
          <text className="node-label" x="70" y="138" textAnchor="middle">Input</text>
          <text className="node-name"  x="70" y="160" textAnchor="middle">Claim</text>
          <text x="70" y="175" textAnchor="middle"
                style={{ fill: "var(--muted)", fontFamily: "JetBrains Mono, monospace", fontSize: 9 }}>
            user text
          </text>
        </g>

        {/* Agent A */}
        <g className="node-a">
          <rect className="node-bg" x="178" y="118" width="102" height="64" rx="2"/>
          <text className="node-label" x="229" y="138" textAnchor="middle">§1 · Agent A</text>
          <text className="node-name"  x="229" y="160" textAnchor="middle">Extract</text>
          <text x="229" y="175" textAnchor="middle"
                style={{ fill: "var(--muted)", fontFamily: "JetBrains Mono, monospace", fontSize: 9 }}>
            atomic claims
          </text>
        </g>

        {/* Agent B — Prosecution */}
        <g className="node-b">
          <rect className="node-bg" x="338" y="42" width="142" height="66" rx="2"/>
          <text className="node-label" x="409" y="62" textAnchor="middle" style={{ fill: "var(--v-false-fg)" }}>§2 · Agent B</text>
          <text className="node-name"  x="409" y="84" textAnchor="middle">Prosecution</text>
          <text x="409" y="99" textAnchor="middle"
                style={{ fill: "var(--muted)", fontFamily: "JetBrains Mono, monospace", fontSize: 9 }}>
            argues FALSE
          </text>
        </g>

        {/* Agent C — Defense */}
        <g className="node-c">
          <rect className="node-bg" x="338" y="192" width="142" height="66" rx="2"/>
          <text className="node-label" x="409" y="212" textAnchor="middle" style={{ fill: "var(--v-true-fg)" }}>§3 · Agent C</text>
          <text className="node-name"  x="409" y="234" textAnchor="middle">Defense</text>
          <text x="409" y="249" textAnchor="middle"
                style={{ fill: "var(--muted)", fontFamily: "JetBrains Mono, monospace", fontSize: 9 }}>
            argues TRUE
          </text>
        </g>

        {/* Agent D */}
        <g className="node-d">
          <rect className="node-bg" x="538" y="118" width="82" height="64" rx="2"/>
          <text className="node-label" x="579" y="138" textAnchor="middle">§4 · D</text>
          <text className="node-name-sm" x="579" y="160" textAnchor="middle">Judge</text>
          <text x="579" y="175" textAnchor="middle"
                style={{ fill: "var(--muted)", fontFamily: "JetBrains Mono, monospace", fontSize: 9 }}>
            weigh both
          </text>
        </g>

        {/* VERDICT */}
        <g className="node-verdict">
          <rect className="node-bg" x="638" y="118" width="72" height="64" rx="2"/>
          <text className="node-label" x="674" y="138" textAnchor="middle">Output</text>
          <text className="verdict-text-idle"
                x="674" y="162" textAnchor="middle"
                style={{ fill: "var(--ink)", fontFamily: "Lora, serif", fontSize: 14, fontWeight: 700 }}>
            Verdict
          </text>
          <text className="verdict-text-final"
                x="674" y="162" textAnchor="middle"
                style={{ fill: "var(--v-false-fg)", fontFamily: "Lora, serif", fontSize: 14, fontWeight: 700, letterSpacing: "0.05em" }}>
            FALSE
          </text>
          <text x="674" y="176" textAnchor="middle"
                style={{ fill: "var(--muted)", fontFamily: "JetBrains Mono, monospace", fontSize: 9 }}>
            stamped
          </text>
        </g>

        {/* small caption helpers */}
        <text x="10" y="20"
              style={{ fill: "var(--muted)", fontFamily: "Inter, sans-serif", fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase", fontWeight: 600 }}>
          Judgment Pipeline · 4 Agents
        </text>
        <text x="710" y="20" textAnchor="end"
              style={{ fill: "var(--muted)", fontFamily: "JetBrains Mono, monospace", fontSize: 9 }}>
          fig. 1
        </text>

        {/* axis-like baseline between B and C to emphasize "vs" */}
        <line x1="409" y1="120" x2="409" y2="180" stroke="var(--border-soft)" strokeWidth="1" strokeDasharray="2 3"/>
        <text x="409" y="156" textAnchor="middle"
              style={{ fill: "var(--muted)", fontFamily: "Lora, serif", fontStyle: "italic", fontSize: 11 }}>
          vs.
        </text>
      </svg>
    </div>
  );
}

// =========================================================================
// MASTHEAD
// =========================================================================
function Masthead({ theme, onToggleTheme, user, onLogout, quota, onBilling, onHistory, onQuotaClick }) {
  return (
    <header style={{ borderBottom: `1px solid ${TN.border}`, background: TN.bg }}>
      <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <a href="/" style={{ display: "flex", alignItems: "center", gap: 12, textDecoration: "none", color: "inherit" }}>
          <svg width="28" height="34" viewBox="0 0 28 34" fill="none">
            <path d="M14 1 L26 6 V18 C26 25 20 30 14 33 C8 30 2 25 2 18 V6 L14 1 Z"
                  stroke={TN.ink} strokeWidth="1.2" fill={TN.surfaceSoft} />
            <text x="14" y="20" textAnchor="middle"
                  fontFamily="Lora, serif" fontSize="11" fontWeight="700" fill={TN.ink}>TN</text>
          </svg>
          <div>
            <div style={{ fontFamily: "Lora, serif", fontWeight: 700, fontSize: 26, letterSpacing: "-0.01em", color: TN.ink, lineHeight: 1 }}>
              TruthNet
            </div>
            <div style={{ fontFamily: "Inter, sans-serif", fontSize: 11, color: TN.muted, letterSpacing: "0.15em", textTransform: "uppercase", marginTop: 4 }}>
              A Journal of Adversarial Fact-Checking
            </div>
          </div>
          </a>
        </div>
        <div className="flex items-center gap-5">
          {user && user.email !== "__guest__@truthnet.local" && (
            <span style={{ fontFamily: "Inter, sans-serif", fontSize: 12, color: TN.muted }}>
              {user.email}
            </span>
          )}
          {user && user.email !== "__guest__@truthnet.local" && onHistory && (
              <button type="button" onClick={onHistory} style={{
                fontFamily: "Inter, sans-serif", fontSize: 11, letterSpacing: "0.08em",
                padding: "5px 10px", border: `1px solid ${TN.border}`, background: "transparent", color: TN.ink2,
              }}>History</button>
          )}
          {user && user.email !== "__guest__@truthnet.local" && onBilling && (
              <button type="button" onClick={onBilling} style={{
                fontFamily: "Inter, sans-serif", fontSize: 11, letterSpacing: "0.08em",
                padding: "5px 10px", border: `1px solid ${TN.border}`, background: "transparent", color: TN.ink2,
              }}>Plan</button>
          )}
          {user && user.email !== "__guest__@truthnet.local" && onLogout && (
            <button onClick={onLogout} style={{
              fontFamily: "Inter, sans-serif", fontSize: 11, letterSpacing: "0.08em",
              padding: "5px 10px", border: `1px solid ${TN.border}`, background: "transparent", color: TN.ink2,
            }}>Log out</button>
          )}
          <QuotaBadge quota={quota} onClick={onQuotaClick} />
          <div className="hidden md:flex flex-col items-end gap-1" style={{ fontFamily: "JetBrains Mono, ui-monospace, monospace", fontSize: 10.5, color: TN.muted }}>
            <span>Vol. 1 · Issue 04 · ISSN 0000–0000</span>
            <span>{new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</span>
          </div>
          <ThemeToggle theme={theme} onToggle={onToggleTheme} />
        </div>
      </div>
    </header>
  );
}

// =========================================================================
// LEFT TOC
// =========================================================================
function LeftTOC({ status }) {
  const items = [
    { id: "verdict", label: "Verdict",           num: "1" },
    { id: "detail",  label: "Detailed Analysis", num: "2" },
  ];
  const [active, setActive] = React.useState("verdict");
  React.useEffect(() => {
    if (status !== "done") return;
    const onScroll = () => {
      let cur = "verdict";
      for (const it of items) {
        const el = document.getElementById(it.id);
        if (el && el.getBoundingClientRect().top < 120) cur = it.id;
      }
      setActive(cur);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [status]);

  return (
    <nav className="hidden lg:block sticky" style={{ top: 24, alignSelf: "start" }}>
      <SectionLabel className="mb-4">Contents</SectionLabel>
      <ol className="relative flex flex-col">
        <div className="absolute left-[7px] top-2 bottom-2 w-px"
             style={{ background: `repeating-linear-gradient(to bottom, ${TN.border} 0 3px, transparent 3px 6px)` }} />
        {items.map((it) => {
          const isActive = active === it.id;
          return (
            <li key={it.id} className="relative pl-6 py-1.5">
              <span style={{
                position: "absolute", left: 4, top: 12,
                width: 7, height: 7, borderRadius: 999,
                background: isActive ? TN.ink : TN.bg,
                border: `1px solid ${isActive ? TN.ink : TN.border}`,
              }} />
              <a href={`#${it.id}`} style={{
                display: "block", fontFamily: "Inter, sans-serif", fontSize: 12.5,
                color: isActive ? TN.ink : TN.ink2, textDecoration: "none",
                fontWeight: isActive ? 600 : 400,
              }}>
                <span style={{ color: TN.muted, marginRight: 6, fontFamily: "JetBrains Mono, monospace", fontSize: 10 }}>§{it.num}</span>
                {it.label}
              </a>
            </li>
          );
        })}
      </ol>
      <div className="mt-6 pt-4" style={{ borderTop: `1px solid ${TN.borderSoft}` }}>
        <SectionLabel className="mb-2">Status</SectionLabel>
        <div style={{ fontFamily: "Inter, sans-serif", fontSize: 12, color: TN.ink2 }}>
          {status === "idle" && "Awaiting submission"}
          {status === "loading" && "Judgment in progress…"}
          {status === "done" && "Verdict published"}
          {status === "error" && "Processing error"}
        </div>
      </div>
    </nav>
  );
}

// =========================================================================
// IDLE INTRO — animated graphic instead of an explanatory paragraph
// =========================================================================
function IdleIntro() {
  return (
    <section id="abstract">
      <SectionLabel>Abstract</SectionLabel>
      <h1 className="mt-3" style={{
        fontFamily: "Lora, serif", fontWeight: 700, fontSize: 44, lineHeight: 1.1,
        letterSpacing: "-0.015em", color: TN.ink,
      }}>
        Truth, on trial.
      </h1>

      <div className="mt-10 tn-fade-up" style={{
        background: TN.surfaceSoft, border: `1px solid ${TN.borderSoft}`,
        padding: "22px 22px 14px",
      }}>
        <TruthNetDiagram />
      </div>

      <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 items-center"
           style={{ fontFamily: "Inter, sans-serif", fontSize: 12, color: TN.muted }}>
        <span>· Median judgment time: 16.4s</span>
        <span>· Source corpus: web + curated archives</span>
        <span>· 4 independent agents per claim</span>
      </div>
    </section>
  );
}

function ClaimEcho({ text }) {
  return (
    <section id="claims" className="scroll-mt-8">
      <H2 num="2">Submitted Claim</H2>
      <div className="mt-5" style={{
        background: TN.surface, border: `1px solid ${TN.border}`,
        padding: "20px 22px", borderLeft: `3px solid ${TN.accent}`,
      }}>
        <SectionLabel className="mb-2">Claim under review</SectionLabel>
        <p style={{ fontFamily: "Lora, serif", fontStyle: "italic", fontSize: 18, lineHeight: 1.55, color: TN.ink }}>
          “{text}”
        </p>
        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1"
             style={{ fontFamily: "JetBrains Mono, ui-monospace, monospace", fontSize: 11, color: TN.muted }}>
          <span>received: {new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}</span>
          <span>tokens: ~{Math.ceil(text.length / 4)}</span>
        </div>
      </div>
    </section>
  );
}

function ErrorState({ onRetry, message }) {
  return (
    <div className="my-12" style={{
      background: "var(--v-false-bg)",
      border: `1px solid color-mix(in srgb, var(--v-false-fg) 35%, transparent)`,
      padding: "20px 22px",
    }}>
      <SectionLabel className="mb-2">Processing Error</SectionLabel>
      <div style={{ fontFamily: "Lora, serif", fontSize: 17, color: "var(--v-false-fg)", marginBottom: 8 }}>
        The agent panel could not complete the judgment.
      </div>
      <p style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: TN.ink2 }}>
        {message || "The backend stream returned an error before all four agents reported. Try again after confirming the backend is running."}
      </p>
      <button onClick={onRetry} className="mt-4 px-3 py-1.5"
              style={{ fontFamily: "Inter, sans-serif", fontSize: 12, background: TN.ink, color: TN.bg }}>
        Retry submission →
      </button>
    </div>
  );
}

// =========================================================================
// DETAILED ANALYSIS — collapsible wrapper, closed by default
// =========================================================================
function DetailedAnalysis({ result, inputText }) {
  const [open, setOpen] = React.useState(false);
  return (
    <section id="detail" className="scroll-mt-8">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-4 py-4 text-left transition-colors"
        style={{
          borderTop: `1px solid ${TN.border}`,
          borderBottom: open ? `1px solid ${TN.border}` : `1px solid ${TN.borderSoft}`,
          background: "transparent",
        }}
        onMouseEnter={(e)=> e.currentTarget.style.background = TN.surfaceSoft}
        onMouseLeave={(e)=> e.currentTarget.style.background = "transparent"}
      >
        <span style={{
          width: 28, height: 28, display: "grid", placeItems: "center",
          border: `1px solid ${TN.border}`,
          fontFamily: "JetBrains Mono, monospace", fontSize: 15,
          transition: "background 0.2s, color 0.2s",
          background: open ? TN.ink : "transparent",
          color: open ? TN.bg : TN.ink,
        }}>{open ? "−" : "+"}</span>
        <div className="flex-1">
          <SectionLabel>§2 · Detailed Analysis</SectionLabel>
          <div style={{ fontFamily: "Lora, serif", fontSize: 20, fontWeight: 600, color: TN.ink, marginTop: 2, lineHeight: 1.2 }}>
            {open ? "Methodology, briefs, appendices & references" : "Expand the full judgment record"}
          </div>
        </div>
        <span style={{ fontFamily: "Inter, sans-serif", fontSize: 11, color: TN.muted, letterSpacing: "0.08em", textTransform: "uppercase" }}>
          {open ? "Collapse" : "Expand"}
        </span>
      </button>

      {open && (
        <div className="tn-fade-up">
          <div className="mt-10">
            <ClaimEcho text={inputText || MOCK_CLAIM} />
          </div>

          <Rule />
          <ProsecutionDefense result={result} />

          <Rule />
          <DetailedExplanation result={result} />

          <Rule />
          <EvidencePanel result={result} />

          <Rule />
          <SourceList sources={result.top_sources} />
        </div>
      )}
    </section>
  );
}

// =========================================================================
// APP
// =========================================================================
function FactCheckApp({ user, onLogout, navigate }) {
  const [inputText, setInputText] = React.useState("");
  const [status, setStatus] = React.useState("idle");
  const [agentSteps, setAgentSteps] = React.useState({
    sources: "pending",
    prosecution: "pending",
    defense: "pending",
    verdict: "pending",
  });
  const [result, setResult] = React.useState(null);
  const [errorMessage, setErrorMessage] = React.useState("");
  const [quota, setQuota] = React.useState(null);
  const [paymentsEnabled, setPaymentsEnabled] = React.useState(false);
  const [activatingPlan, setActivatingPlan] = React.useState(false);
  const [theme, setTheme] = React.useState(() => {
    try { return localStorage.getItem("truthnet-theme") || "light"; }
    catch { return "light"; }
  });
  const timersRef = React.useRef([]);
  const requestRef = React.useRef(null);
  const backendLabel = window.location.protocol === "file:"
    ? "127.0.0.1:8000"
    : window.location.host;

  React.useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    try { localStorage.setItem("truthnet-theme", theme); } catch {}
  }, [theme]);

  const refreshQuota = React.useCallback(async () => {
    if (typeof fetchQuota !== "function") return;
    const q = await fetchQuota();
    if (q) setQuota(q);
  }, []);

  React.useEffect(() => {
    refreshQuota();
  }, [refreshQuota]);

  React.useEffect(() => {
    if (typeof fetchBillingStatus !== "function") return;
    fetchBillingStatus().then((s) => setPaymentsEnabled(!!s.payments_enabled)).catch(() => {});
  }, []);

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("billing") !== "success") return;
    if (typeof pollQuotaAfterPayment !== "function") return;

    setActivatingPlan(true);
    pollQuotaAfterPayment(30000, 2000).then((q) => {
      if (q) setQuota(q);
      setActivatingPlan(false);
    });

    params.delete("billing");
    const next = `${window.location.pathname}${params.toString() ? `?${params}` : ""}`;
    window.history.replaceState(null, "", next);
  }, []);

  const goBilling = React.useCallback(() => {
    if (navigate) navigate("/billing");
    else window.location.href = "/billing";
  }, [navigate]);

  const handleCheckout = React.useCallback(async (tier) => {
    if (typeof startCheckout !== "function") {
      goBilling();
      return;
    }
    try {
      await startCheckout(tier);
    } catch (err) {
      setErrorMessage(err.message || "Checkout failed.");
      setStatus("error");
    }
  }, [goBilling]);

  const quotaBlocked = quota && !quota.exempt && quota.remaining <= 0;

  const toggleTheme = React.useCallback(() => {
    setTheme(t => (t === "dark" ? "light" : "dark"));
  }, []);

  const clearTimers = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  };

  const abortCurrentRequest = () => {
    if (requestRef.current) {
      requestRef.current.abort();
      requestRef.current = null;
    }
  };

  const apiUrl = () => {
    if (window.TRUTHNET_API_URL) return window.TRUTHNET_API_URL;
    if (window.location.protocol === "http:" || window.location.protocol === "https:") {
      return `${window.location.origin}/fact-check`;
    }
    return "http://127.0.0.1:8000/fact-check";
  };

  const applyStreamEvent = (event) => {
    if (event.status === "agent_a_running") {
      setAgentSteps({ sources: "active", prosecution: "pending", defense: "pending", verdict: "pending" });
    }
    if (event.status === "agent_a_done" || (event.step === "sources" && event.done)) {
      setAgentSteps((s) => ({ ...s, sources: "done", prosecution: "active", defense: "active" }));
    }
    if (event.status === "agents_bc_running") {
      setAgentSteps((s) => ({ ...s, prosecution: "active", defense: "active" }));
    }
    if (event.status === "agents_bc_done" || (event.step === "prosecution" && event.done)) {
      setAgentSteps((s) => ({ ...s, prosecution: "done", defense: "done", verdict: "active" }));
    }
    if (event.status === "agent_d_running") {
      setAgentSteps((s) => ({ ...s, verdict: "active" }));
    }
    if (event.status === "agent_d_done" || (event.step === "verdict" && event.done)) {
      setAgentSteps((s) => ({ ...s, verdict: "done" }));
    }

    if (event.status === "error") {
      throw new Error(event.message || "Backend stream failed.");
    }

    if (event.result) {
      setResult(event.result);
      setAgentSteps({ sources: "done", prosecution: "done", defense: "done", verdict: "done" });
      setStatus("done");
    }
  };

  const parseSseBlock = (block) => {
    const dataLine = block
      .split("\n")
      .find((line) => line.startsWith("data: "));
    if (!dataLine) return null;
    return JSON.parse(dataLine.slice(6));
  };

  const submit = React.useCallback(async () => {
    const claim = inputText.trim();
    if (!claim) return;
    if (quotaBlocked) {
      setErrorMessage("Daily limit reached — upgrade your plan to continue.");
      setStatus("error");
      return;
    }
    clearTimers();
    abortCurrentRequest();
    setStatus("loading");
    setAgentSteps({ sources: "active", prosecution: "pending", defense: "pending", verdict: "pending" });
    setResult(null);
    setErrorMessage("");

    const controller = new AbortController();
    requestRef.current = controller;
    const clientTimeoutMs = 35000;
    const timeoutId = setTimeout(() => controller.abort(), clientTimeoutMs);
    let receivedVerdict = false;

    const handleStreamEvent = (event) => {
      if (event?.result) receivedVerdict = true;
      applyStreamEvent(event);
    };

    try {
      const response = await fetch(apiUrl(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_input: claim }),
        signal: controller.signal,
        credentials: "include",
      });

      if (response.status === 401) {
        throw new Error("Session expired — please log in again.");
      }
      if (response.status === 429) {
        let detail = {};
        try { detail = JSON.parse(await response.text()); } catch {}
        const inner = detail.detail || detail;
        if (inner && inner.error === "quota_exceeded") {
          setQuota((q) => ({ ...q, ...inner, remaining: 0 }));
          const upgradeMsg = paymentsEnabled
            ? "Daily limit reached — use Upgrade to subscribe via Stripe."
            : "Daily limit reached — upgrade your plan to continue.";
          throw new Error(upgradeMsg);
        }
        throw new Error(inner.message || inner.detail || "Rate limit exceeded.");
      }

      if (!response.ok) {
        const detail = await response.text();
        throw new Error(`Backend returned ${response.status}: ${detail || response.statusText}`);
      }
      if (!response.body) {
        throw new Error("This browser did not expose a readable response stream.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        buffer += decoder.decode(value || new Uint8Array(), { stream: !done });

        const blocks = buffer.split("\n\n");
        buffer = blocks.pop() || "";

        for (const block of blocks) {
          const event = parseSseBlock(block.trim());
          if (event) handleStreamEvent(event);
        }

        if (done) break;
      }

      const finalEvent = parseSseBlock(buffer.trim());
      if (finalEvent) handleStreamEvent(finalEvent);

      if (!receivedVerdict) {
        throw new Error("The analysis stream ended before a verdict was returned.");
      }
      await refreshQuota();
    } catch (error) {
      if (error.name === "AbortError") {
        setErrorMessage("Analysis timed out after 35 seconds. Try a shorter claim or enable DEMO_MODE.");
        setStatus("error");
        return;
      }
      setErrorMessage(error.message || "Could not connect to the TruthNet backend.");
      setStatus("error");
    } finally {
      clearTimeout(timeoutId);
      if (requestRef.current === controller) requestRef.current = null;
    }
  }, [inputText, quotaBlocked, refreshQuota, paymentsEnabled]);

  const loadDemo = () => {
    clearTimers();
    abortCurrentRequest();
    setInputText(MOCK_CLAIM);
    setResult(null);
    setErrorMessage("");
    setAgentSteps({ sources: "pending", prosecution: "pending", defense: "pending", verdict: "pending" });
    setStatus("idle");
    setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 50);
  };

  const reset = () => {
    clearTimers();
    abortCurrentRequest();
    setStatus("idle");
    setAgentSteps({ sources: "pending", prosecution: "pending", defense: "pending", verdict: "pending" });
    setResult(null);
    setErrorMessage("");
    setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 50);
  };

  React.useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") submit();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [submit]);

  React.useEffect(() => () => {
    clearTimers();
    abortCurrentRequest();
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: TN.bg, color: TN.ink }}>
      <Masthead
        theme={theme}
        onToggleTheme={toggleTheme}
        user={user}
        onLogout={onLogout}
        quota={quota}
        onBilling={user && user.email !== "__guest__@truthnet.local" ? goBilling : null}
        onHistory={user && user.email !== "__guest__@truthnet.local" && navigate
          ? () => navigate("/history")
          : null}
        onQuotaClick={goBilling}
      />

      <main className="max-w-6xl mx-auto px-6 py-10">
        {activatingPlan && (
          <div className="mb-6 p-4 tn-fade-up" style={{
            background: TN.surfaceSoft, border: `1px solid ${TN.border}`,
            fontFamily: "Inter, sans-serif", fontSize: 13, color: TN.ink2,
          }}>
            Activating your subscription… This may take up to 30 seconds after payment.
          </div>
        )}
        <QuotaExceededBanner
          quota={quota}
          onUpgrade={goBilling}
          onCheckout={paymentsEnabled ? handleCheckout : null}
        />
        {quota && !quota.exempt && (
          <div className="mb-8 max-w-md">
            <UsageMeter quota={quota} size="sm" />
          </div>
        )}
        <div className="grid gap-10 grid-cols-1 lg:grid-cols-[180px_1fr]">
          <LeftTOC status={status} />

          <div className="min-w-0">
            {status === "idle" && <IdleIntro />}
            <div className={status === "idle" ? "mt-10" : ""}>
              <ChatInput
                value={inputText}
                onChange={setInputText}
                onSubmit={submit}
                onLoadDemo={loadDemo}
                status={quotaBlocked ? "quota_blocked" : status}
              />
            </div>

            {(status === "loading" || status === "done") && (
              <div className="mt-8">
                <PipelineStatus agentSteps={agentSteps} />
              </div>
            )}

            {status === "error" && <ErrorState onRetry={submit} message={errorMessage} />}

            {status === "done" && result && (
              <>
                <Rule />
                {/* Verdict + manipulation alert sit in a 2-col grid on xl screens.
                    On smaller screens the alert stacks beneath. */}
                <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-8 items-start">
                  <div>
                    <VerdictCard result={result} />
                    <PipelineWarnings warnings={result.pipeline_warnings} />
                  </div>
                  <ManipulationAlert techniques={result.manipulation_techniques_detected} />
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  <CopyResultButton claim={inputText} result={result} />
                </div>

                <div className="mt-12">
                  <DetailedAnalysis result={result} inputText={inputText} />
                </div>

                <div className="mt-12 mb-8 flex items-center justify-between gap-4 flex-wrap"
                     style={{ borderTop: `1px solid ${TN.border}`, paddingTop: 18 }}>
                  <div style={{ fontFamily: "Inter, sans-serif", fontSize: 11, color: TN.muted, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                    — End of judgment —
                  </div>
                  <button onClick={reset} className="px-3 py-1.5"
                          style={{ fontFamily: "Inter, sans-serif", fontSize: 12, background: "transparent",
                                   border: `1px solid ${TN.border}`, color: TN.ink2 }}>
                    Submit another claim →
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </main>

      <footer style={{ borderTop: `1px solid ${TN.border}`, background: TN.surfaceSoft }}>
        <div className="max-w-6xl mx-auto px-6 py-6 flex flex-wrap items-center justify-between gap-3"
             style={{ fontFamily: "Inter, sans-serif", fontSize: 11, color: TN.muted }}>
          <span>© TruthNet · An open judgment protocol</span>
          <span style={{ fontFamily: "JetBrains Mono, monospace" }}>v0.4.1 · {backendLabel}</span>
          <span>Made for clear thinking.</span>
        </div>
      </footer>
    </div>
  );
}

// =========================================================================
// PROSECUTION & DEFENSE
// =========================================================================
function ProsecutionDefense({ result }) {
  const prosecutionBrief = result?.prosecution_brief;
  const defenseBrief = result?.defense_brief;
  const placeholder = "Agent did not return a brief for this claim.";

  return (
    <section className="scroll-mt-8">
      <H2 num="3">Prosecution & Defense — Agent Briefs</H2>
      <p className="mt-3" style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: TN.ink2, lineHeight: 1.55 }}>
        Agents B and C operate in parallel from opposing stances. Their findings — summarized
        below — are passed to Agent D for judgment.
      </p>
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-px" style={{ background: TN.border }}>
        <Brief
          who="Agent B" role="Prosecution"
          tone="var(--v-false-fg)" tint="var(--v-false-bg)"
          posture="Argues the claim is false or misleading"
          body={prosecutionBrief?.trim() ? prosecutionBrief : placeholder}
          empty={!prosecutionBrief?.trim()}
        />
        <Brief
          who="Agent C" role="Defense"
          tone="var(--v-true-fg)" tint="var(--v-true-bg)"
          posture="Argues the claim has supportable elements"
          body={defenseBrief?.trim() ? defenseBrief : placeholder}
          empty={!defenseBrief?.trim()}
        />
      </div>
    </section>
  );
}

function Brief({ who, role, tone, tint, posture, body, empty }) {
  return (
    <div style={{ background: TN.surface, padding: "20px 22px" }}>
      <div className="flex items-center justify-between">
        <div style={{
          fontFamily: "Inter, sans-serif", fontSize: 10, letterSpacing: "0.2em",
          textTransform: "uppercase", color: tone,
          padding: "3px 8px", background: tint,
          border: `1px solid color-mix(in srgb, ${tone} 30%, transparent)`,
        }}>{role}</div>
        <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 11, color: TN.muted }}>{who}</span>
      </div>
      <div className="mt-3" style={{ fontFamily: "Lora, serif", fontStyle: "italic", fontSize: 14.5, color: TN.ink2 }}>
        {posture}
      </div>
      <p className="mt-4" style={{
        fontFamily: "Lora, serif", fontSize: 15, lineHeight: 1.55, color: empty ? TN.muted : TN.ink,
        fontStyle: empty ? "italic" : "normal",
      }}>
        {body}
      </p>
    </div>
  );
}

window.FactCheckApp = FactCheckApp;
window.ErrorBoundary = ErrorBoundary;
