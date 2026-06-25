// ============================================================
// /api/search – GET: full-text search
// ============================================================

import { NextRequest } from "next/server";
import { auth } from "@/lib/auth/auth";
import { searchResources } from "@/lib/services/searchService";
import { ok, err } from "@/lib/utils/api";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return err("Unauthorized", 401);

    const q = req.nextUrl.searchParams.get("q") || "";
    if (!q.trim()) return ok([]);

    const results = await searchResources(session.user.id, q);
    return ok(results);
  } catch (error) {
    console.error("Search error:", error);
    return err("Internal server error.", 500);
  }
}
