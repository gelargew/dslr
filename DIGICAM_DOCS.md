# DigiCamControl Integration Guide

This document provides the essential integration points for adding DigiCamControl to an existing Electron photobooth app.

## Quick Integration Checklist

### 1. Dependencies Required
```json
{
  "dependencies": {
    "axios": "^1.12.2",
    "sharp": "^0.34.4"
  }
}
```

**Install:** `npm install axios sharp`

### 2. DigiCamControl Constants (`src/constants/digicam.ts`)
```typescript
export const DIGICAM_CONFIG = {
  BASE_URL: 'http://127.0.0.1:5513',

  ENDPOINTS: {
    CAPTURE: '/json/capture',
    LIVEVIEW: '/liveview.jpg',
    LIVEVIEW_JSON: '/json/liveview'
  },

  WATCH_DIR: `${process.env.USERPROFILE || ''}\\Pictures\\digiCamControl`,
  OVERLAY_PATH: `${process.env.USERPROFILE || ''}\\Pictures\\digiCamControl\\overlay.png`,

  get CAPTURE_URL() { return `${this.BASE_URL}${this.ENDPOINTS.CAPTURE}`; },
  get LIVEVIEW_URL() { return `${this.BASE_URL}${this.ENDPOINTS.LIVEVIEW}`; },
  get LIVEVIEW_JSON_URL() { return `${this.BASE_URL}${this.ENDPOINTS.LIVEVIEW_JSON}`; }
};

export const WATCH_DIR = DIGICAM_CONFIG.WATCH_DIR;
export const OVERLAY_PATH = DIGICAM_CONFIG.OVERLAY_PATH;
```

### 3. Main Process IPC Handlers (`src/index.ts`)
```typescript
import { DIGICAM_CONFIG, WATCH_DIR, OVERLAY_PATH } from './constants/digicam';

// Camera capture IPC handler
ipcMain.handle('capture', async () => {
  try {
    await axios.get(DIGICAM_CONFIG.CAPTURE_URL);
    return { success: true, message: 'Capture initiated' };
  } catch (error: any) {
    console.error('Capture error:', error.message);
    return { success: false, error: error.message };
  }
});

// DigiCamControl status check
ipcMain.handle('check-dcc-status', async () => {
  try {
    const response = await axios.get(DIGICAM_CONFIG.LIVEVIEW_JSON_URL, { timeout: 3000 });
    return { connected: true, message: 'DigiCamControl connected' };
  } catch (error: any) {
    return { connected: false, error: error.message };
  }
});
```

### 4. File Watching & Overlay Processing
```typescript
function setupFileWatcher() {
  // Ensure watch directory exists
  if (!fs.existsSync(WATCH_DIR)) {
    fs.mkdirSync(WATCH_DIR, { recursive: true });
  }

  fs.watch(WATCH_DIR, async (event, filename) => {
    if (event === 'rename' && filename && filename.endsWith('.jpg')) {
      try {
        const input = path.join(WATCH_DIR, filename);

        // Wait for file to be fully written
        await new Promise(resolve => setTimeout(resolve, 1000));

        if (fs.existsSync(input) && !filename.startsWith('overlay_')) {
          const output = path.join(WATCH_DIR, `overlay_${filename}`);

          // Apply overlay if exists
          if (fs.existsSync(OVERLAY_PATH)) {
            await sharp(input)
              .composite([{ input: OVERLAY_PATH, gravity: 'center' }])
              .toFile(output);

            // Notify renderer about new image
            if (mainWindow) {
              mainWindow.webContents.send('new-image', {
                original: filename,
                processed: `overlay_${filename}`
              });
            }
          }
        }
      } catch (error) {
        console.error('Error processing overlay:', error);
      }
    }
  });
}
```

### 5. Preload Script (`src/preload.ts`)
```typescript
import { contextBridge, ipcRenderer } from 'electron';
import { DIGICAM_CONFIG } from './constants/digicam';

contextBridge.exposeInMainWorld('electronAPI', {
  capture: () => ipcRenderer.invoke('capture'),
  checkDccStatus: () => ipcRenderer.invoke('check-dcc-status'),
  onNewImage: (callback: (data: { original: string; processed: string }) => void) => {
    ipcRenderer.on('new-image', (_, data) => callback(data));
  },
  removeAllListeners: (channel: string) => {
    ipcRenderer.removeAllListeners(channel);
  }
});

contextBridge.exposeInMainWorld('dccConfig', {
  liveViewUrl: `${DIGICAM_CONFIG.LIVEVIEW_URL}`,
  photoUrl: 'http://localhost:8777/photos/',
  baseUrl: DIGICAM_CONFIG.BASE_URL,
  captureUrl: DIGICAM_CONFIG.CAPTURE_URL
});
```

