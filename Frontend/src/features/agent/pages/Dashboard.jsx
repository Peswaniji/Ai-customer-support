import React from "react";
import "../styles/dashboard.scss";

const Dashboard = () => {
  return (
    <div className="dashboard">

      <h1 className="dashboard__title">Dashboard</h1>

      {/* Stats */}
      <div className="dashboard__cards">

        <div className="card">
          <h2>24</h2>
          <p>Assigned Tickets</p>
        </div>

        <div className="card">
          <h2>12</h2>
          <p>Active Chats</p>
        </div>

        <div className="card">
          <h2>8</h2>
          <p>In Progress</p>
        </div>

        <div className="card">
          <h2>15</h2>
          <p>Resolved Tickets</p>
        </div>

      </div>

      {/* Recent Tickets */}
      <div className="dashboard__recent">

        <h2>Recent Tickets</h2>

        <div className="ticket">
          <p>Login issue not working</p>
          <span>Open</span>
        </div>

        <div className="ticket">
          <p>Payment failed error</p>
          <span>In Progress</span>
        </div>

        <div className="ticket">
          <p>Dashboard slow loading</p>
          <span>Resolved</span>
        </div>

      </div>

    </div>
  );
};

export default Dashboard;