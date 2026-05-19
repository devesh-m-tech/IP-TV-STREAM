import React, { useState } from "react";
import API from "../../utils/api";
import "../../index.css";

export default function AdminLogin({ onAuth }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const res = await API.post("/admin/login", { email, password });
      localStorage.setItem("adminToken", res.data.token);
      onAuth(true);
    } catch (err) {
      setError(err?.response?.data?.error || "Invalid credentials");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="ott-login-page">
      {/* Background Glow Accents */}
      <div className="ott-glow-accent-1"></div>
      <div className="ott-glow-accent-2"></div>

      <div className="ott-login-container">
        <div className="ott-glass-card">
          {/* Brand Section */}
          <div className="ott-brand-section">
            <div className="ott-brand-icon-wrapper">
              <span className="material-symbols-outlined ott-brand-icon" style={{ fontVariationSettings: "'FILL' 1" }}>
                movie
              </span>
            </div>
            <h1 className="ott-brand-title">IP TV</h1>
            <p className="ott-brand-subtitle">Sign in to manage your IPTV network</p>
          </div>

          {/* Login Form */}
          <form className="ott-form" onSubmit={handleSubmit}>
            {/* Email Field */}
            <div className="ott-field-group">
              <label className="ott-label" htmlFor="email">
                Email Address
              </label>
              <div className="ott-input-wrapper">
                <span className="material-symbols-outlined ott-input-icon">mail</span>
                <input
                  id="email"
                  className="ott-input"
                  type="email"
                  placeholder="admin@cineadmin.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="ott-field-group">
              <div className="ott-field-header">
                <label className="ott-label" htmlFor="password">
                  Password
                </label>
                <a className="ott-link" href="#" onClick={(e) => e.preventDefault()}>
                  Forgot password?
                </a>
              </div>
              <div className="ott-input-wrapper">
                <span className="material-symbols-outlined ott-input-icon">lock</span>
                <input
                  id="password"
                  className="ott-input"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="ott-input-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <span className="material-symbols-outlined">
                    {showPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <label className="ott-checkbox-container">
              <input
                type="checkbox"
                className="ott-checkbox-input"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span className="ott-checkbox-custom">
                <span className="material-symbols-outlined ott-checkbox-icon">check</span>
              </span>
              <span className="ott-checkbox-label">Remember this device</span>
            </label>

            {/* Login Button */}
            <button
              className="ott-submit-btn"
              type="submit"
              disabled={busy}
            >
              {busy ? "Authenticating..." : "Login to Dashboard"}
              <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
                login
              </span>
            </button>

            {/* Error Message */}
            {error && <div className="ott-error-msg">{error}</div>}
          </form>

          {/* Footer Meta */}
          <div className="ott-footer">
            <p className="ott-footer-text">Authorized personnel only</p>
            <div className="ott-footer-links">
              <a className="ott-footer-link" href="#" onClick={(e) => e.preventDefault()}>Support</a>
              <a className="ott-footer-link" href="#" onClick={(e) => e.preventDefault()}>Privacy</a>
              <a className="ott-footer-link" href="#" onClick={(e) => e.preventDefault()}>Terms</a>
            </div>
          </div>
        </div>

        {/* System Status Indicator */}
        <div className="ott-status-container">
          <div className="ott-status-badge">
            <span className="ott-status-dot-wrapper">
              <span className="ott-status-ping"></span>
              <span className="ott-status-dot"></span>
            </span>
            <span className="ott-status-text">System Status: Optimal</span>
          </div>
        </div>
      </div>

      {/* Decorative Content Image */}
      <div className="ott-preview-image-wrapper">
        <img
          className="ott-preview-image"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuAH1fK4uYBgNOv4P3sUlNN66FuCDpWAjr4LFEf65PKJGvIAA8Ylzc1FANCaKP65FvILkwAMp02jOWuKzyCAjtB9Xz5KN915XZJm_5o-IQNlK4qgMOeQrHv056RX2JXk_H4rtIzxhs1ntS822dypMhZZm9ZlSk-ax7wVpjXJlgySlHwXK_qiqPPqP4ZgH5ycC_hIJz6DogLWP-Fx1EpYgMVJEadryknR7sc7cYNhsI8HDbsSGUA8gFJp3_3d5xiaHqbr_292w_JuKQ"
          alt="IP TV Dashboard Preview"
        />
      </div>
    </div>
  );
}
