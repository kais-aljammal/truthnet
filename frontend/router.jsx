// TruthNet — Client-side router (pathname-based)

function usePathname() {
  const [path, setPath] = React.useState(() => window.location.pathname || "/");

  React.useEffect(() => {
    const onPop = () => setPath(window.location.pathname || "/");
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const navigate = React.useCallback((to) => {
    const next = to.startsWith("/") ? to : `/${to}`;
    if (window.location.pathname !== next) {
      window.history.pushState(null, "", next);
    }
    setPath(next);
    window.scrollTo(0, 0);
  }, []);

  return [path, navigate];
}

function AppLoading() {
  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", color: TN.muted, fontFamily: "Inter, sans-serif" }}>
      Loading…
    </div>
  );
}

function App() {
  const [path, navigate] = usePathname();
  const [user, setUser] = React.useState(null);
  const [authRequired, setAuthRequired] = React.useState(true);
  const [booting, setBooting] = React.useState(true);

  const refreshSession = React.useCallback(async () => {
    try {
      const [meRes, cfgRes] = await Promise.all([
        fetch("/auth/me", { credentials: "include" }),
        fetch("/auth/config", { credentials: "include" }),
      ]);
      const me = await meRes.json();
      const cfg = await cfgRes.json();
      setAuthRequired(!!cfg.auth_required);
      if (me.authenticated && me.user) {
        setUser(me.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setBooting(false);
    }
  }, []);

  React.useEffect(() => {
    refreshSession();
  }, [refreshSession]);

  const handleAuthSuccess = (data) => {
    setUser(data);
  };

  const handleLogout = async () => {
    try {
      await fetch("/auth/logout", { method: "POST", credentials: "include" });
    } catch {}
    setUser(null);
    navigate("/");
  };

  if (booting) return <AppLoading />;

  if (path === "/login") {
    if (user) { navigate("/app"); return <AppLoading />; }
    return <LoginPage navigate={navigate} onAuthSuccess={handleAuthSuccess} />;
  }

  if (path === "/signup") {
    if (user) { navigate("/app"); return <AppLoading />; }
    return <SignupPage navigate={navigate} onAuthSuccess={handleAuthSuccess} />;
  }

  if (path === "/privacy") {
    return <PrivacyPage navigate={navigate} />;
  }

  if (path === "/terms") {
    return <TermsPage navigate={navigate} />;
  }

  if (path === "/billing") {
    if (authRequired && !user) {
      navigate("/login");
      return <AppLoading />;
    }
    return (
      <BillingPage
        user={user}
        navigate={navigate}
        onLogout={authRequired ? handleLogout : null}
      />
    );
  }

  if (path === "/history") {
    if (authRequired && !user) {
      navigate("/login");
      return <AppLoading />;
    }
    return (
      <HistoryPage
        user={user}
        navigate={navigate}
        onLogout={authRequired ? handleLogout : null}
      />
    );
  }

  if (path === "/app") {
    if (authRequired && !user) {
      navigate("/login");
      return <AppLoading />;
    }
    return (
      <FactCheckApp
        user={user}
        onLogout={authRequired ? handleLogout : null}
        navigate={navigate}
      />
    );
  }

  // Default: landing at / and unknown paths
  return <LandingPage user={user} navigate={navigate} />;
}

window.App = App;
