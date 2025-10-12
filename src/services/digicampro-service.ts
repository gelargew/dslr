// Digicampro Camera Service
import { DigicamproConfig } from '@/config/camera-config';

export class DigicamproService {
  private config: DigicamproConfig;
  private refreshInterval: NodeJS.Timeout | null = null;
  private lastImageUrl: string = '';

  constructor(config: DigicamproConfig) {
    this.config = config;
  }

  // Update configuration
  updateConfig(config: DigicamproConfig) {
    this.config = config;
    console.log('📷 Digicampro service configuration updated:', config);
  }

  // Get current live feed URL with cache-busting
  getLiveFeedUrl(): string {
    const timestamp = Date.now();
    return `${this.config.liveFeedUrl}?t=${timestamp}`;
  }

  // Calculate refresh interval in milliseconds based on fps
  private getRefreshInterval(): number {
    return Math.round(1000 / this.config.refreshRate);
  }

  // Test connection to both live feed and capture endpoints
  async testConnection(config?: DigicamproConfig): Promise<{
    success: boolean;
    liveFeedReachable?: boolean;
    captureReachable?: boolean;
    error?: string;
  }> {
    const testConfig = config || this.config;
    const results = {
      success: false,
      liveFeedReachable: false,
      captureReachable: false,
    };

    try {
      console.log('🔍 Testing digicampro connection...');

      // Test live feed endpoint
      try {
        const liveFeedResponse = await fetch(testConfig.liveFeedUrl, {
          method: 'HEAD',
          signal: AbortSignal.timeout(testConfig.timeout),
        });

        if (liveFeedResponse.ok) {
          results.liveFeedReachable = true;
          console.log('✅ Live feed endpoint reachable');
        } else {
          console.warn('⚠️ Live feed endpoint returned:', liveFeedResponse.status);
        }
      } catch (error) {
        console.warn('❌ Live feed endpoint unreachable:', error.message);
      }

      // Test capture endpoint
      try {
        const captureResponse = await fetch(testConfig.captureUrl, {
          method: 'POST',
          signal: AbortSignal.timeout(testConfig.timeout),
        });

        if (captureResponse.ok) {
          results.captureReachable = true;
          console.log('✅ Capture endpoint reachable');
        } else {
          console.warn('⚠️ Capture endpoint returned:', captureResponse.status);
        }
      } catch (error) {
        console.warn('❌ Capture endpoint unreachable:', error.message);
      }

      // Overall success if at least one endpoint is reachable
      results.success = results.liveFeedReachable || results.captureReachable;

      if (results.success) {
        console.log('✅ Digicampro connection test successful');
      } else {
        console.error('❌ Digicampro connection test failed - both endpoints unreachable');
      }

      return results;
    } catch (error) {
      console.error('❌ Digicampro connection test error:', error);
      return {
        ...results,
        error: error.message,
      };
    }
  }

  // Capture photo from digicampro webserver
  async capturePhoto(): Promise<{
    success: boolean;
    imageData?: string;
    error?: string;
  }> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.config.retryAttempts; attempt++) {
      try {
        console.log(`📸 Capture attempt ${attempt}/${this.config.retryAttempts}`);

        const response = await fetch(this.config.captureUrl, {
          method: 'POST',
          signal: AbortSignal.timeout(this.config.timeout),
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        // Get image data as base64
        const buffer = await response.arrayBuffer();
        const base64 = Buffer.from(buffer).toString('base64');
        const imageData = `data:image/jpeg;base64,${base64}`;

        console.log('✅ Photo captured successfully from digicampro');
        return {
          success: true,
          imageData,
        };

      } catch (error) {
        lastError = error;
        console.warn(`❌ Capture attempt ${attempt} failed:`, error.message);

        if (attempt < this.config.retryAttempts) {
          // Wait before retry (exponential backoff)
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
          console.log(`⏳ Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    console.error('❌ All capture attempts failed');
    return {
      success: false,
      error: `Failed to capture photo after ${this.config.retryAttempts} attempts. Last error: ${lastError?.message}`,
    };
  }

  // Start automatic image refresh for live feed
  startAutoRefresh(callback: (imageUrl: string) => void): () => void {
    this.stopAutoRefresh(); // Clear any existing interval

    const interval = this.getRefreshInterval();
    console.log(`🔄 Starting live feed refresh at ${this.config.refreshRate}fps (${interval}ms interval)`);

    this.refreshInterval = setInterval(() => {
      const imageUrl = this.getLiveFeedUrl();

      // Only call callback if URL has changed
      if (imageUrl !== this.lastImageUrl) {
        this.lastImageUrl = imageUrl;
        callback(imageUrl);
      }
    }, interval);

    // Immediately call with current URL
    callback(this.getLiveFeedUrl());

    // Return cleanup function
    return () => this.stopAutoRefresh();
  }

  // Stop automatic image refresh
  stopAutoRefresh(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
      console.log('⏹️ Stopped live feed refresh');
    }
  }

  // Check if service is currently refreshing
  isRefreshing(): boolean {
    return this.refreshInterval !== null;
  }

  // Get current configuration
  getConfig(): DigicamproConfig {
    return { ...this.config };
  }

  // Validate live feed URL format
  static isValidLiveFeedUrl(url: string): boolean {
    try {
      const parsedUrl = new URL(url);
      return ['http:', 'https:'].includes(parsedUrl.protocol);
    } catch {
      return false;
    }
  }

  // Validate capture URL format
  static isValidCaptureUrl(url: string): boolean {
    try {
      const parsedUrl = new URL(url);
      return ['http:', 'https:'].includes(parsedUrl.protocol);
    } catch {
      return false;
    }
  }

  // Cleanup resources
  cleanup(): void {
    this.stopAutoRefresh();
    console.log('🧹 Digicampro service cleaned up');
  }
}

// Singleton instance for the application
let digicamproService: DigicamproService | null = null;

export function getDigicamproService(config?: DigicamproConfig): DigicamproService {
  if (!digicamproService) {
    if (!config) {
      throw new Error('DigicamproService requires configuration for first initialization');
    }
    digicamproService = new DigicamproService(config);
  } else if (config) {
    digicamproService.updateConfig(config);
  }

  return digicamproService;
}

export function cleanupDigicamproService(): void {
  if (digicamproService) {
    digicamproService.cleanup();
    digicamproService = null;
  }
}