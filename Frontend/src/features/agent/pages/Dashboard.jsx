import React from "react";
import { useEffect } from "react";
import "../styles/dashboard.scss";
import useTickets from "../../tickets/hooks/useTickets.js";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
    const navigate = useNavigate()
  const {
    getAssignedTickets,
    getActiveChats,
    getInProgressTickets,
  } = useTickets();

  const { tickets, activeTickets } = useSelector(
    (state) => state.ticket
  );

  useEffect(() => {
    getAssignedTickets();
    getActiveChats();
    getInProgressTickets();
  }, []);

  // 🟢 ADDED LOGIC: 'open' aur 'in_progress' dono tickets ko yahan merge kiya hai
  // Isse "No active chats" wali problem solve ho jayegi kyunki combined list render hogi
  const combinedActiveChats = [
    ...(activeTickets || []),
    ...(tickets?.filter((t) => t.status === "in_progress" && !activeTickets.find(at => at._id === t._id)) || [])
  ];

  function openChat(ticketId) {
    navigate(`/agent/chats/${ticketId}`);
  }

  return (
    <div className="dashboard">
      <h2 className="dashboard__title">Dashboard</h2>

      {/* Cards */}
      <div className="dashboard__cards">
        <div className="card">
          <h4>Assigned Tickets</h4>
          <p>{tickets?.length || 0}</p>
        </div>

        <div className="card">
          <h4>Active Chats</h4>
          {/* Dashboard UI consistency ke liye yahan bhi combined count use kar sakte hain */}
          <p>{combinedActiveChats.length || 0}</p>
        </div>

        <div className="card">
          <h4>In Progress</h4>
          <p>
            {tickets?.filter((t) => t.status === "in_progress")
              ?.length || 0}
          </p>
        </div>

        <div className="card">
          <h4>Resolved Today</h4>
          <p>
            {tickets?.filter((t) => t.status === "resolved")
              ?.length || 0}
          </p>
        </div>
      </div>

      {/* Active Chats Section */}
      <div className="dashboard__section">
        <h3>Active Chats</h3>

        <div className="chatBox">
          {/* 🟢 CHANGE: Ab yahan 'combinedActiveChats' map ho raha hai */}
          {combinedActiveChats.length > 0 ? (
            combinedActiveChats.map((chat) => (
              <div className="chatItem" key={chat._id} onClick={() => openChat(chat._id)}>
                <span>{chat.customerId?.name || "Unknown Customer"}</span>
                <br />
                <small>{chat.subject}</small>
                {/* Status badge dikhane ke liye (optional) */}
                <div className={`status-dot ${chat.status}`}></div>
              </div>
            ))
          ) : (
            <p>No active chats</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;