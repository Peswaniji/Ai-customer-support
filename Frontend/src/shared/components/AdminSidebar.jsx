import React from "react";
import { useNavigate } from "react-router-dom";

const AdminSidebar = () => {
  const navigate = useNavigate();

  return (
    <div className="sidebar">
      <div className="sidebar__top">
        <div className="profile">
          <div className="profile__img">Admin</div>
          <div className="profile__info">
            <h4>Business Admin</h4>
            <p>Administrator</p>
          </div>
        </div>
      </div>

      <div className="sidebar__menu">
        <ul>
          <li onClick={() => navigate("/admin/dashboard")}>Dashboard</li>
          <li onClick={() => navigate("/admin/agents")}>Agents</li>
          <li onClick={() => navigate("/admin/tickets")}>Tickets</li>
          <li onClick={() => navigate("/admin/analytics")}>Analytics</li>
          <li onClick={() => navigate("/admin/settings")}>Settings</li>
        </ul>
      </div>

      <div className="sidebar__bottom">
        <button>Logout</button>
      </div>
    </div>
  );
};

export default AdminSidebar;
