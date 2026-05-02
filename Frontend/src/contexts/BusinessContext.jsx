import { createContext, useContext, useEffect, useState } from "react";
import { apiClient, handleApiError } from "../api/apiClient";
import { AuthContext } from "./AuthContext";

export const BusinessContext = createContext(null);

export const BusinessProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchBusiness = async () => {
    if (!user?.businessId) return;
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get("/business/me");
      if (response.data.success) {
        setBusiness(response.data.business);
      }
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const updateBusiness = async (payload) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.patch("/business/me", payload);
      if (response.data.success) {
        setBusiness(response.data.business);
        return response.data.business;
      }
      throw new Error(response.data.message || "Unable to update business");
    } catch (err) {
      setError(handleApiError(err));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.businessId) {
      fetchBusiness();
    }
  }, [user?.businessId]);

  return (
    <BusinessContext.Provider
      value={{ business, loading, error, fetchBusiness, updateBusiness }}
    >
      {children}
    </BusinessContext.Provider>
  );
};
