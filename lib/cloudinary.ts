import { v2 as cloudinary } from "cloudinary";
import { Readable } from "stream";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload a file buffer to Cloudinary
 * @param buffer - File buffer
 * @param folder - Folder path in Cloudinary (default: "yarncheck/profile")
 * @param publicId - Optional public ID for the file (filename without extension)
 * @returns Promise with the uploaded file URL
 */
export async function uploadToCloudinary(
  buffer: Buffer,
  folder: string = "yarncheck/profile",
  publicId?: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        public_id: publicId,
        resource_type: "image",
        transformation: [
          {
            width: 400,
            height: 400,
            crop: "fill",
            gravity: "face",
            quality: "auto",
            fetch_format: "auto",
          },
        ],
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else if (result) {
          resolve(result.secure_url);
        } else {
          reject(new Error("Upload failed: No result returned"));
        }
      }
    );

    // Convert buffer to stream
    const readable = Readable.from(buffer);
    readable.pipe(uploadStream);
  });
}

/**
 * Delete an image from Cloudinary by URL
 * @param url - The Cloudinary URL of the image to delete
 */
export async function deleteFromCloudinary(url: string): Promise<void> {
  try {
    // Extract public_id from URL (handles nested folders like yarncheck/profile/image.png)
    // Cloudinary URL format: https://res.cloudinary.com/cloud_name/image/upload/v1234567890/yarncheck/profile/image_xxx_timestamp.png
    const urlParts = url.split("/");
    const uploadIndex = urlParts.findIndex((part) => part === "upload");
    
    if (uploadIndex === -1) {
      throw new Error("Invalid Cloudinary URL");
    }

    // Get everything after "upload" (version and path)
    const pathAfterUpload = urlParts.slice(uploadIndex + 1).join("/");
    
    // Remove version if present (format: v1234567890/path/to/image.png)
    const pathWithoutVersion = pathAfterUpload.replace(/^v\d+\//, "");
    
    // Remove file extension
    const publicId = pathWithoutVersion.replace(/\.[^/.]+$/, "");

    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error("Error deleting from Cloudinary:", error);
    // Don't throw - allow deletion to fail silently
  }
}

