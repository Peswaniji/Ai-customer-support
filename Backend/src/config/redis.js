import dotenv from "dotenv";
dotenv.config();

import { createClient } from "redis";

let redisClient = null;
let isConnected = false;

// Dummy client used when Redis is unavailable
const dummyClient = {
  isOpen: false,
  get: async () => null,
  setEx: async () => {},
  del: async () => {},
  keys: async () => [],
  quit: async () => {},
};

// Try to connect to Redis, but don't block app if it fails
(async () => {
  try {
    redisClient = createClient({
      socket: {
        host: process.env.REDIS_HOST || "127.0.0.1",
        port: Number(process.env.REDIS_PORT) || 6379,
        reconnectStrategy: (retries) => {
          if (retries > 3) return false; // stop retrying after 3 attempts
          return Math.min(retries * 200, 1000);
        },
      },
      ...(process.env.REDIS_PASSWORD && { password: process.env.REDIS_PASSWORD }),
    });

    redisClient.on("error", (err) => {
      console.warn("⚠️  Redis error (caching disabled):", err.message);
      isConnected = false;
    });

    redisClient.on("connect", () => {
      console.log("✅ Redis connected");
      isConnected = true;
    });

    redisClient.on("ready", () => {
      isConnected = true;
    });

    redisClient.on("end", () => {
      isConnected = false;
    });

    await redisClient.connect();
    isConnected = true;
  } catch (err) {
    console.warn("⚠️  Redis unavailable, app will work without caching:", err.message);
    isConnected = false;
    redisClient = dummyClient;
  }
})();

// FIX: isOpen is a boolean PROPERTY (not a method) — consistent across all usage
const client = {
  get isOpen() {
    return isConnected && redisClient !== dummyClient && redisClient?.isOpen === true;
  },
  get: async (key) => {
    if (!isConnected) return null;
    try {
      return await redisClient.get(key);
    } catch (e) {
      console.warn("⚠️  Redis get failed:", e.message);
      return null;
    }
  },
  setEx: async (key, ttl, value) => {
    if (!isConnected) return;
    try {
      await redisClient.setEx(key, ttl, value);
    } catch (e) {
      console.warn("⚠️  Redis setEx failed:", e.message);
    }
  },
  del: async (keys) => {
    if (!isConnected) return;
    try {
      if (Array.isArray(keys)) {
        const flatKeys = keys
          .flat()
          .filter((key) => typeof key === "string" || Buffer.isBuffer(key));
        if (flatKeys.length === 0) return;
        await redisClient.del(flatKeys);
      } else {
        await redisClient.del(keys);
      }
    } catch (e) {
      console.warn("⚠️  Redis del failed:", e.message);
    }
  },
  keys: async (pattern) => {
    if (!isConnected) return [];
    try {
      return await redisClient.keys(pattern);
    } catch (e) {
      console.warn("⚠️  Redis keys failed:", e.message);
      return [];
    }
  },
  scan: async (pattern) => {
    if (!isConnected || !redisClient?.scanIterator) return [];
    try {
      const keys = [];
      for await (const item of redisClient.scanIterator({ MATCH: pattern, COUNT: 100 })) {
        if (Array.isArray(item)) {
          keys.push(...item);
        } else {
          keys.push(item);
        }
      }
      return keys;
    } catch (e) {
      console.warn("Redis scan failed:", e.message);
      return [];
    }
  },
  quit: async () => {
    try {
      if (redisClient && redisClient !== dummyClient) await redisClient.quit();
    } catch (e) {
      console.warn("⚠️  Redis quit failed:", e.message);
    }
  },
};

export default client;
