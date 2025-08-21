// IPC channels for database operations
export const DATABASE_CHANNELS = {
  TEST_CONNECTION: 'db:test-connection',
  SAVE_PHOTO: 'db:save-photo',
  GET_PHOTOS: 'db:get-photos',
  DELETE_PHOTO: 'db:delete-photo',
  GET_PHOTO_COUNT: 'db:get-photo-count',
  RUN_MIGRATION: 'db:run-migration',
} as const;
