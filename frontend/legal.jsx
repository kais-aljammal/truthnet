// TruthNet — Legal stub pages

function LegalPage({ title, children, navigate }) {
  return (
    <div style={{ minHeight: "100vh", background: TN.bg, color: TN.ink }}>
      <header style={{ borderBottom: `1px solid ${TN.border}`, padding: "16px 24px" }}>
        <a href="/" onClick={(e) => { e.preventDefault(); navigate("/"); }}
           style={{ fontFamily: "Lora, serif", fontWeight: 700, fontSize: 20, color: TN.ink, textDecoration: "none" }}>
          ← TruthNet
        </a>
      </header>
      <main className="max-w-3xl mx-auto px-6 py-12">
        <h1 style={{ fontFamily: "Lora, serif", fontWeight: 700, fontSize: 32 }}>{title}</h1>
        <div className="mt-8 prose" style={{ fontFamily: "Inter, sans-serif", fontSize: 15, lineHeight: 1.65, color: TN.ink2 }}>
          {children}
        </div>
      </main>
    </div>
  );
}

function PrivacyPage({ navigate }) {
  return (
    <LegalPage title="Privacy Policy" navigate={navigate}>
      <p><em>Last updated: {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}</em></p>
      <p className="mt-4">
        TruthNet stores your account email and password hash. Fact-check claims you submit may be
        logged (truncated) to enforce daily quotas and improve the service.
      </p>
      <p className="mt-4">
        We do not sell personal data. API keys for AI providers are stored server-side only and
        never exposed to the browser.
      </p>
      <p className="mt-4">Contact: privacy@truthnet.example (placeholder)</p>
    </LegalPage>
  );
}

function TermsPage({ navigate }) {
  return (
    <LegalPage title="Terms of Service" navigate={navigate}>
      <p><em>Last updated: {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}</em></p>
      <p className="mt-4">
        TruthNet provides AI-generated fact-check judgments for informational purposes only.
        Verdicts are not legal, medical, or financial advice.
      </p>
      <p className="mt-4">
        You agree not to abuse the service, circumvent rate limits, or submit unlawful content.
        We may suspend accounts that violate these terms.
      </p>
      <p className="mt-4">Contact: legal@truthnet.example (placeholder)</p>
    </LegalPage>
  );
}

window.PrivacyPage = PrivacyPage;
window.TermsPage = TermsPage;
