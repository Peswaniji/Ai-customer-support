import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { setPassword } from "../services/auth.api.js";

const SetPassword = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [password, setPasswordValue] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const token = params.get("token") || "";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await setPassword({ token, password });
      localStorage.setItem("accessToken", data.accessToken);
      navigate("/agent/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to set password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <form className="register-card" onSubmit={handleSubmit}>
        <h1>Set Agent Password</h1>
        <p>Activate your agent account using your invite link.</p>
        {error && <div className="register-card__error">{error}</div>}
        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPasswordValue(e.target.value)}
            minLength={8}
            required
          />
        </label>
        <button type="submit" disabled={loading || !token}>
          {loading ? "Activating..." : "Activate Account"}
        </button>
      </form>
    </div>
  );
};

export default SetPassword;
