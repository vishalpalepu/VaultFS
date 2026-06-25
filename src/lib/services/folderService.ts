// ============================================================
// VaultFS – Folder Service
// ============================================================

import { connectDB } from "@/lib/db/mongoose";
import Folder, { IFolderDoc } from "@/lib/models/Folder";

export async function createFolder(
  ownerId: string,
  name: string,
  parentFolderId?: string | null
): Promise<IFolderDoc> {
  await connectDB();
  return Folder.create({
    ownerId,
    name,
    parentFolderId: parentFolderId || null,
  });
}

export async function getFolderById(folderId: string, ownerId: string) {
  await connectDB();
  return Folder.findOne({ _id: folderId, ownerId }).lean();
}

export async function getRootFolders(ownerId: string) {
  await connectDB();
  return Folder.find({ ownerId, parentFolderId: null })
    .sort({ name: 1 })
    .lean();
}

export async function getChildFolders(parentFolderId: string, ownerId: string) {
  await connectDB();
  return Folder.find({ ownerId, parentFolderId })
    .sort({ name: 1 })
    .lean();
}

export async function renameFolder(
  folderId: string,
  ownerId: string,
  name: string
) {
  await connectDB();
  return Folder.findOneAndUpdate(
    { _id: folderId, ownerId },
    { name },
    { new: true }
  ).lean();
}

export async function deleteFolder(folderId: string, ownerId: string) {
  await connectDB();
  // Delete folder and all children recursively
  const childFolders = await Folder.find({ parentFolderId: folderId, ownerId });
  for (const child of childFolders) {
    await deleteFolder(child._id.toString(), ownerId);
  }
  return Folder.findOneAndDelete({ _id: folderId, ownerId });
}

/**
 * Builds the full folder tree for a user (used in sidebar).
 */
export async function getFolderTree(ownerId: string) {
  await connectDB();
  const allFolders = await Folder.find({ ownerId }).sort({ name: 1 }).lean();

  interface FolderNode {
    _id: string;
    name: string;
    parentFolderId: string | null;
    children: FolderNode[];
  }

  const folderMap = new Map<string, FolderNode>();
  const roots: FolderNode[] = [];

  for (const f of allFolders) {
    folderMap.set(f._id.toString(), {
      _id: f._id.toString(),
      name: f.name,
      parentFolderId: f.parentFolderId?.toString() || null,
      children: [],
    });
  }

  for (const node of folderMap.values()) {
    if (node.parentFolderId && folderMap.has(node.parentFolderId)) {
      folderMap.get(node.parentFolderId)!.children.push(node);
    } else {
      roots.push(node);
    }
  }

  return roots;
}
