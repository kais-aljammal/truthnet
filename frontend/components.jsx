// TruthNet — Scientific Paper UI
// Components

const { useState, useEffect, useRef } = React;

// =========================================================================
// COLOR & STYLE TOKENS
// =========================================================================
const TN = {
  bg:          "var(--bg)",
  surface:     "var(--surface)",
  surfaceSoft: "var(--tint)",
  border:      "var(--border)",
  borderSoft:  "var(--border-soft)",
  ink:         "var(--ink)",
  ink2:        "var(--ink-2)",
  muted:       "var(--muted)",
  accent:      "var(--accent)",
  rule:        "var(--border)",
};

const VERDICT_STYLE = {
  TRUE:           { fg: "var(--v-true-fg)",    bg: "var(--v-true-bg)",    label: "TRUE" },
  FALSE:          { fg: "var(--v-false-fg)",   bg: "var(--v-false-bg)",   label: "FALSE" },
  MISLEADING:     { fg: "var(--v-warn-fg)",    bg: "var(--v-warn-bg)",    label: "MISLEADING" },
  PARTIALLY_TRUE: { fg: "var(--v-warn-fg)",    bg: "var(--v-warn-bg)",    label: "PARTIALLY TRUE" },
  UNVERIFIABLE:   { fg: "var(--v-neutral-fg)", bg: "var(--v-neutral-bg)", label: "UNVERIFIABLE" },
  SATIRE:         { fg: "var(--v-neutral-fg)", bg: "var(--v-neutral-bg)", label: "SATIRE" },
};

// =========================================================================
// SMALL PRIMITIVES
// =========================================================================
function SectionLabel({ children, className = "" }) {
  return (
    <div className={`font-sans text-[11px] font-bold tracking-[0.18em] uppercase ${className}`}
         style={{ color: TN.muted, fontFamily: "Inter, sans-serif" }}>
      {children}
    </div>
  );
}

function H2({ num, children, id }) {
  return (
    <h2 id={id} className="scroll-mt-8 flex items-baseline gap-3"
        style={{ fontFamily: "Lora, serif", fontWeight: 600, color: TN.ink, fontSize: 28, letterSpacing: "-0.01em" }}>
      <span style={{ color: TN.muted, fontWeight: 400, fontSize: 18, fontStyle: "italic" }}>§{num}</span>
      <span>{children}</span>
    </h2>
  );
}

function Rule({ className = "" }) {
  return <hr className={`my-10 ${className}`} style={{ border: 0, borderTop: `1px solid ${TN.rule}` }} />;
}

// =========================================================================
// CHAT INPUT
// =========================================================================
function ChatInput({ value, onChange, onSubmit, onLoadDemo, status }) {
  const loading = status === "loading";
  const chars = value.length;
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3">
        <SectionLabel>Claim Input</SectionLabel>
      </div>

      <div className="relative" style={{
        background: TN.surface,
        border: `1px solid ${TN.border}`,
        boxShadow: "var(--inset-shadow)",
      }}>
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={loading}
          rows={5}
          placeholder="Paste any claim, headline, or social-media post here…"
          className="w-full resize-none outline-none px-5 py-4 bg-transparent"
          style={{
            fontFamily: "Lora, serif",
            fontSize: 18,
            lineHeight: 1.55,
            color: TN.ink,
            fontStyle: value ? "normal" : "italic",
          }}
        />
        <div className="flex items-center justify-between border-t px-4 py-2.5"
             style={{ borderColor: TN.borderSoft, background: TN.surfaceSoft }}>
          <div className="flex items-center gap-3" style={{ fontFamily: "Inter, sans-serif", fontSize: 11, color: TN.muted }}>
            <span>{chars} characters</span>
            <span>·</span>
            <span>{value.trim() ? value.trim().split(/\s+/).length : 0} words</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onLoadDemo}
              disabled={loading}
              className="px-3 py-1.5 transition-colors disabled:opacity-40"
              style={{
                fontFamily: "Inter, sans-serif", fontSize: 12, color: TN.ink2,
                background: "transparent", border: `1px solid ${TN.border}`,
                letterSpacing: "0.04em",
              }}
              onMouseEnter={(e)=>e.currentTarget.style.background = TN.bg}
              onMouseLeave={(e)=>e.currentTarget.style.background = "transparent"}
            >[ Sample Claim ]</button>
            <button
              onClick={onSubmit}
              disabled={loading || !value.trim()}
              className="px-4 py-1.5 transition-all disabled:opacity-40"
              style={{
                fontFamily: "Inter, sans-serif", fontSize: 12, fontWeight: 600,
                background: TN.ink, color: TN.bg,
                letterSpacing: "0.04em",
              }}
            >
              {loading ? "PROCESSING…" : "Submit for Fact-Check →"}
            </button>
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between text-[11px]"
           style={{ fontFamily: "Inter, sans-serif", color: TN.muted }}>
        <span>By submitting, the claim is processed by four independent agents (A, B, C, D).</span>
        <span className="font-mono">↵ Cmd+Enter to submit</span>
      </div>
    </div>
  );
}

