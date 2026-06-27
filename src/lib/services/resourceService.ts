// ============================================================
// VaultFS – Resource Service
// ============================================================

import { connectDB } from "@/lib/db/mongoose";
import Resource, { IResourceDoc } from "@/lib/models/Resource";
import { createEvent } from "./eventLogService";
import type { ResourceType, Visibility } from "@/types";

interface CreateResourceInput {
  ownerId: string;
  folderId: string;
  type: ResourceType;
  title: string;
  description?: string;
  tags?: string[];
  visibility?: Visibility;
  hash?: string;
  storageNodeId?: string;
  metadata?: {
    cloudinaryPublicId?: string;
    cloudinaryResourceType?: string;
    cloudinaryFormat?: string;
    secureUrl?: string;
    youtubeUrl?: string;
    externalUrl?: string;
    noteContent?: string;
    size?: number;
    mimeType?: string;
    cloudName?: string;
  };
}

export async function createResource(input: CreateResourceInput): Promise<IResourceDoc> {
  await connectDB();
  const resource = await Resource.create({
    ownerId: input.ownerId,
    folderId: input.folderId,
    storageNodeId: input.storageNodeId || null,
    type: input.type,
    title: input.title,
    description: input.description || "",
    tags: input.tags || [],
    visibility: input.visibility || "PRIVATE",
    hash: input.hash,
    metadata: input.metadata || {},
  });

  await createEvent("RESOURCE_CREATED", input.ownerId, resource._id.toString(), {
    type: input.type,
    folderId: input.folderId,
  });

  return resource;
}

export async function getResourceById(resourceId: string, ownerId: string) {
  await connectDB();
  return Resource.findOne({ _id: resourceId, ownerId }).lean();
}

export async function getResourcesByFolder(folderId: string, ownerId: string) {
  await connectDB();
  return Resource.find({ folderId, ownerId })
    .sort({ createdAt: -1 })
    .lean();
}

export async function updateResource(
  resourceId: string,
  ownerId: string,
  updates: Partial<Pick<CreateResourceInput, "title" | "description" | "tags" | "visibility" | "metadata">>
) {
  await connectDB();
  const resource = await Resource.findOneAndUpdate(
    { _id: resourceId, ownerId },
    { $set: updates },
    { new: true }
  ).lean();

  if (resource) {
    await createEvent("RESOURCE_UPDATED", ownerId, resourceId, {
      updatedFields: Object.keys(updates),
    });
  }

  return resource;
}

export async function deleteResource(resourceId: string, ownerId: string) {
  await connectDB();
  const resource = await Resource.findOneAndDelete({ _id: resourceId, ownerId });

  if (resource) {
    await createEvent("RESOURCE_DELETED", ownerId, resourceId, {
      type: resource.type,
    });
  }

  return resource;
}

export async function getRecentResources(ownerId: string, limit: number = 10) {
  await connectDB();
  return Resource.find({ ownerId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
}

export async function countResources(ownerId: string): Promise<number> {
  await connectDB();
  return Resource.countDocuments({ ownerId });
}
