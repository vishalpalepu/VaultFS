import mongoose, { Schema, Document, Model, models } from "mongoose";
import type { EventType } from "@/types";

export interface IEventLogDoc extends Document {
  eventType: EventType;
  actorId: mongoose.Types.ObjectId;
  targetId?: mongoose.Types.ObjectId | null;
  metadata: Record<string, unknown>;
  createdAt: Date;
}

const EventLogSchema = new Schema<IEventLogDoc>(
  {
    eventType: {
      type: String,
      enum: [
        "RESOURCE_CREATED",
        "RESOURCE_UPDATED",
        "RESOURCE_DELETED",
        "RESOURCE_SHARED",
        "NODE_ADDED",
        "NODE_UPDATED",
        "NODE_DISABLED",
        "NODE_REMOVED",
        "LEASE_REQUESTED",
        "LEASE_APPROVED",
        "LEASE_REVOKED",
        "USER_REGISTERED",
        "USER_LOGIN",
      ],
      required: true,
    },
    actorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    targetId: { type: Schema.Types.ObjectId, default: null },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// Indexes
EventLogSchema.index({ actorId: 1, createdAt: -1 });
EventLogSchema.index({ eventType: 1 });

const EventLog: Model<IEventLogDoc> =
  models.EventLog || mongoose.model<IEventLogDoc>("EventLog", EventLogSchema);
export default EventLog;
