import "../styles/register.scss";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const Register = () => {
  const navigate = useNavigate();
  const { handleRegister } = useAuth();
  const [form, setForm] = useState({
    businessName: "",
    industry: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const industries = [
    "Technology",
    "Retail",
    "Food & Restaurant",
    "E-commerce",
    "Healthcare",
    "Education",
    "Finance",
    "Travel",
    "Other",
  ];

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await handleRegister(form);
      const role = data.user?.role;
      navigate(role === "business_admin" ? "/admin/dashboard" : "/login");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <form className="register-card" onSubmit={handleSubmit}>
        <h1>Create Business Account</h1>
        <p>Start with the free plan and invite agents later.</p>

        {error && <div className="register-card__error">{error}</div>}

        <label>
          Business Name
          <input
            name="businessName"
            value={form.businessName}
            onChange={handleChange}
            minLength={2}
            maxLength={100}
            required
          />
        </label>

        <label>
          Industry
          <select
            name="industry"
            value={form.industry}
            onChange={handleChange}
            required
          >
            <option value="">Select industry</option>
            {industries.map((industry) => (
              <option key={industry} value={industry}>
                {industry}
              </option>
            ))}
          </select>
        </label>

        <label>
          Email
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Password
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            minLength={8}
            required
          />
        </label>

        <button type="submit" disabled={loading}>
          {loading ? "Creating..." : "Create Account"}
        </button>

        <p className="register-card__switch">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </form>
    </div>
  );
};

export default Register
