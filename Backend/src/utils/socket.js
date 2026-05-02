let io = null;

export const initSocket = async (server, options = {}) => {
  const { Server } = await import("socket.io");
  io = new Server(server, {
    cors: {
      origin: options.origins || [process.env.CLIENT_URL || "http://localhost:5173", "http://localhost:3001", "http://localhost:3000"],
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    socket.on("join", ({ businessId }) => {
      if (!businessId) return;
      const room = `business_${businessId}`;
      socket.join(room);
    });

    socket.on("leave", ({ businessId }) => {
      if (!businessId) return;
      const room = `business_${businessId}`;
      socket.leave(room);
    });
  });

  return io;
};

export const getIO = () => io;
