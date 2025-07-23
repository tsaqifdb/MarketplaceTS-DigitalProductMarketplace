import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Upload raw files (images, PDFs, etc.) without any processing
export async function uploadRawFile(file: File, folder: string = 'marketplace-ts/assets'): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'auto', // Auto-detect file type
        // No transformations - keep original file
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result?.secure_url || '');
      }
    ).end(buffer);
  });
}

// Upload product thumbnails (for display purposes only)
export async function uploadThumbnail(file: File, folder: string = 'marketplace-ts/thumbnails'): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
        // Keep original quality for thumbnails
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result?.secure_url || '');
      }
    ).end(buffer);
  });
}

// Upload product content files (PDFs, ZIPs, etc.)
export async function uploadProductFile(file: File, folder: string = 'marketplace-ts/products'): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'auto', // Auto-detect: pdf, zip, etc.
        // Keep original file without any processing
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result?.secure_url || '');
      }
    ).end(buffer);
  });
}

export async function deleteFile(publicId: string): Promise<void> {
  await cloudinary.uploader.destroy(publicId);
}

export function extractPublicId(url: string): string {
  const parts = url.split('/');
  const lastPart = parts[parts.length - 1];
  // Remove file extension and get public ID
  return lastPart.split('.')[0];
}

export function getFileExtension(url: string): string {
  const parts = url.split('.');
  return parts[parts.length - 1].toLowerCase();
}
