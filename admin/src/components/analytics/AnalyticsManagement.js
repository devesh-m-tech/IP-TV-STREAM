import React, { useState } from "react";
import "../../index.css";

export default function AnalyticsManagement() {
  const [timeframe, setTimeframe] = useState("7d");

  // Dynamic mock analytics data based on timeframe
  const getStats = () => {
    switch (timeframe) {
      case "24h":
        return {
          streamHours: "184 Hrs",
          activeSessions: "86 Live",
          avgBuffer: "0.32s",
          peakViewers: "142 Users",
          categoryData: [
            { name: "Entertainment", percentage: 55 },
            { name: "Movies", percentage: 22 },
            { name: "Music", percentage: 12 },
            { name: "News", percentage: 8 },
            { name: "Kids", percentage: 3 },
          ],
          languageData: [
            { name: "Tamil", value: 68 },
            { name: "Telugu", value: 15 },
            { name: "English", value: 10 },
            { name: "Malayalam", value: 4 },
            { name: "Kannada", value: 3 },
          ],
        };
      case "30d":
        return {
          streamHours: "8,940 Hrs",
          activeSessions: "1,120 Avg",
          avgBuffer: "0.58s",
          peakViewers: "840 Users",
          categoryData: [
            { name: "Entertainment", percentage: 40 },
            { name: "Movies", percentage: 32 },
            { name: "Music", percentage: 14 },
            { name: "News", percentage: 10 },
            { name: "Kids", percentage: 4 },
          ],
          languageData: [
            { name: "Tamil", value: 58 },
            { name: "Telugu", value: 20 },
            { name: "English", value: 13 },
            { name: "Malayalam", value: 6 },
            { name: "Kannada", value: 3 },
          ],
        };
      case "7d":
      default:
        return {
          streamHours: "2,410 Hrs",
          activeSessions: "310 Avg",
          avgBuffer: "0.45s",
          peakViewers: "480 Users",
          categoryData: [
            { name: "Entertainment", percentage: 48 },
            { name: "Movies", percentage: 28 },
            { name: "Music", percentage: 13 },
            { name: "News", percentage: 8 },
            { name: "Kids", percentage: 3 },
          ],
          languageData: [
            { name: "Tamil", value: 62 },
            { name: "Telugu", value: 18 },
            { name: "English", value: 12 },
            { name: "Malayalam", value: 5 },
            { name: "Kannada", value: 3 },
          ],
        };
    }
  };

  const stats = getStats();

  const cdnNodes = [
    { name: "Chennai Primary Edge Node", uptime: "99.98%", load: "42%", status: "Healthy" },
    { name: "Mumbai Backup Transcoder", uptime: "99.95%", load: "28%", status: "Healthy" },
    { name: "Singapore Main Gateway", uptime: "100.00%", load: "15%", status: "Optimal" },
    { name: "US Content Proxy Cache", uptime: "99.82%", load: "8%", status: "Healthy" },
  ];

  return (
    <div className="analytics-container">
      {/* 🚀 A. HEADER WITH TIMEFRAME SELECTOR */}
      <div className="panel-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <div>
          <h4>📊 Real-time IPTV Analytics</h4>
          <p style={{ fontSize: "12px", color: "var(--text3)", margin: "4px 0 0 0" }}>
            Monitor server payloads, streaming playtimes, category metrics, and viewer distribution.
          </p>
        </div>
        <div className="timeframe-buttons" style={{ display: "flex", gap: "6px" }}>
          {["24h", "7d", "30d"].map((t) => (
            <button
              key={t}
              className={`pro-btn ${timeframe === t ? "btn-primary" : "btn-white"}`}
              style={{ padding: "6px 14px", fontSize: "11px", borderRadius: "8px" }}
              onClick={() => setTimeframe(t)}
            >
              {t.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* 🚀 B. STREAMING STATS CARDS */}
      <div className="stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px", marginBottom: "24px" }}>
        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: "rgba(37, 99, 235, 0.1)", color: "var(--accent)" }}>
            ⏳
          </div>
          <div className="stat-info">
            <b>{stats.streamHours}</b>
            <span>Total Stream Hours</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: "rgba(16, 185, 129, 0.1)", color: "#10b981" }}>
            👥
          </div>
          <div className="stat-info">
            <b>{stats.activeSessions}</b>
            <span>Viewer Sessions</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: "rgba(245, 158, 11, 0.1)", color: "#f59e0b" }}>
            ⚡
          </div>
          <div className="stat-info">
            <b>{stats.avgBuffer}</b>
            <span>Avg. Buffering Time</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: "rgba(139, 92, 246, 0.1)", color: "#8b5cf6" }}>
            📈
          </div>
          <div className="stat-info">
            <b>{stats.peakViewers}</b>
            <span>Peak Concurrent sessions</span>
          </div>
        </div>
      </div>

      {/* 🚀 C. VIEWERSHIP CHARTS CONTAINER */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: "24px", marginBottom: "24px" }}>
        {/* Category Share (Progress bar metrics) */}
        <div className="pro-card" style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "20px" }}>
          <h5 style={{ fontSize: "14px", fontWeight: "700", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
            🎬 Category Viewership split
          </h5>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {stats.categoryData.map((item, idx) => (
              <div key={item.name} style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", fontWeight: "600" }}>
                  <span>{item.name}</span>
                  <span style={{ color: "var(--accent)" }}>{item.percentage}%</span>
                </div>
                <div style={{ width: "100%", height: "8px", background: "var(--bg3)", borderRadius: "10px", overflow: "hidden" }}>
                  <div
                    style={{
                      width: `${item.percentage}%`,
                      height: "100%",
                      background: `linear-gradient(90deg, var(--accent) 0%, #60a5fa 100%)`,
                      borderRadius: "10px",
                      transition: "width 0.4s ease",
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Language distribution metrics */}
        <div className="pro-card" style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "20px" }}>
          <h5 style={{ fontSize: "14px", fontWeight: "700", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
            🗣️ Language Stream share
          </h5>
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {stats.languageData.map((item) => (
              <div key={item.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px", borderRadius: "8px", background: "var(--bg)", border: "1px solid var(--border)" }}>
                <span style={{ fontSize: "12px", fontWeight: "700" }}>{item.name} Streams</span>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ width: "80px", height: "4px", background: "var(--border)", borderRadius: "4px", overflow: "hidden" }}>
                    <div style={{ width: `${item.value}%`, height: "100%", background: "#f59e0b" }}></div>
                  </div>
                  <span className="pro-badge" style={{ background: "rgba(245, 158, 11, 0.1)", color: "#d97706", fontSize: "11px", fontWeight: "700" }}>
                    {item.value}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 🚀 D. SERVER GATEWAYS & CDNs STATUS GRID */}
      <div className="pro-card" style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "20px" }}>
        <h5 style={{ fontSize: "14px", fontWeight: "700", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
          ⚙️ Live CDN Gateway Status & Payloads
        </h5>
        <div className="pro-table-container">
          <table>
            <thead>
              <tr>
                <th>NODE LOCATION / SERVICE</th>
                <th>SYSTEM UPTIME</th>
                <th>BANDWIDTH LOAD</th>
                <th>AVAILABILITY GRID</th>
                <th>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {cdnNodes.map((node) => (
                <tr key={node.name}>
                  <td style={{ fontWeight: "700" }}>{node.name}</td>
                  <td>
                    <span className="pro-badge" style={{ background: "rgba(16, 185, 129, 0.1)", color: "#047857" }}>
                      {node.uptime}
                    </span>
                  </td>
                  <td>{node.load} Capacity</td>
                  <td>
                    <span style={{ letterSpacing: "1px", color: "#10b981", fontSize: "10px" }}>
                      ■■■■■■■■■■■■■■■■■■■■■■■■
                    </span>
                  </td>
                  <td>
                    <span className="pro-badge" style={{ background: "rgba(37, 99, 235, 0.1)", color: "var(--accent)" }}>
                      {node.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
