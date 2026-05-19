import React, { useEffect, useState } from "react";
import API from "../../utils/api";
import "../../index.css";

const DURATIONS = ["Monthly", "Semi-Annually", "Yearly"];
const RESOLUTIONS = ["SD", "HD", "FHD", "UHD (4K)"];

export default function PlanManagement() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [duration, setDuration] = useState(DURATIONS[0]);
  const [maxDevices, setMaxDevices] = useState(3);
  const [resolution, setResolution] = useState(RESOLUTIONS[1]);
  const [features, setFeatures] = useState("");

  const [editModal, setEditModal] = useState({ open: false, plan: null });
  const [deleteModal, setDeleteModal] = useState({ open: false, plan: null });
  const [searchTerm, setSearchTerm] = useState("");

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const res = await API.get("/plans");
      setPlans(res.data);
    } catch (err) {
      alert("Failed to load plans list");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const filteredPlans = plans.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.resolution.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await API.post("/plans", {
        name,
        price: parseFloat(price),
        duration,
        maxDevices: parseInt(maxDevices, 10),
        resolution,
        features: features
          ? features.split(",").map((f) => f.trim()).filter(Boolean)
          : [],
      });
      setName("");
      setPrice("");
      setDuration(DURATIONS[0]);
      setMaxDevices(3);
      setResolution(RESOLUTIONS[1]);
      setFeatures("");
      fetchPlans();
      alert("✅ Subscription plan successfully published!");
    } catch (err) {
      alert("Publishing plan failed");
    }
  };

  const handleEditSave = async () => {
    try {
      const p = editModal.plan;
      await API.put(`/plans/${p.id}`, {
        name: p.name,
        price: parseFloat(p.price),
        duration: p.duration,
        maxDevices: parseInt(p.maxDevices, 10),
        resolution: p.resolution,
        features: Array.isArray(p.features)
          ? p.features
          : String(p.features).split(",").map((f) => f.trim()).filter(Boolean),
      });
      fetchPlans();
      setEditModal({ open: false, plan: null });
      alert("✅ Subscription plan updated!");
    } catch (err) {
      alert("Plan update failed");
    }
  };

  const handleDelete = async () => {
    const p = deleteModal.plan;
    try {
      await API.delete(`/plans/${p.id}`);
      fetchPlans();
      setDeleteModal({ open: false, plan: null });
      alert("✅ Subscription plan successfully deleted");
    } catch (err) {
      alert("Failed to delete plan");
    }
  };

  return (
    <div className="pro-module">
      <h2 className="card-title">Subscription Plans</h2>

      {/* Creation form */}
      <div className="pro-card">
        <h3 style={{ fontSize: "16px", marginBottom: "16px", color: "var(--text)" }}>Create New Plan</h3>
        <form className="pro-form-grid" onSubmit={handleCreate}>
          <div className="form-group">
            <label>Plan Name</label>
            <input
              className="pro-input"
              placeholder="e.g. Standard HD Plan"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Price (₹ INR)</label>
            <input
              className="pro-input"
              type="number"
              step="1"
              placeholder="e.g. 299"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Billing Duration</label>
            <select
              className="pro-select"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
            >
              {DURATIONS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Max Devices</label>
            <input
              className="pro-input"
              type="number"
              min="1"
              value={maxDevices}
              onChange={(e) => setMaxDevices(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Resolution</label>
            <select
              className="pro-select"
              value={resolution}
              onChange={(e) => setResolution(e.target.value)}
            >
              {RESOLUTIONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Features (Comma-separated)</label>
            <input
              className="pro-input"
              placeholder="e.g. 1080p stream, No ads, Offline access"
              value={features}
              onChange={(e) => setFeatures(e.target.value)}
            />
          </div>
          <button className="pro-btn btn-primary" type="submit">
            Create Plan
          </button>
        </form>
      </div>

      {/* Search Plan */}
      <div className="search-container">
        <span className="search-icon">🔍</span>
        <input
          className="search-input"
          placeholder="Search plan or resolution..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Plans Table */}
      <div className="pro-table-container">
        <table>
          <thead>
            <tr>
              <th>PLAN NAME</th>
              <th>PRICE</th>
              <th>DURATION</th>
              <th>DEVICES LIMIT</th>
              <th>QUALITY</th>
              <th>FEATURES</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" style={{ textAlign: "center", padding: "40px" }}>
                  Fetching active subscription plans...
                </td>
              </tr>
            ) : filteredPlans.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: "center", padding: "40px", color: "var(--text3)" }}>
                  No subscription plans found. Add one above!
                </td>
              </tr>
            ) : (
              filteredPlans.map((p) => (
                <tr key={p.id}>
                  <td>
                    <span style={{ fontWeight: "700" }}>{p.name}</span>
                  </td>
                  <td>
                    <b style={{ color: "var(--accent)" }}>₹{p.price.toLocaleString("en-IN")}</b>
                  </td>
                  <td>
                    <span className="pro-badge blue">{p.duration}</span>
                  </td>
                  <td>
                    <span className="pro-badge">{p.maxDevices} Devices</span>
                  </td>
                  <td>
                    <span className="pro-badge" style={{ background: "#fef3c7", color: "#d97706" }}>
                      {p.resolution}
                    </span>
                  </td>
                  <td style={{ maxWidth: "250px" }}>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                      {p.features && p.features.map((feat, idx) => (
                        <span key={idx} style={{ fontSize: "10px", background: "var(--bg3)", color: "var(--text2)", padding: "2px 6px", borderRadius: "4px" }}>
                          ✓ {feat}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td>
                    <button
                      className="action-btn edit"
                      onClick={() => setEditModal({ open: true, plan: { ...p, features: p.features.join(", ") } })}
                    >
                      Edit
                    </button>
                    <button
                      className="action-btn delete"
                      onClick={() => setDeleteModal({ open: true, plan: p })}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {editModal.open && (
        <div className="pro-modal-overlay" onClick={() => setEditModal({ open: false, plan: null })}>
          <form className="pro-modal" onClick={(e) => e.stopPropagation()} onSubmit={(e) => { e.preventDefault(); handleEditSave(); }}>
            <h3 style={{ marginBottom: "20px" }}>Edit Subscription Plan</h3>
            <div style={{ display: "grid", gap: "20px", marginTop: "24px" }}>
              <div className="form-group">
                <label>Plan Name</label>
                <input
                  className="pro-input"
                  value={editModal.plan.name}
                  onChange={(e) =>
                    setEditModal({
                      ...editModal,
                      plan: { ...editModal.plan, name: e.target.value },
                    })
                  }
                  required
                />
              </div>
              <div className="pro-form-grid" style={{ gridTemplateColumns: "1fr 1fr", padding: 0, border: "none", boxShadow: "none" }}>
                <div className="form-group">
                  <label>Price (₹ INR)</label>
                  <input
                    className="pro-input"
                    type="number"
                    step="1"
                    value={editModal.plan.price}
                    onChange={(e) =>
                      setEditModal({
                        ...editModal,
                        plan: { ...editModal.plan, price: e.target.value },
                      })
                    }
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Billing Duration</label>
                  <select
                    className="pro-select"
                    value={editModal.plan.duration}
                    onChange={(e) =>
                      setEditModal({
                        ...editModal,
                        plan: { ...editModal.plan, duration: e.target.value },
                      })
                    }
                  >
                    {DURATIONS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="pro-form-grid" style={{ gridTemplateColumns: "1fr 1fr", padding: 0, border: "none", boxShadow: "none" }}>
                <div className="form-group">
                  <label>Max Devices Limit</label>
                  <input
                    className="pro-input"
                    type="number"
                    value={editModal.plan.maxDevices}
                    onChange={(e) =>
                      setEditModal({
                        ...editModal,
                        plan: { ...editModal.plan, maxDevices: e.target.value },
                      })
                    }
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Resolution</label>
                  <select
                    className="pro-select"
                    value={editModal.plan.resolution}
                    onChange={(e) =>
                      setEditModal({
                        ...editModal,
                        plan: { ...editModal.plan, resolution: e.target.value },
                      })
                    }
                  >
                    {RESOLUTIONS.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Plan Features (Comma-separated)</label>
                <input
                  className="pro-input"
                  value={editModal.plan.features}
                  onChange={(e) =>
                    setEditModal({
                      ...editModal,
                      plan: { ...editModal.plan, features: e.target.value },
                    })
                  }
                />
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "32px" }}>
              <button type="button" className="action-btn" onClick={() => setEditModal({ open: false, plan: null })}>
                Cancel
              </button>
              <button type="submit" className="pro-btn btn-primary">
                Save Changes
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.open && (
        <div className="pro-modal-overlay" onClick={() => setDeleteModal({ open: false, plan: null })}>
          <div className="pro-modal" style={{ maxWidth: "400px", textAlign: "center" }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ color: "var(--danger)" }}>Delete Subscription Plan</h3>
            <p style={{ margin: "20px 0", color: "var(--text2)" }}>
              Are you sure you want to completely delete the <b>{deleteModal.plan.name}</b> subscription tier? Users currently subscribed will not be affected.
            </p>
            <div style={{ display: "flex", justifyContent: "center", gap: "12px" }}>
              <button className="action-btn" onClick={() => setDeleteModal({ open: false, plan: null })}>
                Cancel
              </button>
              <button className="pro-btn" style={{ background: "var(--danger)" }} onClick={handleDelete}>
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
