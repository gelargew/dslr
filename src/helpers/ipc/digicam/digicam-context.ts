// DigiCamControl context bridge for renderer process
import { contextBridge, ipcRenderer } from 'electron';
import { DIGICAM_CONFIG, EXPRESS_CONFIG } from '@/constants/digicam';

export function exposeDigicamContext() {
  try {
    console.log('📷 Exposing DigiCamControl context to renderer...');

    // Expose DigiCamControl API
    contextBridge.exposeInMainWorld('digicamAPI', {
      // Camera capture
      capture: () => {
        console.log('📡 DigiCamControl capture called from renderer');
        return ipcRenderer.invoke('digicam:capture');
      },

      // Status check
      checkStatus: () => {
        console.log('📡 DigiCamControl status check called from renderer');
        return ipcRenderer.invoke('digicam:check-status');
      },

      // Event listeners
      onNewImage: (callback: (data: { original: string; processed: string }) => void) => {
        console.log('📡 DigiCamControl new-image listener registered');
        ipcRenderer.on('digicam:new-image', (_, data) => callback(data));
      },

      removeAllListeners: (channel: string) => {
        console.log('📡 Removing DigiCamControl listeners for channel:', channel);
        ipcRenderer.removeAllListeners(channel);
      }
    });

    // Expose DigiCamControl configuration following documentation
    contextBridge.exposeInMainWorld('dccConfig', {
      liveViewUrl: `${DIGICAM_CONFIG.LIVEVIEW_URL}`,
      photoUrl: 'http://localhost:8777/photos/',
      baseUrl: DIGICAM_CONFIG.BASE_URL,
      captureUrl: DIGICAM_CONFIG.CAPTURE_URL
    });

    console.log('✅ DigiCamControl context exposed successfully');
  } catch (error) {
    console.error('❌ Failed to expose DigiCamControl context:', error);
  }
}