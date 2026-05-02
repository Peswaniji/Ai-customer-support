import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/login.scss";
import { useAuth } from "../hooks/useAuth";

const Login = () => {
    const {handleLogin} = useAuth()
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ email: "", password: "" });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit =async (e) => {
    e.preventDefault();

    if (!form.email || !form.password) {
      alert("Fill all fields");
      return;
    }
    await handleLogin(form)



    navigate("/");
  };

  return (
    <div className="auth">
      <div className="auth-left">
        <h1>Welcome Back 👋</h1>
        <p>Manage your dashboard smoothly</p>
      </div>

      <div className="auth-right">
        <div className="card">
          <h2>{isLogin ? "Login" : "Register"}</h2>

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

            <button type="submit">
              {isLogin ? "Login" : "Register"}
            </button>
          </form>

          <p onClick={() => setIsLogin(!isLogin)} className="switch">
            {isLogin
              ? "Don't have an account? Register"
              : "Already have an account? Login"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;