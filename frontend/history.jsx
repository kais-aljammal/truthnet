// TruthNet — Fact-check history

const VERDICT_COLORS = {
  TRUE: "var(--v-true-fg)",
  FALSE: "var(--v-false-fg)",
  MISLEADING: "var(--v-mislead-fg)",
  PARTIALLY_TRUE: "var(--v-warn-fg)",
  UNVERIFIABLE: "var(--v-neutral-fg)",
  SATIRE: "var(--v-neutral-fg)",
};

async function fetchFactChecks(limit = 20, offset = 0) {
  const res = await fetch(`/api/me/fact-checks?limit=${limit}&offset=${offset}`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error("Could not load history.");
  return res.json();
}

async function fetchFactCheckDetail(id) {
  const res = await fetch(`/api/me/fact-checks/${id}`, { credentials: "include" });
  if (!res.ok) throw new Error("Could not load verdict details.");
  return res.json();
}

function HistoryRow({ item, expanded, onToggle, detail, loadingDetail }) {
  const verdictColor = VERDICT_COLORS[item.verdict] || TN.ink;

  return (
    <>
      <tr
        onClick={onToggle}
        style={{ cursor: item.has_response ? "pointer" : "default", background: expanded ? TN.surfaceSoft : TN.surface }}
      >
        <td style={{ padding: "12px 14px", fontFamily: "Lora, serif", fontSize: 14, color: TN.ink, maxWidth: 420 }}>
          {item.claim_snippet}
        </td>
        <td style={{ padding: "12px 14px", fontFamily: "JetBrains Mono, monospace", fontSize: 12, color: verdictColor, whiteSpace: "nowrap" }}>
          {item.verdict}
        </td>
        <td style={{ padding: "12px 14px", fontFamily: "JetBrains Mono, monospace", fontSize: 12, color: TN.muted }}>
          {item.confidence}%
        </td>
        <td style={{ padding: "12px 14px", fontFamily: "Inter, sans-serif", fontSize: 12, color: TN.muted, whiteSpace: "nowrap" }}>
          {new Date(item.created_at).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}
        </td>
        <td style={{ padding: "12px 14px", fontFamily: "Inter, sans-serif", fontSize: 11, color: TN.muted }}>
          {item.has_response ? (expanded ? "−" : "+") : "—"}
        </td>
      </tr>
      {expanded && (
        <tr>
          <td colSpan={5} style={{ padding: "16px 14px", background: TN.surfaceSoft, borderTop: `1px solid ${TN.borderSoft}` }}>
            {loadingDetail && <p style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: TN.muted }}>Loading…</p>}
            {!loadingDetail && detail?.response_json && (
              <pre style={{
                fontFamily: "JetBrains Mono, monospace", fontSize: 11, color: TN.ink2,
                whiteSpace: "pre-wrap", wordBreak: "break-word", maxHeight: 360, overflow: "auto",
                margin: 0,
              }}>
                {JSON.stringify(detail.response_json, null, 2)}
              </pre>
            )}
            {!loadingDetail && !detail?.response_json && (
              <p style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: TN.muted }}>No stored response for this check.</p>
            )}
          </td>
        </tr>
      )}
    </>
  );
}

