// ============================================================
// /api/cron/health – GET: Cron health worker endpoint
// Runs health checks on all active nodes.
// ============================================================

import { NextRequest } from "next/server";
import { runAllHealthChecks } from "@/lib/services/storageNodeService";
import { ok, err } from "@/lib/utils/api";

export async function GET(req: NextRequest) {
  try {
    // Basic verification using CRON_SECRET if defined
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      const searchParams = req.nextUrl.searchParams;
      const secretParam = searchParams.get("secret");
      if (secretParam !== cronSecret) {
        return err("Unauthorized", 401);
      }
    }

    const result = await runAllHealthChecks();
    return ok({
      message: "Health check completed.",
      ...result,
    });
  } catch (error) {
    console.error("Cron health check error:", error);
    return err("Internal server error.", 500);
  }
}
