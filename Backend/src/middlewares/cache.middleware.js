import redisClient from "../config/redis.js";

// Cache any GET route response
// Usage: router.get("/route", cache(60), controller)
// ttl = seconds
export const cache = (ttl = 60) => async (req, res, next) => {
  // Skip cache if not connected
  if (!redisClient.isOpen) return next();

  // Key = role + businessId + full URL (scoped per business)
  const key = `cache:${req.user?.role}:${req.user?.businessId}:${req.originalUrl}`;

  try {
    const cached = await redisClient.get(key);
    if (cached) {
      return res.json({ ...JSON.parse(cached), fromCache: true });
    }

    // Intercept res.json to store in cache before sending
    const originalJson = res.json.bind(res);
    res.json = (data) => {
      if (res.statusCode === 200) {
        redisClient.setEx(key, ttl, JSON.stringify(data)).catch(console.error);
      }
      return originalJson(data);
    };

    next();
  } catch (err) {
    console.error("Cache middleware error:", err.message);
    next(); // cache fail hone pe bhi request continue karo
  }
};

// Invalidate cache for a business — call this after any write operation
export const invalidateCache = async (businessId) => {
  if (!redisClient.isOpen) return;
  try {
    const keys = await redisClient.keys(`cache:*:${businessId}:*`);
    if (keys.length > 0) {
      await redisClient.del(keys);
      console.log(`🗑️ Cache invalidated for business ${businessId} — ${keys.length} keys`);
    }
  } catch (err) {
    console.error("Cache invalidation error:", err.message);
  }
};

// Cache specifically for refresh token blacklisting (logout)
export const blacklistToken = async (token, expirySeconds) => {
  if (!redisClient.isOpen) return;
  await redisClient.setEx(`blacklist:${token}`, expirySeconds, "1");
};

export const isTokenBlacklisted = async (token) => {
  if (!redisClient.isOpen) return false;
  const val = await redisClient.get(`blacklist:${token}`);
  return val === "1";
};