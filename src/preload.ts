// Back to context bridge approach but with correct channel names
const { contextBridge, ipcRenderer } = require('electron');

console.log('🚀 Preload script starting...');

try {
  // Database API
  contextBridge.exposeInMainWorld('photoDatabase', {
    testConnection: () => ipcRenderer.invoke('db:test-connection'),
    getPhotos: (limit) => ipcRenderer.invoke('db:get-photos', limit),
    savePhoto: (photoData) => ipcRenderer.invoke('db:save-photo', photoData),
    deletePhoto: (photoId) => ipcRenderer.invoke('db:delete-photo', photoId),
    getPhotoCount: () => ipcRenderer.invoke('db:get-photo-count'),
    runMigration: () => ipcRenderer.invoke('db:run-migration'),
  });

  // Camera API
  contextBridge.exposeInMainWorld('cameraAPI', {
    getPermissions: () => ipcRenderer.invoke('camera:get-permissions'),
    requestPermissions: () => ipcRenderer.invoke('camera:request-permissions'),
  });

  // Window API
  contextBridge.exposeInMainWorld('electronWindow', {
    minimize: () => ipcRenderer.invoke('window:minimize'),
    maximize: () => ipcRenderer.invoke('window:maximize'),
    close: () => ipcRenderer.invoke('window:close'),
  });

  // DigiCamControl API
  const { exposeDigicamContext } = require('./helpers/ipc/digicam/digicam-context');
  exposeDigicamContext();

  console.log('✅ All APIs exposed via context bridge');
} catch (error) {
  console.error('❌ Failed to expose APIs:', error);
}
