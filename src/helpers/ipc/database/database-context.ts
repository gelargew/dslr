// Database context for renderer process
import { contextBridge, ipcRenderer } from 'electron';
import { DATABASE_CHANNELS } from './database-channels';

export function exposeDatabaseContext() {
  try {
    console.log('🔌 Exposing database context to renderer...');
    contextBridge.exposeInMainWorld('photoDatabase', {
      // Test connection
      testConnection: () => {
        console.log('📡 Database testConnection called from renderer');
        return ipcRenderer.invoke(DATABASE_CHANNELS.TEST_CONNECTION);
      },

      // Save photo with metadata
      savePhoto: (photoData: any) => {
        console.log('📡 Database savePhoto called from renderer');
        return ipcRenderer.invoke(DATABASE_CHANNELS.SAVE_PHOTO, photoData);
      },

      // Get recent photos
      getPhotos: (limit?: number) => {
        console.log('📡 Database getPhotos called from renderer');
        return ipcRenderer.invoke(DATABASE_CHANNELS.GET_PHOTOS, limit);
      },

      // Delete photo
      deletePhoto: (photoId: string) => {
        console.log('📡 Database deletePhoto called from renderer');
        return ipcRenderer.invoke(DATABASE_CHANNELS.DELETE_PHOTO, photoId);
      },

      // Get photo count
      getPhotoCount: () => {
        console.log('📡 Database getPhotoCount called from renderer');
        return ipcRenderer.invoke(DATABASE_CHANNELS.GET_PHOTO_COUNT);
      },

      // Run migration
      runMigration: () => {
        console.log('📡 Database runMigration called from renderer');
        return ipcRenderer.invoke(DATABASE_CHANNELS.RUN_MIGRATION);
      },
    });
    console.log('✅ Database context exposed successfully');
  } catch (error) {
    console.error('❌ Failed to expose database context:', error);
  }
}
