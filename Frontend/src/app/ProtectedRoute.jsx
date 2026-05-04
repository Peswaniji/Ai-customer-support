import { Navigate } from "react-router-dom";

const decodeTokenPayload = (token) => {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch {
    return null;
  }
};

const ProtectedRoute = ({ children, roles }) => {
  const token = localStorage.getItem("accessToken");
  if (!token) return <Navigate to="/login" replace />;

  if (roles?.length) {
    const payload = decodeTokenPayload(token);
    if (!payload || !roles.includes(payload.role)) {
      const fallback = payload?.role === "agent" ? "/agent/dashboard" : "/admin/dashboard";
      return <Navigate to={fallback} replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
