import React, { useEffect, useState } from "react";
import API from "../../utils/api";
import "../../index.css";

const BACKEND_URL = "http://localhost:4000";

export default function DashboardOverview() {
  const [stats, setStats] = useState({ users: 0, channels: 0, activeDevices: 0 });
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentChannels, setRecentChannels] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const [uRes, cRes] = await Promise.all([
          API.get("/admin/users"),
          API.get("/channels")
        ]);
        
        let activeCount = 0;
        const users = uRes.data;
        
        // Fetch devices for active device count
        await Promise.all(users.map(async (u) => {
           try {
             const devRes = await API.get(`/admin/users/${u.id}/devices`);
             activeCount += devRes.data.length;
           } catch {}
        }));

        setStats({
          users: users.length,
          channels: cRes.data.length,
          activeDevices: activeCount
        });

        // Set recent 5 users & channels for panels
        setRecentUsers(users.slice(0, 5));
        setRecentChannels(cRes.data.map(ch => ({
          ...ch,
          logo: ch.logo && !ch.logo.startsWith("http") ? `${BACKEND_URL}${ch.logo}` : ch.logo
        })).slice(0, 5));

      } catch (err) { 
        console.error("Dashboard Overview fetch error", err); 
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  return (
    <div className="pro-module">
      <h2 className="card-title">System Overview</h2>
      
      {/* 3 Stat Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: "var(--bg3)", color: "var(--accent)" }}>👤</div>
          <div className="stat-info">
            <b>{stats.users}</b>
            <span>Total Users</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: "var(--bg3)", color: "var(--accent)" }}>🎬</div>
          <div className="stat-info">
            <b>{stats.channels}</b>
            <span>Active Channels</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: "var(--bg3)", color: "var(--accent)" }}>📱</div>
          <div className="stat-info">
            <b>{stats.activeDevices}</b>
            <span>Linked Devices</span>
          </div>
        </div>
      </div>

      {/* Blue Gradient Welcome Banner */}
      <div className="welcome-banner">
         <h3>Welcome to the Admin Command Center</h3>
         <p>
           From here you can manage your entire IPTV infrastructure. Use the sidebar to navigate between user directories and the channel catalog.
         </p>
      </div>

      {/* 2 Panels: Channel List + User List */}
      <div className="panels-grid">
        {/* Panel 1: Channels list */}
        <div className="pro-card panel-card">
          <div className="panel-header">
            <h4>Channel Catalog Summary</h4>
            <span className="pro-badge blue">{stats.channels} Active</span>
          </div>
          <div className="panel-body">
            {loading ? (
              <div className="panel-loading">Syncing...</div>
            ) : recentChannels.length === 0 ? (
              <div className="panel-empty">No channels found</div>
            ) : (
              <ul className="panel-list">
                {recentChannels.map(ch => (
                  <li key={ch.id} className="panel-list-item">
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div className="table-logo" style={{ width: "30px", height: "30px" }}>
                        {ch.logo ? (
                          <img src={ch.logo} alt="" style={{ width: "100%", height: "100%", borderRadius: "6px", objectFit: "cover" }} />
                        ) : ch.name[0].toUpperCase()}
                      </div>
                      <span className="item-name">{ch.name}</span>
                    </div>
                    <span className="pro-badge">{ch.category}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Panel 2: Users list */}
        <div className="pro-card panel-card">
          <div className="panel-header">
            <h4>User Directory Summary</h4>
            <span className="pro-badge blue">{stats.users} Active</span>
          </div>
          <div className="panel-body">
            {loading ? (
              <div className="panel-loading">Syncing...</div>
            ) : recentUsers.length === 0 ? (
              <div className="panel-empty">No users found</div>
            ) : (
              <ul className="panel-list">
                {recentUsers.map(u => (
                  <li key={u.id} className="panel-list-item">
                    <span className="item-name">{u.email}</span>
                    <span className="pro-badge">Limit: {u.maxDevices ?? 3}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
