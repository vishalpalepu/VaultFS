// ============================================================
// VaultFS – Cloudinary Client Factory
// Per-node dynamic credentials instantiation
// ============================================================

import { v2 as cloudinary, ConfigOptions } from "cloudinary";
import type { IStorageNodeDoc } from "@/lib/models/StorageNode";

/**
 * Returns a configured Cloudinary instance for the given storage node.
 * Each call configures a fresh instance using the node's credentials.
 */
export function getCloudinaryInstance(node: {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
}): typeof cloudinary {
  const config: ConfigOptions = {
    cloud_name: node.cloudName,
    api_key: node.apiKey,
    api_secret: node.apiSecret,
    secure: true,
  };

  cloudinary.config(config);
  return cloudinary;
}

/**
 * Pings a Cloudinary node to check health.
 */
export async function pingNode(node: {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
}): Promise<boolean> {
  try {
    const cld = getCloudinaryInstance(node);
    const result = await cld.api.ping();
    return result?.status === "ok";
  } catch {
    return false;
  }
}

/**
 * Uploads a file buffer to Cloudinary.
 */
export async function uploadToCloudinary(
  node: { cloudName: string; apiKey: string; apiSecret: string },
  fileBuffer: Buffer,
  options: {
    folder?: string;
    resource_type?: "image" | "video" | "raw" | "auto";
    public_id?: string;
  } = {}
): Promise<{
  publicId: string;
  secureUrl: string;
  bytes: number;
  format: string;
  resourceType: string;
}> {
  const cld = getCloudinaryInstance(node);

  return new Promise((resolve, reject) => {
    const uploadStream = cld.uploader.upload_stream(
      {
        folder: options.folder || "vaultfs",
        resource_type: options.resource_type || "auto",
        public_id: options.public_id,
      },
      (error, result) => {
        if (error) return reject(error);
        if (!result) return reject(new Error("No result from Cloudinary upload"));
        resolve({
          publicId: result.public_id,
          secureUrl: result.secure_url,
          bytes: result.bytes,
          format: result.format,
          resourceType: result.resource_type,
        });
      }
    );
    uploadStream.end(fileBuffer);
  });
}

/**
 * Deletes a resource from Cloudinary.
 */
export async function deleteFromCloudinary(
  node: { cloudName: string; apiKey: string; apiSecret: string },
  publicId: string,
  resourceType: string = "image"
): Promise<void> {
  const cld = getCloudinaryInstance(node);
  await cld.uploader.destroy(publicId, {
    resource_type: resourceType,
  });
}

/**
 * Generates a signed URL for secure access to a Cloudinary resource.
 */
export function getCloudinaryUrl(
  node: { cloudName: string; apiKey: string; apiSecret: string },
  publicId: string,
  resourceType: string = "image"
): string {
  const cld = getCloudinaryInstance(node);
  if (resourceType === "video") {
    return cld.url(publicId, { resource_type: "video", secure: true });
  }
  if (resourceType === "raw") {
    return cld.url(publicId, { resource_type: "raw", secure: true });
  }
  return cld.url(publicId, { secure: true });
}
