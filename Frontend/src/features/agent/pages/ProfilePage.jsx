import React from "react";
import { useSelector } from "react-redux";
import "../styles/profilePage.scss";

const ProfilePage = () => {
  const { user } = useSelector((state) => state.auth);

  const details = [
    ["Name", user?.name || "Agent"],
    ["Email", user?.email || "-"],
    ["Role", user?.role || "agent"],
    ["Business ID", user?.businessId || "-"],
    ["Availability", user?.availabilityStatus || "available"],
  ];

  return (
    <div className="profile-page">
      <div className="profile-page__header">
        <div className="profile-page__avatar">
          {(user?.name || "Agent").trim()[0]?.toUpperCase()}
        </div>
        <div>
          <h2>{user?.name || "Agent Profile"}</h2>
          <p>Review your account details and security options.</p>
        </div>
      </div>

      <div className="profile-page__card">
        {details.map(([label, value]) => (
          <div className="profile-page__row" key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </div>

      <div className="profile-page__actions">
        <button type="button" disabled>
          Change Password
        </button>
        <p>Password change endpoint is not available yet.</p>
      </div>
    </div>
  );
};

export default ProfilePage;
