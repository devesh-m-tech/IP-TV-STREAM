import React, { useEffect, useState } from "react";
import API from "../../utils/api";
import "../../index.css";

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [devicesModal, setDevicesModal] = useState({ open: false, devices: [], userId: null, email: "" });

  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newMaxDevices, setNewMaxDevices] = useState(3);

  const [searchTerm, setSearchTerm] = useState("");

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await API.get("/admin/users");
      const data = await Promise.all(res.data.map(async (u) => {
        try {
          const devRes = await API.get(`/admin/users/${u.id}/devices`);
          return { ...u, activeDevices: devRes.data.length };
        } catch { return { ...u, activeDevices: 0 }; }
      }));
      setUsers(data);
    } catch (err) { alert("Failed to fetch users"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, []);

  const filteredUsers = users.filter(u => 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await API.post("/admin/users", { email: newEmail, password: newPassword, maxDevices: parseInt(newMaxDevices, 10) || 3 });
      setNewEmail(""); setNewPassword(""); fetchUsers();
      alert("✅ User created successfully");
    } catch (err) { alert(err?.response?.data?.error || "Error creating user"); }
  };

  const handleUpdateUser = async (id) => {
    const max = prompt("New device limit:", "3");
    const pwd = prompt("New password (blank to keep):", "");
    if (max === null && pwd === null) return;
    try {
      await API.put(`/admin/users/${id}`, { maxDevices: max ? parseInt(max) : undefined, password: pwd || undefined });
      fetchUsers();
    } catch (err) { alert("Update failed"); }
  };

  const handleDeleteUser = async (id, email) => {
    if (!window.confirm(`Delete ${email}?`)) return;
    try { await API.delete(`/admin/users/${id}`); fetchUsers(); }
    catch (err) { alert("Delete failed"); }
  };

  const viewDevices = async (userId, email) => {
    try {
      const res = await API.get(`/admin/users/${userId}/devices`);
      setDevicesModal({ open: true, devices: res.data, userId, email });
    } catch (err) { alert("Error fetching devices"); }
  };

  return (
    <div className="pro-module">
      <h2 className="card-title">User Directory</h2>

      <div className="pro-card">
        <form className="pro-form-grid" onSubmit={handleCreateUser}>
          <div className="form-group">
            <label>Account Email</label>
            <input className="pro-input" type="email" placeholder="user@example.com" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Initial Password</label>
            <input className="pro-input" type="password" placeholder="••••••••" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Device Limit</label>
            <input className="pro-input" type="number" min="1" value={newMaxDevices} onChange={(e) => setNewMaxDevices(e.target.value)} />
          </div>
          <button className="pro-btn" type="submit">Create Account</button>
        </form>
      </div>

      <div className="search-container">
        <span className="search-icon">🔍</span>
        <input 
          className="search-input" 
          placeholder="Search user email..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="pro-table-container">
        <table>
          <thead>
            <tr>
              <th>USER EMAIL</th>
              <th>LIMIT</th>
              <th>ACTIVE DEVICES</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan="4" style={{ textAlign: "center", padding: "40px" }}>Syncing...</td></tr> : 
              filteredUsers.map((u) => (
                <tr key={u.id}>
                  <td style={{ fontWeight: "700" }}>{u.email}</td>
                  <td><span className="pro-badge">{u.maxDevices ?? "-"}</span></td>
                  <td><span className={`pro-badge ${u.activeDevices > 0 ? "active" : ""}`}>{u.activeDevices ?? 0}</span></td>
                  <td>
                    <button className="action-btn edit" onClick={() => handleUpdateUser(u.id)}>Edit</button>
                    <button className="action-btn delete" onClick={() => handleDeleteUser(u.id, u.email)}>Delete</button>
                    <button className="action-btn" onClick={() => viewDevices(u.id, u.email)}>Devices</button>
                  </td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>

      {devicesModal.open && (
        <div className="pro-modal-overlay" onClick={() => setDevicesModal({ ...devicesModal, open: false })}>
          <div className="pro-modal" onClick={e => e.stopPropagation()}>
            <h3 style={{ marginBottom: "20px" }}>Connected Devices</h3>
            <p style={{ marginBottom: "20px", color: "var(--text-muted)" }}>Active devices for <b>{devicesModal.email}</b></p>
            <div className="pro-table-container">
              <table>
                <thead><tr><th>DEVICE ID</th><th>STATUS</th></tr></thead>
                <tbody>
                  {devicesModal.devices.map(d => (
                    <tr key={d.id}>
                      <td style={{ fontSize: "12px", fontFamily: "monospace" }}>{d.device_id}</td>
                      <td><span className="pro-badge active">Online</span></td>
                    </tr>
                  ))}
                  {devicesModal.devices.length === 0 && <tr><td colSpan="2" style={{ textAlign: "center", padding: "20px" }}>No devices active</td></tr>}
                </tbody>
              </table>
            </div>
            <button className="pro-btn" style={{ marginTop: "24px", width: "100%" }} onClick={() => setDevicesModal({ ...devicesModal, open: false })}>Close View</button>
          </div>
        </div>
      )}
    </div>
  );
}
