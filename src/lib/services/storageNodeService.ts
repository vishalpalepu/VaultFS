// ============================================================
// VaultFS – Storage Node Service
// ============================================================

import { connectDB } from "@/lib/db/mongoose";
import StorageNode, { IStorageNodeDoc } from "@/lib/models/StorageNode";
import { pingNode } from "@/lib/storage/cloudinary";
import { createEvent } from "./eventLogService";

interface CreateNodeInput {
  ownerId: string;
  cloudName: string;
  apiKey: string;
  apiSecret: string;
  availableStorageGB: number;
}

export async function createNode(input: CreateNodeInput): Promise<IStorageNodeDoc> {
  await connectDB();

  // Pre-validate credentials before saving
  const isValid = await pingNode({
    cloudName: input.cloudName,
    apiKey: input.apiKey,
    apiSecret: input.apiSecret,
  });

  if (!isValid) {
    throw new Error("Invalid Cloudinary credentials. Please verify your Cloud Name, API Key, and API Secret.");
  }

  const node = await StorageNode.create({
    ownerId: input.ownerId,
    cloudName: input.cloudName,
    apiKey: input.apiKey,
    apiSecret: input.apiSecret,
    availableStorageGB: input.availableStorageGB,
    usedStorageGB: 0,
    status: "ACTIVE",
    active: true,
    failureCount: 0,
  });

  await createEvent("NODE_ADDED", input.ownerId, node._id.toString(), {
    cloudName: input.cloudName,
  });

  return node;
}

export async function getNodesByOwner(ownerId: string) {
  await connectDB();
  return StorageNode.find({ ownerId }).sort({ createdAt: -1 }).lean();
}

export async function getNodeById(nodeId: string) {
  await connectDB();
  return StorageNode.findById(nodeId).lean();
}

export async function updateNode(
  nodeId: string,
  ownerId: string,
  updates: Partial<Pick<IStorageNodeDoc, "cloudName" | "apiKey" | "apiSecret" | "availableStorageGB">>
) {
  await connectDB();
  const node = await StorageNode.findOneAndUpdate(
    { _id: nodeId, ownerId },
    { $set: updates },
    { new: true }
  ).lean();

  if (node) {
    await createEvent("NODE_UPDATED", ownerId, nodeId, {
      updatedFields: Object.keys(updates),
    });
  }

  return node;
}

export async function disableNode(nodeId: string, ownerId: string) {
  await connectDB();
  const node = await StorageNode.findOneAndUpdate(
    { _id: nodeId, ownerId },
    { $set: { status: "DISABLED", active: false } },
    { new: true }
  ).lean();

  if (node) {
    await createEvent("NODE_DISABLED", ownerId, nodeId);
  }

  return node;
}

/**
 * Run health check on a single node.
 * After 3 consecutive failures → OFFLINE.
 */
export async function healthCheckNode(node: IStorageNodeDoc) {
  await connectDB();
  const isHealthy = await pingNode({
    cloudName: node.cloudName,
    apiKey: node.apiKey,
    apiSecret: node.apiSecret,
  });

  if (isHealthy) {
    await StorageNode.updateOne(
      { _id: node._id },
      {
        $set: {
          status: node.availableStorageGB <= 0 ? "FULL" : "ACTIVE",
          active: node.availableStorageGB > 0,
          failureCount: 0,
          lastHealthCheck: new Date(),
        },
      }
    );
  } else {
    const newFailureCount = (node.failureCount || 0) + 1;
    const update: Record<string, unknown> = {
      failureCount: newFailureCount,
      lastHealthCheck: new Date(),
    };

    if (newFailureCount >= 3) {
      update.status = "OFFLINE";
      update.active = false;
    }

    await StorageNode.updateOne({ _id: node._id }, { $set: update });
  }
}

/**
 * Run health checks on ALL active/non-disabled nodes.
 */
export async function runAllHealthChecks() {
  await connectDB();
  const nodes = await StorageNode.find({
    status: { $in: ["ACTIVE", "OFFLINE"] },
  });

  for (const node of nodes) {
    await healthCheckNode(node);
  }

  return { checked: nodes.length };
}

/**
 * Get aggregated storage statistics for a user.
 */
export async function getStorageStats(ownerId: string) {
  await connectDB();
  const nodes = await StorageNode.find({ ownerId }).lean();

  let totalAvailable = 0;
  let totalUsed = 0;
  let activeCount = 0;

  for (const n of nodes) {
    totalAvailable += n.availableStorageGB;
    totalUsed += n.usedStorageGB;
    if (n.status === "ACTIVE") activeCount++;
  }

  return {
    totalNodes: nodes.length,
    activeNodes: activeCount,
    totalAvailableGB: totalAvailable,
    totalUsedGB: totalUsed,
    nodes,
  };
}
