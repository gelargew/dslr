// IPC channels for GCS storage operations
export const STORAGE_CHANNELS = {
  UPLOAD_PHOTO: 'storage:upload-photo',
  UPLOAD_THUMBNAIL: 'storage:upload-thumbnail',
  DELETE_PHOTO: 'storage:delete-photo',
  TEST_GCS_CONNECTION: 'storage:test-connection',
} as const;
