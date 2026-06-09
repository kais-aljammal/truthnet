// TruthNet — Scientific Paper UI
// Components

const {
  useState,
  useEffect,
  useRef
} = React;

// =========================================================================
// COLOR & STYLE TOKENS
// =========================================================================
const TN = {
  bg: "var(--bg)",
  surface: "var(--surface)",
  surfaceSoft: "var(--tint)",
  border: "var(--border)",
  borderSoft: "var(--border-soft)",
  ink: "var(--ink)",
  ink2: "var(--ink-2)",
  muted: "var(--muted)",
  accent: "var(--accent)",
  rule: "var(--border)"
};
const VERDICT_STYLE = {
  TRUE: {
    fg: "var(--v-true-fg)",
    bg: "var(--v-true-bg)",
    label: "TRUE"
  },
  FALSE: {
    fg: "var(--v-false-fg)",
    bg: "var(--v-false-bg)",
    label: "FALSE"
  },
  MISLEADING: {
    fg: "var(--v-mislead-fg)",
    bg: "var(--v-mislead-bg)",
    label: "MISLEADING"
  },
  PARTIALLY_TRUE: {
    fg: "var(--v-warn-fg)",
    bg: "var(--v-warn-bg)",
    label: "PARTIALLY TRUE"
  },
  UNVERIFIABLE: {
    fg: "var(--v-neutral-fg)",
    bg: "var(--v-neutral-bg)",
    label: "UNVERIFIABLE"
  },
  SATIRE: {
    fg: "var(--v-neutral-fg)",
    bg: "var(--v-neutral-bg)",
    label: "SATIRE"
  }
};

// =========================================================================
// SMALL PRIMITIVES
// =========================================================================
function SectionLabel({
  children,
  className = ""
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: `font-sans text-[11px] font-bold tracking-[0.18em] uppercase ${className}`,
    style: {
      color: TN.muted,
      fontFamily: "Inter, sans-serif"
    }
  }, children);
}
function H2({
  num,
  children,
  id
}) {
  return /*#__PURE__*/React.createElement("h2", {
    id: id,
    className: "scroll-mt-8 flex items-baseline gap-3",
    style: {
      fontFamily: "Lora, serif",
      fontWeight: 600,
      color: TN.ink,
      fontSize: 28,
      letterSpacing: "-0.01em"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: TN.muted,
      fontWeight: 400,
      fontSize: 18,
      fontStyle: "italic"
    }
  }, "\xA7", num), /*#__PURE__*/React.createElement("span", null, children));
}
function Rule({
  className = ""
}) {
  return /*#__PURE__*/React.createElement("hr", {
    className: `my-10 ${className}`,
    style: {
      border: 0,
      borderTop: `1px solid ${TN.rule}`
    }
  });
}

