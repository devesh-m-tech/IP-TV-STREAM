import React, { useState, useEffect } from "react";
import UserManagement from "../users/UserManagement";
import ChannelManagement from "../channels/ChannelManagement";
import PlanManagement from "../plans/PlanManagement";
import RevenueManagement from "../revenue/RevenueManagement";
import AnalyticsManagement from "../analytics/AnalyticsManagement";
import DashboardOverview from "./DashboardOverview";
import "../../index.css";

export default function AdminDashboard({ onLogout }) {
  const [activeTab, setActiveTab] = useState("overview");
  const [time, setTime] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="admin-root">
      <header className="admin-header">
        <div className="brand">
          <div className="brand-icon">📺</div>
          <div className="brand-text">
            <b>IPTV PORTAL</b>
            <span>MANAGEMENT CONTROL</span>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center" }}>
          <div className="header-clock">{time}</div>
          <button className="sign-out-btn" onClick={() => { localStorage.removeItem("adminToken"); onLogout(); }}>
            Sign Out
          </button>
        </div>
      </header>

      <div className="admin-layout">
        <aside className="sidebar">
          <button className={`nav-item ${activeTab === "overview" ? "active" : ""}`} onClick={() => setActiveTab("overview")}>
            🖥️ System Overview
          </button>
          <button className={`nav-item ${activeTab === "analytics" ? "active" : ""}`} onClick={() => setActiveTab("analytics")}>
            📈 Streaming Analytics
          </button>
          <button className={`nav-item ${activeTab === "users" ? "active" : ""}`} onClick={() => setActiveTab("users")}>
            👤 User Directory
          </button>
          <button className={`nav-item ${activeTab === "channels" ? "active" : ""}`} onClick={() => setActiveTab("channels")}>
            🎬 Channel Catalog
          </button>
          <button className={`nav-item ${activeTab === "plans" ? "active" : ""}`} onClick={() => setActiveTab("plans")}>
            🎫 Subscription Plans
          </button>
          <button className={`nav-item ${activeTab === "revenue" ? "active" : ""}`} onClick={() => setActiveTab("revenue")}>
            💵 Revenue Reports
          </button>
        </aside>

        <main className="main-content">
          {activeTab === "overview" && <DashboardOverview />}
          {activeTab === "analytics" && <AnalyticsManagement />}
          {activeTab === "users" && <UserManagement />}
          {activeTab === "channels" && <ChannelManagement />}
          {activeTab === "plans" && <PlanManagement />}
          {activeTab === "revenue" && <RevenueManagement />}
        </main>
      </div>

      <footer style={{ padding: "16px", textAlign: "center", fontSize: "11px", color: "var(--text-muted)", background: "#fff", borderTop: "1px solid var(--border)" }}>
        &copy; 2025 IPTV Management Dashboard. All rights reserved.
      </footer>
    </div>
  );
}
