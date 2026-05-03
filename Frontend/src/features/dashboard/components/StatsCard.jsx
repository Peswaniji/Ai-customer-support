import "../styles/StatsCard.scss";

const StatsCard = ({ label, value, icon, color, loading }) => {
  return (
    <div className="stats-card">
      <div className="stats-card__icon" style={{ background: `${color}18` }}>
        <span>{icon}</span>
      </div>
      <div className="stats-card__info">
        <span className="stats-card__label">{label}</span>
        <span className="stats-card__value" style={{ color }}>
          {loading ? "..." : value}
        </span>
      </div>
    </div>
  );
};

export default StatsCard;