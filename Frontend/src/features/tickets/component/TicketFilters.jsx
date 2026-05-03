import "../styles/TicketFilters.scss";

const statusOptions = [
  { value: "", label: "All Status" },
  { value: "open", label: "Open" },
  { value: "in_progress", label: "In Progress" },
  { value: "resolved", label: "Resolved" },
  { value: "closed", label: "Closed" },
  { value: "auto_resolved", label: "Auto Resolved" },
];

const priorityOptions = [
  { value: "", label: "All Priority" },
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "critical", label: "Critical" },
];

const TicketFilters = ({ filters, onChange }) => {
  return (
    <div className="ticket-filters">
      <select
        value={filters.status}
        onChange={(e) => onChange({ status: e.target.value })}
        className="ticket-filters__select"
      >
        {statusOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>

      <select
        value={filters.priority}
        onChange={(e) => onChange({ priority: e.target.value })}
        className="ticket-filters__select"
      >
        {priorityOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>

      {(filters.status || filters.priority) && (
        <button
          className="ticket-filters__clear"
          onClick={() => onChange({ status: "", priority: "" })}
        >
          ✕ Clear
        </button>
      )}
    </div>
  );
};

export default TicketFilters;