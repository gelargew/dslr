// DigiCamControl Configuration Constants
// Based on DigiCamControl WebServer plugin documentation
// Default configuration - actual values come from Zustand store in renderer process

export const DIGICAM_CONFIG = {
  // Default base URL - actual config comes from Zustand store
  get BASE_URL() {
    return 'http://127.0.0.1:5513'; // Default fallback
  },

  ENDPOINTS: {
    CAPTURE: '/?CMD=Capture', // Correct DigiCamControl capture endpoint
    LIVEVIEW: '/liveview.jpg',
    LIVEVIEW_JSON: '/json/liveview',
    DOWNLOAD: '/download' // Download endpoint for captured photos
  },

  // Windows-specific paths - use os.homedir() for more reliable path detection
  get WATCH_DIR() {
    const os = require('os');
    const path = require('path');
    return path.join(os.homedir(), 'Pictures', 'digiCamControl', 'Session1'); // Photos go to Session1 folder
  },
  get OVERLAY_PATH() {
    const os = require('os');
    const path = require('path');
    return path.join(os.homedir(), 'Pictures', 'digiCamControl', 'Session1', 'overlay.png');
  },

  // Dynamic URL getters that use the current configuration
  get CAPTURE_URL() { return `${this.BASE_URL}${this.ENDPOINTS.CAPTURE}`; },
  get LIVEVIEW_URL() { return `${this.BASE_URL}${this.ENDPOINTS.LIVEVIEW}`; },
  get LIVEVIEW_JSON_URL() { return `${this.BASE_URL}${this.ENDPOINTS.LIVEVIEW_JSON}`; },
  get DOWNLOAD_URL() { return `${this.BASE_URL}${this.ENDPOINTS.DOWNLOAD}`; },

  // Helper method to get the photo download URL with correct format
  getPhotoDownloadUrl(filename: string): string {
    return `${this.BASE_URL}/image/${filename}`;
  }
};

// Export individual constants for easier importing
export const WATCH_DIR = DIGICAM_CONFIG.WATCH_DIR;
export const OVERLAY_PATH = DIGICAM_CONFIG.OVERLAY_PATH;

// DigiCamControl API interface
export interface DigicamStatusResponse {
  connected: boolean;
  message?: string;
  error?: string;
}

export interface DigicamCaptureResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export interface NewImageData {
  original: string;
  processed: string;
}

// Express server configuration for photo serving
export const EXPRESS_CONFIG = {
  PORT: 8777
};

// File processing configuration
export const FILE_PROCESSING = {
  WAIT_TIME: 1000, // ms to wait for file to be fully written
  SUPPORTED_FORMATS: ['.jpg', '.jpeg'],
  OVERLAY_PREFIX: 'overlay_'
};