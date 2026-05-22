import { useState, useEffect } from "react";
import Logbook from "./components/Logbook.jsx";
import Analytics from "./components/Analytics.jsx";
import { getExpenses } from "./api.js";
import { formatCurrency } from "./constants.js";

const NAV = [
  { id: "logbook",   label: "Logbook"},
  { id: "analytics", label: "Analytics" },
];

export default function App() {
  const [view, setView]   = useState("logbook");
  const [total, setTotal] = useState(null);
  const [toast, setToast] = useState("");

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  }

  useEffect(() => {
    getExpenses()
      .then(({ data }) => setTotal(data.reduce((s, e) => s + e.amount, 0)))
      .catch(() => {});
  }, [view]);

  return (
    <div className="app-shell">
      <header className="app-header">
        <h1>Spend<span>.</span>BuB</h1>
      </header>

      <nav className="sidebar">
        {NAV.map((n) => (
          <button
            key={n.id}
            className={`nav-btn ${view === n.id ? "active" : ""}`}
            onClick={() => setView(n.id)}
          >
            {n.label}
          </button>
        ))}
      </nav>

      <main className="main-content">
        {view === "logbook"   && <Logbook   key="logbook"  onToast={showToast} />}
        {view === "analytics" && <Analytics key="analytics" />}
      </main>

      {toast && (
        <div className="toast">
          {toast}
        </div>
      )}
    </div>
  );
}
