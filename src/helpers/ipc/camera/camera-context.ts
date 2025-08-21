// Camera context bridge for renderer process
import { contextBridge, ipcRenderer } from 'electron';
import { CAMERA_CHANNELS } from './camera-channels';

export function exposeCameraContext() {
  contextBridge.exposeInMainWorld('cameraAPI', {
    getPermissions: () => ipcRenderer.invoke(CAMERA_CHANNELS.GET_PERMISSIONS),
    requestPermissions: () => ipcRenderer.invoke(CAMERA_CHANNELS.REQUEST_PERMISSIONS),
  });
}