// =========================================================================
// CHAT INPUT
// =========================================================================
function ChatInput({
  value,
  onChange,
  onSubmit,
  onLoadDemo,
  status
}) {
  const loading = status === "loading";
  const quotaBlocked = status === "quota_blocked";
  const disabled = loading || quotaBlocked;
  const chars = value.length;
  return /*#__PURE__*/React.createElement("div", {
    className: "w-full"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center justify-between mb-3"
  }, /*#__PURE__*/React.createElement(SectionLabel, null, "Claim Input")), /*#__PURE__*/React.createElement("div", {
    className: "relative",
    style: {
      background: TN.surface,
      border: `1px solid ${TN.border}`,
      boxShadow: "var(--inset-shadow)"
    }
  }, /*#__PURE__*/React.createElement("textarea", {
    value: value,
    onChange: e => onChange(e.target.value),
    disabled: disabled,
    rows: 5,
    placeholder: "Paste any claim, headline, or social-media post here\u2026",
    className: "w-full resize-none outline-none px-5 py-4 bg-transparent",
    style: {
      fontFamily: "Lora, serif",
      fontSize: 18,
      lineHeight: 1.55,
      color: TN.ink,
      fontStyle: value ? "normal" : "italic"
    }
  }), /*#__PURE__*/React.createElement("div", {
    className: "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-t px-4 py-2.5",
    style: {
      borderColor: TN.borderSoft,
      background: TN.surfaceSoft
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-3",
    style: {
      fontFamily: "Inter, sans-serif",
      fontSize: 11,
      color: TN.muted
    }
  }, /*#__PURE__*/React.createElement("span", null, chars, " characters"), /*#__PURE__*/React.createElement("span", null, "\xB7"), /*#__PURE__*/React.createElement("span", null, value.trim() ? value.trim().split(/\s+/).length : 0, " words")), /*#__PURE__*/React.createElement("div", {
    className: "flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto"
  }, /*#__PURE__*/React.createElement("button", {
    onClick: onLoadDemo,
    disabled: disabled,
    className: "px-3 py-1.5 transition-colors disabled:opacity-40",
    style: {
      fontFamily: "Inter, sans-serif",
      fontSize: 12,
      color: TN.ink2,
      background: "transparent",
      border: `1px solid ${TN.border}`,
      letterSpacing: "0.04em"
    },
    onMouseEnter: e => e.currentTarget.style.background = TN.bg,
    onMouseLeave: e => e.currentTarget.style.background = "transparent"
  }, "[ Sample Claim ]"), /*#__PURE__*/React.createElement("button", {
    onClick: onSubmit,
    disabled: disabled || !value.trim(),
    className: "px-4 py-1.5 transition-all disabled:opacity-40",
    style: {
      fontFamily: "Inter, sans-serif",
      fontSize: 12,
      fontWeight: 600,
      background: TN.ink,
      color: TN.bg,
      letterSpacing: "0.04em"
    }
  }, loading ? "PROCESSING…" : quotaBlocked ? "Daily limit reached" : "Submit for Fact-Check →")))), /*#__PURE__*/React.createElement("div", {
    className: "mt-3 flex items-center justify-between text-[11px]",
    style: {
      fontFamily: "Inter, sans-serif",
      color: TN.muted
    }
  }, /*#__PURE__*/React.createElement("span", null, "By submitting, the claim is processed by four independent agents (A, B, C, D)."), /*#__PURE__*/React.createElement("span", {
    className: "font-mono"
  }, "\u21B5 Cmd+Enter to submit")));
}

