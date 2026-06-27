import { NextRequest } from "next/server";
import { auth } from "@/lib/auth/auth";
import mongoose from "mongoose";
import { getResourceById } from "@/lib/services/resourceService";
import { getNodeById } from "@/lib/services/storageNodeService";
import { getCloudinaryUrl } from "@/lib/storage/cloudinary";
import { err } from "@/lib/utils/api";

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: Params) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new Response("Unauthorized", { status: 401 });
    }

    const { id } = await params;

    // Validate resource ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return new Response("Invalid resource ID", { status: 400 });
    }

    const resource = await getResourceById(id, session.user.id);
    if (!resource) {
      return new Response("Resource not found", { status: 404 });
    }

    if (!resource.storageNodeId || !resource.metadata?.cloudinaryPublicId) {
      return new Response("Storage metadata missing", { status: 400 });
    }

    const node = await getNodeById(resource.storageNodeId.toString());
    if (!node) {
      return new Response("Storage node not found", { status: 404 });
    }

    let resourceType = resource.metadata.cloudinaryResourceType;
    let format = resource.metadata.cloudinaryFormat;

    // Fallback for older resources uploaded before cloudinaryResourceType was added to metadata
    if (!resourceType && resource.metadata.secureUrl) {
      if (resource.metadata.secureUrl.includes("/image/upload/")) {
        resourceType = "image";
        if (resource.metadata.secureUrl.endsWith(".pdf")) {
          format = "pdf";
        }
      } else if (resource.metadata.secureUrl.includes("/video/upload/")) {
        resourceType = "video";
      } else {
        resourceType = "raw";
      }
    }

    if (!resourceType) {
      resourceType = "raw";
    }
    
    // Generate the Cloudinary URL (using the SDK configuration)
    const cloudinaryUrl = getCloudinaryUrl(
      node,
      resource.metadata.cloudinaryPublicId,
      resourceType,
      format
    );

    // Fetch the file from Cloudinary (on the server-side, bypassing CORS and client restrictions)
    const response = await fetch(cloudinaryUrl);
    if (!response.ok) {
      console.error(`Failed to fetch raw file from Cloudinary: ${response.status} ${response.statusText}`);
      return new Response("Failed to retrieve file from storage", { status: response.status });
    }

    // Determine the MIME type
    const mimeType = resource.metadata.mimeType || "application/pdf";

    // Return the response stream with inline content-disposition
    return new Response(response.body, {
      headers: {
        "Content-Type": mimeType,
        "Content-Disposition": "inline",
        "Cache-Control": "public, max-age=31536000",
      },
    });
  } catch (error) {
    console.error("Proxy route error:", error);
    return new Response("Internal server error", { status: 500 });
  }
}
