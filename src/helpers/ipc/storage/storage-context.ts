// GCS Storage context for renderer process
import { contextBridge, ipcRenderer } from 'electron';
import { STORAGE_CHANNELS } from './storage-channels';

export function exposeStorageContext() {
  contextBridge.exposeInMainWorld('gcsStorage', {
    // Upload photo to GCS
    uploadPhoto: (photoData: string, filename?: string) =>
      ipcRenderer.invoke(STORAGE_CHANNELS.UPLOAD_PHOTO, photoData, filename),

    // Upload thumbnail to GCS
    uploadThumbnail: (photoData: string, filename?: string) =>
      ipcRenderer.invoke(STORAGE_CHANNELS.UPLOAD_THUMBNAIL, photoData, filename),

    // Delete photo from GCS
    deletePhoto: (gcsPath: string) =>
      ipcRenderer.invoke(STORAGE_CHANNELS.DELETE_PHOTO, gcsPath),

    // Test GCS connection
    testConnection: () =>
      ipcRenderer.invoke(STORAGE_CHANNELS.TEST_GCS_CONNECTION),
  });
}
