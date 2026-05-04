import React from "react";
import "../styles/agentListPage.scss";

const AgentPlaceholderPage = ({ title, description }) => {
  return (
    <div className="agent-list-page">
      <div className="agent-list-page__header">
        <h2>{title}</h2>
        <p>{description}</p>
      </div>

      <div className="agent-list-page__state">
        This section is not connected to a backend workflow yet.
      </div>
    </div>
  );
};

export default AgentPlaceholderPage;
