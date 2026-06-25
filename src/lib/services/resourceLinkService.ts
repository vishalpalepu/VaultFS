// ============================================================
// VaultFS – Resource Link Service
// ============================================================

import { connectDB } from "@/lib/db/mongoose";
import ResourceLink from "@/lib/models/ResourceLink";
import type { RelationType } from "@/types";

export async function createLink(
  sourceResourceId: string,
  targetResourceId: string,
  relation: RelationType
) {
  await connectDB();
  return ResourceLink.create({
    sourceResourceId,
    targetResourceId,
    relation,
  });
}

export async function getLinksByResource(resourceId: string) {
  await connectDB();
  const [outgoing, incoming] = await Promise.all([
    ResourceLink.find({ sourceResourceId: resourceId })
      .populate("targetResourceId", "title type")
      .lean(),
    ResourceLink.find({ targetResourceId: resourceId })
      .populate("sourceResourceId", "title type")
      .lean(),
  ]);

  return { outgoing, incoming };
}

export async function deleteLink(linkId: string) {
  await connectDB();
  return ResourceLink.findByIdAndDelete(linkId);
}
