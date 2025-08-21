// Database context for renderer process
import { contextBridge, ipcRenderer } from 'electron';
import { DATABASE_CHANNELS } from './database-channels';

export function exposeDatabaseContext() {
  contextBridge.exposeInMainWorld('photoDatabase', {
        // Test connection
    testConnection: () => ipcRenderer.invoke(DATABASE_CHANNELS.TEST_CONNECTION),

    // Save photo with metadata
    savePhoto: (photoData: any) => ipcRenderer.invoke(DATABASE_CHANNELS.SAVE_PHOTO, photoData),

    // Get recent photos
    getPhotos: (limit?: number) => ipcRenderer.invoke(DATABASE_CHANNELS.GET_PHOTOS, limit),

    // Delete photo
    deletePhoto: (photoId: string) => ipcRenderer.invoke(DATABASE_CHANNELS.DELETE_PHOTO, photoId),

    // Get photo count
    getPhotoCount: () => ipcRenderer.invoke(DATABASE_CHANNELS.GET_PHOTO_COUNT),

    // Run migration
    runMigration: () => ipcRenderer.invoke(DATABASE_CHANNELS.RUN_MIGRATION),
  });
}
