// Textimoni Photobooth Application Configuration
// Now uses dynamic configuration from config manager

import { configManager } from '@/services/config-manager';

export const APP_CONFIG = {
  // Dynamic Debugger Configuration
  get debugger() {
    try {
      return {
        enabled: configManager.getDebuggerEnabled()
      };
    } catch {
      return {
        enabled: true // Fallback to default
      };
    }
  },

  // Other app-wide configurations can be added here
};
