import jwt from "jsonwebtoken";
import { createClient } from "redis";
import { createAdapter } from "@socket.io/redis-adapter";
import Message from "../models/message.model.js";
import Ticket from "../models/ticket.model.js";
import User from "../models/user.model.js";
import { isTokenBlacklisted } from "../middlewares/cache.middleware.js";
import { getSuggestedReplies } from "../services/ai.service.js";

let io = null;

const createRedisClient = () => {
  if (process.env.REDIS_URL) {
    return createClient({ url: process.env.REDIS_URL });
  }

  return createClient({
    socket: {
      host: process.env.REDIS_HOST || "127.0.0.1",
      port: Number(process.env.REDIS_PORT) || 6379,
    },
    ...(process.env.REDIS_PASSWORD && { password: process.env.REDIS_PASSWORD }),
  });
};

const configureRedisAdapter = async (socketServer) => {
  try {
    const pubClient = createRedisClient();
    const subClient = pubClient.duplicate();

    pubClient.on("error", (err) => {
      console.warn("Socket Redis pub client error:", err.message);
    });
    subClient.on("error", (err) => {
      console.warn("Socket Redis sub client error:", err.message);
    });

    await Promise.all([pubClient.connect(), subClient.connect()]);
    socketServer.adapter(createAdapter(pubClient, subClient));
    console.log("Socket.io Redis adapter enabled");
  } catch (err) {
    console.warn("Socket.io Redis adapter unavailable, using single-instance rooms:", err.message);
  }
};

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

  await configureRedisAdapter(io);

  // JWT Auth Middleware
  io.use(async (socket, next) => {
    let token = socket.handshake.auth?.token;

    if (!token) {
      const authHeader = socket.handshake.headers?.authorization;
      if (authHeader?.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1];
      }
    }

    if (!token) return next(new Error("No token provided"));

    try {
      const blacklisted = await isTokenBlacklisted(token);
      if (blacklisted) return next(new Error("Token has been revoked"));

      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
      const user = await User.findById(decoded.userId)
        .select("_id role businessId isActive")
        .lean();
      if (!user?.isActive) return next(new Error("User not found or inactive"));

      socket.user = {
        userId: user._id,
        role: user.role,
        businessId: user.businessId,
      };
      next();
    } catch {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    const { userId, role, businessId } = socket.user;
    const joinedTickets = new Set();
    console.log(`Socket connected: ${role} - ${userId}`);

    const canAccessTicket = (ticket) => {
      if (role === "super_admin") return true;
      if (businessId && String(ticket.businessId) !== String(businessId)) return false;
      if (role === "customer" && String(ticket.customerId) !== String(userId)) return false;
      return true;
    };

    // Business room (agents and admins see ticket:created events)
    if (businessId) {
      socket.join(`business_${businessId}`);
    }

    // Agent personal room (for assignment notifications)
    if (role === "agent") {
      socket.join(`agent_${userId}`);
    }

    // ── join_ticket ──────────────────────────────────────────
    socket.on("join_ticket", async ({ ticketId }) => {
      if (!ticketId) return;

      try {
        // FIX: Scope check BEFORE joining room — any role must own/belong to this ticket
        const ticket = await Ticket.findById(ticketId).lean();
        if (!ticket) return;

        if (!canAccessTicket(ticket)) {
          socket.emit("error", { message: "Access denied to this ticket" });
          return;
        }

        socket.join(`ticket_${ticketId}`);
        joinedTickets.add(String(ticketId));
        if (role !== "customer") {
          socket.join(`ticket_${ticketId}:staff`);
        }
        console.log(`${role} joined ticket_${ticketId}`);

        // Agent/admin joins → send AI suggestions (non-blocking)
        if (role === "agent" || role === "business_admin") {
          try {
            const messages = await Message.find({ ticketId, isInternal: false })
              .sort({ createdAt: 1 })
              .limit(20)
              .lean();

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
      } catch (err) {
        console.error("join_ticket error:", err.message);
      }
    });

    // ── leave_ticket ─────────────────────────────────────────
    socket.on("leave_ticket", ({ ticketId }) => {
      if (!ticketId) return;
      socket.leave(`ticket_${ticketId}`);
      socket.leave(`ticket_${ticketId}:staff`);
      joinedTickets.delete(String(ticketId));
    });

    // ── send_message ─────────────────────────────────────────
    socket.on("send_message", async ({ ticketId, content, isInternal = false }) => {
      if (!ticketId || !content?.trim()) return;

      try {
        const ticket = await Ticket.findById(ticketId).lean();
        if (!ticket) return;

        if (!canAccessTicket(ticket)) return;

        // Customers cannot send internal notes
        if (role === "customer" && isInternal) return;

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
          io.to(`ticket_${ticketId}:staff`).emit("new_internal_note", message);
        } else {
          // Broadcast to everyone in the ticket room
          io.to(`ticket_${ticketId}`).emit("new_message", message);
        }

        // After agent sends → refresh AI suggestions
        if ((role === "agent" || role === "business_admin") && !isInternal) {
          try {
            const allMessages = await Message.find({ ticketId, isInternal: false })
              .sort({ createdAt: 1 })
              .limit(20)
              .lean();

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
            // non-critical
          }
        }
      } catch (err) {
        console.error("send_message error:", err.message);
        socket.emit("message_error", { error: "Failed to send message" });
      }
    });

    // ── typing indicators ────────────────────────────────────
    socket.on("typing_start", ({ ticketId }) => {
      if (!ticketId || !joinedTickets.has(String(ticketId))) return;
      socket
        .to(`ticket_${ticketId}`)
        .emit(role === "agent" || role === "business_admin" ? "agent_typing" : "customer_typing", {
          name: userId,
        });
    });

    socket.on("typing_stop", ({ ticketId }) => {
      if (!ticketId || !joinedTickets.has(String(ticketId))) return;
      socket.to(`ticket_${ticketId}`).emit("typing_stop", {});
    });

    // ── mark_read ─────────────────────────────────────────────
    socket.on("mark_read", async ({ ticketId }) => {
      if (!ticketId || !joinedTickets.has(String(ticketId))) return;
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

    socket.on("disconnect", () => {
      console.log(`Socket disconnected: ${role} - ${userId}`);
    });
  });

  return io;
};

export const getIO = () => io;