// =========================================================================
// PIPELINE STATUS — live SSE step tracker
// =========================================================================
function PipelineStatus({
  agentSteps
}) {
  const steps = [{
    key: "sources",
    label: "Gathering sources",
    agent: "Agent A"
  }, {
    key: "prosecution",
    label: "Building prosecution case",
    agent: "Agent B"
  }, {
    key: "defense",
    label: "Building defense case",
    agent: "Agent C"
  }, {
    key: "verdict",
    label: "Reaching verdict",
    agent: "Agent D"
  }];
  const stepState = key => {
    if (agentSteps?.[key] === "done") return "done";
    if (agentSteps?.[key] === "active") return "active";
    return "pending";
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "w-full",
    style: {
      background: TN.surface,
      border: `1px solid ${TN.border}`,
      padding: "18px 22px",
      boxShadow: "var(--inset-shadow)"
    }
  }, /*#__PURE__*/React.createElement(SectionLabel, {
    className: "mb-4"
  }, "Agent Progress"), /*#__PURE__*/React.createElement("ul", {
    className: "flex flex-col gap-3"
  }, steps.map(s => {
    const st = stepState(s.key);
    const done = st === "done";
    const active = st === "active";
    return /*#__PURE__*/React.createElement("li", {
      key: s.key,
      className: "flex items-center gap-3"
    }, done ? /*#__PURE__*/React.createElement("span", {
      style: {
        width: 22,
        height: 22,
        borderRadius: 999,
        background: TN.ink,
        color: TN.bg,
        display: "grid",
        placeItems: "center",
        fontSize: 12,
        fontWeight: 700
      }
    }, "\u2713") : active ? /*#__PURE__*/React.createElement("span", {
      className: "tn-pulse",
      style: {
        width: 22,
        height: 22,
        borderRadius: 999,
        background: TN.accent,
        boxShadow: `0 0 0 4px color-mix(in srgb, ${TN.accent} 18%, transparent)`
      }
    }) : /*#__PURE__*/React.createElement("span", {
      style: {
        width: 22,
        height: 22,
        borderRadius: 999,
        border: `1px solid ${TN.border}`,
        background: TN.surface
      }
    }), /*#__PURE__*/React.createElement("div", {
      className: "flex-1 min-w-0"
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: "Lora, serif",
        fontSize: 15,
        fontWeight: 600,
        color: done ? TN.muted : TN.ink
      }
    }, s.label), /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: "Inter, sans-serif",
        fontSize: 11,
        color: TN.muted
      }
    }, done ? "Complete" : active ? "In progress…" : "Pending", " \xB7 ", s.agent)));
  })));
}
function VerdictBadge({
  verdict,
  verdictColor
}) {
  const key = (verdict || "UNVERIFIABLE").toUpperCase().replace(/\s+/g, "_");
  const styled = VERDICT_STYLE[key] || VERDICT_STYLE.UNVERIFIABLE;
  const colorMap = {
    green: {
      bg: "var(--v-true-bg)",
      fg: "var(--v-true-fg)"
    },
    red: {
      bg: "var(--v-false-bg)",
      fg: "var(--v-false-fg)"
    },
    orange: {
      bg: "var(--v-mislead-bg)",
      fg: "var(--v-mislead-fg)"
    },
    yellow: {
      bg: "var(--v-warn-bg)",
      fg: "var(--v-warn-fg)"
    },
    amber: {
      bg: "var(--v-warn-bg)",
      fg: "var(--v-warn-fg)"
    },
    gray: {
      bg: "var(--v-neutral-bg)",
      fg: "var(--v-neutral-fg)"
    }
  };
  const fromBackend = verdictColor && colorMap[verdictColor.toLowerCase()];
  const bg = fromBackend?.bg || styled.bg;
  const fg = fromBackend?.fg || styled.fg;
  const label = styled.label || String(verdict || "UNVERIFIABLE").replace(/_/g, " ");
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-block",
      padding: "6px 14px",
      borderRadius: 4,
      background: bg,
      color: fg,
      border: `1px solid ${fg}`,
      fontFamily: "Inter, sans-serif",
      fontSize: 13,
      fontWeight: 700,
      letterSpacing: "0.06em",
      textTransform: "capitalize"
    }
  }, label.toLowerCase());
}
function ConfidenceProgressBar({
  score
}) {
  if (score === null || score === undefined || Number.isNaN(Number(score))) return null;
  let normalized = Number(score);
  if (normalized > 0 && normalized <= 1) normalized *= 100;
  normalized = Math.max(0, Math.min(100, Math.round(normalized)));
  return /*#__PURE__*/React.createElement("div", {
    className: "mt-4"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "Inter, sans-serif",
      fontSize: 12,
      color: TN.ink2,
      marginBottom: 6
    }
  }, "Confidence: ", normalized, "%"), /*#__PURE__*/React.createElement("progress", {
    value: normalized,
    max: 100,
    className: "w-full h-2",
    style: {
      accentColor: TN.accent
    }
  }));
}
function PipelineWarnings({
  warnings
}) {
  if (!warnings || warnings.length === 0) return null;
  return /*#__PURE__*/React.createElement("div", {
    className: "mt-4",
    style: {
      background: "var(--v-warn-bg)",
      border: `1px solid color-mix(in srgb, var(--v-warn-fg) 35%, transparent)`,
      padding: "12px 16px"
    }
  }, /*#__PURE__*/React.createElement(SectionLabel, {
    className: "mb-2"
  }, "Pipeline Warnings"), /*#__PURE__*/React.createElement("ul", {
    className: "flex flex-col gap-1.5"
  }, warnings.map((w, i) => /*#__PURE__*/React.createElement("li", {
    key: i,
    style: {
      fontFamily: "Inter, sans-serif",
      fontSize: 12,
      color: TN.ink2
    }
  }, w))));
}
function CopyResultButton({
  claim,
  result
}) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    const score = result?.confidence_score;
    const normalized = score != null && score <= 1 ? Math.round(score * 100) : score ?? "—";
    const sources = (result?.sources || result?.top_sources || []).map(s => s?.url).filter(Boolean).join(", ");
    const text = [`Claim: ${claim}`, `Verdict: ${result?.verdict ?? "UNVERIFIABLE"} (${normalized}% confidence)`, `Summary: ${result?.summary || result?.headline_summary || ""}`, `Sources: ${sources || "none"}`].join("\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };
  return /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: handleCopy,
    className: "px-3 py-1.5",
    style: {
      fontFamily: "Inter, sans-serif",
      fontSize: 12,
      background: TN.surface,
      border: `1px solid ${TN.border}`,
      color: TN.ink2
    }
  }, copied ? "Copied ✓" : "Copy result");
}

