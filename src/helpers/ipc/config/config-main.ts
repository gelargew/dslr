// Configuration IPC handlers for main process (now supports dynamic config)
import { ipcMain } from 'electron';

export function registerConfigHandlers() {
  console.log('🔌 Registering dynamic configuration IPC handlers...');

  // Get current configuration (returns dynamic config from frontend)
  ipcMain.handle('config:get-config', async () => {
    try {
      // Configuration is now managed entirely by the frontend config manager
      // This handler is kept for compatibility but returns basic info
      const basicConfig = {
        message: 'Configuration is now managed by the frontend config manager',
        managedBy: 'frontend',
        storage: 'localStorage'
      };

      console.log('📋 Configuration managed by frontend (localStorage)');

      return {
        success: true,
        config: basicConfig,
      };
    } catch (error) {
      console.error('❌ Failed to get configuration:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  });

  // Save configuration (now forwards to frontend config manager)
  ipcMain.handle('config:save-config', async (_, configData) => {
    try {
      console.log('💾 Configuration save requested - forwarding to frontend config manager');

      // The actual saving is now handled by the frontend config manager
      // This handler just acknowledges the request

      return {
        success: true,
        message: 'Configuration will be saved by frontend config manager',
      };
    } catch (error) {
      console.error('❌ Failed to save configuration:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  });

  // Reset configuration (now forwards to frontend config manager)
  ipcMain.handle('config:reset-config', async () => {
    try {
      console.log('🔄 Configuration reset requested - forwarding to frontend config manager');

      // The actual reset is now handled by the frontend config manager
      // This handler just acknowledges the request

      return {
        success: true,
        message: 'Configuration will be reset by frontend config manager',
      };
    } catch (error) {
      console.error('❌ Failed to reset configuration:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  });

  // Get current DigiCamControl URL for debugging
  ipcMain.handle('config:get-digicam-url', async () => {
    try {
      // This would need to be implemented to get the current URL from the frontend
      // For now, return a placeholder that indicates it should be retrieved from frontend
      return {
        success: true,
        url: 'managed-by-frontend',
        message: 'DigiCamControl URL is managed by frontend config manager'
      };
    } catch (error) {
      console.error('❌ Failed to get DigiCamControl URL:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  });

  console.log('✅ Dynamic configuration IPC handlers registered');
}