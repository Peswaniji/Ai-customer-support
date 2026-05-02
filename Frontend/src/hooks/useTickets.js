import { useAppDispatch, useAppSelector } from "../store/hooks";
import { fetchTickets } from "../store/ticketSlice";

export const useTickets = () => {
  const dispatch = useAppDispatch();
  const ticketState = useAppSelector((state) => state.tickets);

  const loadTickets = async (params = {}) => dispatch(fetchTickets(params)).unwrap();

  return {
    ...ticketState,
    fetchTickets: loadTickets,
  };
};
