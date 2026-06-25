// ============================================================
// /api/storage/nodes/[id]/disable – POST: Disable storage node
// ============================================================

import { NextRequest } from "next/server";
import { auth } from "@/lib/auth/auth";
import { disableNode } from "@/lib/services/storageNodeService";
import { ok, err } from "@/lib/utils/api";

interface Params {
  params: Promise<{ id: string }>;
}

export async function POST(req: NextRequest, { params }: Params) {
  try {
    const session = await auth();
    if (!session?.user?.id) return err("Unauthorized", 401);

    const { id } = await params;
    const node = await disableNode(id, session.user.id);
    if (!node) return err("Storage node not found or unauthorized.", 404);

    return ok(node);
  } catch (error) {
    console.error("Disable storage node error:", error);
    return err("Internal server error.", 500);
  }
}
