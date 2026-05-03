import useAnalytics from "../hooks/useAnalytics.js";
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";
import "../styles/AnalyticsPage.scss";

const AnalyticsPage = () => {
  const { overview, trends, agentStats, loading } = useAnalytics();

  return (
    <div className="analytics-page">
      <div className="analytics-page__header">
        <h1 className="page-title">Analytics</h1>
        <p className="page-sub">Your business performance overview</p>
      </div>

      <div className="analytics-page__stats">
        {[
          ["Total Tickets", overview?.totalTickets ?? 0],
          ["AI Resolved", overview?.autoResolved ?? 0],
          ["AI Rate", `${overview?.aiRate ?? 0}%`],
          ["Avg Resolution", `${overview?.avgResolutionMin ?? 0} min`],
          ["Avg Rating", overview?.avgRating ? `${overview.avgRating} ⭐` : "N/A"],
          ["Resolution Rate", `${overview?.resolutionRate ?? 0}%`],
        ].map(([label, value]) => (
          <div className="analytics-stat" key={label}>
            <span className="analytics-stat__label">{label}</span>
            <span className="analytics-stat__value">{loading ? "..." : value}</span>
          </div>
        ))}
      </div>

      <div className="analytics-page__charts">
        <div className="analytics-card">
          <h3 className="analytics-card__title">Ticket Trends</h3>
          {loading ? (
            <div className="analytics-card__loading">Loading...</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={trends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#FAC77520" />
                <XAxis dataKey="_id" tick={{ fontSize: 11, fill: "#854F0B" }} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#854F0B" }} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ background: "#fff", border: "0.5px solid #FAC775", borderRadius: 8, fontSize: 12 }} />
                <Line type="monotone" dataKey="count" stroke="#F5A623" strokeWidth={2.5} dot={{ fill: "#F5A623", r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="analytics-card">
          <h3 className="analytics-card__title">Agent Performance</h3>
          {loading ? (
            <div className="analytics-card__loading">Loading...</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={agentStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#FAC77520" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#854F0B" }} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#854F0B" }} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ background: "#fff", border: "0.5px solid #FAC775", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="resolvedTickets" fill="#F5A623" radius={[4, 4, 0, 0]} name="Resolved" />
                <Bar dataKey="totalTickets" fill="#FAEEDA" radius={[4, 4, 0, 0]} name="Total" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="analytics-card">
        <h3 className="analytics-card__title">Agent Details</h3>
        <div className="analytics-table__wrapper">
          <table className="analytics-table">
            <thead>
              <tr>
                <th>Agent</th>
                <th>Email</th>
                <th>Status</th>
                <th>Total</th>
                <th>Resolved</th>
                <th>Avg Resolution</th>
                <th>Avg Rating</th>
              </tr>
            </thead>
            <tbody>
              {agentStats.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: "32px", color: "#854F0B" }}>
                    No agent data yet
                  </td>
                </tr>
              ) : (
                agentStats.map((agent) => (
                  <tr key={agent.agentId}>
                    <td>{agent.name}</td>
                    <td className="text-medium">{agent.email}</td>
                    <td>
                      <span className={agent.availabilityStatus === "available" ? "badge-online" : "badge-warning"}>
                        {agent.availabilityStatus === "available" ? "Available" : "Busy"}
                      </span>
                    </td>
                    <td>{agent.totalTickets}</td>
                    <td>{agent.resolvedTickets}</td>
                    <td>{agent.avgResolutionMin ?? 0} min</td>
                    <td>{agent.avgRating ? `${agent.avgRating} ⭐` : "N/A"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;