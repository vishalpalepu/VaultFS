import mongoose, { Schema, Document, Model, models } from "mongoose";
import type { LeaseStatus } from "@/types";

export interface IStorageLeaseDoc extends Document {
  providerId: mongoose.Types.ObjectId;
  consumerId: mongoose.Types.ObjectId;
  maxStorageGB: number;
  usedStorageGB: number;
  status: LeaseStatus;
  expiresAt?: Date | null;
  createdAt: Date;
}

const StorageLeaseSchema = new Schema<IStorageLeaseDoc>(
  {
    providerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    consumerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    maxStorageGB: { type: Number, required: true },
    usedStorageGB: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["PENDING", "ACTIVE", "REVOKED"],
      default: "PENDING",
    },
    expiresAt: { type: Date, default: null },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// Indexes
StorageLeaseSchema.index({ providerId: 1, consumerId: 1 });
StorageLeaseSchema.index({ consumerId: 1, status: 1 });

const StorageLease: Model<IStorageLeaseDoc> =
  models.StorageLease || mongoose.model<IStorageLeaseDoc>("StorageLease", StorageLeaseSchema);
export default StorageLease;
