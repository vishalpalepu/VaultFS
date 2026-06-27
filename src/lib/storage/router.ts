// ============================================================
// VaultFS – Storage Router
// Capacity-aware node selection algorithm
// ============================================================

import { connectDB } from "@/lib/db/mongoose";
import StorageNode, { IStorageNodeDoc } from "@/lib/models/StorageNode";
import StorageLease from "@/lib/models/StorageLease";
import { pingNode } from "@/lib/storage/cloudinary";

const HEALTH_SCORES: Record<string, number> = {
  ACTIVE: 100,
  OFFLINE: 0,
  FULL: 0,
  DISABLED: 0,
};

function calculateScore(node: IStorageNodeDoc): number {
  const healthScore = HEALTH_SCORES[node.status] ?? 0;
  return node.availableStorageGB * 0.8 + healthScore * 0.2;
}

/**
 * Select the best storage node for a given user.
 *
 * 1. Get user-owned nodes.
 * 2. Get active leases where user is consumer.
 * 3. Get nodes accessible through those leases (direct only — no multi-hop).
 * 4. Merge all accessible nodes.
 * 5. Remove non-ACTIVE nodes.
 * 6. Score nodes.
 * 7. Return highest-score node.
 */
export async function selectStorageNode(
  userId: string
): Promise<{ node: IStorageNodeDoc; leaseId?: string; providerId?: string }> {
  await connectDB();

  // 1. User-owned nodes
  const ownedNodes = await StorageNode.find({ ownerId: userId });

  // 2. Active leases where user is consumer
  const leases = await StorageLease.find({
    consumerId: userId,
    status: "ACTIVE",
    $or: [{ expiresAt: null }, { expiresAt: { $gt: new Date() } }],
  });

  // Filter out leases where usedStorageGB >= maxStorageGB
  const validLeases = leases.filter((l) => (l.usedStorageGB || 0) < l.maxStorageGB);

  // 3. Get leased node provider IDs (direct only)
  const providerIds = validLeases.map((l) => l.providerId);

  // 4. Get provider's ACTIVE nodes
  const leasedNodes =
    providerIds.length > 0
      ? await StorageNode.find({ ownerId: { $in: providerIds } })
      : [];

  // 5. Merge all nodes
  const allNodes = [...ownedNodes, ...leasedNodes];

  // 6. Filter: only ACTIVE status
  const eligible = allNodes.filter((n) => n.status === "ACTIVE");

  if (eligible.length === 0) {
    throw new Error("No active storage nodes available.");
  }

  // 7. Score and sort highest first
  const sortedEligible = eligible.sort((a, b) => calculateScore(b) - calculateScore(a));

  for (const node of sortedEligible) {
    const isHealthy = await pingNode({
      cloudName: node.cloudName,
      apiKey: node.apiKey,
      apiSecret: node.apiSecret,
    });

    if (isHealthy) {
      // Check if this node came from a lease
      const matchingLease = validLeases.find((l) => l.providerId.toString() === node.ownerId.toString());
      if (matchingLease) {
        return { node, leaseId: matchingLease._id.toString(), providerId: matchingLease.providerId.toString() };
      }
      return { node };
    } else {
      // Mark invalid/failing node as OFFLINE so it is taken out of rotation
      await StorageNode.updateOne({ _id: node._id }, { $set: { status: "OFFLINE", active: false } });
    }
  }

  throw new Error("No active and healthy storage nodes available. Please check your Cloudinary credentials.");
}
