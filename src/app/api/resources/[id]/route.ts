// ============================================================
// /api/resources/[id] – GET, PATCH, DELETE single resource
// ============================================================

import { NextRequest } from "next/server";
import { auth } from "@/lib/auth/auth";
import mongoose from "mongoose";
import {
  getResourceById,
  updateResource,
  deleteResource,
} from "@/lib/services/resourceService";
import { getNodeById } from "@/lib/services/storageNodeService";
import { deleteFromCloudinary, getCloudinaryUrl } from "@/lib/storage/cloudinary";
import { ok, err } from "@/lib/utils/api";

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: Params) {
  try {
    const session = await auth();
    if (!session?.user?.id) return err("Unauthorized", 401);

    const { id } = await params;

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return err("Invalid resource ID.", 400);
    }

    const resource = await getResourceById(id, session.user.id);
    if (!resource) return err("Resource not found.", 404);

    // Generate access URL if stored on Cloudinary
    let accessUrl: string | null = null;
    if (resource.storageNodeId && resource.metadata?.cloudinaryPublicId) {
      const node = await getNodeById(resource.storageNodeId.toString());
      if (node) {
        const resourceType =
          resource.type === "VIDEO"
            ? "video"
            : "image";
        accessUrl = getCloudinaryUrl(node, resource.metadata.cloudinaryPublicId, resourceType);
      }
    }

    return ok({ ...resource, accessUrl });
  } catch (error) {
    console.error("Get resource error:", error);
    return err("Internal server error.", 500);
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const session = await auth();
    if (!session?.user?.id) return err("Unauthorized", 401);

    const { id } = await params;
    const body = await req.json();
    const { title, description, tags, visibility, metadata } = body;

    const updates: Record<string, unknown> = {};
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (tags !== undefined) updates.tags = tags;
    if (visibility !== undefined) updates.visibility = visibility;
    if (metadata !== undefined) updates.metadata = metadata;

    const resource = await updateResource(id, session.user.id, updates);
    if (!resource) return err("Resource not found.", 404);

    return ok(resource);
  } catch (error) {
    console.error("Update resource error:", error);
    return err("Internal server error.", 500);
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const session = await auth();
    if (!session?.user?.id) return err("Unauthorized", 401);

    const { id } = await params;
    const resource = await getResourceById(id, session.user.id);
    if (!resource) return err("Resource not found.", 404);

    // Delete from Cloudinary if applicable
    if (resource.storageNodeId && resource.metadata?.cloudinaryPublicId) {
      const node = await getNodeById(resource.storageNodeId.toString());
      if (node) {
        const resourceType =
          resource.type === "VIDEO" ? "video" : "image";
        try {
          await deleteFromCloudinary(node, resource.metadata.cloudinaryPublicId, resourceType);
        } catch (e) {
          console.warn("Failed to delete from Cloudinary:", e);
        }
      }
    }

    await deleteResource(id, session.user.id);
    return ok({ deleted: true });
  } catch (error) {
    console.error("Delete resource error:", error);
    return err("Internal server error.", 500);
  }
}