// =========================================================================
// PIPELINE STATUS — 4-step horizontal tracker
// =========================================================================
function PipelineStatus({ step }) {
  const stages = [
    { label: "Claim Extraction",     agent: "Agent A",      sec: "§1" },
    { label: "Prosecution + Defense", agent: "Agents B + C", sec: "§2–3" },
    { label: "Judgment",             agent: "Agent D",      sec: "§4" },
    { label: "Verdict Compiled",     agent: "Output",       sec: "§5" },
  ];

  const stateFor = (i) => {
    if (step >= i + 1) return "done";
    if (step === i) return "active";
    return "pending";
  };

  return (
    <div className="w-full" style={{
      background: TN.surface, border: `1px solid ${TN.border}`,
      padding: "18px 22px",
      boxShadow: "var(--inset-shadow)",
    }}>
      <div className="flex items-center justify-between mb-4">
        <SectionLabel>Document Processing Timeline</SectionLabel>
        <div style={{ fontFamily: "JetBrains Mono, ui-monospace, monospace", fontSize: 11, color: TN.muted }}>
          t = {(step * 4.2).toFixed(1)}s
        </div>
      </div>

      <div className="relative grid grid-cols-4 gap-2">
        {stages.map((s, i) => {
          const st = stateFor(i);
          const done = st === "done";
          const active = st === "active";
          return (
            <div key={i} className="relative flex flex-col items-start">
              {i < stages.length - 1 && (
                <div className="absolute top-[10px] left-[24px] right-[-8px] h-px"
                     style={{
                       background: `repeating-linear-gradient(to right, ${done ? TN.ink : TN.border} 0 4px, transparent 4px 8px)`
                     }} />
              )}
              <div className="flex items-center gap-2 mb-2 relative z-10">
                {done ? (
                  <div style={{
                    width: 20, height: 20, borderRadius: 999,
                    background: TN.ink, color: TN.bg,
                    display: "grid", placeItems: "center",
                    fontFamily: "Inter, sans-serif", fontSize: 11, fontWeight: 700,
                  }}>✓</div>
                ) : active ? (
                  <div className="tn-pulse" style={{
                    width: 20, height: 20, borderRadius: 999,
                    background: TN.accent,
                    boxShadow: `0 0 0 4px color-mix(in srgb, ${TN.accent} 18%, transparent)`,
                  }} />
                ) : (
                  <div style={{
                    width: 20, height: 20, borderRadius: 999,
                    border: `1px solid ${TN.border}`, background: TN.surface,
                  }} />
                )}
                <span style={{ fontFamily: "JetBrains Mono, ui-monospace, monospace", fontSize: 10, color: TN.muted }}>
                  {s.sec}
                </span>
              </div>
              <div style={{
                fontFamily: "Lora, serif", fontSize: 15, fontWeight: 600,
                color: done ? TN.muted : TN.ink,
                textDecoration: done ? "line-through" : "none",
                lineHeight: 1.2,
              }}>{s.label}</div>
              <div style={{
                fontFamily: "Inter, sans-serif", fontSize: 11, color: TN.muted, marginTop: 2,
              }}>
                {done ? "✓ " : active ? "⏳ " : "· "}{s.agent}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// =========================================================================
// VERDICT CARD
// =========================================================================
function VerdictCard({ result }) {
  const verdict = result?.verdict ?? "UNVERIFIABLE";
  const v = VERDICT_STYLE[verdict] || VERDICT_STYLE.UNVERIFIABLE;
  const score = result?.confidence_score ?? 0;
  const headline = result?.headline_summary ?? "";
  const bias = result?.bias_rating_of_original ?? "neutral";
  const expertNote = result?.domain_expert_note ?? "";
  const errorMargin = result?.error_margin_note ?? "";

  const biasLabel = {
    neutral: "Neutral",
    slightly_biased: "Slightly Biased",
    highly_biased: "Highly Biased",
    propaganda: "Propaganda",
  }[bias] || bias;

  return (
    <section id="verdict" className="scroll-mt-8">
      <H2 num="1">Verdict</H2>
      <div className="mt-6">
        <div className="flex flex-col md:flex-row gap-6 items-start">
          <div className="relative shrink-0" style={{
            background: v.bg, border: `2px solid ${v.fg}`, color: v.fg,
            padding: "18px 26px", transform: "rotate(-1.4deg)",
            boxShadow: `inset 0 0 0 1px ${v.bg}`,
          }}>
            <div style={{ fontFamily: "Inter, sans-serif", fontSize: 10, letterSpacing: "0.2em", opacity: 0.7, marginBottom: 4 }}>
              FINAL JUDGMENT
            </div>
            <div style={{ fontFamily: "Lora, serif", fontWeight: 700, fontSize: 44, lineHeight: 1, letterSpacing: "-0.01em" }}>
              {v.label}
            </div>
            <div style={{ fontFamily: "JetBrains Mono, ui-monospace, monospace", fontSize: 10, marginTop: 6, opacity: 0.8 }}>
              {new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "2-digit" })}
            </div>
          </div>
          <div className="flex-1">
            <p style={{ fontFamily: "Lora, serif", fontStyle: "italic", fontSize: 20, lineHeight: 1.5, color: TN.ink }}>
              {headline}
            </p>
            <div className="mt-3 flex flex-wrap gap-2 items-center">
              <span style={{
                fontFamily: "Inter, sans-serif", fontSize: 11, padding: "3px 8px",
                border: `1px solid ${TN.border}`, color: TN.ink2, background: TN.bg,
              }}>[ Bias: {biasLabel} ]</span>
              <span style={{
                fontFamily: "Inter, sans-serif", fontSize: 11, padding: "3px 8px",
                border: `1px solid ${TN.border}`, color: TN.ink2, background: TN.bg,
              }}>[ {result?.top_sources?.length ?? 0} sources reviewed ]</span>
            </div>
          </div>
        </div>

        <div className="mt-10">
          <div className="flex items-baseline justify-between mb-3">
            <SectionLabel>Confidence Measurement</SectionLabel>
            <div style={{ fontFamily: "JetBrains Mono, ui-monospace, monospace", fontSize: 11, color: TN.ink }}>
              {score.toFixed(1)} / 100
            </div>
          </div>
          <ConfidenceRuler score={score} />
        </div>

        {expertNote && (
          <blockquote className="mt-8" style={{
            borderLeft: `3px solid ${TN.accent}`,
            background: TN.surfaceSoft,
            padding: "16px 20px",
          }}>
            <SectionLabel className="mb-2">Domain Expert Note</SectionLabel>
            <div style={{ fontFamily: "Lora, serif", fontStyle: "italic", fontSize: 15, lineHeight: 1.55, color: TN.ink }}>
              {expertNote}
            </div>
          </blockquote>
        )}

        {errorMargin && (
          <p className="mt-6" style={{ fontFamily: "Inter, sans-serif", fontStyle: "italic", fontSize: 12, color: TN.muted, lineHeight: 1.5 }}>
            ⁂ {errorMargin}
          </p>
        )}
      </div>
    </section>
  );
}

function DetailedExplanation({ result }) {
  const explanation = result?.detailed_explanation ?? "";
  return (
    <section id="explanation" className="scroll-mt-8">
      <H2 num="4">Detailed Explanation</H2>
      <p className="mt-3" style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: TN.ink2, lineHeight: 1.55 }}>
        Synthesized reasoning from Agent D, drawing on both briefs and the retrieved corpus.
      </p>
      <div className="mt-6" style={{ fontFamily: "Lora, serif", fontSize: 17, lineHeight: 1.7, color: TN.ink }}>
        {explanation.split("\n\n").map((p, i) => (
          <p key={i} className="mb-5" style={{ textIndent: i === 0 ? 0 : "1.5em" }}>{p}</p>
        ))}
      </div>
    </section>
  );
}

window.DetailedExplanation = DetailedExplanation;

function ConfidenceRuler({ score }) {
  const ticks = Array.from({ length: 21 }, (_, i) => i * 5);
  return (
    <div className="relative" style={{ paddingTop: 22, paddingBottom: 28 }}>
      <div style={{
        position: "relative", height: 14, borderBottom: `1px solid ${TN.ink}`,
      }}>
        {ticks.map((t) => {
          const major = t % 25 === 0;
          return (
            <div key={t}
                 style={{
                   position: "absolute", left: `${t}%`, bottom: 0,
                   width: 1, height: major ? 12 : 6, background: TN.ink,
                 }}/>
          );
        })}
        <div style={{
          position: "absolute", left: `${score}%`, bottom: -6, transform: "translateX(-50%)",
          width: 0, height: 0,
          borderLeft: "8px solid transparent",
          borderRight: "8px solid transparent",
          borderBottom: `12px solid ${TN.ink}`,
        }} />
        <div style={{
          position: "absolute", left: `${score}%`, top: -22, transform: "translateX(-50%)",
          fontFamily: "JetBrains Mono, ui-monospace, monospace", fontSize: 11, color: TN.ink,
          background: TN.bg, padding: "1px 6px", border: `1px solid ${TN.border}`,
          whiteSpace: "nowrap",
        }}>{score}%</div>
      </div>
      <div className="relative" style={{ height: 0 }}>
        {[0, 25, 50, 75, 100].map((t) => (
          <div key={t} style={{
            position: "absolute", left: `${t}%`, top: 4, transform: "translateX(-50%)",
            fontFamily: "JetBrains Mono, ui-monospace, monospace", fontSize: 10, color: TN.muted,
          }}>{t}</div>
        ))}
      </div>
      <div className="flex justify-between mt-7" style={{ fontFamily: "Inter, sans-serif", fontSize: 11, color: TN.ink2 }}>
        <span>No Confidence</span>
        <span style={{ color: TN.muted }}>Moderate</span>
        <span>High Confidence</span>
      </div>
    </div>
  );
}

// =========================================================================
// EVIDENCE PANEL
// =========================================================================
function EvidencePanel({ result }) {
  const sections = [
    {
      key: "true",  letter: "A", title: "Verified Facts",
      items: result?.what_is_true ?? [], glyph: "✓",
      color: "var(--v-true-fg)", tint: "var(--v-true-bg)",
    },
    {
      key: "false", letter: "B", title: "Debunked Elements",
      items: result?.what_is_false ?? [], glyph: "✗",
      color: "var(--v-false-fg)", tint: "var(--v-false-bg)",
    },
    {
      key: "missing", letter: "C", title: "Missing Context",
      items: result?.what_is_missing ?? [], glyph: "?",
      color: "var(--v-warn-fg)", tint: "var(--v-warn-bg)",
    },
  ];

  return (
    <section id="evidence" className="scroll-mt-8">
      <H2 num="5">Appendices — Evidence Breakdown</H2>
      <p className="mt-3" style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: TN.ink2, lineHeight: 1.55 }}>
        The following appendices enumerate the discrete factual elements identified by Agents B and C and ratified by Agent D.
      </p>
      <div className="mt-6 flex flex-col">
        {sections.map((s) => <Appendix key={s.key} s={s} />)}
      </div>
    </section>
  );
}

