import React, { useState, useEffect } from "react";
import UserManagement from "../users/UserManagement";
import ChannelManagement from "../channels/ChannelManagement";
import PlanManagement from "../plans/PlanManagement";
import RevenueManagement from "../revenue/RevenueManagement";
import AnalyticsManagement from "../analytics/AnalyticsManagement";
import AdManagement from "../ads/AdManagement";
import DashboardOverview from "./DashboardOverview";
import ResellerManagement from "../resellers/ResellerManagement";
import StreamsManagement from "../streams/StreamsManagement";
import LanguageManagement from "../languages/LanguageManagement";
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
        <aside className="sidebar" style={{ minWidth: "220px" }}>
          <button className={`nav-item ${activeTab === "overview" ? "active" : ""}`} onClick={() => setActiveTab("overview")}>
            🖥️ System Overview
          </button>
          <button className={`nav-item ${activeTab === "analytics" ? "active" : ""}`} onClick={() => setActiveTab("analytics")}>
            📈 Streaming Analytics
          </button>
          <button className={`nav-item ${activeTab === "users" ? "active" : ""}`} onClick={() => setActiveTab("users")}>
            👤 User Directory
          </button>
          <button className={`nav-item ${activeTab === "resellers" ? "active" : ""}`} onClick={() => setActiveTab("resellers")}>
            🔷 Reseller Network
          </button>
          <button className={`nav-item ${activeTab === "channels" ? "active" : ""}`} onClick={() => setActiveTab("channels")}>
            🎬 Channel Catalog
          </button>
          <button className={`nav-item ${activeTab === "languages" ? "active" : ""}`} onClick={() => setActiveTab("languages")}>
            🌐 Manage Languages
          </button>
          <button className={`nav-item ${activeTab === "streams" ? "active" : ""}`} onClick={() => setActiveTab("streams")}>
            📡 Live Streams
          </button>
          <button className={`nav-item ${activeTab === "plans" ? "active" : ""}`} onClick={() => setActiveTab("plans")}>
            🎫 Subscription Plans
          </button>
          <button className={`nav-item ${activeTab === "revenue" ? "active" : ""}`} onClick={() => setActiveTab("revenue")}>
            💵 Revenue Reports
          </button>
          <button className={`nav-item ${activeTab === "ads" ? "active" : ""}`} onClick={() => setActiveTab("ads")}>
            📢 Ad Banners
          </button>
        </aside>

        <main className="main-content">
          <div style={{ display: activeTab === "overview" ? "block" : "none" }}><DashboardOverview /></div>
          <div style={{ display: activeTab === "analytics" ? "block" : "none" }}><AnalyticsManagement /></div>
          <div style={{ display: activeTab === "users" ? "block" : "none" }}><UserManagement /></div>
          <div style={{ display: activeTab === "resellers" ? "block" : "none" }}><ResellerManagement /></div>
          <div style={{ display: activeTab === "channels" ? "block" : "none" }}><ChannelManagement /></div>
          <div style={{ display: activeTab === "languages" ? "block" : "none" }}><LanguageManagement /></div>
          <div style={{ display: activeTab === "streams" ? "block" : "none" }}><StreamsManagement /></div>
          <div style={{ display: activeTab === "plans" ? "block" : "none" }}><PlanManagement /></div>
          <div style={{ display: activeTab === "revenue" ? "block" : "none" }}><RevenueManagement /></div>
          <div style={{ display: activeTab === "ads" ? "block" : "none" }}><AdManagement /></div>
        </main>
      </div>

      <footer style={{ padding: "16px", textAlign: "center", fontSize: "11px", color: "var(--text-muted)", background: "#fff", borderTop: "1px solid var(--border)" }}>
        &copy; 2025 IPTV Management Dashboard. All rights reserved.
      </footer>
    </div>
  );
}
