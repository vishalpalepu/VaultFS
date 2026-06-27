// ============================================================
// /api/uploads – POST: upload file to Cloudinary via storage router
// ============================================================

import { NextRequest } from "next/server";
import { auth } from "@/lib/auth/auth";
import { selectStorageNode } from "@/lib/storage/router";
import { uploadToCloudinary } from "@/lib/storage/cloudinary";
import { createResource } from "@/lib/services/resourceService";
import StorageNode from "@/lib/models/StorageNode";
import StorageLease from "@/lib/models/StorageLease";
import { createEvent } from "@/lib/services/eventLogService";
import { ok, err } from "@/lib/utils/api";
import type { ResourceType } from "@/types";

const MAX_UPLOAD_SIZE = 500 * 1024 * 1024; // 500 MB

function getResourceTypeFromMime(mimeType: string): ResourceType {
  if (mimeType.startsWith("image/")) return "IMAGE";
  if (mimeType.startsWith("video/")) return "VIDEO";
  if (mimeType === "application/pdf") return "PDF";
  return "IMAGE"; // fallback
}

function getCloudinaryResourceType(type: ResourceType): "image" | "video" | "raw" | "auto" {
  switch (type) {
    case "VIDEO":
      return "video";
    case "PDF":
      return "raw";
    case "IMAGE":
      return "image";
    default:
      return "auto";
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return err("Unauthorized", 401);

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const title = formData.get("title") as string | null;
    const folderId = formData.get("folderId") as string | null;
    const description = (formData.get("description") as string) || "";
    const tagsRaw = (formData.get("tags") as string) || "";
    const visibility = (formData.get("visibility") as string) || "PRIVATE";
    const hash = (formData.get("hash") as string) || undefined;

    if (!file || !title || !folderId) {
      return err("file, title, and folderId are required.", 400);
    }

    if (file.size > MAX_UPLOAD_SIZE) {
      return err("File exceeds maximum upload size of 500 MB.", 400);
    }

    // 1. Select best storage node
    let selection;
    try {
      selection = await selectStorageNode(session.user.id);
    } catch {
      return err("No active storage nodes available.", 503);
    }

    const { node, leaseId, providerId } = selection;

    // 2. Upload to Cloudinary
    const buffer = Buffer.from(await file.arrayBuffer());
    const resourceType = getResourceTypeFromMime(file.type);
    const cloudinaryType = getCloudinaryResourceType(resourceType);

    const uploadResult = await uploadToCloudinary(node, buffer, {
      folder: `vaultfs/${session.user.id}`,
      resource_type: cloudinaryType,
    });

    // 3. Update node used storage
    const fileSizeGB = file.size / (1024 * 1024 * 1024);
    await StorageNode.updateOne(
      { _id: node._id },
      {
        $inc: { usedStorageGB: fileSizeGB },
      }
    );

    // Check if node is now full
    const updatedNode = await StorageNode.findById(node._id);
    if (updatedNode && updatedNode.usedStorageGB >= updatedNode.availableStorageGB) {
      await StorageNode.updateOne(
        { _id: node._id },
        { $set: { status: "FULL", active: false } }
      );
    }

    // If leased node, update lease used storage and create event log
    if (leaseId && providerId) {
      await StorageLease.updateOne(
        { _id: leaseId },
        { $inc: { usedStorageGB: fileSizeGB } }
      );
      await createEvent("RESOURCE_CREATED", session.user.id, leaseId, {
        leasedNode: true,
        providerId,
        fileSizeGB,
      });
    }

    // 4. Save metadata
    const tags = tagsRaw
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const resource = await createResource({
      ownerId: session.user.id,
      folderId,
      storageNodeId: node._id.toString(),
      type: resourceType,
      title,
      description,
      tags,
      visibility: visibility as "PRIVATE" | "SHARED",
      hash,
      metadata: {
        cloudinaryPublicId: uploadResult.publicId,
        cloudinaryResourceType: uploadResult.resourceType,
        cloudinaryFormat: uploadResult.format,
        secureUrl: uploadResult.secureUrl,
        size: file.size,
        mimeType: file.type,
        cloudName: node.cloudName,
        leased: !!leaseId,
        leaseId,
        providerId,
      },
    });

    return ok(resource, 201);
  } catch (error) {
    console.error("Upload error:", error);
    return err("Internal server error.", 500);
  }
}
