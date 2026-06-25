// ============================================================
// /api/resources – POST: create resource, GET: list recent
// ============================================================

import { NextRequest } from "next/server";
import { auth } from "@/lib/auth/auth";
import {
  createResource,
  getRecentResources,
} from "@/lib/services/resourceService";
import { ok, err } from "@/lib/utils/api";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return err("Unauthorized", 401);

    const body = await req.json();
    const { folderId, type, title, description, tags, visibility, metadata, hash } = body;

    if (!folderId || !type || !title) {
      return err("folderId, type, and title are required.", 400);
    }

    const resource = await createResource({
      ownerId: session.user.id,
      folderId,
      type,
      title,
      description,
      tags,
      visibility,
      metadata,
      hash,
    });

    return ok(resource, 201);
  } catch (error) {
    console.error("Create resource error:", error);
    return err("Internal server error.", 500);
  }
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) return err("Unauthorized", 401);

    const resources = await getRecentResources(session.user.id, 20);
    return ok(resources);
  } catch (error) {
    console.error("List resources error:", error);
    return err("Internal server error.", 500);
  }
}
