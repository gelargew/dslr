// Configuration Manager for Textimoni Photobooth
// Handles localStorage-based configuration with defaults and validation

export interface AppConfig {
  appId: string;           // Random 8-character alphanumeric ID
  debugger: {
    enabled: boolean;      // Debugger interface toggle
  };
  digicam: {
    baseUrl: string;       // DigiCamControl web server URL
  };
}

// Custom event for configuration changes
export interface ConfigChangeEvent extends CustomEvent {
  detail: {
    key: string;
    value: any;
    config: AppConfig;
  };
}

// Register the custom event type
declare global {
  interface WindowEventMap {
    'config-change': ConfigChangeEvent;
  }
}

const DEFAULT_CONFIG: AppConfig = {
  appId: '', // Will be generated on first run
  debugger: {
    enabled: true
  },
  digicam: {
    baseUrl: 'http://127.0.0.1:5513'
  }
};

const STORAGE_KEY = 'textimoni-app-config';

class ConfigManager {
  private config: AppConfig | null = null;
  private static instanceCount = 0;
  private readonly instanceId: string;
  private storageEventListener: ((event: StorageEvent) => void) | null = null;

  constructor() {
    // Generate unique instance ID for debugging
    ConfigManager.instanceCount++;
    this.instanceId = `ConfigManager-${ConfigManager.instanceCount}-${Date.now()}`;

    console.log(`🆔 ConfigManager instance created: ${this.instanceId} (Total instances: ${ConfigManager.instanceCount})`);

    this.loadConfig();
    this.setupStorageListener();
  }

  /**
   * Setup localStorage event listener for cross-instance communication
   */
  private setupStorageListener(): void {
    this.storageEventListener = (event: StorageEvent) => {
      // Only handle events for our storage key and from other windows/tabs
      if (event.key === STORAGE_KEY && event.oldValue !== event.newValue) {
        console.log(`🔄 ${this.instanceId} - Storage change detected:`, {
          key: event.key,
          oldValue: event.oldValue ? JSON.parse(event.oldValue).debugger?.enabled : 'undefined',
          newValue: event.newValue ? JSON.parse(event.newValue).debugger?.enabled : 'undefined'
        });

        // Reload config from localStorage
        const oldEnabled = this.config?.debugger.enabled;
        this.loadConfig(); // This will update this.config

        // Check if debugger enabled state changed
        if (oldEnabled !== this.config?.debugger.enabled) {
          console.log(`🔄 ${this.instanceId} - Debugger state changed via storage event: ${oldEnabled} → ${this.config?.debugger.enabled}`);

          // Dispatch custom event for React components
          window.dispatchEvent(new CustomEvent('config-change', {
            detail: {
              key: 'storage-change',
              value: this.config,
              config: this.config
            }
          }));
          console.log(`📢 ${this.instanceId} - Config change event dispatched via storage listener`);
        }
      }
    };

    window.addEventListener('storage', this.storageEventListener);
    console.log(`👂 ${this.instanceId} - Storage listener setup complete`);
  }

  /**
   * Cleanup method for testing
   */
  public cleanup(): void {
    if (this.storageEventListener) {
      window.removeEventListener('storage', this.storageEventListener);
      this.storageEventListener = null;
      console.log(`🗑️ ${this.instanceId} - Storage listener cleaned up`);
    }
  }

