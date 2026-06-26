// ============================================================
// /api/folders – POST: create folder, GET: list root folders
// ============================================================

import { NextRequest } from "next/server";
import { auth } from "@/lib/auth/auth";
import { createFolder, getRootFolders, getFolderTree } from "@/lib/services/folderService";
import { ok, err } from "@/lib/utils/api";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return err("Unauthorized", 401);

    const { name, parentFolderId } = await req.json();
    if (!name) return err("Folder name is required.", 400);

    const folder = await createFolder(session.user.id, name, parentFolderId);
    return ok(folder, 201);
  } catch (error) {
    console.error("Create folder error:", error);
    return err("Internal server error.", 500);
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return err("Unauthorized", 401);

    const isTree = req.nextUrl.searchParams.get("tree") === "true";
    if (isTree) {
      const tree = await getFolderTree(session.user.id);
      return ok(tree);
    }

    const folders = await getRootFolders(session.user.id);
    return ok(folders);
  } catch (error) {
    console.error("List folders error:", error);
    return err("Internal server error.", 500);
  }
}
