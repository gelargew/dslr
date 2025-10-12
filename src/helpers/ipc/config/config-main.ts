// Configuration IPC handlers for main process
import { ipcMain } from 'electron';
import { CONFIG_CHANNELS } from './config-channels';
import { loadConfig, saveConfig, DEFAULT_APP_CONFIG, validateConfig } from '@/config/camera-config';

export function registerConfigHandlers() {
  console.log('🔌 Registering configuration IPC handlers...');

  // Get current configuration
  ipcMain.handle(CONFIG_CHANNELS.GET_CONFIG, async () => {
    try {
      const config = loadConfig();
      console.log('📋 Loaded camera configuration:', config.digicampro);

      return {
        success: true,
        config: config.digicampro,
      };
    } catch (error) {
      console.error('❌ Failed to get configuration:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  });

  // Save configuration
  ipcMain.handle(CONFIG_CHANNELS.SAVE_CONFIG, async (_, configData) => {
    try {
      console.log('💾 Saving camera configuration:', configData);

      // Validate configuration
      const validation = validateConfig(configData);
      if (!validation.isValid) {
        console.error('❌ Configuration validation failed:', validation.errors);
        return {
          success: false,
          error: 'Configuration validation failed: ' + validation.errors.join(', '),
        };
      }

      // Load existing config and merge with new digicampro config
      const existingConfig = loadConfig();
      const newConfig = {
        ...existingConfig,
        digicampro: {
          ...existingConfig.digicampro,
          ...configData,
        },
      };

      // Save to file
      const saved = saveConfig(newConfig);

      if (saved) {
        console.log('✅ Camera configuration saved successfully');
        return {
          success: true,
        };
      } else {
        throw new Error('Failed to save configuration file');
      }
    } catch (error) {
      console.error('❌ Failed to save configuration:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  });

  // Reset configuration to defaults
  ipcMain.handle(CONFIG_CHANNELS.RESET_CONFIG, async () => {
    try {
      console.log('🔄 Resetting camera configuration to defaults...');

      const saved = saveConfig(DEFAULT_APP_CONFIG);

      if (saved) {
        console.log('✅ Camera configuration reset successfully');
        return {
          success: true,
        };
      } else {
        throw new Error('Failed to reset configuration file');
      }
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