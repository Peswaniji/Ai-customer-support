import { createContext, useCallback, useEffect, useMemo, useState } from "react";
import { apiClient, handleApiError } from "../api/apiClient";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("authUser");
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [accessToken, setAccessToken] = useState(null);

  const persistUser = useCallback((nextUser) => {
    setUser(nextUser);
    if (nextUser) {
      localStorage.setItem("authUser", JSON.stringify(nextUser));
    } else {
      localStorage.removeItem("authUser");
    }
  }, []);

  const login = async (credentials) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.post("/auth/login", credentials);
      const data = response.data;
      if (data.success) {
  setAccessToken(data.accessToken);

  localStorage.setItem("accessToken", data.accessToken);

  persistUser(data.user);
  return data.user;
}
      throw new Error(data.message || "Login failed");
    } catch (err) {
      setError(handleApiError(err));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const registerBusiness = async (payload) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.post("/auth/register-business", payload);
      const data = response.data;
      if (data.success) {
  setAccessToken(data.accessToken);

  localStorage.setItem("accessToken", data.accessToken);

  persistUser(data.user);
  return data.user;
}
      throw new Error(data.message || "Registration failed");
    } catch (err) {
      setError(handleApiError(err));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const refreshSession = useCallback(async () => {
    try {
      const response = await apiClient.post("/auth/refresh-token");
      const data = response.data;
      if (data.success) {
        setAccessToken(data.accessToken);
      }
      return data;
    } catch {
      persistUser(null);
      setAccessToken(null);
      return null;
    }
  }, [persistUser]);

  const logout = async () => {
    setLoading(true);
    try {
      await apiClient.post("/auth/logout");
    } catch {
    } finally {
      persistUser(null);
      setAccessToken(null);
      setLoading(false);
    }
  };

  useEffect(() => {
    const initialize = async () => {
      await refreshSession();
      setLoading(false);
    };
    initialize();
  }, [refreshSession]);

  const value = useMemo(
    () => ({
      user,
      accessToken,
      loading,
      error,
      login,
      registerBusiness,
      refreshSession,
      logout,
      setError,
    }),
    [user, accessToken, loading, error, login, registerBusiness, refreshSession, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
