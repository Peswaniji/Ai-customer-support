import { useEffect, useMemo } from "react";
import { useAuth } from "../hooks/useAuth";
import { useBusiness } from "../hooks/useBusiness";
import { useTickets } from "../hooks/useTickets";

const DashboardPage = () => {
  const { user } = useAuth();
  const { business, loading: businessLoading, error: businessError, fetchBusiness } = useBusiness();
  const { tickets, loading: ticketsLoading, error: ticketsError, fetchTickets } = useTickets();

  useEffect(() => {
    if (user) {
      fetchBusiness().catch(() => {});
      fetchTickets().catch(() => {});
    }
  }, [user, fetchBusiness, fetchTickets]);

  const stats = useMemo(() => {
    const total = tickets?.length || 0;
    const resolved = tickets?.filter((t) => ["resolved", "auto_resolved", "closed"].includes(t.status)).length || 0;
    const inProgress = tickets?.filter((t) => t.status === "in_progress").length || 0;
    const open = tickets?.filter((t) => t.status === "open").length || 0;
    const priorityHigh = tickets?.filter((t) => ["high", "critical"].includes(t.priority)).length || 0;

    return { total, resolved, inProgress, open, priorityHigh };
  }, [tickets]);

  const overviewCards = [
    {
      title: "Tickets handled",
      value: stats.resolved,
      description: "This month",
      accent: "#f97316",
    },
    {
      title: "Open requests",
      value: stats.open,
      description: "Awaiting agent",
      accent: "#10b981",
    },
    {
      title: "In progress",
      value: stats.inProgress,
      description: "Active conversations",
      accent: "#3b82f6",
    },
    {
      title: "High priority",
      value: stats.priorityHigh,
      description: "Urgent tickets",
      accent: "#ef4444",
    },
  ];

  const lineChartPoints = [32, 50, 45, 60, 72, 65, 84];
  const barChartValues = [18, 24, 27, 20, 30, 22, 28];
  const weekLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <div className="dashboard-page">
      <section className="dashboard-hero card">
        <div>
          <p className="eyebrow">Welcome back</p>
          <h2>{user?.name || "Customer Support"}</h2>
          <p className="hero-copy">Here’s your customer support overview for the week. Track ticket flow, business health, and upcoming tasks in one place.</p>
        </div>
        <div className="hero-summary">
          <div>
            <span>Total customers</span>
            <strong>{business?.customerCount || 0}</strong>
          </div>
          <div>
            <span>Business</span>
            <strong>{business?.name || "No business"}</strong>
          </div>
        </div>
      </section>

      <section className="dashboard-cards">
        {overviewCards.map((card) => (
          <div className="dashboard-stat-card" key={card.title} style={{ borderTopColor: card.accent }}>
            <div className="stat-card-title">{card.title}</div>
            <div className="stat-card-value">{card.value}</div>
            <div className="stat-card-note">{card.description}</div>
          </div>
        ))}
      </section>

      <section className="dashboard-grid">
        <div className="dashboard-main">
          <div className="card dashboard-graph-card">
            <div className="card-header">
              <div>
                <p className="eyebrow">Monthly updates</p>
                <h3>Daily Time Log Activity</h3>
              </div>
              <span className="badge">Live</span>
            </div>
            <div className="chart-meta">
              <div>
                <strong>260</strong>
                <p>Tickets handled</p>
              </div>
              <div>
                <strong>18%</strong>
                <p>Week over week</p>
              </div>
            </div>
            <div className="line-chart">
              {lineChartPoints.map((value, index) => (
                <div
                  key={index}
                  className="line-point"
                  style={{ bottom: `${value}%`, left: `${index * 14.5}%` }}
                />
              ))}
            </div>
          </div>

          <div className="card dashboard-bar-card">
            <div className="card-header">
              <div>
                <p className="eyebrow">Weekly summary</p>
                <h3>Weekly Invoices</h3>
              </div>
              <span className="badge secondary">Updated</span>
            </div>
            <div className="bar-chart">
              {barChartValues.map((value, index) => (
                <div key={weekLabels[index]} className="bar-item">
                  <div className="bar-fill" style={{ height: `${value}%` }} />
                  <span>{weekLabels[index]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <aside className="dashboard-sidebar">
          <div className="card schedule-card">
            <div className="card-header">
              <div>
                <p className="eyebrow">Today</p>
                <h3>Upcoming schedule</h3>
              </div>
            </div>
            <div className="schedule-list">
              <article className="schedule-item">
                <strong>09:00 AM</strong>
                <div>
                  <p>Dental Cleaning and Care</p>
                  <span>with Edward Jenner</span>
                </div>
              </article>
              <article className="schedule-item">
                <strong>10:30 AM</strong>
                <div>
                  <p>Status update to John Doe</p>
                  <span>with Sarah Lee</span>
                </div>
              </article>
              <article className="schedule-item">
                <strong>1:00 PM</strong>
                <div>
                  <p>Calendar updates</p>
                  <span>with Edward Johnson</span>
                </div>
              </article>
              <article className="schedule-item meeting">
                <strong>03:00 PM</strong>
                <div>
                  <p>Send Detailed Status Update</p>
                  <span>with Mike Taylor</span>
                </div>
              </article>
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
};

export default DashboardPage;
