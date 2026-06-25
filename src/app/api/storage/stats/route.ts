// ============================================================
// /api/storage/stats – GET: Storage statistics
// ============================================================

import { NextRequest } from "next/server";
import { auth } from "@/lib/auth/auth";
import { getStorageStats } from "@/lib/services/storageNodeService";
import { countResources } from "@/lib/services/resourceService";
import { getActiveLeaseCount } from "@/lib/services/storageLeaseService";
import { ok, err } from "@/lib/utils/api";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) return err("Unauthorized", 401);

    const stats = await getStorageStats(session.user.id);
    const resourceCount = await countResources(session.user.id);
    const activeLeaseCount = await getActiveLeaseCount(session.user.id);

    return ok({
      ...stats,
      totalResources: resourceCount,
      activeLeases: activeLeaseCount,
    });
  } catch (error) {
    console.error("Storage stats error:", error);
    return err("Internal server error.", 500);
  }
}
