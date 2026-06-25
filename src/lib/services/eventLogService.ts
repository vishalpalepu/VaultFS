// ============================================================
// VaultFS – Event Log Service (append-only)
// ============================================================

import { connectDB } from "@/lib/db/mongoose";
import EventLog from "@/lib/models/EventLog";
import type { EventType } from "@/types";

export async function createEvent(
  eventType: EventType,
  actorId: string,
  targetId?: string | null,
  metadata: Record<string, unknown> = {}
) {
  await connectDB();
  return EventLog.create({
    eventType,
    actorId,
    targetId: targetId || undefined,
    metadata,
  });
}

export async function getEventsByActor(actorId: string, limit: number = 50) {
  await connectDB();
  return EventLog.find({ actorId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
}

export async function getEventsByTarget(targetId: string, limit: number = 50) {
  await connectDB();
  return EventLog.find({ targetId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
}
