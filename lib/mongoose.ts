import type { ConnectOptions } from "mongoose";

const mongoose = await import("mongoose"); 

// ✅ Global cache type for Next.js (prevents multiple connections in dev)
type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

// ✅ Ensure we reuse existing connection during hot reload
let cached = (globalThis as any).mongoose as MongooseCache;

if (!cached) {
  cached = (globalThis as any).mongoose = { conn: null, promise: null };
}

// ✅ Ensure environment variable exists
const MONGODB_URI = process.env.MONGODB_URI;


if (!MONGODB_URI) {
  throw new Error("❌ Missing MONGODB_URI in environment variables.");
}

// ✅ Connection options tuned for serverless & production stability
const CONNECTION_OPTIONS: ConnectOptions = {
  dbName: "finance_ai_chat",
  maxPoolSize: 10, // ✅ optimal for most use cases
  minPoolSize: 2,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  autoIndex: process.env.NODE_ENV !== "production",
};

/**
 * ✅ Connect to MongoDB (reusable + production safe)
 * - Works for both serverless and persistent environments
 * - Prevents multiple simultaneous connections
 */
export async function connectToDB(): Promise<typeof mongoose> {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI, CONNECTION_OPTIONS)
      .then((mongooseInstance) => {
        if (process.env.NODE_ENV !== "production") {
          console.log("✅ MongoDB connected successfully (cached).");
        }
        return mongooseInstance;
      })
      .catch((err) => {
        console.error("❌ MongoDB connection failed :", err);
        cached.promise = null; // reset cache on failure
        throw err;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}




