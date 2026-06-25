// ============================================================
// /api/storage/nodes/[id] – PATCH: Update storage node
// ============================================================

import { NextRequest } from "next/server";
import { auth } from "@/lib/auth/auth";
import { updateNode } from "@/lib/services/storageNodeService";
import { ok, err } from "@/lib/utils/api";

interface Params {
  params: Promise<{ id: string }>;
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const session = await auth();
    if (!session?.user?.id) return err("Unauthorized", 401);

    const { id } = await params;
    const body = await req.json();
    const { cloudName, apiKey, apiSecret, availableStorageGB } = body;

    const updates: Record<string, any> = {};
    if (cloudName !== undefined) updates.cloudName = cloudName;
    if (apiKey !== undefined) updates.apiKey = apiKey;
    if (apiSecret !== undefined) updates.apiSecret = apiSecret;
    if (availableStorageGB !== undefined) updates.availableStorageGB = Number(availableStorageGB);

    const node = await updateNode(id, session.user.id, updates);
    if (!node) return err("Storage node not found or unauthorized.", 404);

    return ok(node);
  } catch (error) {
    console.error("Update storage node error:", error);
    return err("Internal server error.", 500);
  }
}
