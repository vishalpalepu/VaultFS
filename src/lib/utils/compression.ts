/**
 * VaultFS – Automatic Media Compression Utility
 * Zero-dependency client-side file compression and validation
 */

export interface CompressionResult {
  success: boolean;
  file?: File;
  error?: string;
}

const MB = 1024 * 1024;

export async function compressFileIfNeeded(file: File): Promise<CompressionResult> {
  const fileType = file.type;
  const fileName = file.name.toLowerCase();

  // 1. Check if VIDEO
  if (fileType.startsWith("video/") || fileName.endsWith(".mp4") || fileName.endsWith(".mov") || fileName.endsWith(".webm") || fileName.endsWith(".mkv") || fileName.endsWith(".3gp") || fileName.endsWith(".avi")) {
    if (file.size > 100 * MB) {
      return {
        success: false,
        error: `Video file size (${(file.size / MB).toFixed(1)} MB) exceeds the Cloudinary limit of 100 MB. Please select a smaller video or compress it before uploading.`,
      };
    }
    return { success: true, file };
  }

  // 2. Check if IMAGE
  if (fileType.startsWith("image/") || fileName.endsWith(".jpg") || fileName.endsWith(".jpeg") || fileName.endsWith(".png") || fileName.endsWith(".webp")) {
    // If <= 5 MB, no compression needed for upload speed/limits
    if (file.size <= 5 * MB) {
      return { success: true, file };
    }

    try {
      // Compress image to < 5 MB using HTML5 Canvas
      const compressedFile = await compressImage(file, 5 * MB);
      if (compressedFile.size > 10 * MB) {
        return {
          success: false,
          error: `Image file size (${(compressedFile.size / MB).toFixed(1)} MB) exceeds the maximum limit of 10 MB even after compression.`,
        };
      }
      return { success: true, file: compressedFile };
    } catch (err) {
      console.error("Image compression error:", err);
      // Fallback check against max 10MB limit if canvas compression failed
      if (file.size > 10 * MB) {
        return {
          success: false,
          error: `Image file size (${(file.size / MB).toFixed(1)} MB) exceeds the maximum limit of 10 MB.`,
        };
      }
      return { success: true, file };
    }
  }

  // 3. RAW / OTHER files (PDF, zip, doc, etc.)
  if (file.size > 10 * MB) {
    return {
      success: false,
      error: `Raw file size (${(file.size / MB).toFixed(1)} MB) exceeds the Cloudinary limit of 10 MB. Raw binary files cannot be automatically compressed without data loss. Please reduce the file size before uploading.`,
    };
  }

  return { success: true, file };
}

function compressImage(file: File, targetSize: number): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      let width = img.width;
      let height = img.height;
      const maxDim = 2048;

      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        return resolve(file);
      }

      ctx.drawImage(img, 0, 0, width, height);

      let quality = 0.8;
      const attemptCompression = () => {
        canvas.toBlob(
          (blob) => {
            if (!blob) return resolve(file);

            if (blob.size <= targetSize || quality <= 0.2) {
              const compressedFile = new File([blob], file.name, {
                type: blob.type || "image/jpeg",
              });
              resolve(compressedFile);
            } else {
              quality -= 0.15;
              attemptCompression();
            }
          },
          "image/jpeg",
          quality
        );
      };

      attemptCompression();
    };

    img.onerror = (err) => reject(err);
    img.src = objectUrl;
  });
}
