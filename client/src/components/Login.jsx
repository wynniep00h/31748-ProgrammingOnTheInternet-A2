import { useState } from "react";
import { loginUser } from "../api.js";

export default function Login({ onLogin, onSwitchToRegister }) {
    const [form, setForm] = useState({ username: "", password: "" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const set = (field) => (e) =>
        setForm((f) => ({ ...f, [field]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!form.usernam || !form.password) {
            return setError("Please enter your username and password.");
        }

        setLoading(true);
        try {
            const { data } = await loginUser(form);

            //store token and user info in localStorage
            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));

            onLogin(data.user);

        } catch (err) {
            setError(err.response?.data?.error || "Login failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

   return (
    <div className="auth-page">
      <div className="auth-card">

        <div className="auth-header">
          <h1 className="auth-logo">Spend<span>.</span>BuB</h1>
          <p className="auth-subtitle">Sign in to track your expenses</p>
        </div>

        {error && <div className="form-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: 16 }}>
            <label htmlFor="login-username">Username</label>
            <input
              id="login-username"
              name="login-username"
              type="text"
              placeholder="Enter your username"
              value={form.username}
              onChange={set("username")}
              autoFocus
            />
          </div>

          <div className="form-group" style={{ marginBottom: 24 }}>
            <label htmlFor="login-password">Password</label>
            <input
              id="login-password"
              name="login-password"
              type="password"
              placeholder="Enter your password"
              value={form.password}
              onChange={set("password")}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: "100%", justifyContent: "center", padding: "12px" }}
            disabled={loading}
          >
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>

        <div className="auth-switch">
          Don't have an account?{" "}
          <button className="auth-link" onClick={onSwitchToRegister}>
            Register here
          </button>
        </div>

      </div>
    </div>
  );
}