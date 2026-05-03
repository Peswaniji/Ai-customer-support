import { useState } from "react";
import useAgents from "../hooks/useAgents.js";
import AgentTable from "../components/AgentTable.jsx";
import InviteAgentModal from "../components/InviteAgentModal.jsx";
import "../styles/AgentsPage.scss";

const AgentsPage = () => {
  const { agents, loading } = useAgents();
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="agents-page">
      <div className="agents-page__header">
        <div>
          <h1 className="page-title">Agents</h1>
          <p className="page-sub">{agents.length} agents in your team</p>
        </div>
        <button
          className="btn-primary"
          onClick={() => setShowModal(true)}
          style={{ borderRadius: "10px", padding: "10px 20px", fontWeight: 600 }}
        >
          + Invite Agent
        </button>
      </div>

      <AgentTable agents={agents} loading={loading} />

      {showModal && (
        <InviteAgentModal onClose={() => setShowModal(false)} />
      )}
    </div>
  );
};

export default AgentsPage;