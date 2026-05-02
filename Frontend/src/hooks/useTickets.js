import { useContext } from "react";
import { TicketContext } from "../contexts/TicketContext";

export const useTickets = () => {
  const context = useContext(TicketContext);
  if (!context) {
    throw new Error("useTickets must be used inside a TicketProvider");
  }
  return context;
};
