import React, { useEffect, useState } from "react";
import API from "../../utils/api";
import "../../index.css";

const CATEGORIES = ["Entertainment","Movies","Sports","News","Kids","Music","Lifestyle"];
const BACKEND_URL = window.location.hostname === "localhost"
  ? "http://localhost:4000"
  : "https://ip-tv-stream.onrender.com"; 

export default function ChannelManagement() {
  const [channels, setChannels] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [loading, setLoading] = useState(false);

  const [channelNumber, setChannelNumber] = useState("");
  const [name, setName] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [logoFile, setLogoFile] = useState(null);
  const [language, setLanguage] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [drm, setDrm] = useState("");
  const [status, setStatus] = useState("Active");

  const [editModal, setEditModal] = useState({ open: false, channel: null });
  const [deleteModal, setDeleteModal] = useState({ open: false, channel: null });
  const [searchTerm, setSearchTerm] = useState("");

  const fetchNextNumber = async () => {
    try {
      const res = await API.get("/channels/next-number");
      setChannelNumber(String(res.data.nextNumber));
    } catch (err) {
      console.error("Failed to fetch next channel number");
    }
  };

  const fetchChannels = async () => {
    setLoading(true);
    try {
      const res = await API.get("/channels");
      const data = res.data.map(ch => ({
        ...ch,
        logo: ch.logo && !ch.logo.startsWith("http") ? `${BACKEND_URL}${ch.logo}` : ch.logo
      }));
      setChannels(data);
    } catch (err) { alert("Failed to load catalog"); }
    finally { setLoading(false); }
  };

  const fetchLanguages = async () => {
    try {
      const res = await API.get("/languages");
      setLanguages(res.data);
      if (res.data.length > 0) {
        setLanguage(res.data[0].name);
      }
    } catch (err) {
      console.error("Failed to load dynamic languages catalog");
    }
  };

  useEffect(() => {
    fetchChannels();
    fetchLanguages();
    fetchNextNumber();
  }, []);

  const toggleChannelStatus = async (id, newStatus) => {
    setChannels(prev => prev.map(ch => {
      const chId = ch.id || ch._id;
      if (chId === id) {
        return { ...ch, status: newStatus };
      }
      return ch;
    }));

    try {
      await API.put(`/channels/${id}`, { status: newStatus });
    } catch (err) {
      alert("Failed to update status");
      fetchChannels();
    }
  };

  const filteredChannels = channels.filter(ch => 
    ch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ch.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isNumberTaken = (num, excludeId = null) => {
    if (!num) return false;
    const parsed = parseInt(num, 10);
    if (isNaN(parsed)) return false;
    return channels.some(ch => {
      const chId = ch.id || ch._id;
      return ch.channelNumber === parsed && chId !== excludeId;
    });
  };

  const getNextAvailableNumberFromState = (excludeId = null) => {
    const used = new Set(
      channels
        .filter(ch => (ch.id || ch._id) !== excludeId && ch.channelNumber)
        .map(ch => ch.channelNumber)
    );
    let n = 101;
    while (used.has(n)) n++;
    return n;
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (isNumberTaken(channelNumber)) {
      alert(`❌ Channel number ${channelNumber} is already in use by another channel! Click Auto-Fix or select a different number.`);
      return;
    }
    try {
      const form = new FormData();
      form.append("channelNumber", channelNumber);
      form.append("name", name);
      form.append("videoUrl", videoUrl);
      form.append("language", language);
      form.append("category", category);
      form.append("drm", drm || "");
      form.append("status", status);
      if (logoFile) form.append("logoFile", logoFile);
      else form.append("logoUrl", logoUrl || "");

      await API.post("/channels", form, { headers: { "Content-Type": "multipart/form-data" } });
      setName(""); setVideoUrl(""); setLogoUrl(""); setLogoFile(null); setDrm(""); setStatus("Active");
      await fetchChannels();
      await fetchNextNumber(); // refresh next available number after creation
      alert("✅ Channel published");
    } catch (err) {
      const msg = err.response?.data?.error || "Publishing failed";
      alert(msg);
    }
  };

  const handleEditSave = async () => {
    const ch = editModal.channel;
    if (isNumberTaken(ch.channelNumber, ch.id || ch._id)) {
      alert(`❌ Channel number ${ch.channelNumber} is already taken! Click Auto-Fix or enter a unique number.`);
      return;
    }
    try {
      const form = new FormData();
      form.append("channelNumber", ch.channelNumber || "");
      form.append("name", ch.name);
      form.append("videoUrl", ch.videoUrl);
      form.append("language", ch.language);
      form.append("category", ch.category);
      form.append("status", ch.status || "Active");
      
      if (ch.newLogoFile) {
        form.append("logoFile", ch.newLogoFile);
      } else {
        let rawLogo = ch.logo || "";
        if (rawLogo.startsWith("http")) {
          // Check if it is a local upload mapped to BACKEND_URL, if so, strip BACKEND_URL prefix
          if (rawLogo.startsWith(BACKEND_URL)) {
            rawLogo = rawLogo.replace(BACKEND_URL, "");
          }
        }
        form.append("logoUrl", ch.logoUrl !== undefined ? ch.logoUrl : rawLogo);
      }

      await API.put(`/channels/${ch.id}`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      fetchChannels();
      setEditModal({ open: false, channel: null });
    } catch (err) {
      const msg = err.response?.data?.error || "Update failed";
      alert(msg);
    }
  };

  const handleDelete = async () => {
    const ch = deleteModal.channel;
    try {
      await API.delete(`/channels/${ch.id}`);
      await fetchChannels();
      await fetchNextNumber(); // after delete, refresh next available (fills the gap)
      setDeleteModal({ open: false, channel: null });
    } catch (err) {
      alert("Delete failed");
    }
  };

  return (
    <div className="pro-module">
      <h2 className="card-title">Channel Catalog</h2>

      {/* Creation form styled in a premium white card */}
      <div className="pro-card">
        <form className="pro-form-grid" onSubmit={handleCreate}>
          <div className="form-group">
            <label>Channel Number</label>
            <div style={{ display: "flex", gap: "8px" }}>
              <input
                className="pro-input"
                type="number"
                min="1"
                placeholder="e.g. 101"
                value={channelNumber}
                onChange={e => setChannelNumber(e.target.value)}
                required
                style={{
                  borderColor: isNumberTaken(channelNumber) ? "#ef4444" : "var(--border)",
                  flex: 1
                }}
                title="Each channel gets a unique number. The next available number is pre-filled."
              />
              {isNumberTaken(channelNumber) && (
                <button 
                  type="button"
                  className="pro-btn" 
                  style={{ background: "#ef4444", color: "#fff", padding: "4px 10px", fontSize: "11px", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "700" }}
                  onClick={() => setChannelNumber(String(getNextAvailableNumberFromState()))}
                >
                  Auto-Fix
                </button>
              )}
            </div>
            {isNumberTaken(channelNumber) ? (
              <small style={{ color: "#ef4444", fontWeight: "700", fontSize: "11px", marginTop: "4px", display: "block" }}>
                ❌ Number #{channelNumber} is already taken! Click "Auto-Fix" to resolve.
              </small>
            ) : (
              <small style={{ color: "var(--text3)", fontSize: "11px", marginTop: "4px", display: "block" }}>
                Next available: #{channelNumber} — change if needed
              </small>
            )}
          </div>
          <div className="form-group">
            <label>Name</label>
            <input className="pro-input" placeholder="e.g. Sun TV" value={name} onChange={e => setName(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Stream URL</label>
            <input className="pro-input" placeholder="HLS/M3U8 link" value={videoUrl} onChange={e => setVideoUrl(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Language</label>
            <select className="pro-select" value={language} onChange={e => setLanguage(e.target.value)}>
              {languages.map(l => <option key={l.id || l.name} value={l.name}>{l.name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Category</label>
            <select className="pro-select" value={category} onChange={e => setCategory(e.target.value)}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Logo File (Local Upload)</label>
            <input className="pro-input" type="file" accept="image/*" onChange={e => {
              setLogoFile(e.target.files[0]);
              if (e.target.files[0]) setLogoUrl(""); 
            }} />
          </div>
          <div className="form-group">
            <label>Logo URL (Web Link)</label>
            <input className="pro-input" placeholder="e.g. https://.../logo.png" value={logoUrl} onChange={e => {
              setLogoUrl(e.target.value);
              if (e.target.value) setLogoFile(null);
            }} />
          </div>
          <div className="form-group">
            <label>DRM ID</label>
            <input className="pro-input" placeholder="Optional" value={drm} onChange={e => setDrm(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Relay Status</label>
            <select className="pro-select" value={status} onChange={e => setStatus(e.target.value)}>
              <option value="Active">ACTIVE (On-Air)</option>
              <option value="Disabled">MUTED (Disabled)</option>
            </select>
          </div>
          <button className="pro-btn btn-primary" type="submit">Publish Channel</button>
        </form>
      </div>

      {/* Search component */}
      <div className="search-container">
        <span className="search-icon">🔍</span>
        <input 
          className="search-input" 
          placeholder="Search channel or category..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Table grid matching brand language, category, source url, actions */}
      <div className="pro-table-container">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>BRAND</th>
              <th>LANG</th>
              <th>CATEGORY</th>
              <th>SOURCE</th>
              <th>STATUS</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan="7" style={{ textAlign: "center", padding: "40px" }}>Loading catalog...</td></tr> : 
              filteredChannels.map(ch => (
                <tr key={ch.id}>
                  <td>
                    <span style={{ fontWeight: "800", color: "var(--accent)", fontSize: "14px" }}>
                      {ch.channelNumber || "—"}
                    </span>
                  </td>
                  <td style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div className="table-logo">
                      {ch.logo ? (
                        <img 
                          src={ch.logo} 
                          alt="" 
                          style={{ width: "100%", height: "100%", borderRadius: "8px", objectFit: "cover" }} 
                          onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                        />
                      ) : null}
                      <div className="table-logo-fallback" style={{ display: ch.logo ? 'none' : 'flex', width: "100%", height: "100%", alignItems: "center", justifyContent: "center", background: "var(--bg3)", color: "var(--accent)", fontWeight: "800", borderRadius: "8px" }}>
                        {ch.name[0].toUpperCase()}
                      </div>
                    </div>
                    <span style={{ fontWeight: "700" }}>{ch.name}</span>
                  </td>
                  <td><span className="pro-badge blue">{ch.language}</span></td>
                  <td><span className="pro-badge">{ch.category}</span></td>
                  <td style={{ fontSize: "11px", color: "var(--text3)", maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis" }}>{ch.videoUrl}</td>
                  <td>
                    <select
                      className={`pro-badge ${ch.status !== "Disabled" ? "active" : ""}`}
                      value={ch.status || "Active"}
                      onChange={(e) => toggleChannelStatus(ch.id || ch._id, e.target.value)}
                      style={{
                        border: "1px solid var(--border)",
                        outline: "none",
                        cursor: "pointer",
                        fontWeight: "800",
                        padding: "4px 10px",
                        borderRadius: "20px",
                        fontFamily: "inherit",
                        fontSize: "11px",
                        textAlign: "center",
                        textAlignLast: "center",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.04)",
                        display: "inline-block",
                        WebkitAppearance: "none",
                        MozAppearance: "none",
                        appearance: "none",
                        background: ch.status !== "Disabled" ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.15)",
                        color: ch.status !== "Disabled" ? "#10b981" : "#ef4444",
                        borderColor: ch.status !== "Disabled" ? "#10b981" : "#ef4444"
                      }}
                    >
                      <option value="Active" style={{ background: "#fff", color: "#10b981", fontWeight: "800" }}>ACTIVE</option>
                      <option value="Disabled" style={{ background: "#fff", color: "#ef4444", fontWeight: "800" }}>MUTED</option>
                    </select>
                  </td>
                  <td>
                    <button className="action-btn edit" onClick={() => setEditModal({ open: true, channel: { ...ch } })}>Edit</button>
                    <button className="action-btn delete" onClick={() => setDeleteModal({ open: true, channel: ch })}>Delete</button>
                  </td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {editModal.open && (
        <div className="pro-modal-overlay" onClick={() => setEditModal({ open: false, channel: null })}>
          <form className="pro-modal" onClick={e => e.stopPropagation()} onSubmit={(e) => { e.preventDefault(); handleEditSave(); }}>
            <h3 style={{ marginBottom: "20px" }}>Edit Channel Metadata</h3>
            <div style={{ display: "grid", gap: "20px", marginTop: "24px" }}>
              <div className="form-group">
                <label>Channel Number</label>
                <div style={{ display: "flex", gap: "8px" }}>
                  <input
                    className="pro-input"
                    type="number"
                    min="1"
                    value={editModal.channel.channelNumber || ""}
                    onChange={e => setEditModal({ ...editModal, channel: { ...editModal.channel, channelNumber: e.target.value } })}
                    required
                    style={{
                      borderColor: isNumberTaken(editModal.channel.channelNumber, editModal.channel.id || editModal.channel._id) ? "#ef4444" : "var(--border)",
                      flex: 1
                    }}
                  />
                  {isNumberTaken(editModal.channel.channelNumber, editModal.channel.id || editModal.channel._id) && (
                    <button 
                      type="button"
                      className="pro-btn" 
                      style={{ background: "#ef4444", color: "#fff", padding: "4px 10px", fontSize: "11px", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "700" }}
                      onClick={() => setEditModal({ 
                        ...editModal, 
                        channel: { 
                          ...editModal.channel, 
                          channelNumber: String(getNextAvailableNumberFromState(editModal.channel.id || editModal.channel._id)) 
                        } 
                      })}
                    >
                      Auto-Fix
                    </button>
                  )}
                </div>
                {isNumberTaken(editModal.channel.channelNumber, editModal.channel.id || editModal.channel._id) && (
                  <small style={{ color: "#ef4444", fontWeight: "700", fontSize: "11px", marginTop: "4px", display: "block" }}>
                    ❌ Number #{editModal.channel.channelNumber} is already in use globally!
                  </small>
                )}
              </div>
              <div className="form-group">
                <label>Name</label>
                <input className="pro-input" value={editModal.channel.name} onChange={e => setEditModal({ ...editModal, channel: { ...editModal.channel, name: e.target.value } })} required />
              </div>
              <div className="form-group">
                <label>Stream URL</label>
                <input className="pro-input" value={editModal.channel.videoUrl} onChange={e => setEditModal({ ...editModal, channel: { ...editModal.channel, videoUrl: e.target.value } })} required />
              </div>
              <div className="pro-form-grid" style={{ gridTemplateColumns: "1fr 1fr", padding: 0, border: "none", boxShadow: "none" }}>
                <div className="form-group">
                  <label>Language</label>
                  <select className="pro-select" value={editModal.channel.language} onChange={e => setEditModal({ ...editModal, channel: { ...editModal.channel, language: e.target.value } })}>
                    {languages.map(l => <option key={l.id || l.name} value={l.name}>{l.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Category</label>
                  <select className="pro-select" value={editModal.channel.category} onChange={e => setEditModal({ ...editModal, channel: { ...editModal.channel, category: e.target.value } })}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Relay Status</label>
                <select className="pro-select" value={editModal.channel.status || "Active"} onChange={e => setEditModal({ ...editModal, channel: { ...editModal.channel, status: e.target.value } })}>
                  <option value="Active">ACTIVE (On-Air)</option>
                  <option value="Disabled">MUTED (Disabled)</option>
                </select>
              </div>
              <div className="form-group">
                <label>Change Logo (Local Upload)</label>
                <input className="pro-input" type="file" accept="image/*" onChange={e => {
                  setEditModal({ 
                    ...editModal, 
                    channel: { 
                      ...editModal.channel, 
                      newLogoFile: e.target.files[0],
                      logoUrl: e.target.files[0] ? "" : editModal.channel.logoUrl
                    } 
                  });
                }} />
              </div>
              <div className="form-group">
                <label>Change Logo URL (Web Link)</label>
                <input className="pro-input" placeholder="e.g. https://.../logo.png" value={editModal.channel.logoUrl !== undefined ? editModal.channel.logoUrl : (editModal.channel.logo && editModal.channel.logo.startsWith("http") && !editModal.channel.logo.includes(BACKEND_URL) ? editModal.channel.logo : "")} onChange={e => {
                  setEditModal({ 
                    ...editModal, 
                    channel: { 
                      ...editModal.channel, 
                      logoUrl: e.target.value,
                      newLogoFile: e.target.value ? null : editModal.channel.newLogoFile
                    } 
                  });
                }} />
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "32px" }}>
              <button type="button" className="action-btn" onClick={() => setEditModal({ open: false, channel: null })}>Cancel</button>
              <button type="submit" className="pro-btn btn-primary">Save Changes</button>
            </div>
          </form>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.open && (
        <div className="pro-modal-overlay" onClick={() => setDeleteModal({ open: false, channel: null })}>
          <div className="pro-modal" style={{ maxWidth: "400px", textAlign: "center" }} onClick={e => e.stopPropagation()}>
            <h3 style={{ color: "var(--danger)" }}>Confirm Deletion</h3>
            <p style={{ margin: "20px 0", color: "var(--text2)" }}>
              Are you sure you want to delete <b>{deleteModal.channel.name}</b>?<br/>
              <span style={{ color: "var(--accent)", fontSize: "13px" }}>
                Channel #{deleteModal.channel.channelNumber} will be freed and reused for the next new channel.
              </span>
            </p>
            <div style={{ display: "flex", justifyContent: "center", gap: "12px" }}>
              <button className="action-btn" onClick={() => setDeleteModal({ open: false, channel: null })}>Cancel</button>
              <button className="pro-btn" style={{ background: "var(--danger)" }} onClick={handleDelete}>Confirm Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
