// src/components/AuthGate.jsx
import { useState } from "react";
import { isAuthed, setToken, setUser } from "../auth";
import { api } from "../api";

export default function AuthGate({ children }) {
  const [authed, setAuthed] = useState(isAuthed());
  const [mode, setMode] = useState("login"); // "login" or "register"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (authed) return children;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Validation
      if (!email || !password) {
        throw new Error("Email and password are required");
      }

      if (mode === "register") {
        if (password !== confirmPassword) {
          throw new Error("Passwords do not match");
        }
        if (password.length < 6) {
          throw new Error("Password must be at least 6 characters");
        }
      }

      // API call
      let response;
      if (mode === "register") {
        response = await api.register(email, password);
      } else {
        response = await api.login(email, password);
      }

      // Store auth data
      if (response.token) {
        setToken(response.token);
        setUser({
          id: response.user.id,
          email: response.user.email,
          name: response.user.email.split("@")[0] // Use email prefix as display name
        });
        setAuthed(true);
        // Force a page reload to refresh all components
        window.location.reload();
      }
    } catch (err) {
      // Extract error message from API response or use default
      const errorMsg = err.message || "Authentication failed";
      const match = errorMsg.match(/\{.*"error":"([^"]+)".*\}/);
      if (match) {
        setError(match[1]);
      } else {
        setError(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setMode(mode === "login" ? "register" : "login");
    setError("");
    setPassword("");
    setConfirmPassword("");
  };

  return (
    <main className="container main-content">
      <div className="auth-container">
        <div className="auth-card">
          <h2 className="auth-title">
            {mode === "login" ? "Sign In to NoteKeeper" : "Create Your Account"}
          </h2>
          
          {mode === "register" && (
            <p className="auth-subtitle">
              Join NoteKeeper to start organizing your thoughts
            </p>
          )}

          {error && (
            <div className="auth-error">
              <p>{error}</p>
            </div>
          )}

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="auth_email">
                Email Address
              </label>
              <input
                id="auth_email"
                type="email"
                className="form-input"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="auth_password">
                Password
              </label>
              <input
                id="auth_password"
                type="password"
                className="form-input"
                placeholder={mode === "register" ? "At least 6 characters" : "Enter your password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            {mode === "register" && (
              <div className="form-group">
                <label className="form-label" htmlFor="auth_confirm_password">
                  Confirm Password
                </label>
                <input
                  id="auth_confirm_password"
                  type="password"
                  className="form-input"
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
            )}

            <div className="form-actions">
              <button
                type="submit"
                className="btn btn-primary btn-full"
                disabled={loading}
              >
                {loading && <span className="btn-spinner"></span>}
                {mode === "login" 
                  ? (loading ? "Signing in..." : "Sign In") 
                  : (loading ? "Creating account..." : "Create Account")}
              </button>
            </div>
          </form>

          <div className="auth-toggle">
            <button
              type="button"
              className="auth-toggle-btn"
              onClick={toggleMode}
              disabled={loading}
            >
              {mode === "login" 
                ? "Don't have an account? Sign up" 
                : "Already have an account? Sign in"}
            </button>
          </div>

          <div className="auth-footer">
            <p>
              Your notes are private and secured with 
              <span className="badge">JWT</span> authentication
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
