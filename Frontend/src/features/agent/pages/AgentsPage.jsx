import { useState } from "react";
import useAgents from "../hooks/useAgents.js";
import AgentTable from "../components/AgentTable.jsx";
import InviteAgentModal from "../components/InviteAgentModal.jsx";
import "../styles/AgentsPage.scss";

const AgentsPage = () => {
  const { agents, loading } = useAgents();
  const [showModal, setShowModal] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState(null);

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

      <AgentTable agents={agents} loading={loading} onSelectAgent={setSelectedAgent} />

      {showModal && (
        <InviteAgentModal onClose={() => setShowModal(false)} />
      )}

      {selectedAgent && (
        <div className="agent-detail" onClick={() => setSelectedAgent(null)}>
          <div className="agent-detail__card" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="agent-detail__close"
              onClick={() => setSelectedAgent(null)}
            >
              X
            </button>
            <h2>{selectedAgent.name}</h2>
            <p>{selectedAgent.email}</p>
            <div>
              <span>Status</span>
              <strong>{selectedAgent.isActive ? "Active" : "Inactive"}</strong>
            </div>
            <div>
              <span>Availability</span>
              <strong>{selectedAgent.availabilityStatus || "available"}</strong>
            </div>
            <div>
              <span>Agent ID</span>
              <strong>{selectedAgent._id}</strong>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentsPage;
