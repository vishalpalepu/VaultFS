// ============================================================
// /api/storage/health – GET: Run node health checks
// ============================================================

import { NextRequest } from "next/server";
import { auth } from "@/lib/auth/auth";
import { runAllHealthChecks } from "@/lib/services/storageNodeService";
import { ok, err } from "@/lib/utils/api";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) return err("Unauthorized", 401);

    const result = await runAllHealthChecks();
    return ok(result);
  } catch (error) {
    console.error("Storage health check error:", error);
    return err("Internal server error.", 500);
  }
}
