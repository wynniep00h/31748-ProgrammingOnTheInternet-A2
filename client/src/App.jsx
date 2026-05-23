import { useState, useEffect } from "react";
import Logbook from "./components/Logbook.jsx";
import Analytics from "./components/Analytics.jsx";
import AdminPanel from "./components/AdminPanel.jsx";
import Login from "./components/Login.jsx";
import Register from "./components/Register.jsx";
import { logoutUser } from "./api.js";

{/* import { getExpenses } from "./api.js";
 import { formatCurrency } from "./constants.js"; */}

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
    {id: "logbook",   label: "Logbook", icon: "📒"},
    {id: "analytics", label: "Analytics", icon: "📊"},
    ...(user?.role === "admin" ? [{ id: "admin", label: "Admin Panel", icon: "⚙️" }] : []), //add icons
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

  {/* useEffect(() => {
  //   getExpenses()
  //     .then(({ data }) => setTotal(data.reduce((s, e) => s + e.amount, 0)))
  //     .catch(() => {});
  // }, [view]); */}

 {/* MAIN APP LAYOUT once3 logged in*/}

  return (
    <div className="app-shell">
      <header className="app-header">
        <h1>Spend<span>.</span>BuB</h1>

        //user info and logout
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ color: "var(--muted)", fontSize: "0.85rem" }}>
            Welcome, <strong style={{ color: "var(--text)" }}>{user.username}</strong>
            {user.role === "admin" && (
              <span style={{
                marginLeft: 8, fontSize: "0.7rem",
                background: "var(--accent)", color: "#0f0f11",
                padding: "2px 8px", borderRadius: 4, fontWeight: 700
              }}>
                ADMIN
              </span>
            )}
          </span>
          <button className="btn btn-ghost btn-sm" onClick={handleLogout}>
            Logout
          </button>
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