// =========================================================================
// VERDICT CARD
// =========================================================================
function VerdictCard({
  result
}) {
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
    propaganda: "Propaganda"
  }[bias] || bias;
  return /*#__PURE__*/React.createElement("section", {
    id: "verdict",
    className: "scroll-mt-8"
  }, /*#__PURE__*/React.createElement(H2, {
    num: "1"
  }, "Verdict"), /*#__PURE__*/React.createElement("div", {
    className: "mt-6"
  }, /*#__PURE__*/React.createElement(VerdictBadge, {
    verdict: verdict,
    verdictColor: result?.verdict_color
  }), /*#__PURE__*/React.createElement(ConfidenceProgressBar, {
    score: result?.confidence_score
  }), /*#__PURE__*/React.createElement("div", {
    className: "flex flex-col md:flex-row gap-6 items-start mt-6"
  }, /*#__PURE__*/React.createElement("div", {
    className: "relative shrink-0",
    style: {
      background: v.bg,
      border: `2px solid ${v.fg}`,
      color: v.fg,
      padding: "18px 26px",
      transform: "rotate(-1.4deg)",
      boxShadow: `inset 0 0 0 1px ${v.bg}`
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "Inter, sans-serif",
      fontSize: 10,
      letterSpacing: "0.2em",
      opacity: 0.7,
      marginBottom: 4
    }
  }, "FINAL JUDGMENT"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "Lora, serif",
      fontWeight: 700,
      fontSize: 44,
      lineHeight: 1,
      letterSpacing: "-0.01em"
    }
  }, v.label), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "JetBrains Mono, ui-monospace, monospace",
      fontSize: 10,
      marginTop: 6,
      opacity: 0.8
    }
  }, new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit"
  }))), /*#__PURE__*/React.createElement("div", {
    className: "flex-1"
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: "Lora, serif",
      fontStyle: "italic",
      fontSize: 20,
      lineHeight: 1.5,
      color: TN.ink
    }
  }, headline), /*#__PURE__*/React.createElement("div", {
    className: "mt-3 flex flex-wrap gap-2 items-center"
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "Inter, sans-serif",
      fontSize: 11,
      padding: "3px 8px",
      border: `1px solid ${TN.border}`,
      color: TN.ink2,
      background: TN.bg
    }
  }, "[ Bias: ", biasLabel, " ]"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "Inter, sans-serif",
      fontSize: 11,
      padding: "3px 8px",
      border: `1px solid ${TN.border}`,
      color: TN.ink2,
      background: TN.bg
    }
  }, "[ ", result?.top_sources?.length ?? 0, " sources reviewed ]")))), /*#__PURE__*/React.createElement("div", {
    className: "mt-10"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-baseline justify-between mb-3"
  }, /*#__PURE__*/React.createElement(SectionLabel, null, "Confidence Measurement"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "JetBrains Mono, ui-monospace, monospace",
      fontSize: 11,
      color: TN.ink
    }
  }, score.toFixed(1), " / 100")), /*#__PURE__*/React.createElement(ConfidenceRuler, {
    score: score
  })), expertNote && /*#__PURE__*/React.createElement("blockquote", {
    className: "mt-8",
    style: {
      borderLeft: `3px solid ${TN.accent}`,
      background: TN.surfaceSoft,
      padding: "16px 20px"
    }
  }, /*#__PURE__*/React.createElement(SectionLabel, {
    className: "mb-2"
  }, "Domain Expert Note"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "Lora, serif",
      fontStyle: "italic",
      fontSize: 15,
      lineHeight: 1.55,
      color: TN.ink
    }
  }, expertNote)), errorMargin && /*#__PURE__*/React.createElement("p", {
    className: "mt-6",
    style: {
      fontFamily: "Inter, sans-serif",
      fontStyle: "italic",
      fontSize: 12,
      color: TN.muted,
      lineHeight: 1.5
    }
  }, "\u2042 ", errorMargin)));
}
function DetailedExplanation({
  result
}) {
  const explanation = result?.detailed_explanation ?? "";
  return /*#__PURE__*/React.createElement("section", {
    id: "explanation",
    className: "scroll-mt-8"
  }, /*#__PURE__*/React.createElement(H2, {
    num: "4"
  }, "Detailed Explanation"), /*#__PURE__*/React.createElement("p", {
    className: "mt-3",
    style: {
      fontFamily: "Inter, sans-serif",
      fontSize: 13,
      color: TN.ink2,
      lineHeight: 1.55
    }
  }, "Synthesized reasoning from Agent D, drawing on both briefs and the retrieved corpus."), /*#__PURE__*/React.createElement("div", {
    className: "mt-6",
    style: {
      fontFamily: "Lora, serif",
      fontSize: 17,
      lineHeight: 1.7,
      color: TN.ink
    }
  }, explanation.split("\n\n").map((p, i) => /*#__PURE__*/React.createElement("p", {
    key: i,
    className: "mb-5",
    style: {
      textIndent: i === 0 ? 0 : "1.5em"
    }
  }, p))));
}
window.DetailedExplanation = DetailedExplanation;
function ConfidenceRuler({
  score
}) {
  const ticks = Array.from({
    length: 21
  }, (_, i) => i * 5);
  return /*#__PURE__*/React.createElement("div", {
    className: "relative",
    style: {
      paddingTop: 22,
      paddingBottom: 28
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      height: 14,
      borderBottom: `1px solid ${TN.ink}`
    }
  }, ticks.map(t => {
    const major = t % 25 === 0;
    return /*#__PURE__*/React.createElement("div", {
      key: t,
      style: {
        position: "absolute",
        left: `${t}%`,
        bottom: 0,
        width: 1,
        height: major ? 12 : 6,
        background: TN.ink
      }
    });
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      left: `${score}%`,
      bottom: -6,
      transform: "translateX(-50%)",
      width: 0,
      height: 0,
      borderLeft: "8px solid transparent",
      borderRight: "8px solid transparent",
      borderBottom: `12px solid ${TN.ink}`
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      left: `${score}%`,
      top: -22,
      transform: "translateX(-50%)",
      fontFamily: "JetBrains Mono, ui-monospace, monospace",
      fontSize: 11,
      color: TN.ink,
      background: TN.bg,
      padding: "1px 6px",
      border: `1px solid ${TN.border}`,
      whiteSpace: "nowrap"
    }
  }, score, "%")), /*#__PURE__*/React.createElement("div", {
    className: "relative",
    style: {
      height: 0
    }
  }, [0, 25, 50, 75, 100].map(t => /*#__PURE__*/React.createElement("div", {
    key: t,
    style: {
      position: "absolute",
      left: `${t}%`,
      top: 4,
      transform: "translateX(-50%)",
      fontFamily: "JetBrains Mono, ui-monospace, monospace",
      fontSize: 10,
      color: TN.muted
    }
  }, t))), /*#__PURE__*/React.createElement("div", {
    className: "flex justify-between mt-7",
    style: {
      fontFamily: "Inter, sans-serif",
      fontSize: 11,
      color: TN.ink2
    }
  }, /*#__PURE__*/React.createElement("span", null, "No Confidence"), /*#__PURE__*/React.createElement("span", {
    style: {
      color: TN.muted
    }
  }, "Moderate"), /*#__PURE__*/React.createElement("span", null, "High Confidence")));
}

