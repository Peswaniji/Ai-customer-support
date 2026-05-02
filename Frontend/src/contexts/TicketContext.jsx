import { createContext, useContext, useEffect, useState } from "react";
import { apiClient, handleApiError } from "../api/apiClient";
import { AuthContext } from "./AuthContext";

export const TicketContext = createContext(null);

export const TicketProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTickets = async (params = {}) => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get("/tickets", { params });
      if (response.data.success) {
        setTickets(response.data.tickets || []);
        return response.data;
      }
      throw new Error(response.data.message || "Unable to load tickets");
    } catch (err) {
      setError(handleApiError(err));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchTickets();
    }
  }, [user]);

  return (
    <TicketContext.Provider value={{ tickets, loading, error, fetchTickets }}>
      {children}
    </TicketContext.Provider>
  );
};
