// Google Cloud Storage Configuration
export const GCS_CONFIG = {
  projectId: 'plabs-444812',
  bucketName: 'general-plabs',
  keyFilename: './credentials/gcs.json', // Path relative to main process

  // Upload settings
  uploadOptions: {
    resumable: false,
    validation: 'crc32c',
    metadata: {
      cacheControl: 'public, max-age=31536000', // Cache for 1 year
    },
  },

  // Generate public URL
  getPublicUrl: (filename: string) =>
    `https://storage.googleapis.com/${GCS_CONFIG.bucketName}/${filename}`,
};
