import { useAuth } from "../hooks/useAuth";
import { useBusiness } from "../hooks/useBusiness";
import { useTickets } from "../hooks/useTickets";

const DashboardPage = () => {
  const { user } = useAuth();
  const { business, loading: businessLoading, error: businessError } = useBusiness();
  const { tickets, loading: ticketsLoading, error: ticketsError } = useTickets();

  return (
    <div className="card dashboard-card">
      <h2>Welcome back, {user?.name}</h2>
      <section className="dashboard-section">
        <h3>Your profile</h3>
        <div className="dashboard-grid">
          <div>
            <strong>Email</strong>
            <p>{user?.email}</p>
          </div>
          <div>
            <strong>Role</strong>
            <p>{user?.role}</p>
          </div>
          <div>
            <strong>Business ID</strong>
            <p>{user?.businessId || "N/A"}</p>
          </div>
        </div>
      </section>

      <section className="dashboard-section">
        <h3>Business details</h3>
        {businessLoading ? (
          <p>Loading business...</p>
        ) : businessError ? (
          <p className="error-text">{businessError}</p>
        ) : business ? (
          <div className="dashboard-grid">
            <div>
              <strong>Name</strong>
              <p>{business.name}</p>
            </div>
            <div>
              <strong>Industry</strong>
              <p>{business.industry || "Not set"}</p>
            </div>
            <div>
              <strong>Created</strong>
              <p>{new Date(business.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        ) : (
          <p>No business data available.</p>
        )}
      </section>

      <section className="dashboard-section">
        <h3>Tickets</h3>
        {ticketsLoading ? (
          <p>Loading tickets...</p>
        ) : ticketsError ? (
          <p className="error-text">{ticketsError}</p>
        ) : tickets?.length ? (
          <div className="ticket-list">
            {tickets.slice(0, 5).map((ticket) => (
              <article key={ticket._id} className="ticket-card">
                <h4>{ticket.subject}</h4>
                <p>{ticket.description}</p>
                <div className="ticket-meta">
                  <span>Status: {ticket.status}</span>
                  <span>Priority: {ticket.priority || "N/A"}</span>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p>No tickets found yet.</p>
        )}
      </section>
    </div>
  );
};

export default DashboardPage;
