// DigiCamControl Configuration Constants
// Based on DigiCamControl WebServer plugin documentation

export const DIGICAM_CONFIG = {
  BASE_URL: 'http://127.0.0.1:5513',

  ENDPOINTS: {
    CAPTURE: '/json/capture',
    LIVEVIEW: '/liveview.jpg',
    LIVEVIEW_JSON: '/json/liveview'
  },

  // Windows-specific paths
  WATCH_DIR: `${process.env.USERPROFILE || ''}\\Pictures\\digiCamControl`,
  OVERLAY_PATH: `${process.env.USERPROFILE || ''}\\Pictures\\digiCamControl\\overlay.png`,

  get CAPTURE_URL() { return `${this.BASE_URL}${this.ENDPOINTS.CAPTURE}`; },
  get LIVEVIEW_URL() { return `${this.BASE_URL}${this.ENDPOINTS.LIVEVIEW}`; },
  get LIVEVIEW_JSON_URL() { return `${this.BASE_URL}${this.ENDPOINTS.LIVEVIEW_JSON}`; }
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
  PORT: 8777,
  HOST: '0.0.0.0',
  PHOTO_ROUTE: '/photos',
  STATUS_ROUTE: '/status'
};

// File processing configuration
export const FILE_PROCESSING = {
  WAIT_TIME: 1000, // ms to wait for file to be fully written
  SUPPORTED_FORMATS: ['.jpg', '.jpeg'],
  OVERLAY_PREFIX: 'overlay_'
};