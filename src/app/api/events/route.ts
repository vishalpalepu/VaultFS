// ============================================================
// /api/events – GET: list recent event logs for authenticated user
// ============================================================

import { NextRequest } from "next/server";
import { auth } from "@/lib/auth/auth";
import { connectDB } from "@/lib/db/mongoose";
import EventLog from "@/lib/models/EventLog";
import { ok, err } from "@/lib/utils/api";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return err("Unauthorized", 401);

    await connectDB();
    const events = await EventLog.find({ actorId: session.user.id })
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    return ok(events);
  } catch (error) {
    console.error("List events error:", error);
    return err("Internal server error.", 500);
  }
}
