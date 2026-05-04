import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import useTickets from "../../tickets/hooks/useTickets.js";
import "../styles/agentListPage.scss";

const ActiveChatsPage = () => {
  const navigate = useNavigate();
  const { getActiveChats, getInProgressTickets } = useTickets();
  const { activeTickets, inProgressTickets, loading, error } = useSelector(
    (state) => state.ticket
  );

  useEffect(() => {
    getActiveChats();
    getInProgressTickets();
  }, []);

  const chats = [
    ...(activeTickets || []),
    ...(inProgressTickets?.filter(
      (ticket) =>
        !activeTickets?.some((activeTicket) => activeTicket._id === ticket._id)
    ) || []),
  ];

  return (
    <div className="agent-list-page">
      <div className="agent-list-page__header">
        <h2>Active Chats</h2>
        <p>Open and in-progress conversations assigned to your workspace.</p>
      </div>

      {loading ? (
        <div className="agent-list-page__state">Loading active chats...</div>
      ) : error ? (
        <div className="agent-list-page__state error">Error: {error}</div>
      ) : (
        <div className="agent-list-page__scroll">
          {chats.length > 0 ? (
            chats.map((ticket) => (
              <button
                className="agent-list-page__row"
                key={ticket._id}
                type="button"
                onClick={() => navigate(`/agent/chats/${ticket._id}`)}
              >
                <span>{ticket.customerId?.name || "Unknown Customer"}</span>
                <span>{ticket.subject}</span>
                <span className={`agent-list-page__badge ${ticket.status}`}>
                  {ticket.status}
                </span>
              </button>
            ))
          ) : (
            <div className="agent-list-page__state">No active chats found.</div>
          )}
        </div>
      )}
    </div>
  );
};

export default ActiveChatsPage;
