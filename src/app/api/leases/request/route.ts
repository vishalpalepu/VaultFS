// ============================================================
// /api/leases/request – POST: Request a storage lease
// ============================================================

import { NextRequest } from "next/server";
import { auth } from "@/lib/auth/auth";
import { requestLease } from "@/lib/services/storageLeaseService";
import User from "@/lib/models/User";
import { connectDB } from "@/lib/db/mongoose";
import { ok, err } from "@/lib/utils/api";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return err("Unauthorized", 401);

    const { providerEmail, maxStorageGB, expiresAt } = await req.json();

    if (!providerEmail || maxStorageGB === undefined) {
      return err("providerEmail and maxStorageGB are required.", 400);
    }

    await connectDB();
    const provider = await User.findOne({ email: providerEmail.toLowerCase() });
    if (!provider) {
      return err("Provider user email not found.", 404);
    }

    if (provider._id.toString() === session.user.id) {
      return err("You cannot request a lease from yourself.", 400);
    }

    const lease = await requestLease(
      session.user.id,
      provider._id.toString(),
      Number(maxStorageGB),
      expiresAt
    );

    return ok(lease, 201);
  } catch (error) {
    console.error("Request lease error:", error);
    return err("Internal server error.", 500);
  }
}
