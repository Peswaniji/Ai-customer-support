import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useTickets from "../hooks/useTickets.js";
import useAgents from "../../agent/hooks/useAgents.js";
import { useState } from "react";
import "../styles/TicketDetailPage.scss";

const statusOptions = ["open", "in_progress", "resolved", "closed"];
const priorityOptions = ["low", "medium", "high", "critical"];
const statusConfig = {
  open: { label: "Open", class: "badge-warning" },
  in_progress: { label: "In Progress", class: "badge-info" },
  resolved: { label: "Resolved", class: "badge-online" },
  closed: { label: "Closed", class: "badge-offline" },
  auto_resolved: { label: "Auto Resolved", class: "badge-online" },
};

const formatDate = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "N/A";

const TicketDetailPage = () => {
  const { ticketId } = useParams();
  const navigate = useNavigate();
  const { selectedTicket, loading, getTicketById, changeStatus, changePriority, assign } = useTickets();
  const { agents } = useAgents();

  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [agentId, setAgentId] = useState("");

  useEffect(() => {
    getTicketById(ticketId);
  }, [ticketId]);

  useEffect(() => {
    if (!selectedTicket) return;
    const t = setTimeout(() => {
      setStatus(selectedTicket.status);
      setPriority(selectedTicket.priority);
      setAgentId(selectedTicket.assignedAgentId?._id || "");
    }, 0);
    return () => clearTimeout(t);
  }, [selectedTicket]);

  if (loading || !selectedTicket) return <div className="ticket-detail__loading">Loading ticket...</div>;

  return (
    <div className="ticket-detail">
      <div className="ticket-detail__header">
        <button className="ticket-detail__back" onClick={() => navigate("/admin/tickets")}>
          ← Back to Tickets
        </button>
        <span className={statusConfig[selectedTicket.status]?.class || "badge-offline"}>
          {statusConfig[selectedTicket.status]?.label || selectedTicket.status}
        </span>
      </div>

      <div className="ticket-detail__body">
        <div className="ticket-detail__main">
          <div className="ticket-detail__card">
            <h2 className="ticket-detail__subject">{selectedTicket.subject}</h2>
            <p className="ticket-detail__description">{selectedTicket.description}</p>
            <div className="ticket-detail__meta">
              {[
                ["Customer", selectedTicket.customerId?.name],
                ["Email", selectedTicket.customerId?.email],
                ["Category", selectedTicket.category],
                ["Created", formatDate(selectedTicket.createdAt)],
                selectedTicket.resolvedAt && ["Resolved", formatDate(selectedTicket.resolvedAt)],
                selectedTicket.customerRating && ["Rating", "⭐".repeat(selectedTicket.customerRating)],
              ].filter(Boolean).map(([label, value]) => (
                <div className="ticket-detail__meta-item" key={label}>
                  <span className="ticket-detail__meta-label">{label}</span>
                  <span>{value}</span>
                </div>
              ))}
            </div>
          </div>

          {selectedTicket.aiSummary && (
            <div className="ticket-detail__card ticket-detail__ai-summary">
              <h3>🤖 AI Summary</h3>
              <p>{selectedTicket.aiSummary}</p>
            </div>
          )}
        </div>

        <div className="ticket-detail__sidebar">
          <div className="ticket-detail__action-card">
            <h4>Update Status</h4>
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="ticket-detail__select">
              {statusOptions.map((s) => <option key={s} value={s}>{statusConfig[s]?.label || s}</option>)}
            </select>
            <button className="btn-primary ticket-detail__btn" onClick={() => changeStatus(ticketId, status)}>Update Status</button>
          </div>

          <div className="ticket-detail__action-card">
            <h4>Update Priority</h4>
            <select value={priority} onChange={(e) => setPriority(e.target.value)} className="ticket-detail__select">
              {priorityOptions.map((p) => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
            </select>
            <button className="btn-primary ticket-detail__btn" onClick={() => changePriority(ticketId, priority)}>Update Priority</button>
          </div>

          <div className="ticket-detail__action-card">
            <h4>Assign Agent</h4>
            <select value={agentId} onChange={(e) => setAgentId(e.target.value)} className="ticket-detail__select">
              <option value="">Unassigned</option>
              {agents.map((a) => <option key={a._id} value={a._id}>{a.name}</option>)}
            </select>
            <button className="btn-primary ticket-detail__btn" onClick={() => assign(ticketId, agentId)} disabled={!agentId}>Assign</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketDetailPage;