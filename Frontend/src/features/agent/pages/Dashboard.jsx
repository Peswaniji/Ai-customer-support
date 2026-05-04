import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import useTickets from "../../tickets/hooks/useTickets.js";
import "../styles/dashboard.scss";

const Dashboard = () => {
  const navigate = useNavigate();
  const { getAssignedTickets, getActiveChats, getInProgressTickets } =
    useTickets();

  const { tickets, activeTickets } = useSelector((state) => state.ticket);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    getAssignedTickets();
    getActiveChats();
    getInProgressTickets();
  }, []);

  const combinedActiveChats = [
    ...(activeTickets || []),
    ...(tickets?.filter(
      (ticket) =>
        ticket.status === "in_progress" &&
        !activeTickets.find((activeTicket) => activeTicket._id === ticket._id)
    ) || []),
  ];

  function openChat(ticketId) {
    navigate(`/agent/chats/${ticketId}`);
  }

  return (
    <div className="dashboard">
      <div className="dashboard__hero">
        <div>
          <h2 className="dashboard__title">Dashboard</h2>
          <p>Welcome back, {user?.name || "Agent"}</p>
        </div>
      </div>

      <div className="dashboard__cards">
        <div className="card">
          <h4>Assigned Tickets</h4>
          <p>{tickets?.length || 0}</p>
        </div>

        <div className="card">
          <h4>Active Chats</h4>
          <p>{combinedActiveChats.length || 0}</p>
        </div>

        <div className="card">
          <h4>In Progress</h4>
          <p>{tickets?.filter((t) => t.status === "in_progress")?.length || 0}</p>
        </div>

        <div className="card">
          <h4>Resolved Today</h4>
          <p>{tickets?.filter((t) => t.status === "resolved")?.length || 0}</p>
        </div>
      </div>

      <section className="dashboard__section">
        <h3>Active Chats</h3>

        <div className="chatBox">
          {combinedActiveChats.length > 0 ? (
            combinedActiveChats.map((chat) => (
              <button
                className="chatItem"
                key={chat._id}
                type="button"
                onClick={() => openChat(chat._id)}
              >
                <span className="chatItem__customer">
                  {chat.customerId?.name || "Unknown Customer"}
                </span>
                <span className="chatItem__subject">{chat.subject}</span>
                <span className="chatItem__meta">{chat.status}</span>
                <span className={`status-dot ${chat.status}`} />
              </button>
            ))
          ) : (
            <p className="chatBox__empty">No active chats</p>
          )}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