// =========================================================================
// EVIDENCE PANEL
// =========================================================================
function EvidencePanel({
  result
}) {
  const sections = [{
    key: "true",
    letter: "A",
    title: "Verified Facts",
    items: result?.what_is_true ?? [],
    glyph: "✓",
    color: "var(--v-true-fg)",
    tint: "var(--v-true-bg)"
  }, {
    key: "false",
    letter: "B",
    title: "Debunked Elements",
    items: result?.what_is_false ?? [],
    glyph: "✗",
    color: "var(--v-false-fg)",
    tint: "var(--v-false-bg)"
  }, {
    key: "missing",
    letter: "C",
    title: "Missing Context",
    items: result?.what_is_missing ?? [],
    glyph: "?",
    color: "var(--v-warn-fg)",
    tint: "var(--v-warn-bg)"
  }];
  return /*#__PURE__*/React.createElement("section", {
    id: "evidence",
    className: "scroll-mt-8"
  }, /*#__PURE__*/React.createElement(H2, {
    num: "5"
  }, "Appendices \u2014 Evidence Breakdown"), /*#__PURE__*/React.createElement("p", {
    className: "mt-3",
    style: {
      fontFamily: "Inter, sans-serif",
      fontSize: 13,
      color: TN.ink2,
      lineHeight: 1.55
    }
  }, "The following appendices enumerate the discrete factual elements identified by Agents B and C and ratified by Agent D."), /*#__PURE__*/React.createElement("div", {
    className: "mt-6 flex flex-col"
  }, sections.map(s => /*#__PURE__*/React.createElement(Appendix, {
    key: s.key,
    s: s
  }))));
}
function Appendix({
  s
}) {
  const [open, setOpen] = useState(false);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      borderTop: `1px solid ${TN.border}`
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => setOpen(o => !o),
    className: "w-full flex items-center justify-between py-4 text-left transition-colors",
    style: {
      background: open ? TN.surfaceSoft : "transparent"
    },
    onMouseEnter: e => {
      if (!open) e.currentTarget.style.background = TN.surfaceSoft;
    },
    onMouseLeave: e => {
      if (!open) e.currentTarget.style.background = "transparent";
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-4"
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "JetBrains Mono, ui-monospace, monospace",
      fontSize: 12,
      color: TN.muted,
      width: 30
    }
  }, "App. ", s.letter), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "Lora, serif",
      fontSize: 19,
      fontWeight: 600,
      color: TN.ink
    }
  }, s.title), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "Inter, sans-serif",
      fontSize: 11,
      color: s.color,
      padding: "2px 8px",
      background: s.tint,
      border: `1px solid color-mix(in srgb, ${s.color} 25%, transparent)`
    }
  }, s.items.length, " item", s.items.length === 1 ? "" : "s")), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "JetBrains Mono, ui-monospace, monospace",
      fontSize: 14,
      color: TN.muted
    }
  }, open ? "−" : "+")), /*#__PURE__*/React.createElement("div", {
    style: {
      overflow: "hidden",
      maxHeight: open ? 800 : 0,
      transition: "max-height 320ms cubic-bezier(0.4, 0, 0.2, 1)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "pb-6 pl-[64px] pr-4"
  }, /*#__PURE__*/React.createElement("ol", {
    className: "flex flex-col gap-3"
  }, s.items.map((it, i) => /*#__PURE__*/React.createElement("li", {
    key: i,
    className: "flex gap-3",
    style: {
      fontFamily: "Lora, serif",
      fontSize: 16,
      lineHeight: 1.55,
      color: TN.ink
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: s.color,
      fontWeight: 700,
      fontSize: 18,
      width: 28,
      flexShrink: 0
    }
  }, s.glyph, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      marginLeft: 2,
      color: TN.muted,
      fontFamily: "JetBrains Mono, monospace"
    }
  }, i + 1)), /*#__PURE__*/React.createElement("span", null, it)))))));
}

