// Configuration IPC handlers for main process (simplified for DigiCamControl)
import { ipcMain } from 'electron';

export function registerConfigHandlers() {
  console.log('🔌 Registering simplified configuration IPC handlers...');

  // Get current configuration (returns hardcoded DigiCamControl config)
  ipcMain.handle('config:get-config', async () => {
    try {
      const hardcodedConfig = {
        liveFeedUrl: 'http://127.0.0.1:5513/liveview.jpg',
        captureUrl: 'http://127.0.0.1:5513/json/capture',
        refreshRate: 20,
        timeout: 5000,
        retryAttempts: 3
      };

      console.log('📋 Using hardcoded DigiCamControl configuration');

      return {
        success: true,
        config: hardcodedConfig,
      };
    } catch (error) {
      console.error('❌ Failed to get configuration:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  });

  // Save configuration (no-op since we use hardcoded config)
  ipcMain.handle('config:save-config', async (_, configData) => {
    try {
      console.log('💾 Configuration save requested (using hardcoded setup - no changes saved)');

      return {
        success: true,
      };
    } catch (error) {
      console.error('❌ Failed to save configuration:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  });

  // Reset configuration (no-op)
  ipcMain.handle('config:reset-config', async () => {
    try {
      console.log('🔄 Configuration reset requested (using hardcoded setup)');

      return {
        success: true,
      };
    } catch (error) {
      console.error('❌ Failed to reset configuration:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  });

  console.log('✅ Configuration IPC handlers registered');
}