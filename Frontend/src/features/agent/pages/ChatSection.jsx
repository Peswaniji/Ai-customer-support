import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { useChat } from "../../chat/hooks/useChat"; // Aapka banaya hua hook
import "../styles/chatSection.scss";

const ChatSection = () => {
  const { ticketId } = useParams(); // URL se ticketId milegi
  const { messages, loading, getMessages, sendMessage } = useChat();
  const [text, setText] = useState("");
  const scrollRef = useRef(null);

  // 1. Ticket change hone par messages load karein
  useEffect(() => {
    if (ticketId) {
      getMessages(ticketId);
    }
  }, [ticketId]);

  // 2. Naya message aane par auto-scroll niche karein
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    await sendMessage(ticketId, text);
    setText(""); // Input khali karein
  };

  return (
    <div className="chat">
      <div className="chat__header">
        Active Chat {ticketId && ` - ID: ${ticketId.slice(-5)}`}
      </div>

      <div className="chat__container">
        <div className="chat__window">
          <div className="chat__messages">
            {loading ? (
              <p className="loading-text">Loading messages...</p>
            ) : messages.length > 0 ? (
              messages.map((msg, index) => (
      <div
  key={index}
  className={`msg ${msg.senderType === "agent" ? "right" : "left"}`}
>
  <div className="msg-content">{msg.content}</div>
  {/* Agar aapke backend mein timestamp hai toh usey aise dikha sakti hain */}
  {msg.createdAt && (
    <small className="msg-time">
      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
    </small>
  )}
</div>
    ))
            ) : (
              <p className="no-msgs">No messages yet. Start conversation!</p>
            )}
            {/* Auto-scroll target */}
            <div ref={scrollRef} />
          </div>

          <form className="chat__input" onSubmit={handleSend}>
            <input
              type="text"
              placeholder="Type message..."
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <button type="submit" disabled={!text.trim()}>
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChatSection;
