import React, { useEffect, useState } from "react";
import API from "../../utils/api";
import "../../index.css";

export default function LanguageManagement() {
  const [languages, setLanguages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [editModal, setEditModal] = useState({ open: false, language: null });
  const [deleteModal, setDeleteModal] = useState({ open: false, language: null });

  const fetchLanguages = async () => {
    setLoading(true);
    try {
      const res = await API.get("/languages");
      setLanguages(res.data);
    } catch (err) {
      alert("Failed to load languages");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLanguages();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      await API.post("/languages", { name });
      setName("");
      fetchLanguages();
      alert("✅ Language added successfully");
    } catch (err) {
      alert(err.response?.data?.error || "Failed to add language");
    }
  };

  const handleEditSave = async () => {
    const lang = editModal.language;
    try {
      await API.put(`/languages/${lang.id}`, { name: lang.name });
      fetchLanguages();
      setEditModal({ open: false, language: null });
      alert("✅ Language updated successfully");
    } catch (err) {
      alert(err.response?.data?.error || "Update failed");
    }
  };

  const handleDelete = async () => {
    const lang = deleteModal.language;
    try {
      await API.delete(`/languages/${lang.id}`);
      fetchLanguages();
      setDeleteModal({ open: false, language: null });
      alert("✅ Language deleted successfully");
    } catch (err) {
      alert(err.response?.data?.error || "Delete failed");
    }
  };

  const filteredLanguages = languages.filter((l) =>
    l.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="pro-module">
      <h2 className="card-title">Manage Languages</h2>

      {/* Creation form */}
      <div className="pro-card">
        <form className="pro-form-grid" onSubmit={handleCreate} style={{ display: "flex", gap: "16px", alignItems: "flex-end" }}>
          <div className="form-group" style={{ flex: 1 }}>
            <label>Language Name</label>
            <input
              className="pro-input"
              placeholder="e.g. Tamil, Telugu, Malayalam"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <button className="pro-btn btn-primary" type="submit" style={{ height: "42px" }}>
            Add Language
          </button>
        </form>
      </div>

      {/* Search box */}
      <div className="search-container">
        <span className="search-icon">🔍</span>
        <input
          className="search-input"
          placeholder="Search language..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Table grid */}
      <div className="pro-table-container">
        <table>
          <thead>
            <tr>
              <th>LANGUAGE NAME</th>
              <th>CREATED DATE</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="3" style={{ textAlign: "center", padding: "40px" }}>
                  Loading languages...
                </td>
              </tr>
            ) : filteredLanguages.length === 0 ? (
              <tr>
                <td colSpan="3" style={{ textAlign: "center", padding: "40px" }}>
                  No languages found. Add one above!
                </td>
              </tr>
            ) : (
              filteredLanguages.map((lang) => (
                <tr key={lang.id}>
                  <td>
                    <span style={{ fontWeight: "700", fontSize: "15px", color: "var(--text)" }}>
                      {lang.name}
                    </span>
                  </td>
                  <td>
                    <span style={{ color: "var(--text3)", fontSize: "13px" }}>
                      {new Date(lang.createdAt).toLocaleDateString()}
                    </span>
                  </td>
                  <td>
                    <button
                      className="action-btn edit"
                      onClick={() => setEditModal({ open: true, language: { ...lang } })}
                    >
                      Edit
                    </button>
                    <button
                      className="action-btn delete"
                      onClick={() => setDeleteModal({ open: true, language: lang })}
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
        <div className="pro-modal-overlay" onClick={() => setEditModal({ open: false, language: null })}>
          <form
            className="pro-modal"
            onClick={(e) => e.stopPropagation()}
            onSubmit={(e) => {
              e.preventDefault();
              handleEditSave();
            }}
          >
            <h3 style={{ marginBottom: "20px" }}>Edit Language Name</h3>
            <div style={{ display: "grid", gap: "20px", marginTop: "24px" }}>
              <div className="form-group">
                <label>Language Name</label>
                <input
                  className="pro-input"
                  value={editModal.language.name}
                  onChange={(e) =>
                    setEditModal({
                      ...editModal,
                      language: { ...editModal.language, name: e.target.value },
                    })
                  }
                  required
                />
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "32px" }}>
              <button
                type="button"
                className="action-btn"
                onClick={() => setEditModal({ open: false, language: null })}
              >
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
        <div className="pro-modal-overlay" onClick={() => setDeleteModal({ open: false, language: null })}>
          <div
            className="pro-modal"
            style={{ maxWidth: "400px", textAlign: "center" }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ color: "var(--danger)" }}>Confirm Deletion</h3>
            <p style={{ margin: "20px 0", color: "var(--text2)" }}>
              Are you sure you want to delete language <b>{deleteModal.language.name}</b>?
            </p>
            <div style={{ display: "flex", justifyContent: "center", gap: "12px" }}>
              <button
                className="action-btn"
                onClick={() => setDeleteModal({ open: false, language: null })}
              >
                Cancel
              </button>
              <button
                className="pro-btn"
                style={{ background: "var(--danger)" }}
                onClick={handleDelete}
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
