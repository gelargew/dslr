// Camera IPC handlers for main process
import { ipcMain, systemPreferences } from 'electron';
import { CAMERA_CHANNELS } from './camera-channels';

export function registerCameraHandlers() {
  console.log('🔌 Registering camera IPC handlers...');

  // Get camera permissions status
  ipcMain.handle(CAMERA_CHANNELS.GET_PERMISSIONS, async () => {
    try {
      if (process.platform === 'darwin') {
        // macOS permission check
        const status = systemPreferences.getMediaAccessStatus('camera');
        return {
          success: true,
          hasPermission: status === 'granted',
          status: status
        };
      } else {
        // For other platforms, assume permission is available
        return {
          success: true,
          hasPermission: true,
          status: 'granted'
        };
      }
    } catch (error) {
      console.error('Failed to get camera permissions:', error);
      return {
        success: false,
        hasPermission: false,
        error: error.message
      };
    }
  });

  // Request camera permissions
  ipcMain.handle(CAMERA_CHANNELS.REQUEST_PERMISSIONS, async () => {
    try {
      if (process.platform === 'darwin') {
        console.log('🍎 macOS detected - requesting camera permissions...');

        // First check current status
        const currentStatus = systemPreferences.getMediaAccessStatus('camera');
        console.log('📹 Current camera permission status:', currentStatus);

        if (currentStatus === 'granted') {
          return {
            success: true,
            hasPermission: true,
            status: 'granted'
          };
        }

        if (currentStatus === 'denied') {
          console.log('❌ Camera permission was previously denied');
          return {
            success: false,
            hasPermission: false,
            status: 'denied',
            error: 'Camera permission was denied. Please enable it in System Settings > Privacy & Security > Camera'
          };
        }

        // Request permission
        console.log('📱 Requesting camera permission from user...');
        const granted = await systemPreferences.askForMediaAccess('camera');
        console.log('🎯 Permission result:', granted);

        return {
          success: true,
          hasPermission: granted,
          status: granted ? 'granted' : 'denied'
        };
      } else {
        // For other platforms, assume permission is available
        return {
          success: true,
          hasPermission: true,
          status: 'granted'
        };
      }
    } catch (error) {
      console.error('❌ Failed to request camera permissions:', error);
      return {
        success: false,
        hasPermission: false,
        error: error.message
      };
    }
  });

  console.log('✅ Camera IPC handlers registered');
}
