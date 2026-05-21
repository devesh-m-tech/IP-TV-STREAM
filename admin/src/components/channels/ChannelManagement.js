import React, { useEffect, useState } from "react";
import API from "../../utils/api";
import "../../index.css";

const LANGUAGES = ["Tamil","English","Hindi","Telugu","Malayalam","Kannada","Bengali"];
const CATEGORIES = ["Entertainment","Movies","Sports","News","Kids","Music","Lifestyle"];
const BACKEND_URL = window.location.hostname === "localhost"
  ? "http://localhost:4000"
  : "https://ip-tv-stream.onrender.com"; 

export default function ChannelManagement() {
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [logoFile, setLogoFile] = useState(null);
  const [language, setLanguage] = useState(LANGUAGES[0]);
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [drm, setDrm] = useState("");

  const [editModal, setEditModal] = useState({ open: false, channel: null });
  const [deleteModal, setDeleteModal] = useState({ open: false, channel: null });
  const [searchTerm, setSearchTerm] = useState("");

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

  useEffect(() => { fetchChannels(); }, []);

  const filteredChannels = channels.filter(ch => 
    ch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ch.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const form = new FormData();
      form.append("name", name);
      form.append("videoUrl", videoUrl);
      form.append("language", language);
      form.append("category", category);
      form.append("drm", drm || "");
      if (logoFile) form.append("logoFile", logoFile);
      else form.append("logoUrl", logoUrl || "");

      await API.post("/channels", form, { headers: { "Content-Type": "multipart/form-data" } });
      setName(""); setVideoUrl(""); setLogoUrl(""); setLogoFile(null); setDrm(""); fetchChannels();
      alert("✅ Channel published");
    } catch (err) { alert("Publishing failed"); }
  };

  const handleEditSave = async () => {
    try {
      const ch = editModal.channel;
      const form = new FormData();
      form.append("name", ch.name);
      form.append("videoUrl", ch.videoUrl);
      form.append("language", ch.language);
      form.append("category", ch.category);
      if (ch.newLogoFile) form.append("logoFile", ch.newLogoFile);

      await API.put(`/channels/${ch.id}`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      fetchChannels();
      setEditModal({ open: false, channel: null });
    } catch (err) {
      alert("Update failed");
    }
  };

  const handleDelete = async () => {
    const ch = deleteModal.channel;
    try {
      await API.delete(`/channels/${ch.id}`);
      fetchChannels();
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
              {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Category</label>
            <select className="pro-select" value={category} onChange={e => setCategory(e.target.value)}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Logo Asset</label>
            <input className="pro-input" type="file" accept="image/*" onChange={e => setLogoFile(e.target.files[0])} />
          </div>
          <div className="form-group">
            <label>DRM ID</label>
            <input className="pro-input" placeholder="Optional" value={drm} onChange={e => setDrm(e.target.value)} />
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
              <th>BRAND</th>
              <th>LANG</th>
              <th>CATEGORY</th>
              <th>SOURCE</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan="5" style={{ textAlign: "center", padding: "40px" }}>Loading catalog...</td></tr> : 
              filteredChannels.map(ch => (
                <tr key={ch.id}>
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
                    {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
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
                <label>Change Logo Asset</label>
                <input className="pro-input" type="file" accept="image/*" onChange={e => setEditModal({ ...editModal, channel: { ...editModal.channel, newLogoFile: e.target.files[0] } })} />
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
            <p style={{ margin: "20px 0", color: "var(--text2)" }}>Are you sure you want to delete <b>{deleteModal.channel.name}</b>?</p>
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
