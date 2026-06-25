// ============================================================
// /api/folders/[id] – GET, PATCH, DELETE single folder
// ============================================================

import { NextRequest } from "next/server";
import { auth } from "@/lib/auth/auth";
import {
  getFolderById,
  getChildFolders,
  renameFolder,
  deleteFolder,
} from "@/lib/services/folderService";
import { ok, err } from "@/lib/utils/api";

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: Params) {
  try {
    const session = await auth();
    if (!session?.user?.id) return err("Unauthorized", 401);

    const { id } = await params;
    const folder = await getFolderById(id, session.user.id);
    if (!folder) return err("Folder not found.", 404);

    const children = await getChildFolders(id, session.user.id);

    return ok({ folder, children });
  } catch (error) {
    console.error("Get folder error:", error);
    return err("Internal server error.", 500);
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const session = await auth();
    if (!session?.user?.id) return err("Unauthorized", 401);

    const { id } = await params;
    const { name } = await req.json();
    if (!name) return err("Name is required.", 400);

    const folder = await renameFolder(id, session.user.id, name);
    if (!folder) return err("Folder not found.", 404);

    return ok(folder);
  } catch (error) {
    console.error("Rename folder error:", error);
    return err("Internal server error.", 500);
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const session = await auth();
    if (!session?.user?.id) return err("Unauthorized", 401);

    const { id } = await params;
    const folder = await deleteFolder(id, session.user.id);
    if (!folder) return err("Folder not found.", 404);

    return ok({ deleted: true });
  } catch (error) {
    console.error("Delete folder error:", error);
    return err("Internal server error.", 500);
  }
}