function Appendix({ s }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderTop: `1px solid ${TN.border}` }}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between py-4 text-left transition-colors"
        style={{ background: open ? TN.surfaceSoft : "transparent" }}
        onMouseEnter={(e)=> { if (!open) e.currentTarget.style.background = TN.surfaceSoft; }}
        onMouseLeave={(e)=> { if (!open) e.currentTarget.style.background = "transparent"; }}
      >
        <div className="flex items-center gap-4">
          <span style={{ fontFamily: "JetBrains Mono, ui-monospace, monospace", fontSize: 12, color: TN.muted, width: 30 }}>
            App. {s.letter}
          </span>
          <span style={{ fontFamily: "Lora, serif", fontSize: 19, fontWeight: 600, color: TN.ink }}>
            {s.title}
          </span>
          <span style={{
            fontFamily: "Inter, sans-serif", fontSize: 11, color: s.color,
            padding: "2px 8px", background: s.tint,
            border: `1px solid color-mix(in srgb, ${s.color} 25%, transparent)`,
          }}>
            {s.items.length} item{s.items.length === 1 ? "" : "s"}
          </span>
        </div>
        <span style={{ fontFamily: "JetBrains Mono, ui-monospace, monospace", fontSize: 14, color: TN.muted }}>
          {open ? "−" : "+"}
        </span>
      </button>
      <div style={{
        overflow: "hidden",
        maxHeight: open ? 800 : 0,
        transition: "max-height 320ms cubic-bezier(0.4, 0, 0.2, 1)",
      }}>
        <div className="pb-6 pl-[64px] pr-4">
          <ol className="flex flex-col gap-3">
            {s.items.map((it, i) => (
              <li key={i} className="flex gap-3" style={{ fontFamily: "Lora, serif", fontSize: 16, lineHeight: 1.55, color: TN.ink }}>
                <span style={{ color: s.color, fontWeight: 700, fontSize: 18, width: 28, flexShrink: 0 }}>
                  {s.glyph}<span style={{ fontSize: 11, marginLeft: 2, color: TN.muted, fontFamily: "JetBrains Mono, monospace" }}>{i+1}</span>
                </span>
                <span>{it}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}

// =========================================================================
// SOURCE LIST
// =========================================================================
function SourceList({ sources }) {
  return (
    <section id="sources" className="scroll-mt-8">
      <H2 num="6">References</H2>
      <p className="mt-3" style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: TN.ink2, lineHeight: 1.55 }}>
        External documents retrieved and weighed by the panel. Click each to inspect the underlying source.
      </p>
      {(!sources || sources.length === 0) ? (
        <p className="mt-6" style={{ fontFamily: "Lora, serif", fontStyle: "italic", color: TN.muted }}>
          No external sources were cited by the agents.
        </p>
      ) : (
        <ol className="mt-6 flex flex-col">
          {sources.map((src, i) => <SourceItem key={i} idx={i+1} src={src} />)}
        </ol>
      )}
    </section>
  );
}

