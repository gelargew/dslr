// Import dynamically to avoid bundling issues in renderer
let Storage: any;
let GCS_CONFIG: any;

import path from 'path';
import { writeFile, unlink } from 'fs/promises';
import { randomUUID } from 'crypto';

// GCS client instance
let storage: any = null;
let bucket: any = null;

async function initializeGCS() {
  if (!storage) {
    // Dynamic imports to work around Vite bundling issues
    if (!Storage) {
      const gcsModule = await import('@google-cloud/storage');
      Storage = gcsModule.Storage;

      const config = await import('../../config/gcs-config');
      GCS_CONFIG = config.GCS_CONFIG;
    }

    storage = new Storage({
      projectId: GCS_CONFIG.projectId,
      keyFilename: GCS_CONFIG.keyFilename,
    });

    bucket = storage.bucket(GCS_CONFIG.bucketName);
    console.log(`🌩️ GCS initialized for bucket: ${GCS_CONFIG.bucketName}`);
  }
}

export interface UploadResult {
  publicUrl: string;
  filename: string;
  gcsPath: string;
}

export class GCSStorage {
  async uploadPhoto(photoData: string, originalFilename?: string): Promise<UploadResult> {
    await initializeGCS();

    try {
      // Generate unique filename
      const timestamp = Date.now();
      const uniqueId = randomUUID().split('-')[0];
      const extension = originalFilename?.split('.').pop() || 'jpg';
      const filename = `photos/${timestamp}-${uniqueId}.${extension}`;

      console.log('☁️ Uploading photo to GCS:', filename);

      // Convert base64 to buffer
      const imageBuffer = Buffer.from(photoData.replace(/^data:image\/\w+;base64,/, ''), 'base64');

      // Create file in bucket
      const file = bucket.file(filename);

      // Upload the buffer
      await file.save(imageBuffer, {
        ...GCS_CONFIG.uploadOptions,
        metadata: {
          ...GCS_CONFIG.uploadOptions.metadata,
          contentType: `image/${extension}`,
          contentDisposition: 'inline',
        },
      });

      // File is publicly accessible via uniform bucket-level access

      const publicUrl = GCS_CONFIG.getPublicUrl(filename);

      console.log('✅ Photo uploaded successfully:', publicUrl);

      return {
        publicUrl,
        filename,
        gcsPath: filename,
      };
    } catch (error) {
      console.error('❌ GCS upload failed:', error);
      throw new Error(`Failed to upload photo: ${error.message}`);
    }
  }

  async uploadThumbnail(photoData: string, originalFilename?: string): Promise<UploadResult> {
    await initializeGCS();

    try {
      // Generate thumbnail filename
      const timestamp = Date.now();
      const uniqueId = randomUUID().split('-')[0];
      const extension = originalFilename?.split('.').pop() || 'jpg';
      const filename = `thumbnails/${timestamp}-${uniqueId}-thumb.${extension}`;

      console.log('🖼️ Uploading thumbnail to GCS:', filename);

      // Convert base64 to buffer
      const imageBuffer = Buffer.from(photoData.replace(/^data:image\/\w+;base64,/, ''), 'base64');

      // Create file in bucket
      const file = bucket.file(filename);

      // Upload with smaller cache settings for thumbnails
      await file.save(imageBuffer, {
        resumable: false,
        validation: 'crc32c',
        metadata: {
          contentType: `image/${extension}`,
          contentDisposition: 'inline',
          cacheControl: 'public, max-age=604800', // Cache for 1 week
        },
      });

      // File is publicly accessible via uniform bucket-level access

      const publicUrl = GCS_CONFIG.getPublicUrl(filename);

      console.log('✅ Thumbnail uploaded successfully:', publicUrl);

      return {
        publicUrl,
        filename,
        gcsPath: filename,
      };
    } catch (error) {
      console.error('❌ GCS thumbnail upload failed:', error);
      throw new Error(`Failed to upload thumbnail: ${error.message}`);
    }
  }

  async deletePhoto(gcsPath: string): Promise<void> {
    await initializeGCS();

    try {
      console.log('🗑️ Deleting photo from GCS:', gcsPath);

      const file = bucket.file(gcsPath);
      await file.delete();

      console.log('✅ Photo deleted from GCS');
    } catch (error) {
      console.error('❌ GCS delete failed:', error);
      // Don't throw - deletion failures shouldn't break the app
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      await initializeGCS();

      // Test by listing files (but limit to 1)
      const [files] = await bucket.getFiles({ maxResults: 1 });

      console.log('✅ GCS connection test successful');
      return true;
    } catch (error) {
      console.error('❌ GCS connection test failed:', error);
      return false;
    }
  }
}

// Export singleton
export const gcsStorage = new GCSStorage();
