// ============================================================
// VaultFS – MongoDB connection singleton (globalThis cache)
// Prevents connection pool exhaustion in serverless/Next.js
// ============================================================

import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI as string;

// Check MONGODB_URI inside connectDB to prevent build/import errors when env var is not set yet

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// Extend global type to hold our cache
declare global {
  // eslint-disable-next-line no-var
  var __mongooseCache: MongooseCache | undefined;
}

const cache: MongooseCache = globalThis.__mongooseCache ?? {
  conn: null,
  promise: null,
};

globalThis.__mongooseCache = cache;

export async function connectDB(): Promise<typeof mongoose> {
  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI environment variable is not defined.");
  }

  if (cache.conn) {
    return cache.conn;
  }

  if (!cache.promise) {
    cache.promise = mongoose
      .connect(MONGODB_URI, {
        bufferCommands: false,
        serverSelectionTimeoutMS: 5000, // Fail early (5s) instead of hanging for 30s
        socketTimeoutMS: 45000, // Keep socket open longer for large operations
        family: 4, // Use IPv4, skip IPv6 to prevent getaddrinfo ENOTFOUND DNS issues
      })
      .then((m) => m)
      .catch((err) => {
        cache.promise = null; // Clear cached promise so subsequent requests can retry
        throw err;
      });
  }

  cache.conn = await cache.promise;
  return cache.conn;
}
