// TruthNet — Auth forms (login / signup)

async function authFetch(path, options = {}) {
  const res = await fetch(path, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    }
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    let detail = data.detail;
    if (Array.isArray(detail)) {
      detail = detail.map(e => typeof e === "string" ? e : e.msg).join("; ");
    }
    throw new Error(detail || data.message || `Request failed (${res.status})`);
  }
  return data;
}
function AuthShell({
  title,
  subtitle,
  children
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      minHeight: "100vh",
      background: TN.bg,
      display: "grid",
      placeItems: "center",
      padding: 24
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: "100%",
      maxWidth: 420
    }
  }, /*#__PURE__*/React.createElement("a", {
    href: "/",
    style: {
      fontFamily: "Lora, serif",
      fontWeight: 700,
      fontSize: 24,
      color: TN.ink,
      textDecoration: "none"
    }
  }, "TruthNet"), /*#__PURE__*/React.createElement("h1", {
    className: "mt-8",
    style: {
      fontFamily: "Lora, serif",
      fontWeight: 600,
      fontSize: 28,
      color: TN.ink
    }
  }, title), subtitle && /*#__PURE__*/React.createElement("p", {
    className: "mt-2",
    style: {
      fontFamily: "Inter, sans-serif",
      fontSize: 14,
      color: TN.ink2
    }
  }, subtitle), /*#__PURE__*/React.createElement("div", {
    className: "mt-8",
    style: {
      background: TN.surface,
      border: `1px solid ${TN.border}`,
      padding: "28px 24px"
    }
  }, children)));
}
function AuthField({
  label,
  type,
  value,
  onChange,
  autoComplete
}) {
  return /*#__PURE__*/React.createElement("label", {
    className: "block mb-5"
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "Inter, sans-serif",
      fontSize: 11,
      letterSpacing: "0.12em",
      textTransform: "uppercase",
      color: TN.muted
    }
  }, label), /*#__PURE__*/React.createElement("input", {
    type: type,
    value: value,
    onChange: onChange,
    autoComplete: autoComplete,
    required: true,
    className: "w-full mt-2 px-4 py-3 outline-none",
    style: {
      fontFamily: "Inter, sans-serif",
      fontSize: 15,
      background: TN.bg,
      border: `1px solid ${TN.border}`,
      color: TN.ink
    }
  }));
}
function LoginPage({
  navigate,
  onAuthSuccess
}) {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const submit = async e => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await authFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email,
          password
        })
      });
      onAuthSuccess(data);
      navigate("/app");
    } catch (err) {
      setError(err.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  };
  return /*#__PURE__*/React.createElement(AuthShell, {
    title: "Log in",
    subtitle: "Access your fact-checker account."
  }, /*#__PURE__*/React.createElement("form", {
    onSubmit: submit
  }, /*#__PURE__*/React.createElement(AuthField, {
    label: "Email",
    type: "email",
    value: email,
    onChange: e => setEmail(e.target.value),
    autoComplete: "email"
  }), /*#__PURE__*/React.createElement(AuthField, {
    label: "Password",
    type: "password",
    value: password,
    onChange: e => setPassword(e.target.value),
    autoComplete: "current-password"
  }), error && /*#__PURE__*/React.createElement("div", {
    className: "mb-4 p-3",
    style: {
      background: "var(--v-false-bg)",
      color: "var(--v-false-fg)",
      fontFamily: "Inter, sans-serif",
      fontSize: 13
    }
  }, error), /*#__PURE__*/React.createElement("button", {
    type: "submit",
    disabled: loading,
    className: "tn-btn-primary w-full"
  }, loading ? "Signing in…" : "Log in →")), /*#__PURE__*/React.createElement("p", {
    className: "mt-6 text-center",
    style: {
      fontFamily: "Inter, sans-serif",
      fontSize: 13,
      color: TN.muted
    }
  }, "No account?", " ", /*#__PURE__*/React.createElement("a", {
    href: "/signup",
    onClick: e => {
      e.preventDefault();
      navigate("/signup");
    }
  }, "Sign up")));
}
function SignupPage({
  navigate,
  onAuthSuccess
}) {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const submit = async e => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await authFetch("/auth/register", {
        method: "POST",
        body: JSON.stringify({
          email,
          password
        })
      });
      onAuthSuccess(data);
      navigate("/app");
    } catch (err) {
      setError(err.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };
  return /*#__PURE__*/React.createElement(AuthShell, {
    title: "Create account",
    subtitle: "Start fact-checking claims in seconds."
  }, /*#__PURE__*/React.createElement("form", {
    onSubmit: submit
  }, /*#__PURE__*/React.createElement(AuthField, {
    label: "Email",
    type: "email",
    value: email,
    onChange: e => setEmail(e.target.value),
    autoComplete: "email"
  }), /*#__PURE__*/React.createElement(AuthField, {
    label: "Password",
    type: "password",
    value: password,
    onChange: e => setPassword(e.target.value),
    autoComplete: "new-password"
  }), /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: "Inter, sans-serif",
      fontSize: 11,
      color: TN.muted,
      marginTop: -8,
      marginBottom: 16
    }
  }, "At least 8 characters with letters and numbers."), error && /*#__PURE__*/React.createElement("div", {
    className: "mb-4 p-3",
    style: {
      background: "var(--v-false-bg)",
      color: "var(--v-false-fg)",
      fontFamily: "Inter, sans-serif",
      fontSize: 13
    }
  }, error), /*#__PURE__*/React.createElement("button", {
    type: "submit",
    disabled: loading,
    className: "tn-btn-primary w-full"
  }, loading ? "Creating account…" : "Get started →")), /*#__PURE__*/React.createElement("p", {
    className: "mt-6 text-center",
    style: {
      fontFamily: "Inter, sans-serif",
      fontSize: 13,
      color: TN.muted
    }
  }, "Already have an account?", " ", /*#__PURE__*/React.createElement("a", {
    href: "/login",
    onClick: e => {
      e.preventDefault();
      navigate("/login");
    }
  }, "Log in")));
}
window.LoginPage = LoginPage;
window.SignupPage = SignupPage;
window.authFetch = authFetch;