function SourceItem({ idx, src }) {
  const tagColor = {
    debunks: "var(--v-false-fg)",
    claim: "var(--v-true-fg)",
    contextualizes: "var(--accent)",
  }[src.supports] || TN.muted;
  return (
    <li className="grid py-3" style={{
      gridTemplateColumns: "36px 1fr",
      borderTop: `1px solid ${TN.borderSoft}`,
      alignItems: "baseline", gap: 16,
    }}>
      <span style={{ fontFamily: "JetBrains Mono, ui-monospace, monospace", fontSize: 12, color: TN.muted }}>
        [{idx}]
      </span>
      <div>
        <div style={{ fontFamily: "Lora, serif", fontSize: 16, color: TN.ink }}>
          {src.title}
          <span style={{ marginLeft: 10, fontFamily: "Inter, sans-serif", fontSize: 11,
                          color: tagColor, textTransform: "uppercase", letterSpacing: "0.1em" }}>
            · {src.supports}
          </span>
        </div>
        {/* BACKEND NOTE: mock data uses bare domains (e.g. "reuters.com/...").
            If the backend returns full URLs (e.g. "https://reuters.com/..."), remove the prefix logic below. */}
        <a href={src.url.startsWith("http") ? src.url : "https://" + src.url} target="_blank" rel="noopener noreferrer"
           style={{ fontFamily: "JetBrains Mono, ui-monospace, monospace", fontSize: 11.5,
                    color: TN.accent, textDecoration: "underline", textUnderlineOffset: 3 }}>
          {src.url}
        </a>
      </div>
    </li>
  );
}

