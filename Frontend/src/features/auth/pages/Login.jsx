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

  const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const response = await handleLogin(form);
    console.log("Response from hook:", response);

    // Postman ke mutabiq yahan se token nikalye
    const token = response.accessToken; 
    const userData = response.user;

    if (token) {
      localStorage.setItem("accessToken", token);
      console.log("Token successfully stored in LocalStorage!");
      
      // Role check ke liye userData use karein
      if (userData?.role === 'agent') {
        navigate("/agent/dashboard");
      } else {
        navigate("/");
      }
    } else {
      console.error("AccessToken missing! Check if hook returns 'res.data'");
    }
  } catch (error) {
    console.error("Login Error:", error);
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