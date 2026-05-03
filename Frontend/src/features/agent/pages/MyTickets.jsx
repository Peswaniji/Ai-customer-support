import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { useTickets } from "../../tickets/hook/useTicket"; // Path check kar lein
import "../styles/myTickets.scss";
import { useNavigate } from "react-router-dom";

const MyTickets = () => {
  const { getAssignedTickets } = useTickets();
  const navigate = useNavigate();
  // Redux state se tickets aur loading status nikalna
  const { tickets, loading, error } = useSelector((state) => state.ticket);

  useEffect(() => {
    getAssignedTickets();
  }, []);

  if (loading) return <div className="loading">Loading your tickets...</div>;
  if (error) return <div className="error">Error: {error}</div>;
  const handleTicketClick = (ticketId) => {
    // Ticket ID ko state ya URL param ke taur par pass karein
    navigate(`/agent/chats/${ticketId}`); 
  };

  return (
    <div className="tickets">
      <h2 className="tickets__title">My Tickets</h2>

      <div className="tickets__container">
        {tickets && tickets.length > 0 ? (
          tickets.map((ticket) => (
            <div className="ticket" key={ticket._id}
            onClick={() => handleTicketClick(ticket._id)} // Click event
            style={{ cursor: 'pointer' }}
            >
              <div className="ticket__left">
                {/* Customer name nested object mein hai */}
                <h4>{ticket.customerId?.name || "Unknown Customer"}</h4>
                <p>{ticket.subject}</p>
                <small className="ticket__desc">{ticket.description}</small>
              </div>
              <div className="ticket__right">
                <span className={`status-badge ${ticket.status}`}>
                  {ticket.category || "General"}
                </span>
                <div className={`priority-dot ${ticket.priority}`}>
                  {ticket.status}
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="no-data">Aapke paas koi tickets nahi hain.</p>
        )}
      </div>
    </div>
  );
};

export default MyTickets;