// =========================================================================
// SOURCE LIST
// =========================================================================
function SourceList({
  sources
}) {
  return /*#__PURE__*/React.createElement("section", {
    id: "sources",
    className: "scroll-mt-8"
  }, /*#__PURE__*/React.createElement(H2, {
    num: "6"
  }, "References"), /*#__PURE__*/React.createElement("p", {
    className: "mt-3",
    style: {
      fontFamily: "Inter, sans-serif",
      fontSize: 13,
      color: TN.ink2,
      lineHeight: 1.55
    }
  }, "External documents retrieved and weighed by the panel. Click each to inspect the underlying source."), !sources || sources.length === 0 ? /*#__PURE__*/React.createElement("p", {
    className: "mt-6",
    style: {
      fontFamily: "Lora, serif",
      fontStyle: "italic",
      color: TN.muted
    }
  }, "No external sources were cited by the agents.") : /*#__PURE__*/React.createElement("ol", {
    className: "mt-6 flex flex-col gap-3 w-full max-w-full"
  }, sources.map((src, i) => /*#__PURE__*/React.createElement(SourceItem, {
    key: i,
    idx: i + 1,
    src: src
  }))));
}
function sourceDomain(url) {
  if (!url || typeof url !== "string") return "";
  try {
    const href = url.startsWith("http") ? url : `https://${url}`;
    return new URL(href).hostname.replace(/^www\./, "");
  } catch {
    return url.split("/")[0] || url;
  }
}
function sourceHref(url) {
  if (!url || typeof url !== "string") return null;
  return url.startsWith("http") ? url : `https://${url}`;
}
function SourceItem({
  idx,
  src
}) {
  const source = src || {};
  const title = source?.title ?? source?.url ?? "Unknown source";
  const href = sourceHref(source?.url);
  const domain = sourceDomain(source?.url);
  const tagColor = {
    debunks: "var(--v-false-fg)",
    claim: "var(--v-true-fg)",
    contextualizes: "var(--accent)"
  }[source?.supports] || TN.muted;
  const cardInner = /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-2 mb-1"
  }, domain ? /*#__PURE__*/React.createElement("img", {
    src: `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}`,
    alt: "",
    width: 16,
    height: 16,
    style: {
      borderRadius: 2
    }
  }) : null, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "JetBrains Mono, ui-monospace, monospace",
      fontSize: 10,
      color: TN.muted
    }
  }, domain || "source"), source?.supports ? /*#__PURE__*/React.createElement("span", {
    style: {
      marginLeft: "auto",
      fontFamily: "Inter, sans-serif",
      fontSize: 10,
      color: tagColor,
      textTransform: "uppercase",
      letterSpacing: "0.1em"
    }
  }, source.supports) : null), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "Lora, serif",
      fontSize: 16,
      color: TN.ink,
      lineHeight: 1.35
    }
  }, title), typeof source?.snippet === "string" && source.snippet.trim() ? /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: "Inter, sans-serif",
      fontSize: 12,
      color: TN.ink2,
      marginTop: 6,
      lineHeight: 1.45,
      overflow: "hidden",
      display: "-webkit-box",
      WebkitLineClamp: 2,
      WebkitBoxOrient: "vertical"
    }
  }, source.snippet) : null, href ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "JetBrains Mono, ui-monospace, monospace",
      fontSize: 11,
      color: TN.accent,
      marginTop: 6,
      display: "block"
    }
  }, source?.url) : /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "Inter, sans-serif",
      fontSize: 11,
      color: TN.muted,
      marginTop: 6,
      display: "block"
    }
  }, "No URL provided"));
  return /*#__PURE__*/React.createElement("li", {
    className: "py-3"
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "JetBrains Mono, ui-monospace, monospace",
      fontSize: 12,
      color: TN.muted,
      display: "block",
      marginBottom: 8
    }
  }, "[", idx, "]"), href ? /*#__PURE__*/React.createElement("a", {
    href: href,
    target: "_blank",
    rel: "noopener noreferrer",
    className: "block no-underline",
    style: {
      background: TN.surface,
      border: `1px solid ${TN.borderSoft}`,
      padding: "14px 16px",
      color: "inherit",
      transition: "background 0.2s"
    },
    onMouseEnter: e => {
      e.currentTarget.style.background = TN.surfaceSoft;
    },
    onMouseLeave: e => {
      e.currentTarget.style.background = TN.surface;
    }
  }, cardInner) : /*#__PURE__*/React.createElement("div", {
    style: {
      background: TN.surface,
      border: `1px solid ${TN.borderSoft}`,
      padding: "14px 16px"
    }
  }, cardInner));
}