  /**
   * Generate random 8-character alphanumeric ID
   */
  private generateAppId(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * Validate URL format
   */
  private isValidUrl(url: string): boolean {
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch {
      return false;
    }
  }

  /**
   * Load configuration from localStorage or create defaults
   */
  private loadConfig(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsedConfig = JSON.parse(stored);
        // Validate and merge with defaults
        this.config = {
          ...DEFAULT_CONFIG,
          ...parsedConfig,
          appId: parsedConfig.appId || this.generateAppId(),
          debugger: {
            enabled: parsedConfig.debugger?.enabled ?? DEFAULT_CONFIG.debugger.enabled
          },
          digicam: {
            baseUrl: this.isValidUrl(parsedConfig.digicam?.baseUrl)
              ? parsedConfig.digicam.baseUrl
              : DEFAULT_CONFIG.digicam.baseUrl
          }
        };
      } else {
        // First time setup - create new config with generated ID
        this.config = {
          ...DEFAULT_CONFIG,
          appId: this.generateAppId()
        };
        this.saveConfig();
      }
    } catch (error) {
      console.error('Failed to load config from localStorage:', error);
      // Fallback to defaults
      this.config = {
        ...DEFAULT_CONFIG,
        appId: this.generateAppId()
      };
      this.saveConfig();
    }
  }

  /**
   * Save configuration to localStorage
   */
  private saveConfig(): void {
    try {
      if (this.config) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.config));
        // Dispatch custom event to notify listeners
        window.dispatchEvent(new CustomEvent('config-change', {
          detail: {
            key: 'config-saved',
            value: this.config,
            config: this.config
          }
        }));
        console.log('📢 Config change event dispatched:', this.config);
      }
    } catch (error) {
      console.error('Failed to save config to localStorage:', error);
    }
  }

  /**
   * Get entire configuration object
   */
  public getConfig(): AppConfig {
    return this.config || { ...DEFAULT_CONFIG, appId: this.generateAppId() };
  }

  /**
   * Get App ID
   */
  public getAppId(): string {
    return this.getConfig().appId;
  }

  /**
   * Get debugger enabled state
   */
  public getDebuggerEnabled(): boolean {
    const result = this.getConfig().debugger.enabled;
    console.log(`📖 ${this.instanceId} - getDebuggerEnabled(): ${result}`);
    return result;
  }

  /**
   * Get DigiCamControl base URL
   */
  public getDigicamBaseUrl(): string {
    return this.getConfig().digicam.baseUrl;
  }

  /**
   * Update debugger enabled state
   */
  public setDebuggerEnabled(enabled: boolean): void {
    if (this.config) {
      console.log(`💾 ${this.instanceId} - setDebuggerEnabled(${enabled}) - Current: ${this.config.debugger.enabled}`);
      this.config.debugger.enabled = enabled;
      this.saveConfig();
      console.log(`💾 ${this.instanceId} - setDebuggerEnabled(${enabled}) - New: ${this.config.debugger.enabled}`);
    } else {
      console.warn(`⚠️ ${this.instanceId} - setDebuggerEnabled(${enabled}) - No config object available`);
    }
  }

  /**
   * Update DigiCamControl base URL
   */
  public setDigicamBaseUrl(url: string): boolean {
    if (this.isValidUrl(url)) {
      if (this.config) {
        this.config.digicam.baseUrl = url;
        this.saveConfig();
        return true;
      }
    }
    return false;
  }

  /**
   * Reset configuration to defaults (but keep App ID)
   */
  public resetConfig(): void {
    if (this.config) {
      const appId = this.config.appId;
      this.config = {
        ...DEFAULT_CONFIG,
        appId // Preserve the App ID
      };
      this.saveConfig();
    }
  }

  /**
   * Export configuration for backup
   */
  public exportConfig(): string {
    return JSON.stringify(this.getConfig(), null, 2);
  }

  /**
   * Import configuration from backup
   */
  public importConfig(configJson: string): boolean {
    try {
      const imported = JSON.parse(configJson);
      if (this.isValidConfig(imported)) {
        this.config = {
          ...DEFAULT_CONFIG,
          ...imported,
          // Always preserve existing App ID unless explicitly provided
          appId: imported.appId || this.config?.appId || this.generateAppId()
        };
        this.saveConfig();
        return true;
      }
    } catch (error) {
      console.error('Failed to import config:', error);
    }
    return false;
  }

  /**
   * Validate configuration structure
   */
  private isValidConfig(config: any): config is Partial<AppConfig> {
    return (
      typeof config === 'object' &&
      config !== null &&
      // Validate debugger section
      (!config.debugger ||
        (typeof config.debugger === 'object' &&
         typeof config.debugger.enabled === 'boolean')) &&
      // Validate digicam section
      (!config.digicam ||
        (typeof config.digicam === 'object' &&
         (typeof config.digicam.baseUrl === 'string' || !config.digicam.baseUrl)))
    );
  }
}

// Create singleton instance with proper singleton pattern
let singletonInstance: ConfigManager | null = null;

export const configManager = new Proxy({} as ConfigManager, {
  get(target, prop) {
    if (!singletonInstance) {
      console.log('🔧 Creating ConfigManager singleton instance...');
      singletonInstance = new ConfigManager();
    }
    return (singletonInstance as any)[prop];
  }
});

// Export the singleton and type
export default configManager;