### 6. Express Server Integration
```typescript
function setupExpressServer() {
  const app = express();
  const PORT = 8777; // Use different port to avoid conflicts

  // Serve photos directory
  app.use('/photos', express.static(WATCH_DIR));

  // Status endpoint
  app.get('/status', (req, res) => {
    res.json({
      status: 'running',
      photoDir: WATCH_DIR,
      dccUrl: DIGICAM_CONFIG.BASE_URL,
      timestamp: new Date().toISOString()
    });
  });

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Express server running at http://localhost:${PORT}`);
    console.log(`Serving photos from: ${WATCH_DIR}`);
  });
}
```

### 7. CSP Configuration (CRITICAL!)

**Package.json CSP setting:**
```json
{
  "devContentSecurityPolicy": "default-src * 'unsafe-inline' 'unsafe-eval'; script-src * 'unsafe-inline' 'unsafe-eval'; img-src * data:; connect-src *; style-src * 'unsafe-inline';"
}
```

**OR disable CSP completely (if above doesn't work):**
```json
{
  // Remove devContentSecurityPolicy line entirely
}
```

**Main Process CSP Bypass:**
```typescript
mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
  callback({
    responseHeaders: {
      ...details.responseHeaders,
      'Content-Security-Policy': undefined
    }
  });
});
```

### 8. WebPreferences for DigiCamControl
```typescript
mainWindow = new BrowserWindow({
  webPreferences: {
    preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
    contextIsolation: true,
    webSecurity: false, // Disable web security for external images
    allowRunningInsecureContent: true,
    nodeIntegrationInWorker: true,
  },
});
```

## Integration Steps for Existing App

### Step 1: Add Dependencies
```bash
npm install axios sharp
```

### Step 2: Add Constants
- Copy `src/constants/digicam.ts` to your project
- Import constants where needed

### Step 3: Update Main Process
- Add IPC handlers for `capture` and `check-dcc-status`
- Add file watching for overlay processing
- Add Express server setup
- Add CSP bypass

### Step 4: Update Preload Script
- Add DigiCamControl methods to electronAPI
- Expose dccConfig with URLs

### Step 5: Update Renderer
- Replace webcam capture with `window.electronAPI.capture()`
- Replace status check with `window.electronAPI.checkDccStatus()`
- Use `window.dccConfig.liveViewUrl` for live view
- Add `window.electronAPI.onNewImage()` for new photo notifications

### Step 6: Update CSP
- Add devContentSecurityPolicy to package.json
- Add CSP bypass to main process if needed

## DigiCamControl Setup Requirements

### Windows Requirements
1. Install DigiCamControl software
2. Enable WebServer plugin in DigiCamControl
3. Ensure WebServer runs on port 5513 (default)
4. Set camera to manual mode
5. Enable Live View

### Directory Structure
```
C:\Users\[Username]\Pictures\digiCamControl\
├── [captured_photos].jpg
├── overlay_[captured_photos].jpg (processed)
└── overlay.png (overlay image)
```

## Key URLs
- **DigiCamControl API:** `http://127.0.0.1:5513`
- **Live View:** `http://127.0.0.1:5513/liveview.jpg`
- **Express Gallery:** `http://localhost:8777/`

## Common Issues & Solutions

### CSP Blocking Images
- Add devContentSecurityPolicy to package.json
- Use CSP bypass in main process
- Use 127.0.0.1 instead of localhost

### DigiCamControl Not Connected
- Ensure DigiCamControl is running
- Check WebServer plugin is enabled
- Verify port 5513 is available
- Test live view in browser first

### Overlay Not Applying
- Ensure overlay.png exists in watch directory
- Check Sharp is installed and working
- Verify file permissions

### Express Server Not Working
- Check for port conflicts (use 8777 instead of 3000)
- Ensure app.on('ready') calls setupExpressServer()
- Add request logging for debugging

## Minimal Integration Code

**Replace webcam capture:**
```typescript
// Instead of: navigator.mediaDevices.getUserMedia(...)
const result = await window.electronAPI.capture();
```

**Replace live view:**
```typescript
// Instead of: webcam stream
<img src={`${window.dccConfig.liveViewUrl}?t=${Date.now()}`} />
```

**Replace status check:**
```typescript
// Instead of: webcam status check
const status = await window.electronAPI.checkDccStatus();
```

This integration provides camera capture, live view, automatic overlay processing, and photo sharing for existing photobooth applications.