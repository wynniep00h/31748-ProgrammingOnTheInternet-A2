import { useState, useEffect, useCallback } from "react";
import { getExpenses, deleteExpense } from "../api.js";
import { formatCurrency, formatDate, CATEGORIES } from "../constants.js";
import CategoryBadge from "./CategoryBadge.jsx";
import ExpenseForm from "./ExpenseForm.jsx";
import ConfirmDialog from "./ConfirmDialog.jsx";

export default function Logbook({onToast}) {
  const [expenses, setExpenses]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [showForm, setShowForm]         = useState(false);
  const [editTarget, setEditTarget]     = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [filterCat, setFilterCat]       = useState("All");
  const [filterStart, setFilterStart]   = useState("");
  const [filterEnd, setFilterEnd]       = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterCat !== "All") params.category = filterCat;
      if (filterStart) params.startDate = filterStart;
      if (filterEnd)   params.endDate   = filterEnd;
      const { data } = await getExpenses(params);
      setExpenses(data);
    } catch {
      // show empty state
    } finally {
      setLoading(false);
    }
  }, [filterCat, filterStart, filterEnd]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async () => {
    await deleteExpense(deleteTarget._id);
    setDeleteTarget(null);
    load();
    onToast("Expense deleted successfully!");
  };

  const openEdit  = (expense) => { setEditTarget(expense); setShowForm(true); };
  const openAdd   = () => { setEditTarget(null); setShowForm(true); };
  const closeForm = () => { setShowForm(false); setEditTarget(null); };
  const afterSave = () => { closeForm(); 
                            load(); 
                            onToast("Expense saved successfully!");  
   };

  const total = expenses.reduce((s, e) => s + e.amount, 0);

  return (
  <>
    {/* Header row with title and Add button & alltime total */}
    <div className="view-header">
      <h2 className="view-title">Logbook</h2>
    </div>

    {/* Two column layout */}
    <div className="logbook-layout">

      {/* LEFT COLUMN — filters + table */}
      <div className="logbook-main">
        <div className="filter-bar">
          <select value={filterCat} onChange={(e) => setFilterCat(e.target.value)}>
            <option value="All">All Categories</option>
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
          <input type="date" value={filterStart} onChange={(e) => setFilterStart(e.target.value)} title="From date" />
          <input type="date" value={filterEnd}   onChange={(e) => setFilterEnd(e.target.value)}   title="To date" />
          {(filterCat !== "All" || filterStart || filterEnd) && (
            <button className="btn btn-ghost btn-sm" onClick={() => { setFilterCat("All"); setFilterStart(""); setFilterEnd(""); }}>
              Clear filters
            </button>
          )}
          <button className="btn btn-primary" onClick={openAdd}>＋ Add Expense</button>
        </div>

        {loading ? (
          <div className="spinner" />
        ) : expenses.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🧾</div>
            <p>No expenses found.</p>
            <button className="btn btn-primary" onClick={openAdd}>Add your first expense</button>
          </div>
        ) : (
          <div className="expense-table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Description</th>
                  <th>Amount</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((exp) => (
                  <tr key={exp._id}>
                    <td style={{ color: "var(--muted)", whiteSpace: "nowrap" }}>{formatDate(exp.date)}</td>
                    <td style={{ fontWeight: 500 }}>{exp.title}</td>
                    <td><CategoryBadge category={exp.category} /></td>
                    <td style={{ color: "var(--muted)", fontSize: "0.82rem" }}>{exp.description || "—"}</td>
                    <td className="td-amount">{formatCurrency(exp.amount)}</td>
                    <td>
                      <div className="td-actions">
                        <button className="btn btn-ghost btn-sm" onClick={() => openEdit(exp)}>Edit</button>
                        <button className="btn btn-danger btn-sm" onClick={() => setDeleteTarget(exp)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* RIGHT COLUMN — totals */}
      <div className="logbook-sidebar">

      {/* All time total */}
        <div className="card" style={{ marginBottom: 19 }}>
          <div className="stat-label">All-Time Total</div>
          <div className="stat-value">{formatCurrency(total)}</div>
          <div className="stat-sub">{expenses.length} expense{expenses.length !== 1 ? "s" : ""}</div>
        </div>



        {/* Total per category */}
        <div className="card-total">
          <div className="chart-title">By Category</div>
          {CATEGORIES.map((cat) => {
            const catTotal = expenses
              .filter((e) => e.category === cat)
              .reduce((s, e) => s + e.amount, 0);
            if (catTotal === 0) return null;
            return (
              <div key={cat} className="cat-row" style={{ marginBottom: 12 }}>
                <div className="cat-row-header">
                  <div className="cat-row-name">
                    <CategoryBadge category={cat} />
                  </div>
                  <span style={{ fontWeight: 600, fontSize: "0.9rem" }}>
                    {formatCurrency(catTotal)}
                  </span>
                </div>
              </div>
            );
          })}
          {expenses.length === 0 && (
            <p style={{ color: "var(--muted)", fontSize: "0.85rem" }}>No data yet.</p>
          )}
        </div>

      </div>
    </div>

    {showForm && <ExpenseForm expense={editTarget} onSave={afterSave} onClose={closeForm} />}
    {deleteTarget && (
      <ConfirmDialog
        message={<>Are you sure you want to delete <strong>"{deleteTarget.title}"</strong>? This cannot be undone.</>}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    )}
  </>
);
}