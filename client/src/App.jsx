import { useState, useEffect } from "react";
import Logbook from "./components/Logbook.jsx";
import Analytics from "./components/Analytics.jsx";
import AdminPanel from "./components/AdminPanel.jsx";
import Login from "./components/Login.jsx";
import Register from "./components/Register.jsx";
import { logoutUser } from "./api.js";


const NAV = [
  { id: "logbook",   label: "Logbook"},
  { id: "analytics", label: "Analytics" },
];

export default function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });

  const [view, setView]   = useState("logbook");
  const [toast, setToast] = useState("");

  {/*auth screen handlers */}
  const [ authScreen, setAuthScreen ] = useState("login");

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  };

  {/*Logout handler */}
  const handleLogout = async () => {
    try {
      await logoutUser({ userId: user?.id, username: user?.username});
    } catch { }

    {/*clear local storage and reset user state */}
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setView("logbook");
  };

  {/*login callback */}
  const handleLogin = (userData) => {
    setUser(userData);
    setView("logbook");
  };

  {/*navigation items for admin tabs */}
  const NAV = [
    {id: "logbook",   label: "Logbook"},
    {id: "analytics", label: "Analytics"},
    ...(user?.role === "admin" ? [{ id: "admin", label: "Admin Panel"}] : []),
  ];

  {/*if not logged in, show auth screens */}
  if (!user) {
    return authScreen === "login" ? (
      <Login
        onLogin={handleLogin}
        onSwitchToRegister={() => setAuthScreen("register")}
      />
    ) : (
      <Register
        onLogin={handleLogin}
        onSwitchToLogin={() => setAuthScreen("login")}
      />
    );
  }

 {/* MAIN APP LAYOUT once logged in*/}

  return (
    <div className="app-shell">
      <header className="app-header">
        <h1>Spend<span>.</span>BuB</h1>

        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ color: "var(--text2)", fontSize: "1.5rem" }}>
            Welcome, <strong style={{ color: "var(--text2)" }}>{user.username}!</strong>
            {user.role === "admin" && (
              <span style={{
                marginLeft: 8, fontSize: "1.25rem",
                background: "var(--accent)", color: "#ffffff",
                padding: "2px 8px", borderRadius: 4, fontWeight: 700
              }}>
                ADMIN
              </span>
            )}
          </span>
        </div>
      </header>

      <nav className="sidebar">
        {NAV.map((n) => (
          <button
            key={n.id}
            className={`nav-btn ${view === n.id ? "active" : ""}`}
            onClick={() => setView(n.id)}
          >
            <span className="icon">{n.icon}</span>
            {n.label}
          </button>
        ))}

        <button className="nav-btn btn-ghost" onClick={handleLogout}>
        Logout
      </button>
      </nav>

      <main className="main-content">
        {view === "logbook"   && <Logbook   key="logbook"  onToast={showToast} />}
        {view === "analytics" && <Analytics key="analytics" />}
        {view === "admin" && <AdminPanel key="admin" />}
      </main>

      {toast && 
        <div className="toast">
          {toast}
        </div>}
    </div>
  );
}
