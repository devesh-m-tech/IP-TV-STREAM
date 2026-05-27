import React, { useState, useEffect } from "react";
import "../../index.css";

export default function SystemSettings() {
  const [serverUrl, setServerUrl] = useState(() => localStorage.getItem("sys_server_url") || "http://iptv.pro");
  const [maxConnections, setMaxConnections] = useState(() => localStorage.getItem("sys_max_conn") || "4");
  const [trialPeriod, setTrialPeriod] = useState(() => localStorage.getItem("sys_trial_days") || "7");

  const [maintenanceMode, setMaintenanceMode] = useState(() => localStorage.getItem("sys_maint_mode") === "true");
  const [allowRegistration, setAllowRegistration] = useState(() => localStorage.getItem("sys_allow_reg") !== "false");
  const [emailNotifications, setEmailNotifications] = useState(() => localStorage.getItem("sys_email_notif") !== "false");
  const [apiAccess, setApiAccess] = useState(() => localStorage.getItem("sys_api_access") !== "false");

  const handleSave = (e) => {
    e.preventDefault();
    localStorage.setItem("sys_server_url", serverUrl);
    localStorage.setItem("sys_max_conn", maxConnections);
    localStorage.setItem("sys_trial_days", trialPeriod);
    localStorage.setItem("sys_maint_mode", maintenanceMode);
    localStorage.setItem("sys_allow_reg", allowRegistration);
    localStorage.setItem("sys_email_notif", emailNotifications);
    localStorage.setItem("sys_api_access", apiAccess);
    alert("💾 System configurations saved successfully!");
  };

  return (
    <div className="pro-module">
      <h2 className="card-title">System Settings</h2>

      <div className="panels-grid" style={{ gridTemplateColumns: "1.2fr 0.8fr" }}>
        {/* Left column: Settings Forms */}
        <div className="pro-card" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <h3 style={{ fontSize: "16px", color: "var(--text)", borderBottom: "1px solid var(--border)", paddingBottom: "12px" }}>
            ⚙️ System Configuration
          </h3>
          
          <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div className="form-group">
              <label>Server URL</label>
              <input
                className="pro-input"
                type="text"
                value={serverUrl}
                onChange={(e) => setServerUrl(e.target.value)}
                required
              />
            </div>

            <div className="pro-form-grid" style={{ gridTemplateColumns: "1fr 1fr", padding: 0, border: "none", boxShadow: "none" }}>
              <div className="form-group">
                <label>Max Connections per User</label>
                <input
                  className="pro-input"
                  type="number"
                  min="1"
                  value={maxConnections}
                  onChange={(e) => setMaxConnections(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Trial Period (days)</label>
                <input
                  className="pro-input"
                  type="number"
                  min="0"
                  value={trialPeriod}
                  onChange={(e) => setTrialPeriod(e.target.value)}
                  required
                />
              </div>
            </div>

            <h3 style={{ fontSize: "14px", color: "var(--text)", marginTop: "10px", borderBottom: "1px dashed var(--border)", paddingBottom: "8px" }}>
              🔒 Platform Access Control
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid rgba(204, 221, 245, 0.4)" }}>
                <div>
                  <div style={{ fontWeight: "700", fontSize: "13px", color: "var(--text)" }}>Maintenance Mode</div>
                  <div style={{ fontSize: "11px", color: "var(--text3)" }}>Disconnects all clients and shows maintenance screen</div>
                </div>
                <input
                  type="checkbox"
                  style={{ width: "20px", height: "20px", cursor: "pointer" }}
                  checked={maintenanceMode}
                  onChange={(e) => setMaintenanceMode(e.target.checked)}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid rgba(204, 221, 245, 0.4)" }}>
                <div>
                  <div style={{ fontWeight: "700", fontSize: "13px", color: "var(--text)" }}>Allow New Registrations</div>
                  <div style={{ fontSize: "11px", color: "var(--text3)" }}>Enables public users to create free accounts</div>
                </div>
                <input
                  type="checkbox"
                  style={{ width: "20px", height: "20px", cursor: "pointer" }}
                  checked={allowRegistration}
                  onChange={(e) => setAllowRegistration(e.target.checked)}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid rgba(204, 221, 245, 0.4)" }}>
                <div>
                  <div style={{ fontWeight: "700", fontSize: "13px", color: "var(--text)" }}>Email Notifications</div>
                  <div style={{ fontSize: "11px", color: "var(--text3)" }}>Send alerts on reseller top-ups and subscriptions</div>
                </div>
                <input
                  type="checkbox"
                  style={{ width: "20px", height: "20px", cursor: "pointer" }}
                  checked={emailNotifications}
                  onChange={(e) => setEmailNotifications(e.target.checked)}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0" }}>
                <div>
                  <div style={{ fontWeight: "700", fontSize: "13px", color: "var(--text)" }}>API Endpoint Access</div>
                  <div style={{ fontSize: "11px", color: "var(--text3)" }}>Allow developers to read stream channels list via API</div>
                </div>
                <input
                  type="checkbox"
                  style={{ width: "20px", height: "20px", cursor: "pointer" }}
                  checked={apiAccess}
                  onChange={(e) => setApiAccess(e.target.checked)}
                />
              </div>
            </div>

            <button className="pro-btn btn-primary" type="submit" style={{ marginTop: "16px", width: "100%" }}>
              💾 Save Settings
            </button>
          </form>
        </div>

        {/* Right column: Server Info */}
        <div className="pro-card" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <h3 style={{ fontSize: "16px", color: "var(--text)", borderBottom: "1px solid var(--border)", paddingBottom: "12px" }}>
            📡 Server Info
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {[
              ["Server IP", "185.220.101.45"],
              ["OS", "Ubuntu 22.04 LTS"],
              ["CPU Usage", "34%"],
              ["RAM Usage", "58% / 16GB"],
              ["Storage", "1.2TB / 4TB"],
              ["Uptime", "47 days 12h"],
              ["API Version", "v3.0.1"],
              ["SSL Status", "✅ Valid"]
            ].map(([k, v]) => (
              <div
                key={k}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "9px 0",
                  borderBottom: "1px solid rgba(204, 221, 245, 0.4)"
                }}
              >
                <span style={{ fontSize: "12px", fontWeight: "600", color: "var(--text2)" }}>{k}</span>
                <span className="pro-badge" style={{ fontSize: "11px", fontWeight: "700" }}>{v}</span>
              </div>
            ))}
          </div>

          <div
            style={{
              marginTop: "20px",
              padding: "16px",
              background: "var(--bg3)",
              border: "1px solid var(--border)",
              borderRadius: "8px",
              display: "flex",
              gap: "10px",
              alignItems: "flex-start"
            }}
          >
            <span style={{ fontSize: "18px" }}>💡</span>
            <div style={{ fontSize: "12px", color: "var(--text2)", lineHeight: "1.4" }}>
              To sync external players like VLC or TiviMate, distribute the <b>M3U URL</b> listed under each user's profile card in the Directory.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
