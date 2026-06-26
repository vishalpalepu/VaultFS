import mongoose, { Schema, Document, Model, models } from "mongoose";
import type { NodeStatus } from "@/types";

export interface IStorageNodeDoc extends Document {
  ownerId: mongoose.Types.ObjectId;
  cloudName: string;
  apiKey: string;
  apiSecret: string;
  status: NodeStatus;
  active: boolean;
  availableStorageGB: number;
  usedStorageGB: number;
  failureCount: number;
  lastHealthCheck?: Date | null;
  createdAt: Date;
}

const StorageNodeSchema = new Schema<IStorageNodeDoc>(
  {
    ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    cloudName: { type: String, required: true, trim: true },
    apiKey: { type: String, required: true },
    apiSecret: { type: String, required: true },
    status: {
      type: String,
      enum: ["ACTIVE", "OFFLINE", "DISABLED", "FULL"],
      default: "ACTIVE",
    },
    active: { type: Boolean, default: true },
    availableStorageGB: { type: Number, default: 0 },
    usedStorageGB: { type: Number, default: 0 },
    failureCount: { type: Number, default: 0 },
    lastHealthCheck: { type: Date, default: null },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// Indexes
StorageNodeSchema.index({ ownerId: 1 });
StorageNodeSchema.index({ status: 1 });

const StorageNode: Model<IStorageNodeDoc> =
  models.StorageNode || mongoose.model<IStorageNodeDoc>("StorageNode", StorageNodeSchema);
export default StorageNode;
