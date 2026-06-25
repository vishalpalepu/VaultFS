// ============================================================
// /api/resource-links – POST: create resource link
// ============================================================

import { NextRequest } from "next/server";
import { auth } from "@/lib/auth/auth";
import { createLink } from "@/lib/services/resourceLinkService";
import { ok, err } from "@/lib/utils/api";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return err("Unauthorized", 401);

    const { sourceResourceId, targetResourceId, relation } = await req.json();

    if (!sourceResourceId || !targetResourceId || !relation) {
      return err("sourceResourceId, targetResourceId, and relation are required.", 400);
    }

    const validRelations = ["REFERENCES", "RELATED", "CHILD"];
    if (!validRelations.includes(relation)) {
      return err("Invalid relation type.", 400);
    }

    const link = await createLink(sourceResourceId, targetResourceId, relation);
    return ok(link, 201);
  } catch (error) {
    console.error("Create resource link error:", error);
    return err("Internal server error.", 500);
  }
}
