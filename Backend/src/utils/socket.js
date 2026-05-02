import jwt from "jsonwebtoken";
import Message from "../models/message.model.js";
import Ticket from "../models/ticket.model.js";
import { getSuggestedReplies } from "../services/ai.service.js";

let io = null;

export const initSocket = async (server, options = {}) => {
  const { Server } = await import("socket.io");

  io = new Server(server, {
    cors: {
      origin: options.origins || [
        process.env.CLIENT_URL || "http://localhost:5173",
        "http://localhost:3001",
        "http://localhost:3000",
      ],
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  // ── JWT Auth Middleware ──────────────────────────────────────
  io.use((socket, next) => {
  // Try handshake.auth first, then headers
  let token = socket.handshake.auth?.token;

  if (!token) {
    const authHeader = socket.handshake.headers?.authorization;
    if (authHeader?.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }
  }

  if (!token) return next(new Error("No token provided"));

  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    socket.user = decoded;
    next();
  } catch {
    next(new Error("Invalid token"));
  }
});

  io.on("connection", (socket) => {
    const { userId, role, businessId } = socket.user;
    console.log(`🔌 Socket connected: ${role} — ${userId}`);

    // ── Business room (for ticket:created broadcasts) ────────
    if (businessId) {
      socket.join(`business_${businessId}`);
    }

    // ── Agent personal room (for new ticket assignments) ─────
    if (role === "agent") {
      socket.join(`agent_${userId}`);
    }

    // ── join_ticket ──────────────────────────────────────────
    socket.on("join_ticket", async ({ ticketId }) => {
      if (!ticketId) return;
      socket.join(`ticket_${ticketId}`);
      console.log(`👥 ${role} joined ticket_${ticketId}`);

      // Agent joins → send AI suggestions
      if (role === "agent" || role === "business_admin") {
        try {
          const ticket = await Ticket.findById(ticketId);
          if (!ticket) return;

          const messages = await Message.find({
            ticketId,
            isInternal: false,
          })
            .sort({ createdAt: 1 })
            .limit(20);

          if (messages.length > 0) {
            const suggestions = await getSuggestedReplies({
              subject: ticket.subject,
              category: ticket.category || "general",
              messages: messages.map((m) => ({
                senderRole: m.senderRole,
                content: m.content,
              })),
            });
            socket.emit("ai_suggestion_ready", { suggestions });
          }
        } catch (err) {
          console.error("AI suggestions on join failed:", err.message);
        }
      }
    });

    // ── leave_ticket ─────────────────────────────────────────
    socket.on("leave_ticket", ({ ticketId }) => {
      if (!ticketId) return;
      socket.leave(`ticket_${ticketId}`);
    });

    // ── send_message ─────────────────────────────────────────
    socket.on("send_message", async ({ ticketId, content, isInternal = false }) => {
      if (!ticketId || !content?.trim()) return;

      try {
        const ticket = await Ticket.findById(ticketId);
        if (!ticket) return;

        // Scope check — customer can only message their own ticket
        if (
          role === "customer" &&
          String(ticket.customerId) !== String(userId)
        ) return;

        const message = await Message.create({
          ticketId,
          businessId: ticket.businessId,
          senderId: userId,
          senderRole: role,
          content: content.trim(),
          isInternal,
        });

        await message.populate("senderId", "name role");

        if (isInternal) {
          // Internal notes — only agents in the room see it
          socket.to(`ticket_${ticketId}`).emit("new_internal_note", message);
        } else {
          // Broadcast to everyone in the ticket room
          io.to(`ticket_${ticketId}`).emit("new_message", message);
        }

        // After agent sends → refresh AI suggestions
        if ((role === "agent" || role === "business_admin") && !isInternal) {
          try {
            const allMessages = await Message.find({
              ticketId,
              isInternal: false,
            })
              .sort({ createdAt: 1 })
              .limit(20);

            const suggestions = await getSuggestedReplies({
              subject: ticket.subject,
              category: ticket.category || "general",
              messages: allMessages.map((m) => ({
                senderRole: m.senderRole,
                content: m.content,
              })),
            });
            socket.emit("ai_suggestion_ready", { suggestions });
          } catch {
            // suggestions failed — non-critical
          }
        }
      } catch (err) {
        console.error("send_message error:", err.message);
        socket.emit("message_error", { error: "Failed to send message" });
      }
    });

    // ── typing indicators ────────────────────────────────────
    socket.on("typing_start", ({ ticketId }) => {
      if (!ticketId) return;
      socket.to(`ticket_${ticketId}`).emit(
        role === "agent" || role === "business_admin"
          ? "agent_typing"
          : "customer_typing",
        { name: userId }
      );
    });

    socket.on("typing_stop", ({ ticketId }) => {
      if (!ticketId) return;
      socket.to(`ticket_${ticketId}`).emit("typing_stop", {});
    });

    // ── mark_read ─────────────────────────────────────────────
    socket.on("mark_read", async ({ ticketId }) => {
      if (!ticketId) return;
      try {
        await Message.updateMany(
          { ticketId, senderId: { $ne: userId }, isRead: false },
          { isRead: true }
        );
        socket.to(`ticket_${ticketId}`).emit("messages_read", { by: userId });
      } catch (err) {
        console.error("mark_read error:", err.message);
      }
    });

    // ── disconnect ────────────────────────────────────────────
    socket.on("disconnect", () => {
      console.log(`🔌 Socket disconnected: ${role} — ${userId}`);
    });
  });

  return io;
};

export const getIO = () => io;