import useDashboard from "../hooks/useDashboard.js";
import StatsCard from "../components/StatsCard.jsx";
import TicketTrendsChart from "../components/TicketTrendsChart.jsx";
import UsageLimitCard from "../components/UsageLimitCard.jsx";
import "../styles/DashboardPage.scss";

const DashboardPage = () => {
  const { business, overview, trends, loading, error } = useDashboard();

  if (error) {
    return (
      <div className="dashboard" style={{ padding: "20px" }}>
        <div style={{ color: "#E24B4A", padding: "20px", background: "#fff", borderRadius: "8px" }}>
          <h3>⚠️ Error loading dashboard</h3>
          <p>{error}</p>
          <small>Check console for more details</small>
        </div>
      </div>
    );
  }

  const stats = [
    { label: "Total Tickets", value: overview?.totalTickets ?? 0, icon: "🎫", color: "#F5A623" },
    { label: "Open", value: overview?.open ?? 0, icon: "📂", color: "#185FA5" },
    { label: "In Progress", value: overview?.inProgress ?? 0, icon: "⚙️", color: "#854F0B" },
    { label: "Resolved", value: overview?.resolved ?? 0, icon: "✅", color: "#3B6D11" },
    { label: "Total Agents", value: overview?.totalAgents ?? 0, icon: "👥", color: "#6B21A8" },
  ];

  return (
    <div className="dashboard">
      <div className="dashboard__header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-sub">Welcome back, {business?.name || "Admin"}</p>
        </div>
      </div>

      <div className="dashboard__stats">
        {stats.map((s) => (
          <StatsCard key={s.label} {...s} loading={loading} />
        ))}
      </div>

      <div className="dashboard__bottom">
        <div className="dashboard__chart">
          <TicketTrendsChart trends={trends} loading={loading} />
        </div>
        <div className="dashboard__usage">
          <UsageLimitCard business={business} overview={overview} />
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;