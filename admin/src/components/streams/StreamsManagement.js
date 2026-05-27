import React, { useEffect, useState } from "react";
import API from "../../utils/api";
import "../../index.css";

const BACKEND_URL = window.location.hostname === "localhost"
  ? "http://localhost:4000"
  : "https://ip-tv-stream.onrender.com";

export default function StreamsManagement() {
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const fetchChannels = async () => {
    setLoading(true);
    try {
      const res = await API.get("/channels");
      const data = res.data.map(ch => ({
        ...ch,
        logo: ch.logo && !ch.logo.startsWith("http") ? `${BACKEND_URL}${ch.logo}` : ch.logo,
        // Calculate mock viewers for visual excellence (range 10-350)
        viewers: ch.name.charCodeAt(0) * 2 + (ch.name.length * 5),
        quality: ch.name.toLowerCase().includes("hd") ? "1080p · HD" : "720p · SD"
      }));
      setChannels(data);
    } catch (err) {
      console.error("Failed to load catalog for streams");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChannels();
  }, []);

  const toggleStream = async (id) => {
    const channel = channels.find(ch => (ch.id || ch._id) === id);
    if (!channel) return;

    const nextStatus = channel.status === "Disabled" ? "Active" : "Disabled";

    // Optimistic UI update
    setChannels(prev => prev.map(ch => {
      if ((ch.id || ch._id) === id) {
        return { ...ch, status: nextStatus };
      }
      return ch;
    }));

    try {
      await API.put(`/channels/${id}`, { status: nextStatus });
    } catch (err) {
      console.error("Failed to toggle stream status in database", err);
      // Revert if failed
      setChannels(prev => prev.map(ch => {
        if ((ch.id || ch._id) === id) {
          return { ...ch, status: channel.status };
        }
        return ch;
      }));
    }
  };

  const categories = ["All", ...new Set(channels.map(ch => ch.category))];

  const filteredChannels = channels.filter(ch => {
    const matchesSearch = ch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ch.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || ch.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const activeCount = channels.filter(ch => ch.status !== "Disabled").length;
  const totalViewers = channels
    .filter(ch => ch.status !== "Disabled")
    .reduce((sum, ch) => sum + ch.viewers, 0);

  return (
    <div className="pro-module">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 className="card-title">Live Streams Dashboard</h2>
        <span className="pro-badge blue" style={{ padding: "6px 12px", height: "auto" }}>
          Active Viewers: <b>{totalViewers.toLocaleString()} online</b>
        </span>
      </div>

      {/* Analytics stat cards */}
      <div className="stats-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
        <div className="stat-card" style={{ borderLeft: "4px solid #06b6d4" }}>
          <div className="stat-icon" style={{ background: "#ecfeff", color: "#06b6d4" }}>📡</div>
          <div className="stat-info">
            <b>{channels.length}</b>
            <span>Total Streams</span>
          </div>
        </div>

        <div className="stat-card" style={{ borderLeft: "4px solid #10b981" }}>
          <div className="stat-icon" style={{ background: "#ecfdf5", color: "#10b981" }}>✅</div>
          <div className="stat-info">
            <b>{activeCount}</b>
            <span>Online/Live</span>
          </div>
        </div>

        <div className="stat-card" style={{ borderLeft: "4px solid #ef4444" }}>
          <div className="stat-icon" style={{ background: "#fef2f2", color: "#ef4444" }}>⊘</div>
          <div className="stat-info">
            <b>{channels.length - activeCount}</b>
            <span>Offline/Muted</span>
          </div>
        </div>

        <div className="stat-card" style={{ borderLeft: "4px solid #f59e0b" }}>
          <div className="stat-icon" style={{ background: "#fffbeb", color: "#f59e0b" }}>⚡</div>
          <div className="stat-info">
            <b>{categories.length - 1}</b>
            <span>Active Categories</span>
          </div>
        </div>
      </div>

      {/* Filters and Search toolbar */}
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "16px", background: "var(--bg2)", padding: "16px", borderRadius: "12px", border: "1px solid var(--border)", boxShadow: "var(--shadow)" }}>
        <div className="search-container" style={{ margin: 0, flex: 1, maxWidth: "360px" }}>
          <span className="search-icon">🔍</span>
          <input
            className="search-input"
            placeholder="Search active live streams..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div style={{ display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "2px" }}>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className="action-btn"
              style={{
                background: selectedCategory === cat ? "var(--accent)" : "var(--bg2)",
                borderColor: selectedCategory === cat ? "var(--accent)" : "var(--border)",
                color: selectedCategory === cat ? "#fff" : "var(--text2)"
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Stream Cards Grid */}
      {loading ? (
        <div className="pro-card" style={{ textAlign: "center", padding: "80px", color: "var(--text3)" }}>
          Syncing active stream relays...
        </div>
      ) : filteredChannels.length === 0 ? (
        <div className="pro-card" style={{ textAlign: "center", padding: "80px", color: "var(--text3)" }}>
          No channels match search. Go to Channel Catalog tab to upload channels first!
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "20px" }}>
          {filteredChannels.map(ch => {
            const chId = ch.id || ch._id;
            const isLive = ch.status !== "Disabled";
            return (
              <div
                key={chId}
                className="pro-card"
                style={{
                  padding: "20px",
                  position: "relative",
                  transition: "transform 0.2s, border-color 0.2s",
                  borderLeft: isLive ? "4px solid #10b981" : "4px solid #ef4444",
                  opacity: isLive ? 1 : 0.75
                }}
              >
                {/* Thumb/Logo block */}
                <div style={{ display: "flex", gap: "14px", alignItems: "center", marginBottom: "16px" }}>
                  <div style={{ width: "48px", height: "48px", borderRadius: "10px", overflow: "hidden", background: "var(--bg3)", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid var(--border)" }}>
                    {ch.logo ? (
                      <img
                        src={ch.logo}
                        alt=""
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                      />
                    ) : null}
                    <div style={{ display: ch.logo ? 'none' : 'flex', width: "100%", height: "100%", alignItems: "center", justifyContent: "center", background: "var(--bg3)", color: "var(--accent)", fontWeight: "800" }}>
                      {ch.name[0].toUpperCase()}
                    </div>
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ fontWeight: "800", fontSize: "14px", color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {ch.name}
                      </span>
                    </div>
                    <div style={{ display: "flex", gap: "6px", marginTop: "4px" }}>
                      <span className="pro-badge" style={{ fontSize: "9px", background: "var(--bg3)" }}>{ch.category}</span>
                      <span className="pro-badge blue" style={{ fontSize: "9px" }}>{ch.quality}</span>
                    </div>
                  </div>

                  {isLive && (
                    <div style={{ position: "absolute", top: "20px", right: "20px", background: "#dcfce7", color: "#16a34a", fontSize: "10px", fontWeight: "800", padding: "2px 8px", borderRadius: "20px" }}>
                      ● LIVE
                    </div>
                  )}
                </div>

                {/* Source Url box */}
                <div style={{ marginBottom: "16px" }}>
                  <label style={{ fontSize: "9px", fontWeight: "700", textTransform: "uppercase", color: "var(--text3)", display: "block", marginBottom: "4px" }}>
                    Source URL
                  </label>
                  <div style={{ fontSize: "11px", fontFamily: "monospace", color: "var(--text2)", background: "var(--bg3)", padding: "6px 10px", borderRadius: "6px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {ch.videoUrl}
                  </div>
                </div>

                {/* Stream stats & actions */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--border)", paddingTop: "14px", marginTop: "10px" }}>
                  <span style={{ fontSize: "11px", color: "var(--text2)", display: "flex", alignItems: "center", gap: "4px" }}>
                    👤 <b>{isLive ? ch.viewers.toLocaleString() : 0}</b> active
                  </span>

                  <button
                    onClick={() => toggleStream(chId)}
                    className="action-btn"
                    style={{
                      borderColor: isLive ? "var(--danger)" : "var(--accent)",
                      color: isLive ? "var(--danger)" : "var(--accent)",
                      fontSize: "11px",
                      fontWeight: "700",
                      padding: "4px 12px",
                      margin: 0
                    }}
                  >
                    {isLive ? "⊘ Disable" : "▶ Enable"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
