// TruthNet — Legal stub pages

function LegalPage({
  title,
  children,
  navigate
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      minHeight: "100vh",
      background: TN.bg,
      color: TN.ink
    }
  }, /*#__PURE__*/React.createElement("header", {
    style: {
      borderBottom: `1px solid ${TN.border}`,
      padding: "16px 24px"
    }
  }, /*#__PURE__*/React.createElement("a", {
    href: "/",
    onClick: e => {
      e.preventDefault();
      navigate("/");
    },
    style: {
      fontFamily: "Lora, serif",
      fontWeight: 700,
      fontSize: 20,
      color: TN.ink,
      textDecoration: "none"
    }
  }, "\u2190 TruthNet")), /*#__PURE__*/React.createElement("main", {
    className: "max-w-3xl mx-auto px-6 py-12"
  }, /*#__PURE__*/React.createElement("h1", {
    style: {
      fontFamily: "Lora, serif",
      fontWeight: 700,
      fontSize: 32
    }
  }, title), /*#__PURE__*/React.createElement("div", {
    className: "mt-8 prose",
    style: {
      fontFamily: "Inter, sans-serif",
      fontSize: 15,
      lineHeight: 1.65,
      color: TN.ink2
    }
  }, children)));
}
function PrivacyPage({
  navigate
}) {
  return /*#__PURE__*/React.createElement(LegalPage, {
    title: "Privacy Policy",
    navigate: navigate
  }, /*#__PURE__*/React.createElement("p", null, /*#__PURE__*/React.createElement("em", null, "Last updated: ", new Date().toLocaleDateString("en-US", {
    month: "long",
    year: "numeric"
  }))), /*#__PURE__*/React.createElement("p", {
    className: "mt-4"
  }, "TruthNet stores your account email and password hash. Fact-check claims you submit may be logged (truncated) to enforce daily quotas and improve the service."), /*#__PURE__*/React.createElement("p", {
    className: "mt-4"
  }, "We do not sell personal data. API keys for AI providers are stored server-side only and never exposed to the browser."), /*#__PURE__*/React.createElement("p", {
    className: "mt-4"
  }, "Contact: privacy@truthnet.example (placeholder)"));
}
function TermsPage({
  navigate
}) {
  return /*#__PURE__*/React.createElement(LegalPage, {
    title: "Terms of Service",
    navigate: navigate
  }, /*#__PURE__*/React.createElement("p", null, /*#__PURE__*/React.createElement("em", null, "Last updated: ", new Date().toLocaleDateString("en-US", {
    month: "long",
    year: "numeric"
  }))), /*#__PURE__*/React.createElement("p", {
    className: "mt-4"
  }, "TruthNet provides AI-generated fact-check judgments for informational purposes only. Verdicts are not legal, medical, or financial advice."), /*#__PURE__*/React.createElement("p", {
    className: "mt-4"
  }, "You agree not to abuse the service, circumvent rate limits, or submit unlawful content. We may suspend accounts that violate these terms."), /*#__PURE__*/React.createElement("p", {
    className: "mt-4"
  }, "Contact: legal@truthnet.example (placeholder)"));
}
window.PrivacyPage = PrivacyPage;
window.TermsPage = TermsPage;
