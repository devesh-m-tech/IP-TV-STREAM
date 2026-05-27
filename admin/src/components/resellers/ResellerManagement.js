import React, { useState, useEffect } from "react";
import API from "../../utils/api";
import "../../index.css";

export default function ResellerManagement() {
  const [resellers, setResellers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Modal states
  const [addModal, setAddModal] = useState(false);
  const [balanceModal, setBalanceModal] = useState({ open: false, reseller: null, amount: "", note: "" });
  const [editModal, setEditModal] = useState({ open: false, reseller: null });

  // Creation form states
  const [newName, setNewName] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newMaxUsers, setNewMaxUsers] = useState(50);
  const [newCommission, setNewCommission] = useState(25);
  const [newBalance, setNewBalance] = useState(0);
  const [newStatus, setNewStatus] = useState("active");

  const fetchResellers = async () => {
    try {
      const res = await API.get("/resellers");
      setResellers(res.data);
    } catch (err) {
      console.error("Failed to load resellers", err);
    }
  };

  useEffect(() => {
    fetchResellers();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await API.post("/resellers", {
        name: newName,
        username: newUsername,
        email: newEmail,
        maxUsers: parseInt(newMaxUsers, 10),
        balance: parseFloat(newBalance) || 0,
        commission: parseInt(newCommission, 10),
        status: newStatus
      });
      setAddModal(false);
      setNewName("");
      setNewUsername("");
      setNewEmail("");
      setNewMaxUsers(50);
      setNewCommission(25);
      setNewBalance(0);
      setNewStatus("active");
      fetchResellers();
      alert(`🎉 Reseller account '${newName}' successfully registered!`);
    } catch (err) {
      alert("Registration failed");
    }
  };

  const handleToggleStatus = async (id, explicitValue) => {
    const reseller = resellers.find(r => (r.id || r._id) === id);
    if (!reseller) return;
    const nextStatus = explicitValue || (reseller.status === "active" ? "inactive" : "active");

    setResellers(prev => prev.map(r => {
      const rId = r.id || r._id;
      if (rId === id) {
        return { ...r, status: nextStatus };
      }
      return r;
    }));

    try {
      await API.put(`/resellers/${id}`, { status: nextStatus });
    } catch (err) {
      alert("Failed to toggle status");
      fetchResellers();
    }
  };

  const handleAddBalanceSubmit = async (e) => {
    e.preventDefault();
    const amt = parseFloat(balanceModal.amount) || 0;
    if (amt <= 0) {
      alert("Please enter a valid amount greater than 0");
      return;
    }

    const reseller = balanceModal.reseller;
    const resellerId = reseller.id || reseller._id;
    const newBal = reseller.balance + amt;

    setResellers(prev => prev.map(r => {
      const rId = r.id || r._id;
      if (rId === resellerId) {
        return { ...r, balance: newBal };
      }
      return r;
    }));

    try {
      await API.put(`/resellers/${resellerId}`, { balance: newBal });
      setBalanceModal({ open: false, reseller: null, amount: "", note: "" });
      alert(`💰 Credited $${amt.toFixed(2)} to ${reseller.name}'s balance successfully.`);
    } catch (err) {
      alert("Top-up failed");
      fetchResellers();
    }
  };

  const handleEditSave = async (e) => {
    e.preventDefault();
    const edited = editModal.reseller;
    const editedId = edited.id || edited._id;

    setResellers(prev => prev.map(r => {
      const rId = r.id || r._id;
      if (rId === editedId) {
        return {
          ...r,
          name: edited.name,
          email: edited.email,
          maxUsers: parseInt(edited.maxUsers, 10),
          commission: parseInt(edited.commission, 10),
          status: edited.status || "active"
        };
      }
      return r;
    }));

    try {
      await API.put(`/resellers/${editedId}`, {
        name: edited.name,
        email: edited.email,
        maxUsers: parseInt(edited.maxUsers, 10),
        commission: parseInt(edited.commission, 10),
        status: edited.status || "active"
      });
      setEditModal({ open: false, reseller: null });
      alert("✏️ Reseller metadata updated successfully!");
    } catch (err) {
      alert("Update failed");
      fetchResellers();
    }
  };

  const handleDeleteReseller = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this reseller partner?")) return;
    try {
      await API.delete(`/resellers/${id}`);
      fetchResellers();
      alert("🗑️ Reseller account permanently deleted");
    } catch (err) {
      alert("Failed to delete reseller");
    }
  };

  const filteredResellers = resellers.filter(r =>
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeResellersCount = resellers.filter(r => r.status === "active").length;
  const totalResellerUsers = resellers.reduce((sum, r) => sum + r.users, 0);
  const outstandingBalance = resellers.reduce((sum, r) => sum + r.balance, 0);

  return (
    <div className="pro-module">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 className="card-title">Reseller Management</h2>
        <button className="pro-btn btn-primary" onClick={() => setAddModal(true)}>
          ➕ Add Reseller
        </button>
      </div>

      {/* Top dashboard widgets */}
      <div className="stats-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
        <div className="stat-card" style={{ borderLeft: "4px solid #8b5cf6" }}>
          <div className="stat-icon" style={{ background: "#f5f3ff", color: "#8b5cf6" }}>👥</div>
          <div className="stat-info">
            <b>{resellers.length}</b>
            <span>Total Resellers</span>
          </div>
        </div>

        <div className="stat-card" style={{ borderLeft: "4px solid #10b981" }}>
          <div className="stat-icon" style={{ background: "#ecfdf5", color: "#10b981" }}>✅</div>
          <div className="stat-info">
            <b>{activeResellersCount}</b>
            <span>Active Partners</span>
          </div>
        </div>

        <div className="stat-card" style={{ borderLeft: "4px solid #06b6d4" }}>
          <div className="stat-icon" style={{ background: "#ecfeff", color: "#06b6d4" }}>👤</div>
          <div className="stat-info">
            <b>{totalResellerUsers}</b>
            <span>Connected Users</span>
          </div>
        </div>

        <div className="stat-card" style={{ borderLeft: "4px solid #f59e0b" }}>
          <div className="stat-icon" style={{ background: "#fffbeb", color: "#f59e0b" }}>💰</div>
          <div className="stat-info">
            <b>${outstandingBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })}</b>
            <span>Reseller Funds</span>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="search-container">
        <span className="search-icon">🔍</span>
        <input
          className="search-input"
          placeholder="Search resellers by name, username or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Reseller Grid/Table */}
      <div className="pro-table-container">
        <table>
          <thead>
            <tr>
              <th>RESELLER NAME</th>
              <th>CREDENTIALS</th>
              <th>CLIENT SLOTS</th>
              <th>COMMISSION RATE</th>
              <th>AVAILABLE BALANCE</th>
              <th>STATUS</th>
              <th>LAST LOGIN</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filteredResellers.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: "center", padding: "40px", color: "var(--text3)" }}>
                  No reseller partners found. Register a new one above!
                </td>
              </tr>
            ) : (
              filteredResellers.map((r) => {
                const percent = Math.round((r.users / r.maxUsers) * 100);
                const rId = r.id || r._id;
                return (
                  <tr key={rId}>
                    <td>
                      <span style={{ fontWeight: "800", color: "var(--text)" }}>{r.name}</span>
                    </td>
                    <td>
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        <span style={{ fontSize: "12px", fontFamily: "monospace", color: "var(--text2)", fontWeight: "600" }}>@{r.username}</span>
                        <span style={{ fontSize: "10px", color: "var(--text3)" }}>{r.email}</span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        <span style={{ fontSize: "11px", fontWeight: "700" }}>
                          {r.users} <span style={{ color: "var(--text3)", fontWeight: "400" }}>/ {r.maxUsers} max</span>
                        </span>
                        {/* Progressive usage bar */}
                        <div style={{ width: "90px", height: "4px", background: "var(--bg3)", borderRadius: "4px", overflow: "hidden" }}>
                          <div style={{ width: `${percent}%`, height: "100%", background: percent > 80 ? "var(--danger)" : "var(--accent)", borderRadius: "4px" }}></div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="pro-badge blue" style={{ background: "#fef3c7", color: "#d97706" }}>
                        {r.commission}% Off Plan
                      </span>
                    </td>
                    <td>
                      <b style={{ color: "var(--accent)", fontSize: "14px" }}>
                        ${r.balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </b>
                    </td>
                    <td>
                      <select
                        className={`pro-badge ${r.status === "active" ? "active" : ""}`}
                        value={r.status}
                        onChange={(e) => handleToggleStatus(rId, e.target.value)}
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
                          appearance: "none"
                        }}
                      >
                        <option value="active" style={{ background: "#fff", color: "#10b981", fontWeight: "800" }}>ONLINE</option>
                        <option value="inactive" style={{ background: "#fff", color: "#6b7280", fontWeight: "800" }}>MUTED</option>
                      </select>
                    </td>
                    <td style={{ fontSize: "11px", color: "var(--text3)" }}>{r.lastLogin}</td>
                    <td>
                      <div style={{ display: "flex" }}>
                        <button
                          className="action-btn edit"
                          style={{ borderColor: "#10b981", color: "#10b981" }}
                          onClick={() => setBalanceModal({ open: true, reseller: r, amount: "", note: "" })}
                          title="Add Funds"
                        >
                          💰 Top-Up
                        </button>
                        <button
                          className="action-btn edit"
                          onClick={() => setEditModal({ open: true, reseller: { ...r } })}
                          title="Edit Profile"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          className="action-btn delete"
                          style={{ borderColor: "#ef4444", color: "#ef4444", background: "transparent", marginLeft: "8px" }}
                          onClick={() => handleDeleteReseller(rId)}
                          title="Delete Reseller"
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal: Add Reseller */}
      {addModal && (
        <div className="pro-modal-overlay" onClick={() => setAddModal(false)}>
          <form className="pro-modal" onClick={e => e.stopPropagation()} onSubmit={handleCreate}>
            <h3 style={{ marginBottom: "20px" }}>➕ Register New Reseller</h3>
            <div style={{ display: "grid", gap: "16px", marginTop: "24px" }}>
              <div className="form-group">
                <label>Company/Name</label>
                <input className="pro-input" placeholder="e.g. Galaxy Streams" value={newName} onChange={e => setNewName(e.target.value)} required />
              </div>
              <div className="pro-form-grid" style={{ gridTemplateColumns: "1fr 1fr", padding: 0, border: "none", boxShadow: "none" }}>
                <div className="form-group">
                  <label>Reseller Username</label>
                  <input className="pro-input" placeholder="galaxy_iptv" value={newUsername} onChange={e => setNewUsername(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>Email Account</label>
                  <input className="pro-input" type="email" placeholder="partner@gmail.com" value={newEmail} onChange={e => setNewEmail(e.target.value)} required />
                </div>
              </div>
              <div className="pro-form-grid" style={{ gridTemplateColumns: "1fr 1fr", padding: 0, border: "none", boxShadow: "none" }}>
                <div className="form-group">
                  <label>Initial Client Slots</label>
                  <input className="pro-input" type="number" min="5" value={newMaxUsers} onChange={e => setNewMaxUsers(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>Commission Rate (%)</label>
                  <input className="pro-input" type="number" min="0" max="99" value={newCommission} onChange={e => setNewCommission(e.target.value)} required />
                </div>
              </div>
              <div className="form-group">
                <label>Initial Top-Up Balance ($)</label>
                <input className="pro-input" type="number" min="0" placeholder="150" value={newBalance} onChange={e => setNewBalance(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Account Status</label>
                <select className="pro-select" value={newStatus} onChange={e => setNewStatus(e.target.value)}>
                  <option value="active">ONLINE (Active)</option>
                  <option value="inactive">MUTED (Blocked)</option>
                </select>
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "32px" }}>
              <button type="button" className="action-btn" onClick={() => setAddModal(false)}>Cancel</button>
              <button type="submit" className="pro-btn btn-primary">Create Partner Profile</button>
            </div>
          </form>
        </div>
      )}

      {/* Modal: Top-up Balance */}
      {balanceModal.open && (
        <div className="pro-modal-overlay" onClick={() => setBalanceModal({ open: false, reseller: null, amount: "", note: "" })}>
          <form className="pro-modal" style={{ maxWidth: "420px" }} onClick={e => e.stopPropagation()} onSubmit={handleAddBalanceSubmit}>
            <h3>💰 Crediting Reseller Fund</h3>
            <p style={{ margin: "12px 0 20px 0", color: "var(--text2)", fontSize: "13px" }}>
              Top-up balance for partner <b>{balanceModal.reseller.name}</b>. Current balance is <b>${balanceModal.reseller.balance.toFixed(2)}</b>.
            </p>
            <div style={{ display: "grid", gap: "16px" }}>
              <div className="form-group">
                <label>Top-Up Amount ($ USD)</label>
                <input
                  className="pro-input"
                  type="number"
                  placeholder="e.g. 250"
                  min="5"
                  value={balanceModal.amount}
                  onChange={(e) => setBalanceModal({ ...balanceModal, amount: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Notes/Reason (Optional)</label>
                <input
                  className="pro-input"
                  placeholder="e.g. Bank transfer topup"
                  value={balanceModal.note}
                  onChange={(e) => setBalanceModal({ ...balanceModal, note: e.target.value })}
                />
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "28px" }}>
              <button type="button" className="action-btn" onClick={() => setBalanceModal({ open: false, reseller: null, amount: "", note: "" })}>Cancel</button>
              <button type="submit" className="pro-btn" style={{ background: "#10b981" }}>Add Balance</button>
            </div>
          </form>
        </div>
      )}

      {/* Modal: Edit Reseller */}
      {editModal.open && (
        <div className="pro-modal-overlay" onClick={() => setEditModal({ open: false, reseller: null })}>
          <form className="pro-modal" onClick={e => e.stopPropagation()} onSubmit={handleEditSave}>
            <h3>✏️ Edit Reseller Partner Details</h3>
            <div style={{ display: "grid", gap: "16px", marginTop: "24px" }}>
              <div className="form-group">
                <label>Company/Name</label>
                <input
                  className="pro-input"
                  value={editModal.reseller.name}
                  onChange={(e) => setEditModal({ ...editModal, reseller: { ...editModal.reseller, name: e.target.value } })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email Account</label>
                <input
                  className="pro-input"
                  type="email"
                  value={editModal.reseller.email}
                  onChange={(e) => setEditModal({ ...editModal, reseller: { ...editModal.reseller, email: e.target.value } })}
                  required
                />
              </div>
              <div className="pro-form-grid" style={{ gridTemplateColumns: "1fr 1fr", padding: 0, border: "none", boxShadow: "none" }}>
                <div className="form-group">
                  <label>Max Client Slots</label>
                  <input
                    className="pro-input"
                    type="number"
                    value={editModal.reseller.maxUsers}
                    onChange={(e) => setEditModal({ ...editModal, reseller: { ...editModal.reseller, maxUsers: e.target.value } })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Commission Rate (%)</label>
                  <input
                    className="pro-input"
                    type="number"
                    value={editModal.reseller.commission}
                    onChange={(e) => setEditModal({ ...editModal, reseller: { ...editModal.reseller, commission: e.target.value } })}
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Account Status</label>
                <select
                  className="pro-select"
                  value={editModal.reseller.status}
                  onChange={(e) => setEditModal({ ...editModal, reseller: { ...editModal.reseller, status: e.target.value } })}
                >
                  <option value="active">ONLINE (Active)</option>
                  <option value="inactive">MUTED (Blocked)</option>
                </select>
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "32px" }}>
              <button type="button" className="action-btn" onClick={() => setEditModal({ open: false, reseller: null })}>Cancel</button>
              <button type="submit" className="pro-btn btn-primary">Save Changes</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