// =========================================================================
// MANIPULATION ALERT
// =========================================================================
function ManipulationAlert({ techniques }) {
  if (!techniques || techniques.length === 0) return null;
  return (
    <aside className="tn-slide-in" style={{
      background: "var(--v-warn-bg)",
      border: `1px solid color-mix(in srgb, var(--v-warn-fg) 35%, transparent)`,
      padding: "16px 18px",
    }}>
      <div className="flex items-center gap-2 mb-3">
        <span style={{ fontSize: 12, color: "var(--v-warn-fg)" }}>⚠</span>
        <SectionLabel className="!text-[10px]">Rhetorical Analysis</SectionLabel>
      </div>
      <div style={{ fontFamily: "Lora, serif", fontSize: 13.5, fontWeight: 600, color: "var(--v-warn-fg)", marginBottom: 10 }}>
        Manipulation techniques detected in the original claim
      </div>
      <ul className="flex flex-col gap-2.5">
        {techniques.map((t, i) => (
          <li key={i} style={{
            fontFamily: "Inter, sans-serif", fontSize: 12.5, lineHeight: 1.5,
            color: TN.ink, borderLeft: `2px solid var(--v-warn-fg)`, paddingLeft: 10,
          }}>
            {t}
          </li>
        ))}
      </ul>
      <div className="mt-3 pt-3" style={{
        borderTop: `1px dashed color-mix(in srgb, var(--v-warn-fg) 45%, transparent)`,
        fontFamily: "JetBrains Mono, ui-monospace, monospace", fontSize: 10, color: "var(--v-warn-fg)",
      }}>
        margin note · §1
      </div>
    </aside>
  );
}

// expose
Object.assign(window, {
  ChatInput, PipelineStatus, VerdictCard, EvidencePanel, SourceList, ManipulationAlert,
  H2, SectionLabel, Rule, TN, VERDICT_STYLE,
});
