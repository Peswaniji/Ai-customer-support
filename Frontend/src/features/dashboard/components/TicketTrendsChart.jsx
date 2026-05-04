import {
  LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import "../styles/TicketTrendsChart.scss";

const TicketTrendsChart = ({ trends, loading }) => {
  return (
    <div className="trends-chart">
      <h3 className="trends-chart__title">Ticket Trends</h3>
      {loading ? (
        <div className="trends-chart__loading">Loading chart...</div>
      ) : !trends?.length ? (
        <div className="trends-chart__loading">No ticket activity in the last 30 days.</div>
      ) : (
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={trends}>
            <CartesianGrid strokeDasharray="3 3" stroke="#FAC77520" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: "#854F0B" }}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#854F0B" }}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                background: "#fff",
                border: "0.5px solid #FAC775",
                borderRadius: 8,
                fontSize: 12,
              }}
            />
            <Line
              type="monotone"
              dataKey="count"
              stroke="#F5A623"
              strokeWidth={2.5}
              dot={{ fill: "#F5A623", r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default TicketTrendsChart;
