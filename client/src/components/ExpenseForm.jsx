import { useState, useEffect } from "react";
import { createExpense, updateExpense } from "../api.js";
import { CATEGORIES } from "../constants.js";

const EMPTY = {
  title: "",
  category: "Food & Dining",
  amount: "",
  date: new Date().toISOString().split("T")[0],
  description: "",
};

export default function ExpenseForm({ expense, onSave, onClose }) {
  const [form, setForm]     = useState(EMPTY);
  const [error, setError]   = useState("");
  const [saving, setSaving] = useState(false);
  const isEdit = Boolean(expense);

  useEffect(() => {
    if (expense) {
      setForm({
        title:       expense.title,
        category:    expense.category,
        amount:      expense.amount,
        date:        expense.date.split("T")[0],
        description: expense.description || "",
      });
    }
  }, [expense]);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async () => {
    setError("");
    if (!form.title.trim())  return setError("Title is required.");
    if (!form.amount || isNaN(form.amount) || Number(form.amount) <= 0)
        return setError("Please enter a valid positive amount.");
    if (!form.date)   return setError("Date is required.");

    setSaving(true);
    try {
      const payload = { ...form, amount: parseFloat(form.amount) };
      if (isEdit) await updateExpense(expense._id, payload);
      else        await createExpense(payload);
      onSave();
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title" style={{ color: "var(--text2)" }}>{isEdit ? "Edit Expense" : "Add Expense"}</h2>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
        </div>

        {error && <div className="form-error">{error}</div>}

        <div className="form-grid">
          <div className="form-group full">
            <label>Title</label>
            <input
              type="text"
              placeholder="e.g. Grocery run"
              value={form.title}
              onChange={set("title")}
              autoFocus
            />
          </div>

          <div className="form-group">
            <label>Category</label>
            <select value={form.category} onChange={set("category")}>
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label> $ Amount (AUD)</label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              placeholder="0.00"
              value={form.amount}
              onChange={set("amount")}
            />
          </div>

          <div className="form-group">
            <label>Date</label>
            <input type="date" value={form.date} onChange={set("date")} />
          </div>

          <div className="form-group full">
            <label>Description (optional)</label>
            <textarea
              placeholder="e.g. where and why"
              value={form.description}
              onChange={set("description")}
            />
          </div>
        </div>

        <div className="form-actions">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={saving}>
            {saving ? "Saving…" : isEdit ? "Save Changes" : "Add Expense"}
          </button>
        </div>
      </div>
    </div>
  );
}