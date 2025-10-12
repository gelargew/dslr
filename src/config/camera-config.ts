// Digicampro Camera Configuration
import path from 'path';
import { app } from 'electron';

// Configuration interface for digicampro camera
export interface DigicamproConfig {
  liveFeedUrl: string;
  captureUrl: string;
  refreshRate: number; // fps (default 20)
  timeout: number; // milliseconds
  retryAttempts: number;
}

// Default configuration
export const DEFAULT_DIGICAMPRO_CONFIG: DigicamproConfig = {
  liveFeedUrl: 'http://192.168.1.100:8080/live.jpg',
  captureUrl: 'http://192.168.1.100:8080/capture',
  refreshRate: 20, // 20fps
  timeout: 5000,
  retryAttempts: 3,
};

// Full app configuration structure
export interface AppConfig {
  digicampro: DigicamproConfig;
}

// Default app configuration
export const DEFAULT_APP_CONFIG: AppConfig = {
  digicampro: DEFAULT_DIGICAMPRO_CONFIG,
};

// Get configuration file path
export const getConfigPath = () => {
  const userDataPath = app.getPath('userData');
  return path.join(userDataPath, 'camera-config.json');
};

// Load configuration from file
export const loadConfig = (): AppConfig => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const fs = require('fs');
    const configPath = getConfigPath();

    if (fs.existsSync(configPath)) {
      const configData = fs.readFileSync(configPath, 'utf8');
      const config = JSON.parse(configData);

      // Merge with defaults to ensure all properties exist
      return {
        digicampro: {
          ...DEFAULT_DIGICAMPRO_CONFIG,
          ...config.digicampro,
        },
      };
    }
  } catch (error) {
    console.error('Failed to load camera config:', error);
  }

  return DEFAULT_APP_CONFIG;
};

// Save configuration to file
export const saveConfig = (config: AppConfig): boolean => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const fs = require('fs');
    const configPath = getConfigPath();

    // Ensure directory exists
    const configDir = path.dirname(configPath);
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }

    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    console.log('Camera configuration saved to:', configPath);
    return true;
  } catch (error) {
    console.error('Failed to save camera config:', error);
    return false;
  }
};

// Validate configuration
export const validateConfig = (config: Partial<DigicamproConfig>): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!config.liveFeedUrl) {
    errors.push('Live feed URL is required');
  } else {
    try {
      new URL(config.liveFeedUrl);
    } catch {
      errors.push('Live feed URL is not valid');
    }
  }

  if (!config.captureUrl) {
    errors.push('Capture URL is required');
  } else {
    try {
      new URL(config.captureUrl);
    } catch {
      errors.push('Capture URL is not valid');
    }
  }

  if (config.refreshRate !== undefined) {
    if (typeof config.refreshRate !== 'number' || config.refreshRate < 1 || config.refreshRate > 60) {
      errors.push('Refresh rate must be between 1 and 60 fps');
    }
  }

  if (config.timeout !== undefined) {
    if (typeof config.timeout !== 'number' || config.timeout < 1000 || config.timeout > 30000) {
      errors.push('Timeout must be between 1000 and 30000 milliseconds');
    }
  }

  if (config.retryAttempts !== undefined) {
    if (typeof config.retryAttempts !== 'number' || config.retryAttempts < 0 || config.retryAttempts > 10) {
      errors.push('Retry attempts must be between 0 and 10');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};