// =========================================================================
// MANIPULATION ALERT
// =========================================================================
function ManipulationAlert({
  techniques
}) {
  if (!techniques || techniques.length === 0) return null;
  return /*#__PURE__*/React.createElement("aside", {
    className: "tn-slide-in",
    style: {
      background: "var(--v-warn-bg)",
      border: `1px solid color-mix(in srgb, var(--v-warn-fg) 35%, transparent)`,
      padding: "16px 18px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-2 mb-3"
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: "var(--v-warn-fg)"
    }
  }, "\u26A0"), /*#__PURE__*/React.createElement(SectionLabel, {
    className: "!text-[10px]"
  }, "Rhetorical Analysis")), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "Lora, serif",
      fontSize: 13.5,
      fontWeight: 600,
      color: "var(--v-warn-fg)",
      marginBottom: 10
    }
  }, "Manipulation techniques detected in the original claim"), /*#__PURE__*/React.createElement("ul", {
    className: "flex flex-col gap-2.5"
  }, techniques.map((t, i) => /*#__PURE__*/React.createElement("li", {
    key: i,
    style: {
      fontFamily: "Inter, sans-serif",
      fontSize: 12.5,
      lineHeight: 1.5,
      color: TN.ink,
      borderLeft: `2px solid var(--v-warn-fg)`,
      paddingLeft: 10
    }
  }, t))), /*#__PURE__*/React.createElement("div", {
    className: "mt-3 pt-3",
    style: {
      borderTop: `1px dashed color-mix(in srgb, var(--v-warn-fg) 45%, transparent)`,
      fontFamily: "JetBrains Mono, ui-monospace, monospace",
      fontSize: 10,
      color: "var(--v-warn-fg)"
    }
  }, "margin note \xB7 \xA71"));
}

// expose
Object.assign(window, {
  ChatInput,
  PipelineStatus,
  VerdictCard,
  VerdictBadge,
  ConfidenceProgressBar,
  EvidencePanel,
  SourceList,
  ManipulationAlert,
  PipelineWarnings,
  CopyResultButton,
  H2,
  SectionLabel,
  Rule,
  TN,
  VERDICT_STYLE
});
