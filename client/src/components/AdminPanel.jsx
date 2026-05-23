import { useState, useEffect } from "react";
import { getAdminUsers, getAdminActivity, deleteAdminUser, updateUserRole } from "../api.js";
import { formatDate } from "../constants.js";
import ConfirmDialog from "./ConfirmDialog.jsx";

const ACTION_LABELS = {
  register:       "Registered",
  login:          "Logged in",
  logout:         "Logged out",
  create_expense: "Added expense",
  update_expense: "Edited expense",
  delete_expense: "Deleted expense",
};

export default function AdminPanel() {
  const [tab, setTab]           = useState("users");
  const [users, setUsers]       = useState([]);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    loadData();
  }, [tab]);

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      if (tab === "users") {
        const { data } = await getAdminUsers();
        setUsers(data);
      } else {
        const { data } = await getAdminActivity({ limit: 100 });
        setActivity(data);
      }
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load data.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    try {
      await deleteAdminUser(deleteTarget._id);
      setUsers((prev) => prev.filter((u) => u._id !== deleteTarget._id));
      setDeleteTarget(null);
    } catch (err) {
      alert(err.response?.data?.error || "Failed to delete user.");
      setDeleteTarget(null);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await updateUserRole(userId, newRole);
      setUsers((prev) =>
        prev.map((u) => u._id === userId ? { ...u, role: newRole } : u)
      );
    } catch (err) {
      alert(err.response?.data?.error || "Failed to update role.");
    }
  };

  return (
    <>
      <div className="view-header">
        <h2 className="view-title">Admin Panel</h2>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            className={`btn ${tab === "users" ? "btn-primary" : "btn-ghost"}`}
            onClick={() => setTab("users")}
          >
            Users ({users.length})
          </button>
          <button
            className={`btn ${tab === "activity" ? "btn-primary" : "btn-ghost"}`}
            onClick={() => setTab("activity")}
          >
            Activity Log
          </button>
        </div>
      </div>

      {error && <div className="form-error">{error}</div>}

      {loading ? (
        <div className="spinner" />
      ) : tab === "users" ? (

        //Users Table
        <div className="expense-table-wrap">
          <table>
            <thead>
              <tr>
                <th>Username</th>
                <th>Email</th>
                <th>Role</th>
                <th>Expenses</th>
                <th>Last Activity</th>
                <th>Joined</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id}>
                  <td style={{ fontWeight: 600 }}>{user.username}</td>
                  <td style={{ color: "var(--muted)", fontSize: "0.85rem" }}>{user.email}</td>
                  <td>
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user._id, e.target.value)}
                      style={{
                        background: user.role === "admin" ? "var(--accent)" : "var(--surface2)",
                        color: user.role === "admin" ? "#0f0f11" : "var(--text)",
                        border: "none",
                        borderRadius: 6,
                        padding: "4px 8px",
                        fontSize: "0.8rem",
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td style={{ textAlign: "center" }}>{user.expenseCount}</td>
                  <td style={{ color: "var(--muted)", fontSize: "0.82rem" }}>
                    {user.lastAction ? (
                      <>
                        {ACTION_LABELS[user.lastAction] || user.lastAction}
                        <br />
                        <span style={{ fontSize: "0.75rem" }}>
                          {user.lastActivity ? formatDate(user.lastActivity) : ""}
                        </span>
                      </>
                    ) : "No activity"}
                  </td>
                  <td style={{ color: "var(--muted)", fontSize: "0.82rem" }}>
                    {formatDate(user.createdAt)}
                  </td>
                  <td>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => setDeleteTarget(user)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">👥</div>
              <p>No users found.</p>
            </div>
          )}
        </div>

      ) : (

        //Activity Log
        <div className="expense-table-wrap">
          <table>
            <thead>
              <tr>
                <th>User</th>
                <th>Action</th>
                <th>Details</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {activity.map((log) => (
                <tr key={log._id}>
                  <td style={{ fontWeight: 600 }}>
                    {log.user?.username || log.username}
                    {log.user?.role === "admin" && (
                      <span style={{
                        marginLeft: 6, fontSize: "0.7rem",
                        background: "var(--accent)", color: "#0f0f11",
                        padding: "1px 6px", borderRadius: 4, fontWeight: 700
                      }}>
                        admin
                      </span>
                    )}
                  </td>
                  <td>{ACTION_LABELS[log.action] || log.action}</td>
                  <td style={{ color: "var(--muted)", fontSize: "0.82rem" }}>
                    {log.details || "—"}
                  </td>
                  <td style={{ color: "var(--muted)", fontSize: "0.82rem", whiteSpace: "nowrap" }}>
                    {new Date(log.createdAt).toLocaleString("en-AU")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {activity.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">📋</div>
              <p>No activity logged yet.</p>
            </div>
          )}
        </div>
      )}

      {deleteTarget && (
        <ConfirmDialog
          message={
            <>Are you sure you want to delete user{" "}
            <strong>"{deleteTarget.username}"</strong> and all their expenses? This cannot be undone!
            </>
          }
          onConfirm={handleDeleteUser}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </>
  );
}