// Camera context bridge for renderer process
import { contextBridge, ipcRenderer } from 'electron';
import { CAMERA_CHANNELS } from './camera-channels';
import { DigicamproConfig } from '@/config/camera-config';

export function exposeCameraContext() {
  try {
    console.log('📷 Exposing camera context to renderer...');
    contextBridge.exposeInMainWorld('cameraAPI', {
      getPermissions: () => {
        console.log('📡 Camera getPermissions called from renderer');
        return ipcRenderer.invoke(CAMERA_CHANNELS.GET_PERMISSIONS);
      },
      requestPermissions: () => {
        console.log('📡 Camera requestPermissions called from renderer');
        return ipcRenderer.invoke(CAMERA_CHANNELS.REQUEST_PERMISSIONS);
      },
      // New digicampro methods
      captureFromServer: () => {
        console.log('📡 Camera captureFromServer called from renderer');
        return ipcRenderer.invoke(CAMERA_CHANNELS.CAPTURE_FROM_SERVER);
      },
      testConnection: (config: DigicamproConfig) => {
        console.log('📡 Camera testConnection called from renderer');
        return ipcRenderer.invoke(CAMERA_CHANNELS.TEST_CONNECTION, config);
      },
    });
    console.log('✅ Camera context exposed successfully');
  } catch (error) {
    console.error('❌ Failed to expose camera context:', error);
  }
}
