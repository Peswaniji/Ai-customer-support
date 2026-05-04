import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { clearAuth } from "../../auth/state/auth.slice.js";
import { logout } from "../../auth/services/auth.api.js";
import "../styles/agentSidebar.scss";

const navItems = [
  { label: "Dashboard", to: "/agent/dashboard" },
  { label: "Active Chats", to: "/agent/active-chats" },
  { label: "My Tickets", to: "/agent/my-tickets" },
  { label: "Reports", to: "/agent/reports" },
  { label: "Profile", to: "/agent/profile" },
];

const getInitial = (name) => name?.trim()?.[0]?.toUpperCase() || "A";

const AgentSidebar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      // Local logout should still happen if the server session is already gone.
    } finally {
      localStorage.removeItem("accessToken");
      dispatch(clearAuth());
      navigate("/login", { replace: true });
    }
  };

  return (
    <div className="sidebar">
      <div className="sidebar__top">
        <div className="profile">
          <div className="profile__img">{getInitial(user?.name)}</div>
          <div className="profile__info">
            <h4>{user?.name || "Agent"}</h4>
            <p>Support Agent</p>
          </div>
        </div>
      </div>

      <nav className="sidebar__menu" aria-label="Agent navigation">
        <ul>
          {navItems.map((item) => (
            <li key={item.to}>
              <NavLink
                className={({ isActive }) =>
                  isActive ? "sidebar__link active" : "sidebar__link"
                }
                to={item.to}
              >
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="sidebar__bottom">
        <button type="button" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </div>
  );
};

export default AgentSidebar;
