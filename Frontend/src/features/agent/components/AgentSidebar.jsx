// Sidebar.jsx
import React from "react";
import "../styles/agentSidebar.scss";

const AgentSidebar  = () => {
  return (
    <div className="sidebar">
      <div className="sidebar__top">
        <div className="profile">
          <div className="profile__img">A</div>
          <div className="profile__info">
            <h4>Agent Name</h4>
            <p>Support Agent</p>
          </div>
        </div>
      </div>

      <div className="sidebar__menu">
        <ul>
          <li className="active">Dashboard</li>
          <li>Active Chats</li>
          <li>My Tickets</li>
          <li>AI Suggestions</li>
          <li>Knowledge</li>
          <li>Reports</li>
          <li>Settings</li>
        </ul>
      </div>

      <div className="sidebar__bottom">
        <button>Logout</button>
      </div>
    </div>
  );
};

export default AgentSidebar;