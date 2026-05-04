import { useEffect, useState } from "react";
import platformAPI from "../services/platform.api.js";
import "../styles/PlatformStats.scss";

const PlatformStats = () => {
  const [stats, setStats] = useState(null);
  const [businesses, setBusinesses] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [statsRes, businessesRes] = await Promise.all([
          platformAPI.getPlatformStats(),
          platformAPI.getBusinesses(),
        ]);
        setStats(statsRes.data.data);
        setBusinesses(businessesRes.data.businesses || []);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load platform stats");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const statCards = [
    { label: "Businesses", value: stats?.totalBusinesses ?? 0, icon: "B", tone: "gold" },
    { label: "Tickets", value: stats?.totalTickets ?? 0, icon: "T", tone: "blue" },
    { label: "Agents", value: stats?.totalAgents ?? 0, icon: "A", tone: "green" },
    { label: "AI Rate", value: `${stats?.aiRate ?? 0}%`, icon: "%", tone: "violet" },
  ];

  if (error) {
    return (
      <div className="platform">
        <div className="platform__error">{error}</div>
      </div>
    );
  }

  return (
    <div className="platform">
      <div className="platform__header">
        <div>
          <h1 className="page-title">Platform Stats</h1>
          <p className="page-sub">All businesses, tickets, agents, and AI usage in one view</p>
        </div>
        <span className="platform__badge">Super Admin</span>
      </div>

      <div className="platform__stats">
        {statCards.map((card) => (
          <div className="platform-stat" key={card.label}>
            <div className={`platform-stat__icon platform-stat__icon--${card.tone}`}>
              {card.icon}
            </div>
            <div className="platform-stat__body">
              <span className="platform-stat__label">{card.label}</span>
              <strong className="platform-stat__value">{loading ? "..." : card.value}</strong>
            </div>
          </div>
        ))}
      </div>

      <div className="platform-card">
        <div className="platform-card__header">
          <div>
            <h2>Businesses</h2>
            <p>{businesses.length} tenants currently registered</p>
          </div>
        </div>

        {loading ? (
          <div className="platform-card__state">Loading businesses...</div>
        ) : businesses.length === 0 ? (
          <div className="platform-card__state">No businesses found</div>
        ) : (
          <div className="platform-table__wrapper">
            <table className="platform-table">
              <thead>
                <tr>
                  <th>Business</th>
                  <th>Email</th>
                  <th>Plan</th>
                  <th>Agents</th>
                </tr>
              </thead>
              <tbody>
                {businesses.map((business) => (
                  <tr key={business._id}>
                    <td>
                      <div className="platform-table__business">
                        <span className="platform-table__avatar">
                          {(business.name || "?").slice(0, 1).toUpperCase()}
                        </span>
                        <span>{business.name}</span>
                      </div>
                    </td>
                    <td className="platform-table__email">{business.email}</td>
                    <td>
                      <span className={`platform-table__plan platform-table__plan--${business.plan}`}>
                        {business.plan}
                      </span>
                    </td>
                    <td>{business.agentCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlatformStats;
