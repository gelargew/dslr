// Import dynamically to avoid bundling issues in renderer
let Storage: typeof import('@google-cloud/storage').Storage;
let GCS_CONFIG: typeof import('../../config/gcs-config').GCS_CONFIG;

import { randomUUID } from 'crypto';

// GCS client instance
let storage: import('@google-cloud/storage').Storage | null = null;
let bucket: import('@google-cloud/storage').Bucket | null = null;

// Validate and fix private key format
function validatePrivateKey(credentials: Record<string, unknown>) {
  if (credentials && credentials.private_key && typeof credentials.private_key === 'string') {
    // Ensure proper line endings in private key
    credentials.private_key = credentials.private_key
      .replace(/\\n/g, '\n')
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n');

    // Ensure it starts and ends with proper markers
    if (!credentials.private_key.includes('-----BEGIN PRIVATE KEY-----')) {
      console.warn('⚠️ Private key does not contain proper BEGIN marker');
    }
    if (!credentials.private_key.includes('-----END PRIVATE KEY-----')) {
      console.warn('⚠️ Private key does not contain proper END marker');
    }
  }
  return credentials;
}

async function initializeGCS() {
  if (!storage) {
    // Dynamic imports to work around Vite bundling issues
    if (!Storage) {
      const gcsModule = await import('@google-cloud/storage');
      Storage = gcsModule.Storage;

      const config = await import('../../config/gcs-config');
      GCS_CONFIG = config.GCS_CONFIG;
    }

    try {
      // Try credentials object first (from environment variables)
      if (GCS_CONFIG.credentials) {
        console.log('🔐 Using credentials from environment variables');
        const validatedCredentials = validatePrivateKey(GCS_CONFIG.credentials);
        storage = new Storage({
          projectId: GCS_CONFIG.projectId,
          credentials: validatedCredentials,
        });
      } else {
        // Fallback to key file
        console.log(`🔐 Using service account key from: ${GCS_CONFIG.keyFilename}`);
        storage = new Storage({
          projectId: GCS_CONFIG.projectId,
          keyFilename: GCS_CONFIG.keyFilename,
        });
      }
    } catch (credentialError) {
      console.warn('⚠️ Could not load service account credentials:', (credentialError as Error).message);

      // Final fallback: try with default credentials
      try {
        storage = new Storage({
          projectId: GCS_CONFIG.projectId,
        });

        console.log('🔐 Using default credentials (environment variable or metadata server)');
      } catch (fallbackError) {
        console.error('❌ Failed to initialize GCS with any credential method:', fallbackError);
        throw new Error(`GCS initialization failed: ${(fallbackError as Error).message}`);
      }
    }

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
      throw new Error(`Failed to upload photo: ${(error as Error).message}`);
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
      throw new Error(`Failed to upload thumbnail: ${(error as Error).message}`);
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
      await bucket!.getFiles({ maxResults: 1 });

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
