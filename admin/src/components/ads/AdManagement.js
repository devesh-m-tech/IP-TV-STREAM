import React, { useState, useEffect, useRef } from "react";

const API_BASE = window.location.hostname === "localhost"
  ? "http://localhost:4000/api"
  : "https://ip-tv-stream.onrender.com/api";

export default function AdManagement() {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [imageMode, setImageMode] = useState("upload"); // "upload" | "url"
  const [form, setForm] = useState({
    imageUrl: "",
    title: "",
    subtitle: "",
    slogan: "",
    sponsorLabel: "SPONSORED BY",
    isActive: true,
  });
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadPreview, setUploadPreview] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const fileInputRef = useRef(null);

  const fetchAds = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/ads`);
      const data = await res.json();
      setAds(data);
    } catch {
      setError("Failed to load ads");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAds(); }, []);

  // Handle file selection → show local preview
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadFile(file);
    setUploadPreview(URL.createObjectURL(file));
    setForm(f => ({ ...f, imageUrl: "" }));
    setError("");
  };

  // Drag & drop support
  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file) return;
    setUploadFile(file);
    setUploadPreview(URL.createObjectURL(file));
    setForm(f => ({ ...f, imageUrl: "" }));
    setError("");
  };

  // Upload file → get back hosted URL
  const uploadImage = async () => {
    if (!uploadFile) return null;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("image", uploadFile);
      const res = await fetch(`${API_BASE}/ads/upload`, { method: "POST", body: fd });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      return data.imageUrl;
    } catch {
      setError("Image upload failed. Try again.");
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    let finalImageUrl = form.imageUrl;

    // If upload mode → upload first, get URL
    if (imageMode === "upload") {
      if (!uploadFile) { setError("Please select an image to upload"); return; }
      finalImageUrl = await uploadImage();
      if (!finalImageUrl) return;
    }

    if (!finalImageUrl) { setError("Image URL is required"); return; }
    if (!form.title) { setError("Brand Title is required"); return; }

    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/ads`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, imageUrl: finalImageUrl }),
      });
      if (!res.ok) throw new Error("Failed");
      setForm({ imageUrl: "", title: "", subtitle: "", slogan: "", sponsorLabel: "SPONSORED BY", isActive: true });
      setUploadFile(null);
      setUploadPreview("");
      if (fileInputRef.current) fileInputRef.current.value = "";
      setSuccess("✅ Ad banner saved successfully!");
      setTimeout(() => setSuccess(""), 3000);
      fetchAds();
    } catch {
      setError("Failed to save ad");
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (id) => {
    try {
      await fetch(`${API_BASE}/ads/${id}/toggle`, { method: "PATCH" });
      fetchAds();
    } catch { setError("Failed to toggle ad"); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this ad banner?")) return;
    try {
      await fetch(`${API_BASE}/ads/${id}`, { method: "DELETE" });
      fetchAds();
    } catch { setError("Failed to delete ad"); }
  };

  const previewSrc = imageMode === "upload" ? uploadPreview : form.imageUrl;

  return (
    <div className="ad-management">
      <h2 className="section-title">📢 Ad Banner Management</h2>
      <p className="section-subtitle">Upload or link image banners shown below the TV player screen.</p>

      {/* ── Add Form Card ── */}
      <div className="ad-form-card">
        <h3 className="ad-form-title">➕ Add New Ad Banner</h3>

        {error   && <div className="ad-error">{error}</div>}
        {success && <div className="ad-success">{success}</div>}

        <form onSubmit={handleSubmit} className="ad-form">

          {/* Image Source Toggle */}
          <div className="ad-mode-tabs">
            <button
              type="button"
              className={`ad-mode-tab ${imageMode === "upload" ? "active" : ""}`}
              onClick={() => { setImageMode("upload"); setError(""); }}
            >
              📁 Upload Image
            </button>
            <button
              type="button"
              className={`ad-mode-tab ${imageMode === "url" ? "active" : ""}`}
              onClick={() => { setImageMode("url"); setError(""); }}
            >
              🔗 Enter URL
            </button>
          </div>

          {/* Upload Area */}
          {imageMode === "upload" && (
            <div
              className={`ad-dropzone ${uploadPreview ? "has-image" : ""}`}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={e => e.preventDefault()}
              onDrop={handleDrop}
            >
              {uploadPreview ? (
                <div className="ad-dropzone-preview">
                  <img src={uploadPreview} alt="Preview" className="ad-dropzone-img" />
                  <div className="ad-dropzone-change">
                    <span>🔄 Click to change image</span>
                  </div>
                </div>
              ) : (
                <div className="ad-dropzone-placeholder">
                  <span className="ad-dropzone-icon">🖼️</span>
                  <span className="ad-dropzone-text">Click to browse or drag & drop</span>
                  <span className="ad-dropzone-hint">PNG, JPG, WEBP, SVG · Max 5 MB</span>
                </div>
              )}
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleFileChange}
              />
            </div>
          )}

          {/* URL Input */}
          {imageMode === "url" && (
            <div className="ad-form-group">
              <label>Image URL *</label>
              <input
                type="text"
                placeholder="https://example.com/banner.jpg"
                value={form.imageUrl}
                onChange={e => setForm({ ...form, imageUrl: e.target.value })}
              />
            </div>
          )}

          {/* Brand Info */}
          <div className="ad-form-row">
            <div className="ad-form-group">
              <label>Brand Title *</label>
              <input type="text" placeholder="e.g. POORVIKA" value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })} />
            </div>
            <div className="ad-form-group">
              <label>Subtitle</label>
              <input type="text" placeholder="e.g. APPLIANCES" value={form.subtitle}
                onChange={e => setForm({ ...form, subtitle: e.target.value })} />
            </div>
          </div>

          <div className="ad-form-row">
            <div className="ad-form-group">
              <label>Slogan</label>
              <input type="text" placeholder="e.g. THINK AC! Think Poorvika!" value={form.slogan}
                onChange={e => setForm({ ...form, slogan: e.target.value })} />
            </div>
            <div className="ad-form-group">
              <label>Sponsor Label</label>
              <input type="text" placeholder="SPONSORED BY" value={form.sponsorLabel}
                onChange={e => setForm({ ...form, sponsorLabel: e.target.value })} />
            </div>
          </div>

          <div className="ad-form-group ad-form-group--check">
            <label>
              <input type="checkbox" checked={form.isActive}
                onChange={e => setForm({ ...form, isActive: e.target.checked })} />
              &nbsp; Set as Active (shown to users)
            </label>
          </div>

          {/* Live Preview */}
          {previewSrc && (
            <div className="ad-preview">
              <span className="ad-preview-label">Preview:</span>
              <div className="ad-preview-banner">
                <img src={previewSrc} alt="Ad preview" className="ad-preview-img"
                  onError={e => e.target.style.display = 'none'} />
                <div className="ad-preview-text">
                  <span className="ad-preview-sponsor">{form.sponsorLabel}</span>
                  <span className="ad-preview-title">{form.title || "BRAND NAME"}</span>
                  {form.subtitle && <span className="ad-preview-sub">{form.subtitle}</span>}
                  {form.slogan && <span className="ad-preview-slogan">{form.slogan}</span>}
                </div>
              </div>
            </div>
          )}

          <button type="submit" className="ad-save-btn" disabled={saving || uploading}>
            {uploading ? "⬆️ Uploading..." : saving ? "💾 Saving..." : "💾 Save Ad Banner"}
          </button>
        </form>
      </div>

      {/* ── Existing Ads List ── */}
      <div className="ad-list-section">
        <h3 className="ad-form-title">📋 All Ad Banners</h3>
        {loading ? (
          <div className="ad-loading">Loading...</div>
        ) : ads.length === 0 ? (
          <div className="ad-empty">No ad banners added yet. Add one above!</div>
        ) : (
          <div className="ad-list">
            {ads.map(ad => (
              <div key={ad.id} className={`ad-list-item ${ad.isActive ? "active" : "inactive"}`}>
                <img src={ad.imageUrl} alt={ad.title} className="ad-list-img"
                  onError={e => e.target.style.display = 'none'} />
                <div className="ad-list-info">
                  <div className="ad-list-title">{ad.title}</div>
                  {ad.subtitle && <div className="ad-list-sub">{ad.subtitle}</div>}
                  {ad.slogan && <div className="ad-list-slogan">"{ad.slogan}"</div>}
                  <div className={`ad-list-status ${ad.isActive ? "on" : "off"}`}>
                    {ad.isActive ? "🟢 Active — showing to users" : "🔴 Inactive"}
                  </div>
                </div>
                <div className="ad-list-actions">
                  <button className="ad-toggle-btn" onClick={() => handleToggle(ad.id)}>
                    {ad.isActive ? "Deactivate" : "Activate"}
                  </button>
                  <button className="ad-delete-btn" onClick={() => handleDelete(ad.id)}>
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
