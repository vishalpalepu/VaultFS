// ============================================================
// /api/folders/[id]/resources – GET resources in a folder
// ============================================================

import { NextRequest } from "next/server";
import { auth } from "@/lib/auth/auth";
import { getResourcesByFolder } from "@/lib/services/resourceService";
import { ok, err } from "@/lib/utils/api";

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: Params) {
  try {
    const session = await auth();
    if (!session?.user?.id) return err("Unauthorized", 401);

    const { id } = await params;
    const resources = await getResourcesByFolder(id, session.user.id);
    return ok(resources);
  } catch (error) {
    console.error("Get folder resources error:", error);
    return err("Internal server error.", 500);
  }
}
