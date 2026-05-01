import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
import { connectDB } from "./config/db.js";

// Dynamic import — redis.js tab load hoga jab dotenv already set ho
await import("./config/redis.js");

connectDB();

app.listen(process.env.PORT || 3000, () => {
  console.log(`✅ Server running on port ${process.env.PORT || 3000}`);
});