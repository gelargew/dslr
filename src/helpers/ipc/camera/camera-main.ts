// Camera IPC handlers for main process
import { ipcMain, systemPreferences, shell } from 'electron';
import { CAMERA_CHANNELS } from './camera-channels';
import { getDigicamproService } from '@/services/digicampro-service';
import { loadConfig } from '@/config/camera-config';
import { DigicamproConfig } from '@/config/camera-config';

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
      } else if (process.platform === 'win32') {
        // Windows - we can't directly check camera permissions via Electron APIs
        // but we can check if camera devices are available
        try {
          // This is a basic check - the actual permission check will happen at WebRTC level
          return {
            success: true,
            hasPermission: true, // Assume granted, will be verified at WebRTC level
            status: 'unknown', // Windows doesn't provide a direct way to check
            platform: 'windows',
            note: 'Windows camera permissions are managed by the system and will be prompted when camera access is requested'
          };
        } catch (error) {
          return {
            success: false,
            hasPermission: false,
            status: 'error',
            error: error.message
          };
        }
      } else {
        // For other platforms (Linux, etc.), assume permission is available
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
      } else if (process.platform === 'win32') {
        // Windows - provide guidance for camera permissions
        console.log('🪟 Windows detected - camera permissions handled by system');

        return {
          success: true,
          hasPermission: true, // We'll let WebRTC handle the actual permission request
          status: 'windows-system-managed',
          platform: 'windows',
          message: 'Camera permissions on Windows are managed by the system. If prompted, please allow camera access.',
          guidance: {
            settings: 'If camera access is blocked, you can enable it in Windows Settings > Privacy & Security > Camera',
            openSettings: async () => {
              // Option to open Windows camera settings
              await shell.openExternal('ms-settings:privacy-webcam');
            }
          }
        };
      } else {
        // For other platforms (Linux, etc.), assume permission is available
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

  // Capture photo from digicampro webserver
  ipcMain.handle(CAMERA_CHANNELS.CAPTURE_FROM_SERVER, async () => {
    try {
      console.log('📸 Capturing photo from digicampro webserver...');

      // Load current configuration
      const config = loadConfig();
      const digicamproService = getDigicamproService(config.digicampro);

      // Capture photo
      const result = await digicamproService.capturePhoto();

      if (result.success) {
        console.log('✅ Photo captured successfully from digicampro');
        return result;
      } else {
        console.error('❌ Failed to capture photo from digicampro:', result.error);
        return result;
      }
    } catch (error) {
      console.error('❌ Digicampro capture error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  });

  // Test digicampro connection
  ipcMain.handle(CAMERA_CHANNELS.TEST_CONNECTION, async (_, configData?: DigicamproConfig) => {
    try {
      console.log('🔍 Testing digicampro connection...');

      // Use provided config or load from file
      let config: DigicamproConfig;
      if (configData) {
        config = configData;
      } else {
        const appConfig = loadConfig();
        config = appConfig.digicampro;
      }

      const digicamproService = getDigicamproService(config);
      const result = await digicamproService.testConnection();

      console.log('📊 Connection test result:', result);
      return result;
    } catch (error) {
      console.error('❌ Digicampro connection test error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  });

  console.log('✅ Camera IPC handlers registered');
}
