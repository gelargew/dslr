// Working example preload script - exactly as provided in WORKING_EXAMPLES
import { contextBridge, ipcRenderer } from 'electron';
import { DIGICAM_CONFIG } from './constants/digicam';
import { API_BASE_URL, API_KEY, API_ENDPOINTS } from './constants/api-constants';

// Expose IPC handlers to renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  capture: () => ipcRenderer.invoke('capture'),
  checkDccStatus: () => ipcRenderer.invoke('check-dcc-status'),
  downloadPhoto: (filename: string) => ipcRenderer.invoke('digicam:download-photo', filename),
  startLiveView: () => ipcRenderer.invoke('digicam:start-live-view'),
  stopLiveView: () => ipcRenderer.invoke('digicam:stop-live-view'),
  onNewImage: (callback: (data: { original: string; processed: string }) => void) => {
    ipcRenderer.on('new-image', (_, data) => callback(data));
  },
  onLogMessage: (callback: (data: { id: string; timestamp: string; level: string; message: string }) => void) => {
    ipcRenderer.on('log-message', (_, data) => callback(data));
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

// HTTP API for backend communication
contextBridge.exposeInMainWorld('httpAPI', {
  // Photo draft upload (after capture)
  uploadPhotoDraft: (file: File, groupCode: string) => {
    return new Promise((resolve, reject) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('pin', groupCode);

      const headers = {
        'x-api-key': API_KEY,
        'x-device-pin': groupCode,
      };

      fetch(`${API_BASE_URL}${API_ENDPOINTS.UPLOAD_PHOTO_DRAFT}`, {
        method: 'POST',
        headers,
        body: formData,
      })
        .then(response => response.json())
        .then(data => resolve(data))
        .catch(error => reject(error));
    });
  },

  // Final photo upload (after editing)
  uploadPhoto: (file: File, groupCode: string, frame?: string, iconData?: string, photoDraftId?: string) => {
    return new Promise((resolve, reject) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('pin', groupCode);
      if (frame) formData.append('frame', frame);
      if (iconData) formData.append('iconData', iconData);
      if (photoDraftId) formData.append('photoDraftId', photoDraftId);

      const headers = {
        'x-api-key': API_KEY,
        'x-device-pin': groupCode,
      };

      fetch(`${API_BASE_URL}${API_ENDPOINTS.UPLOAD_PHOTO}`, {
        method: 'POST',
        headers,
        body: formData,
      })
        .then(response => response.json())
        .then(data => resolve(data))
        .catch(error => reject(error));
    });
  },

  // Get photo drafts for videotron
  getPhotoDrafts: (groupCode: string) => {
    return new Promise((resolve, reject) => {
      const headers = {
        'x-api-key': API_KEY,
        'x-device-pin': groupCode,
      };

      fetch(`${API_BASE_URL}${API_ENDPOINTS.GET_PHOTO_DRAFTS}?code=${encodeURIComponent(groupCode)}`, {
        method: 'GET',
        headers,
      })
        .then(response => response.json())
        .then(data => resolve(data))
        .catch(error => reject(error));
    });
  },

  // Get photos for videotron
  getPhotos: (groupCode: string) => {
    return new Promise((resolve, reject) => {
      const headers = {
        'x-api-key': API_KEY,
        'x-device-pin': groupCode,
      };

      fetch(`${API_BASE_URL}${API_ENDPOINTS.GET_PHOTOS}?code=${encodeURIComponent(groupCode)}`, {
        method: 'GET',
        headers,
      })
        .then(response => response.json())
        .then(data => resolve(data))
        .catch(error => reject(error));
    });
  },
});

// Configuration API
contextBridge.exposeInMainWorld('configAPI', {
  getConfig: () => ipcRenderer.invoke('config:get-config'),
  saveConfig: (configData) => ipcRenderer.invoke('config:save-config', configData),
  resetConfig: () => ipcRenderer.invoke('config:reset-config'),
});

console.log('✅ All APIs exposed via context bridge');