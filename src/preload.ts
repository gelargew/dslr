// Working example preload script - exactly as provided in WORKING_EXAMPLES
import { contextBridge, ipcRenderer } from 'electron';
import { DIGICAM_CONFIG } from './constants/digicam';

// Expose IPC handlers to renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  capture: () => ipcRenderer.invoke('capture'),
  checkDccStatus: () => ipcRenderer.invoke('check-dcc-status'),
  onNewImage: (callback: (data: { original: string; processed: string }) => void) => {
    ipcRenderer.on('new-image', (_, data) => callback(data));
  },
  removeAllListeners: (channel: string) => {
    ipcRenderer.removeAllListeners(channel);
  }
});

// Expose DigiCamControl configuration to renderer
contextBridge.exposeInMainWorld('dccConfig', {
  liveViewUrl: `${DIGICAM_CONFIG.LIVEVIEW_URL}`,
  photoUrl: 'http://localhost:3000/photos/',
  baseUrl: DIGICAM_CONFIG.BASE_URL,
  captureUrl: DIGICAM_CONFIG.CAPTURE_URL
});

// For debugging - also expose the raw configuration
contextBridge.exposeInMainWorld('debugInfo', {
  dccConfig: DIGICAM_CONFIG
});

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

// File API for accessing local files
contextBridge.exposeInMainWorld('fileAPI', {
  readLocalFile: (filePath: string) => ipcRenderer.invoke('file:read-local-file', filePath),
  fileExists: (filePath: string) => ipcRenderer.invoke('file:exists', filePath),
  getPhotoPath: (filename: string) => ipcRenderer.invoke('file:get-photo-path', filename),
});

console.log('✅ All APIs exposed via context bridge');