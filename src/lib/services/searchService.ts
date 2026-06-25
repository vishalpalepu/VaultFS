// ============================================================
// VaultFS – Search Service (MongoDB Text Index)
// ============================================================

import { connectDB } from "@/lib/db/mongoose";
import Resource from "@/lib/models/Resource";

export async function searchResources(ownerId: string, query: string) {
  await connectDB();

  if (!query || query.trim().length === 0) {
    return [];
  }

  return Resource.find({
    ownerId,
    $text: { $search: query },
  })
    .select({ score: { $meta: "textScore" } })
    .sort({ score: { $meta: "textScore" } })
    .limit(50)
    .lean();
}
