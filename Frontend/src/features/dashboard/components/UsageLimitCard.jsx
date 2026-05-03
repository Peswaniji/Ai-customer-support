import "../styles/UsageLimitCard.scss";

const UsageLimitCard = ({ business, overview }) => {
  const chatsUsed = business?.usage?.chatsThisMonth ?? 0;
  const chatsLimit = business?.planLimits?.maxChatsPerMonth ?? 100;
  const agentsUsed = overview?.totalAgents ?? 0;
  const agentsLimit = business?.planLimits?.maxAgents ?? 2;

  const chatPercent = Math.min((chatsUsed / chatsLimit) * 100, 100);
  const agentPercent = Math.min((agentsUsed / agentsLimit) * 100, 100);

  return (
    <div className="usage-card">
      <h3 className="usage-card__title">Plan Usage</h3>
      <div className="usage-card__plan">
        <span>{business?.plan?.toUpperCase() ?? "FREE"} Plan</span>
      </div>

      <div className="usage-card__item">
        <div className="usage-card__item-header">
          <span>Chats this month</span>
          <span>{chatsUsed} / {chatsLimit}</span>
        </div>
        <div className="usage-card__bar">
          <div
            className="usage-card__bar-fill"
            style={{ width: `${chatPercent}%`,
              background: chatPercent > 80 ? "#E24B4A" : "#F5A623" }}
          />
        </div>
      </div>

      <div className="usage-card__item">
        <div className="usage-card__item-header">
          <span>Agents</span>
          <span>{agentsUsed} / {agentsLimit}</span>
        </div>
        <div className="usage-card__bar">
          <div
            className="usage-card__bar-fill"
            style={{ width: `${agentPercent}%`,
              background: agentPercent > 80 ? "#E24B4A" : "#F5A623" }}
          />
        </div>
      </div>
    </div>
  );
};

export default UsageLimitCard;