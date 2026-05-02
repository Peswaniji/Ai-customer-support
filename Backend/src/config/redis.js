import dotenv from "dotenv";
dotenv.config();

import { createClient } from "redis";

let redisClient = null;
let isConnected = false;

// Try to connect to Redis, but don't block app if it fails
(async () => {
  try {
    redisClient = createClient({
      socket: {
        host: process.env.REDIS_HOST,
        port: Number(process.env.REDIS_PORT),
        reconnectStrategy: false, // disable auto-reconnect to avoid hanging
      },
      password: process.env.REDIS_PASSWORD,
    });

    redisClient.on("error", (err) => {
      console.warn("⚠️  Redis error (caching disabled):", err.message);
      isConnected = false;
    });

    redisClient.on("connect", () => {
      console.log("✅ Redis connected");
      isConnected = true;
    });

    await redisClient.connect();
    isConnected = true;
  } catch (err) {
    console.warn("⚠️  Redis unavailable, app will work without caching:", err.message);
    isConnected = false;
    // Create dummy client that does nothing
    redisClient = {
      get: async () => null,
      setEx: async () => {},
      del: async () => {},
      keys: async () => [],
      quit: async () => {},
      isOpen: false,
    };
  }
})();

// Export a wrapper that gracefully handles Redis being unavailable
export default {
  isOpen: () => isConnected && redisClient?.isOpen,
  get: async (key) => {
    try {
      if (isConnected && redisClient?.isOpen) return await redisClient.get(key);
    } catch (e) {
      console.warn("⚠️  Redis get failed:", e.message);
    }
    return null;
  },
  setEx: async (key, ttl, value) => {
    try {
      if (isConnected && redisClient?.isOpen) await redisClient.setEx(key, ttl, value);
    } catch (e) {
      console.warn("⚠️  Redis setEx failed:", e.message);
    }
  },
  del: async (key) => {
    try {
      if (isConnected && redisClient?.isOpen) await redisClient.del(key);
    } catch (e) {
      console.warn("⚠️  Redis del failed:", e.message);
    }
  },
  keys: async (pattern) => {
    try {
      if (isConnected && redisClient?.isOpen) return await redisClient.keys(pattern);
    } catch (e) {
      console.warn("⚠️  Redis keys failed:", e.message);
    }
    return [];
  },
  quit: async () => {
    try {
      if (redisClient?.quit) await redisClient.quit();
    } catch (e) {
      console.warn("⚠️  Redis quit failed:", e.message);
    }
  },
};