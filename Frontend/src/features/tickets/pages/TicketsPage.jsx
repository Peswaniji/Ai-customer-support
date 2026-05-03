import { useNavigate } from "react-router-dom";
import useTickets from "../hooks/useTickets.js";
import TicketTable from "../component/TicketTable.jsx";
import TicketFilters from "../component/TicketFilters.jsx";
import "../styles/TicketsPage.scss";

const TicketsPage = () => {
  const navigate = useNavigate();
  const { tickets, loading, total, pages, page, filters, applyFilters, changePage } = useTickets(true);

  return (
    <div className="tickets-page">
      <div className="tickets-page__header">
        <div>
          <h1 className="page-title">Tickets</h1>
          <p className="page-sub">{total} total tickets</p>
        </div>
      </div>

      {/* Quick stats */}
      <div className="tickets-page__quickstats">
        {[
          { label: "All", value: total, filter: "" },
          { label: "Open", value: tickets.filter(t => t.status === "open").length, filter: "open" },
          { label: "In Progress", value: tickets.filter(t => t.status === "in_progress").length, filter: "in_progress" },
          { label: "Resolved", value: tickets.filter(t => t.status === "resolved").length, filter: "resolved" },
        ].map((s) => (
          <button
            key={s.label}
            className={`tickets-page__quickstat ${filters.status === s.filter ? "tickets-page__quickstat--active" : ""}`}
            onClick={() => applyFilters({ status: s.filter })}
          >
            <span className="tickets-page__quickstat-value">{s.value}</span>
            <span className="tickets-page__quickstat-label">{s.label}</span>
          </button>
        ))}
      </div>

      <TicketFilters filters={filters} onChange={applyFilters} />
      <TicketTable tickets={tickets} loading={loading} onRowClick={(id) => navigate(`/admin/tickets/${id}`)} />

      {pages > 1 && (
        <div className="tickets-page__pagination">
          {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              className={`tickets-page__page-btn ${p === page ? "tickets-page__page-btn--active" : ""}`}
              onClick={() => changePage(p)}
            >{p}</button>
          ))}
        </div>
      )}
    </div>
  );
};

export default TicketsPage;