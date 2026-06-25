// ============================================================
// /api/leases/revoke – POST: Revoke an active lease
// ============================================================

import { NextRequest } from "next/server";
import { auth } from "@/lib/auth/auth";
import { revokeLease } from "@/lib/services/storageLeaseService";
import { ok, err } from "@/lib/utils/api";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return err("Unauthorized", 401);

    const { leaseId } = await req.json();
    if (!leaseId) return err("leaseId is required.", 400);

    const lease = await revokeLease(leaseId, session.user.id);
    if (!lease) return err("Lease not found or cannot be revoked.", 404);

    return ok(lease);
  } catch (error) {
    console.error("Revoke lease error:", error);
    return err("Internal server error.", 500);
  }
}
