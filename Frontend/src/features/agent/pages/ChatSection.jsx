import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { io } from "socket.io-client";
import { refreshToken } from "../../auth/services/auth.api.js";
import { useChat } from "../../chat/hooks/useChat";
import useTickets from "../../tickets/hooks/useTickets.js";
import "../styles/chatSection.scss";

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ||
  (import.meta.env.VITE_API_URL || "https://ai-csp-backend.onrender.com/api").replace(/\/api\/?$/, "");

const getPayload = (token) => {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch {
    return null;
  }
};

const getValidToken = async () => {
  const token = localStorage.getItem("accessToken");
  const payload = token ? getPayload(token) : null;
  const expiresSoon = payload?.exp ? payload.exp * 1000 < Date.now() + 30000 : true;

  if (!token || expiresSoon) {
    const data = await refreshToken();
    if (data.accessToken) localStorage.setItem("accessToken", data.accessToken);
    return data.accessToken;
  }

  return token;
};

const getSenderName = (message) => {
  if (message.senderRole === "ai") return "AI Assistant";
  if (message.senderRole === "system") return "System";
  if (typeof message.senderId === "object" && message.senderId?.name) {
    return message.senderId.name;
  }
  if (message.senderRole === "customer") return "Customer";
  if (message.senderRole === "business_admin") return "Admin";
  return "Agent";
};

const getMessageSide = (message) => {
  if (message.senderRole === "system") return "center";
  if (["agent", "business_admin", "ai"].includes(message.senderRole)) return "right";
  return "left";
};

const ChatSection = () => {
  const navigate = useNavigate();
  const { ticketId } = useParams();
  const { selectedTicket, getTicketById } = useTickets();
  const {
    messages,
    loading,
    getMessages,
    sendMessage,
    addMessage,
    aiSuggestion,
    setAiSuggestion,
  } = useChat();
  const [text, setText] = useState("");
  const [isInternal, setIsInternal] = useState(false);
  const [typing, setTyping] = useState("");
  const [socketError, setSocketError] = useState("");
  const [socket, setSocket] = useState(null);
  const scrollRef = useRef(null);
  const typingTimer = useRef(null);

  useEffect(() => {
    if (ticketId) {
      getTicketById(ticketId);
      getMessages(ticketId);
    }
  }, [ticketId]);

  useEffect(() => {
    let nextSocket;
    let isMounted = true;

    const connect = async () => {
      try {
        const token = await getValidToken();
        if (!token || !isMounted) return;

        nextSocket = io(SOCKET_URL, {
          auth: { token },
          transports: ["websocket"],
          withCredentials: true,
        });

        setSocket(nextSocket);

        nextSocket.on("connect", () => {
          setSocketError("");
          if (ticketId) nextSocket.emit("join_ticket", { ticketId });
        });

        nextSocket.on("connect_error", (err) => {
          setSocketError(err.message || "Socket connection failed");
        });

        nextSocket.on("new_message", (message) => addMessage(message));
        nextSocket.on("new_internal_note", (message) => addMessage(message));
        nextSocket.on("customer_typing", () => {
          setTyping("Customer is typing...");
          clearTimeout(typingTimer.current);
          typingTimer.current = setTimeout(() => setTyping(""), 3000);
        });
        nextSocket.on("typing_stop", () => setTyping(""));
        nextSocket.on("ai_suggestion_ready", (data) => setAiSuggestion(data.suggestions));
        nextSocket.on("message_error", (data) => {
          setSocketError(data.error || "Failed to send message");
        });
      } catch (err) {
        setSocketError(err.response?.data?.message || "Session expired. Please login again.");
      }
    };

    connect();

    return () => {
      isMounted = false;
      if (ticketId) nextSocket?.emit("leave_ticket", { ticketId });
      nextSocket?.disconnect();
    };
  }, [ticketId]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const title = useMemo(() => {
    if (!selectedTicket) return "Active Chat";
    return selectedTicket.subject || "Active Chat";
  }, [selectedTicket]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    if (socket?.connected) {
      socket.emit("send_message", { ticketId, content: text, isInternal });
    } else {
      await sendMessage(ticketId, text, isInternal);
    }

    setText("");
  };

  const handleTyping = (value) => {
    setText(value);
    if (!socket || !ticketId) return;
    socket.emit("typing_start", { ticketId });
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      socket.emit("typing_stop", { ticketId });
    }, 800);
  };

  return (
    <div className="chat">
      <div className="chat__header">
        <button type="button" onClick={() => navigate("/agent/active-chats")}>
          Back
        </button>
        <div>
          <h2>{title}</h2>
          <p>
            {selectedTicket?.customerId?.name || "Customer"} ·{" "}
            {selectedTicket?.status || "open"}
          </p>
        </div>
      </div>

      {socketError && <div className="chat__error">{socketError}</div>}

      <div className="chat__window">
        <div className="chat__messages">
          {loading ? (
            <p className="loading-text">Loading messages...</p>
          ) : messages.length > 0 ? (
            messages.map((msg, index) => {
              const side = getMessageSide(msg);
              const senderName = getSenderName(msg);

              return (
                <div
                  key={msg._id || index}
                  className={`msg ${side} ${msg.senderRole} ${msg.isInternal ? "internal" : ""}`}
                >
                  <div className="msg-label">
                    {msg.isInternal ? "Internal note · " : ""}
                    {senderName}
                  </div>
                  <div className="msg-content">{msg.content}</div>
                  {msg.createdAt && (
                    <small className="msg-time">
                      {new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </small>
                  )}
                </div>
              );
            })
          ) : (
            <p className="no-msgs">No messages yet. Start conversation!</p>
          )}
          <div ref={scrollRef} />
        </div>

        {typing && <div className="chat__typing">{typing}</div>}

        {Array.isArray(aiSuggestion) && aiSuggestion.length > 0 && (
          <div className="chat__suggestions">
            <span>AI suggestions</span>
            {aiSuggestion.map((suggestion, index) => (
              <button key={index} type="button" onClick={() => setText(suggestion)}>
                {suggestion}
              </button>
            ))}
          </div>
        )}

        <form className="chat__input" onSubmit={handleSend}>
          <label className="chat__internal">
            <input
              type="checkbox"
              checked={isInternal}
              onChange={(e) => setIsInternal(e.target.checked)}
            />
            Internal note
          </label>
          <input
            type="text"
            placeholder="Type message..."
            value={text}
            onChange={(e) => handleTyping(e.target.value)}
          />
          <button type="submit" disabled={!text.trim()}>
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatSection;
