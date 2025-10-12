// DigiCamControl Configuration Constants
export const DIGICAM_CONFIG = {
  // Base URL for DigiCamControl API
  BASE_URL: 'http://127.0.0.1:5513',

  // API Endpoints
  ENDPOINTS: {
    CAPTURE: '/json/capture',
    LIVEVIEW: '/liveview.jpg',
    LIVEVIEW_JSON: '/json/liveview'
  },

  // File paths
  WATCH_DIR: `${process.env.USERPROFILE || ''}\\Pictures\\digiCamControl`,
  OVERLAY_PATH: `${process.env.USERPROFILE || ''}\\Pictures\\digiCamControl\\overlay.png`,

  // Get full URLs
  get CAPTURE_URL() {
    return `${this.BASE_URL}${this.ENDPOINTS.CAPTURE}`;
  },

  get LIVEVIEW_URL() {
    return `${this.BASE_URL}${this.ENDPOINTS.LIVEVIEW}`;
  },

  get LIVEVIEW_JSON_URL() {
    return `${this.BASE_URL}${this.ENDPOINTS.LIVEVIEW_JSON}`;
  }
} as const;

// Export individual constants for convenience
export const WATCH_DIR = DIGICAM_CONFIG.WATCH_DIR;
export const OVERLAY_PATH = DIGICAM_CONFIG.OVERLAY_PATH;