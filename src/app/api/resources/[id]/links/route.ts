// ============================================================
// /api/resources/[id]/links – GET linked resources
// ============================================================

import { NextRequest } from "next/server";
import { auth } from "@/lib/auth/auth";
import { getLinksByResource } from "@/lib/services/resourceLinkService";
import { ok, err } from "@/lib/utils/api";

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: Params) {
  try {
    const session = await auth();
    if (!session?.user?.id) return err("Unauthorized", 401);

    const { id } = await params;
    const links = await getLinksByResource(id);
    return ok(links);
  } catch (error) {
    console.error("Get resource links error:", error);
    return err("Internal server error.", 500);
  }
}
