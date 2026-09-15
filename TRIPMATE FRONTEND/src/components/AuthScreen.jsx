import { useState } from "react";
import { login, register } from "../services/authApi";

export default function AuthScreen({
  onAuthenticated,
  darkMode,
  onToggleTheme,
}) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const isRegistering = mode === "register";
  const updateField = (event) =>
    setForm({ ...form, [event.target.name]: event.target.value });

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = isRegistering
        ? await register(form)
        : await login({ email: form.email, password: form.password });
      onAuthenticated(data.user);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-screen">
      <div className="auth-art" aria-hidden="true">
        <img
          className="auth-art-image"
          src="/trip%20planner%20image.jpg"
          alt=""
        />
        <div className="auth-art-caption">
          <span className="eyebrow">
            <span className="pulse-dot" /> Your next route
          </span>
          <strong>
            Go somewhere
            <br />
            worth remembering.
          </strong>
        </div>
      </div>
      <section className="auth-panel" aria-labelledby="auth-title">
        <div className="auth-topbar">
          <div className="brand-lockup">
            <span className="brand-mark">↗</span> Trip<span>Mate</span>
          </div>
          <button
            type="button"
            className="auth-theme-toggle"
            onClick={onToggleTheme}
            aria-label={
              darkMode ? "Switch to light mode" : "Switch to dark mode"
            }
            title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {darkMode ? "☼" : "☾"}
          </button>
        </div>
        <p className="eyebrow">
          <span className="pulse-dot" /> Travel starts here
        </p>
        <h1 id="auth-title">
          {isRegistering
            ? "Build your next escape."
            : "Welcome back, traveller."}
        </h1>
        <p className="auth-copy">
          Your personal travel copilot is ready to turn a spark of an idea into
          a trip worth taking.
        </p>
        <div
          className="auth-tabs"
          role="tablist"
          aria-label="Authentication mode"
        >
          <button
            type="button"
            className={!isRegistering ? "active" : ""}
            onClick={() => {
              setMode("login");
              setError("");
            }}
          >
            Sign in
          </button>
          <button
            type="button"
            className={isRegistering ? "active" : ""}
            onClick={() => {
              setMode("register");
              setError("");
            }}
          >
            Create account
          </button>
        </div>
        <form className="auth-form" onSubmit={submit}>
          {isRegistering && (
            <label>
              Full name
              <input
                name="name"
                value={form.name}
                onChange={updateField}
                autoComplete="name"
                placeholder="Alex Morgan"
                required
              />
            </label>
          )}
          <label>
            Email address
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={updateField}
              autoComplete="email"
              placeholder="you@example.com"
              required
            />
          </label>
          <label>
            Password
            <span className="password-field">
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={updateField}
                autoComplete={
                  isRegistering ? "new-password" : "current-password"
                }
                placeholder="At least 8 characters"
                minLength="8"
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword((value) => !value)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </span>
          </label>
          {error && (
            <p className="auth-error" role="alert">
              {error}
            </p>
          )}
          <button className="auth-submit" type="submit" disabled={loading}>
            {loading
              ? "Opening TripMate..."
              : isRegistering
                ? "Start exploring"
                : "Continue to TripMate"}
            <span aria-hidden="true">↗</span>
          </button>
        </form>
        <p className="auth-legal">
          By continuing, you agree to use TripMate for planning journeys you can
          actually take.
        </p>
      </section>
    </main>
  );
}
