import axios from "axios";

const api = axios.create({ baseURL: "/api" });

//JWT Interceptor
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
    });

    //Response Interceptor for 401 Unauthorized
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            window.location.reload();
        }
        return Promise.reject(error);
    }
);

//AUTH API calls
export const registerUser = (data) => api.post("/auth/register", data);
export const loginUser = (data) => api.post("/auth/login", data);
export const logoutUser = (data) => api.post("/auth/logout", data);
export const getMe = () => api.get("/auth/me");

//EXPENSE API calls
export const getExpenses        = (params) => api.get("/expenses", { params });
export const createExpense      = (data)   => api.post("/expenses", data);
export const updateExpense      = (id, data) => api.put(`/expenses/${id}`, data);
export const deleteExpense      = (id)     => api.delete(`/expenses/${id}`);
export const getCategoryTotals  = ()       => api.get("/expenses/summary/by-category");
export const getMonthlyTotals   = ()       => api.get("/expenses/summary/monthly");

//ADMIN API calls
export const getAdminUsers = () => api.get("/admin/users");
export const getAdminActivities = (params) => api.get("/admin/activity", { params });
export const getAdminUser = (id) => api.get('/admin/users/${id}');
export const deleteAdminUser = (id) => api.delete(`/admin/users/${id}`);
export const updateUserRole = (id, role) => api.put(`/admin/users/${id}/role`, { role });