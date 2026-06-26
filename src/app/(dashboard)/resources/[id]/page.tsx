import React from "react";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import { getResourceById } from "@/lib/services/resourceService";
import { getNodeById } from "@/lib/services/storageNodeService";
import { getCloudinaryUrl } from "@/lib/storage/cloudinary";
import { ResourceViewer } from "@/components/resources/ResourceViewer";
import Link from "next/link";
import type { IResource } from "@/types";

interface PageProps {
  params: Promise<{ id: string }>;
}

export const revalidate = 0; // Fresh updates on each load

export default async function ResourcePage({ params }: PageProps) {
  const session = await auth();
  const userId = session!.user.id;

  const { id } = await params;
  const resource = await getResourceById(id, userId);

  if (!resource) {
    notFound();
  }

  // Generate secure Cloudinary URL if applicable
  let accessUrl: string | undefined;
  if (resource.storageNodeId && resource.metadata?.cloudinaryPublicId) {
    const node = await getNodeById(resource.storageNodeId.toString());
    if (node) {
      const resourceType =
        resource.type === "VIDEO"
          ? "video"
          : "image";
      const format = resource.type === "PDF" ? "pdf" : undefined;
      accessUrl = getCloudinaryUrl(node, resource.metadata.cloudinaryPublicId, resourceType, format);
    }
  }

  // Format to match serializable structure
  const serializedResource: IResource & { accessUrl?: string } = {
    _id: resource._id.toString(),
    ownerId: resource.ownerId.toString(),
    folderId: resource.folderId.toString(),
    storageNodeId: resource.storageNodeId ? resource.storageNodeId.toString() : null,
    type: resource.type,
    title: resource.title,
    description: resource.description,
    tags: resource.tags,
    visibility: resource.visibility,
    hash: resource.hash,
    metadata: {
      cloudinaryPublicId: resource.metadata?.cloudinaryPublicId,
      youtubeUrl: resource.metadata?.youtubeUrl,
      externalUrl: resource.metadata?.externalUrl,
      noteContent: resource.metadata?.noteContent,
      size: resource.metadata?.size,
      mimeType: resource.metadata?.mimeType,
      cloudName: resource.metadata?.cloudName,
    },
    accessUrl,
    createdAt: resource.createdAt.toISOString(),
    updatedAt: resource.updatedAt.toISOString(),
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
