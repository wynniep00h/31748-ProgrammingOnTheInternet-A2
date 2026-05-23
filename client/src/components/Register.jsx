import { useState } from "react";
import { registerUser } from "../api.js";

export default function Register({ onLogin, onSwitchToLogin }) {
  const [form, setForm]       = useState({ username: "", email: "", password: "", confirm: "" });
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);

  const set = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.username || !form.email || !form.password || !form.confirm) {
      return setError("All fields are required.");
    }
    if (form.password !== form.confirm) {
      return setError("Passwords do not match.");
    }
    if (form.password.length < 6) {
      return setError("Password must be at least 6 characters.");
    }

    setLoading(true);
    try {
      const { data } = await registerUser({
        username: form.username,
        email:    form.email,
        password: form.password,
      });

      // Store token and user info in localStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      onLogin(data.user);

    } catch (err) {
      setError(err.response?.data?.error || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">

        <div className="auth-header">
          <h1 className="auth-logo">Spend<span>.</span>BuB</h1>
          <p className="auth-subtitle">Create your account</p>
        </div>

        {error && <div className="form-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: 16 }}>
            <label htmlFor="reg-username">Username</label>
            <input
              id="reg-username"
              name="reg-username"
              type="text"
              placeholder="Choose a username"
              value={form.username}
              onChange={set("username")}
              autoFocus
            />
          </div>

          <div className="form-group" style={{ marginBottom: 16 }}>
            <label htmlFor="reg-email">Email</label>
            <input
              id="reg-email"
              name="reg-email"
              type="email"
              placeholder="Enter your email"
              value={form.email}
              onChange={set("email")}
            />
          </div>

          <div className="form-group" style={{ marginBottom: 16 }}>
            <label htmlFor="reg-password">Password</label>
            <input
              id="reg-password"
              name="reg-password"
              type="password"
              placeholder="At least 6 characters"
              value={form.password}
              onChange={set("password")}
            />
          </div>

          <div className="form-group" style={{ marginBottom: 24 }}>
            <label htmlFor="reg-confirm">Confirm Password</label>
            <input
              id="reg-confirm"
              name="reg-confirm"
              type="password"
              placeholder="Repeat your password"
              value={form.confirm}
              onChange={set("confirm")}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: "100%", justifyContent: "center", padding: "12px" }}
            disabled={loading}
          >
            {loading ? "Creating account…" : "Create Account"}
          </button>
        </form>

        <div className="auth-switch">
          Already have an account?{" "}
          <button className="auth-link" onClick={onSwitchToLogin}>
            Sign in here
          </button>
        </div>

      </div>
    </div>
  );
}