import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, LineChart, Line, CartesianGrid, PieChart, Pie, Cell, Legend } from "recharts";
import { getCategoryTotals, getMonthlyTotals, getExpenses } from "../api.js";
import { formatCurrency, getCategoryColor, getCategoryIcon, MONTH_NAMES } from "../constants.js";


export default function Analytics() {
  const [catData, setCatData]     = useState([]);
  const [monthData, setMonthData] = useState([]);
  const [expenses, setExpenses]   = useState([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    Promise.all([getCategoryTotals(), getMonthlyTotals(), getExpenses()])
      .then(([cats, months, exps]) => {
        setCatData(cats.data);
        setMonthData(
          months.data.map((m) => ({
            label: `${MONTH_NAMES[m._id.month - 1]} ${m._id.year}`,
            total: m.total,
            count: m.count,
          }))
        );
        setExpenses(exps.data);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="spinner" />;

  const grandTotal = catData.reduce((s, c) => s + c.total, 0);
  const avgMonthly = monthData.length ? grandTotal / monthData.length : 0;
  const topCat     = catData[0];

  const pieData = catData.map((c) => ({
    name:  c._id,
    value: c.total,
    color: getCategoryColor(c._id),
  }));

  return (
    <>
      <div className="view-header">
        <h2 className="view-title">Analytics</h2>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Total Spent</div>
          <div className="stat-value" style={{ fontSize: "1.2rem", display: "flex", alignItems: "center", gap: 8}}> 
            <img src={getCategoryIcon(topCat._id)} alt={topCat._id} width={28} height={28} style={{ objectFit: "contain" }} />
            {topCat._id}
          </div>
          <div className="stat-sub">across {expenses.length} expenses</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Avg. Monthly</div>
          <div className="stat-value">{formatCurrency(avgMonthly)}</div>
          <div className="stat-sub">over {monthData.length} month{monthData.length !== 1 ? "s" : ""}</div>
        </div>
        {topCat && (
          <div className="stat-card">
            <div className="stat-label">Top Category</div>
            <div className="stat-value" style={{ fontSize: "1.2rem", display: "flex", alignItems: "center", gap: 8}}> 
            <img src={getCategoryIcon(topCat._id)} alt={topCat._id} width={28} height={28} style={{ objectFit: "contain" }} />
            {topCat._id}
            </div>
            <div className="stat-sub">{formatCurrency(topCat.total)} · {topCat.count} expenses</div>
          </div>
        )}
        <div className="stat-card">
          <div className="stat-label">Categories Used</div>
          <div className="stat-value">{catData.length}</div>
          <div className="stat-sub">out of 10 available</div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="card">
          <div className="chart-title">Spending by Category</div>
          {pieData.length === 0 ? <p style={{ color: "var(--text2)" }}>No data yet.</p> : (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={95}
                  dataKey="value" nameKey="name" paddingAngle={2}>
                  {pieData.map((d) => <Cell key={d.name} fill={d.color} />)}
                </Pie>
                <Legend iconType="circle" iconSize={8}
                  formatter={(v) => <span style={{ fontSize: "0.78rem", color: "var(--text2)" }}>{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card">
          <div className="chart-title">Amount by Category</div>
          {catData.length === 0 ? <p style={{ color: "var(--text2)" }}>No data yet.</p> : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={catData} layout="vertical" margin={{ left: 10, right: 20 }}>
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="_id" width={100} tick={{ fontSize: 11, fill: "var(--text2)" }} />
                <Bar dataKey="total" radius={[0, 4, 4, 0]}>
                  {catData.map((c) => <Cell key={c._id} fill={getCategoryColor(c._id)} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="card" style={{ marginBottom: 28 }}>
        <div className="chart-title">Monthly Expenditure Trend</div>
        {monthData.length === 0 ? <p style={{ color: "var(--text2)" }}>No data yet.</p> : (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={monthData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: "var(--text2)" }} />
              <YAxis tick={{ fontSize: 11, fill: "var(--text2)" }} tickFormatter={(v) => `$${v}`} />
              <Line type="monotone" dataKey="total" stroke="var(--accent)"
                strokeWidth={2} dot={{ fill: "var(--accent)", r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="card">
        <div className="chart-title">Category Breakdown</div>
        {catData.length === 0 ? <p style={{ color: "var(--text2)" }}>No data yet.</p> : (
          <div className="cat-list">
            {catData.map((c) => {
              const pct   = grandTotal > 0 ? (c.total / grandTotal) * 100 : 0;
              const color = getCategoryColor(c._id);
              return (
                <div className="cat-row" key={c._id}>
                  <div className="cat-row-header">
                    <div className="cat-row-name">
                      <span style={{ color: "var(--text2)" }}>{c._id}</span>
                      <span style={{ color: "var(--text2)", fontSize: "0.75rem" }}>({c.count})</span>
                    </div>
                    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                      <span style={{ color: "var(--text2)", fontSize: "0.78rem" }}>{pct.toFixed(1)}%</span>
                      <span style={{ fontWeight: 600, color: "var(--text2)" }}>{formatCurrency(c.total)}</span>
                    </div>
                  </div>
                  <div className="cat-bar-bg">
                    <div className="cat-bar-fill" style={{ width: `${pct}%`, background: color }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
