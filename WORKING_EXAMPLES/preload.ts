import { contextBridge, ipcRenderer } from 'electron';
import { DIGICAM_CONFIG } from './constants/digicam';

// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

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
