// ============================================================
// /api/leases/approve – POST: Approve a lease request
// ============================================================

import { NextRequest } from "next/server";
import { auth } from "@/lib/auth/auth";
import { approveLease } from "@/lib/services/storageLeaseService";
import { ok, err } from "@/lib/utils/api";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return err("Unauthorized", 401);

    const { leaseId } = await req.json();
    if (!leaseId) return err("leaseId is required.", 400);

    const lease = await approveLease(leaseId, session.user.id);
    if (!lease) return err("Lease request not found or not in PENDING status.", 404);

    return ok(lease);
  } catch (error) {
    console.error("Approve lease error:", error);
    return err("Internal server error.", 500);
  }
}