function HistoryPage({ user, navigate, onLogout }) {
  const [items, setItems] = React.useState([]);
  const [total, setTotal] = React.useState(0);
  const [offset, setOffset] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");
  const [expandedId, setExpandedId] = React.useState(null);
  const [details, setDetails] = React.useState({});
  const [loadingDetail, setLoadingDetail] = React.useState(null);
  const limit = 20;

  const load = React.useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchFactChecks(limit, offset);
      setItems(data.items || []);
      setTotal(data.total || 0);
    } catch (err) {
      setError(err.message || "Failed to load history.");
    } finally {
      setLoading(false);
    }
  }, [offset]);

  React.useEffect(() => { load(); }, [load]);

  const toggleRow = async (item) => {
    if (!item.has_response) return;
    if (expandedId === item.id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(item.id);
    if (details[item.id]) return;

    setLoadingDetail(item.id);
    try {
      const detail = await fetchFactCheckDetail(item.id);
      setDetails((d) => ({ ...d, [item.id]: detail }));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingDetail(null);
    }
  };

  const canPrev = offset > 0;
  const canNext = offset + limit < total;

  return (
    <div style={{ minHeight: "100vh", background: TN.bg, color: TN.ink }}>
      <header style={{ borderBottom: `1px solid ${TN.border}`, background: TN.bg }}>
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <a href="/app" onClick={(e) => { e.preventDefault(); navigate("/app"); }}
             style={{ fontFamily: "Lora, serif", fontWeight: 700, fontSize: 20, color: TN.ink, textDecoration: "none" }}>
            ← Back to app
          </a>
          <span style={{ fontFamily: "Inter, sans-serif", fontSize: 12, color: TN.muted }}>{user?.email}</span>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">
        <SectionLabel>Archive</SectionLabel>
        <h1 style={{ fontFamily: "Lora, serif", fontWeight: 700, fontSize: 32, marginTop: 8 }}>
          Fact-check history
        </h1>
        <p className="mt-2 mb-8" style={{ fontFamily: "Inter, sans-serif", fontSize: 14, color: TN.ink2 }}>
          Past verdicts for your account. Click a row to expand the full judgment JSON.
        </p>

        {error && (
          <p style={{ color: "var(--v-false-fg)", fontFamily: "Inter, sans-serif", fontSize: 13 }}>{error}</p>
        )}

        {loading ? (
          <p style={{ fontFamily: "Inter, sans-serif", fontSize: 14, color: TN.muted }}>Loading…</p>
        ) : items.length === 0 ? (
          <p style={{ fontFamily: "Inter, sans-serif", fontSize: 14, color: TN.muted }}>
            No fact-checks yet. Run your first analysis in the app.
          </p>
        ) : (
          <div style={{ border: `1px solid ${TN.border}`, overflowX: "auto" }}>
            <table className="w-full" style={{ borderCollapse: "collapse", minWidth: 640 }}>
              <thead>
                <tr style={{ background: TN.surfaceSoft, borderBottom: `1px solid ${TN.border}` }}>
                  {["Claim", "Verdict", "Confidence", "Date", ""].map((h) => (
                    <th key={h} style={{
                      padding: "10px 14px", textAlign: "left",
                      fontFamily: "Inter, sans-serif", fontSize: 10, letterSpacing: "0.12em",
                      textTransform: "uppercase", color: TN.muted, fontWeight: 600,
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <HistoryRow
                    key={item.id}
                    item={item}
                    expanded={expandedId === item.id}
                    onToggle={() => toggleRow(item)}
                    detail={details[item.id]}
                    loadingDetail={loadingDetail === item.id}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}

        {total > limit && (
          <div className="mt-6 flex items-center gap-4">
            <button type="button" className="tn-btn-ghost" disabled={!canPrev} onClick={() => setOffset((o) => Math.max(0, o - limit))}>
              ← Previous
            </button>
            <span style={{ fontFamily: "Inter, sans-serif", fontSize: 12, color: TN.muted }}>
              {offset + 1}–{Math.min(offset + limit, total)} of {total}
            </span>
            <button type="button" className="tn-btn-ghost" disabled={!canNext} onClick={() => setOffset((o) => o + limit)}>
              Next →
            </button>
          </div>
        )}

        <div className="mt-10 flex gap-4">
          <button type="button" className="tn-btn-primary" onClick={() => navigate("/app")}>
            New fact-check →
          </button>
          {onLogout && (
            <button type="button" className="tn-btn-ghost" onClick={onLogout}>Log out</button>
          )}
        </div>
      </main>
    </div>
  );
}

window.HistoryPage = HistoryPage;
window.fetchFactChecks = fetchFactChecks;
