// ============================================================
// VaultFS – Storage Lease Service
// ============================================================

import { connectDB } from "@/lib/db/mongoose";
import StorageLease from "@/lib/models/StorageLease";
import { createEvent } from "./eventLogService";

export async function requestLease(
  consumerId: string,
  providerId: string,
  maxStorageGB: number,
  expiresAt?: string | null
) {
  await connectDB();
  const lease = await StorageLease.create({
    consumerId,
    providerId,
    maxStorageGB,
    status: "PENDING",
    expiresAt: expiresAt ? new Date(expiresAt) : null,
  });

  await createEvent("LEASE_REQUESTED", consumerId, lease._id.toString(), {
    providerId,
    maxStorageGB,
  });

  return lease;
}

export async function approveLease(leaseId: string, providerId: string) {
  await connectDB();
  const lease = await StorageLease.findOneAndUpdate(
    { _id: leaseId, providerId, status: "PENDING" },
    { $set: { status: "ACTIVE" } },
    { new: true }
  ).lean();

  if (lease) {
    await createEvent("LEASE_APPROVED", providerId, leaseId, {
      consumerId: lease.consumerId.toString(),
    });
  }

  return lease;
}

export async function revokeLease(leaseId: string, providerId: string) {
  await connectDB();
  const lease = await StorageLease.findOneAndUpdate(
    { _id: leaseId, providerId, status: "ACTIVE" },
    { $set: { status: "REVOKED" } },
    { new: true }
  ).lean();

  if (lease) {
    await createEvent("LEASE_REVOKED", providerId, leaseId, {
      consumerId: lease.consumerId.toString(),
    });
  }

  return lease;
}

export async function getLeasesByProvider(providerId: string) {
  await connectDB();
  return StorageLease.find({ providerId })
    .populate("consumerId", "name email")
    .sort({ createdAt: -1 })
    .lean();
}

export async function getLeasesByConsumer(consumerId: string) {
  await connectDB();
  return StorageLease.find({ consumerId })
    .populate("providerId", "name email")
    .sort({ createdAt: -1 })
    .lean();
}

export async function getActiveLeaseCount(userId: string): Promise<number> {
  await connectDB();
  return StorageLease.countDocuments({
    $or: [{ providerId: userId }, { consumerId: userId }],
    status: "ACTIVE",
  });
}

export async function getAllUserLeases(userId: string) {
  await connectDB();
  const [asProvider, asConsumer] = await Promise.all([
    StorageLease.find({ providerId: userId })
      .populate("consumerId", "name email image")
      .sort({ createdAt: -1 })
      .lean(),
    StorageLease.find({ consumerId: userId })
      .populate("providerId", "name email image")
      .sort({ createdAt: -1 })
      .lean(),
  ]);

  return { asProvider, asConsumer };
}
