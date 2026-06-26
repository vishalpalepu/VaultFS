// ============================================================
// /api/storage/nodes – POST: Create node, GET: List nodes
// ============================================================

import { NextRequest } from "next/server";
import { auth } from "@/lib/auth/auth";
import { createNode, getNodesByOwner } from "@/lib/services/storageNodeService";
import { ok, err } from "@/lib/utils/api";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return err("Unauthorized", 401);

    const { cloudName, apiKey, apiSecret, availableStorageGB } = await req.json();

    if (!cloudName || !apiKey || !apiSecret || availableStorageGB === undefined) {
      return err("cloudName, apiKey, apiSecret, and availableStorageGB are required.", 400);
    }

    const node = await createNode({
      ownerId: session.user.id,
      cloudName,
      apiKey,
      apiSecret,
      availableStorageGB: Number(availableStorageGB),
    });

    return ok(node, 201);
  } catch (error: any) {
    console.error("Create storage node error:", error);
    return err(error.message || "Internal server error.", 400);
  }
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) return err("Unauthorized", 401);

    const nodes = await getNodesByOwner(session.user.id);
    return ok(nodes);
  } catch (error) {
    console.error("List storage nodes error:", error);
    return err("Internal server error.", 500);
  }
}
