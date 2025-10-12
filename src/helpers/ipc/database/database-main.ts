// Database IPC handlers for main process
import { ipcMain } from 'electron';
import { photoDatabase, PhotoRecord } from '../../database/turso-client';
import { DATABASE_CHANNELS } from './database-channels';
import { runMigrationFromMain } from '../../database/migration';

export function registerDatabaseHandlers() {
  console.log('🔌 Registering database IPC handlers...');

  // Test connection
  ipcMain.handle(DATABASE_CHANNELS.TEST_CONNECTION, async () => {
    try {
      const isConnected = await photoDatabase.testConnection();
      return { success: true, connected: isConnected };
    } catch (error) {
      console.error('Database connection test failed:', error);
      return { success: false, error: error.message };
    }
  });

  // Save photo
  ipcMain.handle(DATABASE_CHANNELS.SAVE_PHOTO, async (event, photoData) => {
    try {
      console.log('📤 IPC: Saving photo to database');

      // Extract HTTP URL from metadata if available
      const httpUrl = photoData.metadata?.httpUrl;

      // Prepare photo data for database with HTTP URL as file_path
      const dbPhotoData = {
        ...photoData,
        file_path: httpUrl || `data:image/jpeg;base64,${photoData.photoData}`, // Use HTTP URL or fallback to base64
      };

      const savedPhoto = await photoDatabase.savePhoto(dbPhotoData);

      // Notify all windows about new photo (for videotron)
      // You can broadcast to other windows here if needed

      return { success: true, photo: savedPhoto };
    } catch (error) {
      console.error('Failed to save photo:', error);
      return { success: false, error: error.message };
    }
  });

  // Get photos
  ipcMain.handle(DATABASE_CHANNELS.GET_PHOTOS, async (event, limit = 50) => {
    try {
      console.log('📥 IPC: Fetching photos from database');
      const photos = await photoDatabase.getRecentPhotos(limit);
      return { success: true, photos };
    } catch (error) {
      console.error('Failed to get photos:', error);
      return { success: false, error: error.message };
    }
  });

  // Delete photo
  ipcMain.handle(DATABASE_CHANNELS.DELETE_PHOTO, async (event, photoId: string) => {
    try {
      console.log('🗑️ IPC: Deleting photo from database');
      await photoDatabase.deletePhoto(photoId);
      return { success: true };
    } catch (error) {
      console.error('Failed to delete photo:', error);
      return { success: false, error: error.message };
    }
  });

  // Get photo count
  ipcMain.handle(DATABASE_CHANNELS.GET_PHOTO_COUNT, async () => {
    try {
      const count = await photoDatabase.getPhotoCount();
      return { success: true, count };
    } catch (error) {
      console.error('Failed to get photo count:', error);
      return { success: false, error: error.message };
    }
  });

  // Run migration
  ipcMain.handle(DATABASE_CHANNELS.RUN_MIGRATION, async () => {
    try {
      console.log('🔄 Running database migration...');
      const result = await runMigrationFromMain();
      return result;
    } catch (error) {
      console.error('❌ Migration failed:', error);
      return { success: false, error: error.message };
    }
  });

  console.log('✅ Database IPC handlers registered');
}
