// ============================================================
// /api/leases – GET: List all leases (as provider and consumer)
// ============================================================

import { NextRequest } from "next/server";
import { auth } from "@/lib/auth/auth";
import { getAllUserLeases } from "@/lib/services/storageLeaseService";
import { ok, err } from "@/lib/utils/api";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) return err("Unauthorized", 401);

    const leases = await getAllUserLeases(session.user.id);
    return ok(leases);
  } catch (error) {
    console.error("List leases error:", error);
    return err("Internal server error.", 500);
  }
}
