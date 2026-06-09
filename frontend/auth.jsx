// TruthNet — Auth forms (login / signup)

async function authFetch(path, options = {}) {
  const res = await fetch(path, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    let detail = data.detail;
    if (Array.isArray(detail)) {
      detail = detail.map((e) => (typeof e === "string" ? e : e.msg)).join("; ");
    }
    throw new Error(detail || data.message || `Request failed (${res.status})`);
  }
  return data;
}

function AuthShell({ title, subtitle, children }) {
  return (
    <div style={{ minHeight: "100vh", background: TN.bg, display: "grid", placeItems: "center", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 420 }}>
        <a href="/" style={{ fontFamily: "Lora, serif", fontWeight: 700, fontSize: 24, color: TN.ink, textDecoration: "none" }}>
          TruthNet
        </a>
        <h1 className="mt-8" style={{ fontFamily: "Lora, serif", fontWeight: 600, fontSize: 28, color: TN.ink }}>{title}</h1>
        {subtitle && (
          <p className="mt-2" style={{ fontFamily: "Inter, sans-serif", fontSize: 14, color: TN.ink2 }}>{subtitle}</p>
        )}
        <div className="mt-8" style={{ background: TN.surface, border: `1px solid ${TN.border}`, padding: "28px 24px" }}>
          {children}
        </div>
      </div>
    </div>
  );
}

function AuthField({ label, type, value, onChange, autoComplete }) {
  return (
    <label className="block mb-5">
      <span style={{ fontFamily: "Inter, sans-serif", fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: TN.muted }}>
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        required
        className="w-full mt-2 px-4 py-3 outline-none"
        style={{
          fontFamily: "Inter, sans-serif", fontSize: 15, background: TN.bg,
          border: `1px solid ${TN.border}`, color: TN.ink,
        }}
      />
    </label>
  );
}

function LoginPage({ navigate, onAuthSuccess }) {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await authFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      onAuthSuccess(data);
      navigate("/app");
    } catch (err) {
      setError(err.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title="Log in" subtitle="Access your fact-checker account.">
      <form onSubmit={submit}>
        <AuthField label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
        <AuthField label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
        {error && (
          <div className="mb-4 p-3" style={{ background: "var(--v-false-bg)", color: "var(--v-false-fg)", fontFamily: "Inter, sans-serif", fontSize: 13 }}>
            {error}
          </div>
        )}
        <button type="submit" disabled={loading} className="tn-btn-primary w-full">
          {loading ? "Signing in…" : "Log in →"}
        </button>
      </form>
      <p className="mt-6 text-center" style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: TN.muted }}>
        No account?{" "}
        <a href="/signup" onClick={(e) => { e.preventDefault(); navigate("/signup"); }}>Sign up</a>
      </p>
    </AuthShell>
  );
}

function SignupPage({ navigate, onAuthSuccess }) {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await authFetch("/auth/register", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      onAuthSuccess(data);
      navigate("/app");
    } catch (err) {
      setError(err.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title="Create account" subtitle="Start fact-checking claims in seconds.">
      <form onSubmit={submit}>
        <AuthField label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
        <AuthField label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" />
        <p style={{ fontFamily: "Inter, sans-serif", fontSize: 11, color: TN.muted, marginTop: -8, marginBottom: 16 }}>
          At least 8 characters with letters and numbers.
        </p>
        {error && (
          <div className="mb-4 p-3" style={{ background: "var(--v-false-bg)", color: "var(--v-false-fg)", fontFamily: "Inter, sans-serif", fontSize: 13 }}>
            {error}
          </div>
        )}
        <button type="submit" disabled={loading} className="tn-btn-primary w-full">
          {loading ? "Creating account…" : "Get started →"}
        </button>
      </form>
      <p className="mt-6 text-center" style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: TN.muted }}>
        Already have an account?{" "}
        <a href="/login" onClick={(e) => { e.preventDefault(); navigate("/login"); }}>Log in</a>
      </p>
    </AuthShell>
  );
}

window.LoginPage = LoginPage;
window.SignupPage = SignupPage;
window.authFetch = authFetch;
