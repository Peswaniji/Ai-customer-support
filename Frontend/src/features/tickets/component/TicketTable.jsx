import "../styles/TicketTable.scss";

const statusConfig = {
  open: { label: "Open", class: "badge-warning" },
  in_progress: { label: "In Progress", class: "badge-info" },
  resolved: { label: "Resolved", class: "badge-online" },
  closed: { label: "Closed", class: "badge-offline" },
  auto_resolved: { label: "Auto Resolved", class: "badge-online" },
};

const priorityConfig = {
  low: { label: "Low", class: "priority-low" },
  medium: { label: "Medium", class: "priority-medium" },
  high: { label: "High", class: "priority-high" },
  critical: { label: "Critical", class: "priority-critical" },
};

const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const TicketTable = ({ tickets, loading, onRowClick }) => {
  if (loading) {
    return <div className="ticket-table__loading">Loading tickets...</div>;
  }

  if (tickets.length === 0) {
    return (
      <div className="ticket-table__empty">
        <span>🎫</span>
        <p>No tickets found!</p>
      </div>
    );
  }

  return (
    <div className="ticket-table">
      <div className="ticket-table__wrapper">
        <table>
          <thead>
            <tr>
              <th>Subject</th>
              <th>Customer</th>
              <th>Status</th>
              <th>Priority</th>
              <th>Agent</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map((ticket) => (
              <tr
                key={ticket._id}
                onClick={() => onRowClick(ticket._id)}
                className="ticket-table__row"
              >
                <td>
                  <div className="ticket-table__subject">
                    <span>{ticket.subject}</span>
                    <span className="ticket-table__category">
                      {ticket.category}
                    </span>
                  </div>
                </td>
                <td className="ticket-table__customer">
                  {ticket.customerId?.name || "N/A"}
                </td>
                <td>
                  <span
                    className={
                      statusConfig[ticket.status]?.class || "badge-offline"
                    }
                  >
                    {statusConfig[ticket.status]?.label || ticket.status}
                  </span>
                </td>
                <td>
                  <span
                    className={`ticket-table__priority ${
                      priorityConfig[ticket.priority]?.class || ""
                    }`}
                  >
                    {priorityConfig[ticket.priority]?.label || ticket.priority}
                  </span>
                </td>
                <td className="ticket-table__agent">
                  {ticket.assignedAgentId?.name || (
                    <span className="ticket-table__unassigned">
                      Unassigned
                    </span>
                  )}
                </td>
                <td className="ticket-table__date">
                  {formatDate(ticket.createdAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TicketTable;