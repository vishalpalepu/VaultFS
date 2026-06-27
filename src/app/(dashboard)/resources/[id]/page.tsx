import React from "react";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import { getResourceById } from "@/lib/services/resourceService";
import { getNodeById } from "@/lib/services/storageNodeService";
import { getCloudinaryUrl } from "@/lib/storage/cloudinary";
import { ResourceViewer } from "@/components/resources/ResourceViewer";
import Link from "next/link";
import mongoose from "mongoose";
import type { IResource } from "@/types";

interface PageProps {
  params: Promise<{ id: string }>;
}

export const revalidate = 0; // Fresh updates on each load

export default async function ResourcePage({ params }: PageProps) {
  const session = await auth();
  const userId = session!.user.id;

  const { id } = await params;

  // Validate ObjectId format to prevent CastError
  if (!mongoose.Types.ObjectId.isValid(id)) {
    notFound();
  }

  const resource = await getResourceById(id, userId);

  if (!resource) {
    notFound();
  }

  // Generate secure Cloudinary URL if applicable
  let accessUrl: string | undefined;

  // For PDFs, prefer the stored secureUrl from Cloudinary (direct iframe-compatible URL)
  if (resource.type === "PDF" && resource.metadata?.secureUrl) {
    accessUrl = resource.metadata.secureUrl;
  } else if (resource.storageNodeId && resource.metadata?.cloudinaryPublicId) {
    const node = await getNodeById(resource.storageNodeId.toString());
    if (node) {
      const resourceType =
        resource.type === "VIDEO"
          ? "video"
          : "image";
      accessUrl = getCloudinaryUrl(node, resource.metadata.cloudinaryPublicId, resourceType);
    }
  }

  // Serialize to plain object - JSON round-trip ensures no Mongoose/BSON objects remain
  const plainResource = JSON.parse(JSON.stringify(resource));

  const serializedResource: IResource & { accessUrl?: string } = {
    _id: String(plainResource._id),
    ownerId: String(plainResource.ownerId),
    folderId: String(plainResource.folderId),
    storageNodeId: plainResource.storageNodeId ? String(plainResource.storageNodeId) : null,
    type: plainResource.type,
    title: plainResource.title,
    description: plainResource.description,
    tags: plainResource.tags || [],
    visibility: plainResource.visibility,
    hash: plainResource.hash,
    metadata: {
      cloudinaryPublicId: plainResource.metadata?.cloudinaryPublicId,
      secureUrl: plainResource.metadata?.secureUrl,
      youtubeUrl: plainResource.metadata?.youtubeUrl,
      externalUrl: plainResource.metadata?.externalUrl,
      noteContent: plainResource.metadata?.noteContent,
      size: plainResource.metadata?.size,
      mimeType: plainResource.metadata?.mimeType,
      cloudName: plainResource.metadata?.cloudName,
    },
    accessUrl,
    createdAt: plainResource.createdAt,
    updatedAt: plainResource.updatedAt,
  };

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div>
        <Link
          href={`/folders/${serializedResource.folderId}`}
          className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white transition-colors group"
        >
          <svg
            className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Folder
        </Link>
      </div>

      {/* Main Viewer component */}
      <ResourceViewer resource={serializedResource} />
    </div>
  );
}
