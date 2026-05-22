import axios from "axios";

const api = axios.create({ baseURL: "/api" });

export const getExpenses        = (params) => api.get("/expenses", { params });
export const createExpense      = (data)   => api.post("/expenses", data);
export const updateExpense      = (id, data) => api.put(`/expenses/${id}`, data);
export const deleteExpense      = (id)     => api.delete(`/expenses/${id}`);
export const getCategoryTotals  = ()       => api.get("/expenses/summary/by-category");
export const getMonthlyTotals   = ()       => api.get("/expenses/summary/monthly");