// GCS Storage IPC handlers for main process
import { ipcMain } from 'electron';
import { gcsStorage } from '../../storage/gcs-storage';
import { STORAGE_CHANNELS } from './storage-channels';

export function registerStorageHandlers() {
  console.log('🔌 Registering GCS storage IPC handlers...');

  // Upload photo to GCS
  ipcMain.handle(STORAGE_CHANNELS.UPLOAD_PHOTO, async (event, photoData: string, filename?: string) => {
    try {
      console.log('📤 IPC: Uploading photo to GCS');
      const result = await gcsStorage.uploadPhoto(photoData, filename);
      return { success: true, result };
    } catch (error) {
      console.error('Failed to upload photo to GCS:', error);
      return { success: false, error: error.message };
    }
  });

  // Upload thumbnail to GCS
  ipcMain.handle(STORAGE_CHANNELS.UPLOAD_THUMBNAIL, async (event, photoData: string, filename?: string) => {
    try {
      console.log('📤 IPC: Uploading thumbnail to GCS');
      const result = await gcsStorage.uploadThumbnail(photoData, filename);
      return { success: true, result };
    } catch (error) {
      console.error('Failed to upload thumbnail to GCS:', error);
      return { success: false, error: error.message };
    }
  });

  // Delete photo from GCS
  ipcMain.handle(STORAGE_CHANNELS.DELETE_PHOTO, async (event, gcsPath: string) => {
    try {
      console.log('🗑️ IPC: Deleting photo from GCS');
      await gcsStorage.deletePhoto(gcsPath);
      return { success: true };
    } catch (error) {
      console.error('Failed to delete photo from GCS:', error);
      return { success: false, error: error.message };
    }
  });

  // Test GCS connection
  ipcMain.handle(STORAGE_CHANNELS.TEST_GCS_CONNECTION, async () => {
    try {
      const isConnected = await gcsStorage.testConnection();
      return { success: true, connected: isConnected };
    } catch (error) {
      console.error('GCS connection test failed:', error);
      return { success: false, error: error.message };
    }
  });

  console.log('✅ GCS storage IPC handlers registered');
}
