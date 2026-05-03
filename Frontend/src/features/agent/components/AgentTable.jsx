import useAgents from "../hooks/useAgents.js";
import "../styles/AgentTable.scss";

const AgentTable = ({ agents, loading }) => {
  const { toggleStatus } = useAgents();

  const getInitials = (name) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return <div className="agent-table__loading">Loading agents...</div>;
  }

  if (agents.length === 0) {
    return (
      <div className="agent-table__empty">
        <span>👥</span>
        <p>No agents yet. Invite your first agent!</p>
      </div>
    );
  }

  return (
    <div className="agent-table">
      <div className="agent-table__wrapper">
        <table>
          <thead>
            <tr>
              <th>Agent</th>
              <th>Email</th>
              <th>Status</th>
              <th>Availability</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {agents.map((agent) => (
              <tr key={agent._id}>
                <td>
                    <div className="agent-table__agent">
                        <div className="agent-table__avatar">
                        {getInitials(agent.name)}
                        </div>
                        <span className="agent-table__name">{agent.name}</span>
                    </div>
                </td>
                <td className="agent-table__email">{agent.email}</td>
                <td>
                  <span
                    className={agent.isActive ? "badge-online" : "badge-offline"}
                  >
                    <span className="badge-dot" />
                    {agent.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td>
                  <span
                    className={
                      agent.availabilityStatus === "available"
                        ? "badge-online"
                        : "badge-warning"
                    }
                  >
                    {agent.availabilityStatus === "available"
                      ? "Available"
                      : "Busy"}
                  </span>
                </td>
                <td>
                  <button
                    className={`agent-table__toggle ${
                      agent.isActive
                        ? "agent-table__toggle--deactivate"
                        : "agent-table__toggle--activate"
                    }`}
                    onClick={() => toggleStatus(agent._id, agent.isActive)}
                  >
                    {agent.isActive ? "Deactivate" : "Activate"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AgentTable;