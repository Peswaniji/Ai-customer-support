import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/login.scss";
import { useAuth } from "../hooks/useAuth";

const Login = () => {
  const {handleLogin} = useAuth()
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");
  setLoading(true);
  try {
    localStorage.removeItem("accessToken");
    const response = await handleLogin(form);

    const token = response.accessToken; 
    const userData = response.user;
    if (token) {
      localStorage.setItem("accessToken", token);

      if (userData?.role === 'agent') {
        navigate("/agent/dashboard");
      } else if (userData?.role === 'super_admin') {
        navigate("/superadmin/dashboard");
      } else if (userData?.role === 'business_admin') {
        navigate("/admin/dashboard");
      } else {
        navigate("/admin/dashboard");
      }
    } else {
      console.error("AccessToken missing! Check if hook returns 'res.data'");
    }
  } catch (error) {
    console.error("Login Error:", error);
    setError(error.response?.data?.message || "Login failed. Please try again.");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="auth">
      <div className="auth-left">
        <h1>Welcome Back 👋</h1>
        <p>Manage your dashboard smoothly</p>
      </div>

      <div className="auth-right">
        <div className="card">
          <h2>Login</h2>
          {error && <div className="card__error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              onChange={handleChange}
            />

            <input
              type="password"
              name="password"
              placeholder="Password"
              onChange={handleChange}
            />

            <button type="submit" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <p className="switch">
            Don't have an account? <Link to="/register">Register</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
