import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const RegisterPage = () => {
  const { registerBusiness, loading, error } = useAuth();
  const [businessName, setBusinessName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [industry, setIndustry] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await registerBusiness({ businessName, email, password, industry });
      navigate("/dashboard");
    } catch {
      // error displayed in context
    }
  };

  return (
    <div className="card">
      <h2>Register Business</h2>
      <form onSubmit={handleSubmit} className="form-grid">
        <label>
          Business name
          <input value={businessName} onChange={(e) => setBusinessName(e.target.value)} required />
        </label>
        <label>
          Business email
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
        </label>
        <label>
          Password
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />
        </label>
        <label>
          Industry
          <input value={industry} onChange={(e) => setIndustry(e.target.value)} required />
        </label>
        {error ? <div className="form-error">{error}</div> : null}
        <button className="button button-primary" type="submit" disabled={loading}>
          {loading ? "Creating account..." : "Register"}
        </button>
      </form>
      <p className="form-footer">
        Already registered? <Link to="/login">Login</Link>
      </p>
    </div>
  );
};

export default RegisterPage;
