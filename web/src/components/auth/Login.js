import React, { useState } from "react";
import api from "../../utils/api";

const Login = ({ setLoggedIn }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/auth/login", {
        email,
        password,
        deviceId: "tv-002",
      });
      localStorage.setItem("token", res.data.token);
      setLoggedIn(true);
    } catch (err) {
      alert("Login failed: " + (err.response?.data?.error || err.message));
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
           <span style={{ fontSize: "48px" }}>📺</span>
           <h2 className="auth-title">User Portal</h2>
           <p style={{ color: "var(--text-muted)", fontSize: "14px", fontWeight: "500" }}>Sign in to access your live streams</p>
        </div>
        
        <form className="auth-form" onSubmit={handleLogin}>
          <div className="auth-field">
            <label>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="name@company.com"
            />
          </div>

          <div className="auth-field">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
          </div>

          <button className="auth-btn" type="submit">
            Sign In to Dashboard
          </button>
        </form>
        
        <p style={{ marginTop: "32px", fontSize: "12px", color: "var(--text-muted)", textAlign: "center" }}>
          Contact administrator if you forgot your credentials.
        </p>
      </div>
    </div>
  );
};

export default Login;
