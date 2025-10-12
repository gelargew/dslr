// DigiCamControl IPC handlers for main process
import { ipcMain, BrowserWindow } from 'electron';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { DIGICAM_CONFIG, WATCH_DIR, OVERLAY_PATH, FILE_PROCESSING, EXPRESS_CONFIG } from '@/constants/digicam';

// Dynamic import for Sharp to handle native dependencies
let sharp: any = null;

const loadSharp = async () => {
  try {
    if (!sharp) {
      sharp = await import('sharp');
      console.log('✅ Sharp module loaded successfully');
    }
    return sharp;
  } catch (error) {
    console.warn('⚠️ Sharp module not available, overlay processing disabled:', error);
    return null;
  }
};

let mainWindow: BrowserWindow | null = null;

// Set main window reference for notifications
export function setDigicamMainWindow(window: BrowserWindow) {
  mainWindow = window;
}

// Camera capture IPC handler
ipcMain.handle('digicam:capture', async () => {
  try {
    console.log('📸 Initiating DigiCamControl capture...');
    await axios.get(DIGICAM_CONFIG.CAPTURE_URL);
    console.log('✅ Capture initiated successfully');
    return { success: true, message: 'Capture initiated' };
  } catch (error: any) {
    console.error('❌ DigiCamControl capture error:', error.message);
    return { success: false, error: error.message };
  }
});

// DigiCamControl status check
ipcMain.handle('digicam:check-status', async () => {
  try {
    console.log('🔍 Checking DigiCamControl status...');
    const response = await axios.get(DIGICAM_CONFIG.LIVEVIEW_JSON_URL, { timeout: 3000 });
    console.log('✅ DigiCamControl is connected');
    return { connected: true, message: 'DigiCamControl connected' };
  } catch (error: any) {
    console.log('❌ DigiCamControl not connected:', error.message);
    return { connected: false, error: error.message };
  }
});

// Setup file watcher for new photos
export function setupFileWatcher() {
  console.log('👁️ Setting up DigiCamControl file watcher...');

  // Ensure watch directory exists
  if (!fs.existsSync(WATCH_DIR)) {
    console.log('📁 Creating watch directory:', WATCH_DIR);
    fs.mkdirSync(WATCH_DIR, { recursive: true });
  }

  // Watch for file changes
  fs.watch(WATCH_DIR, async (event, filename) => {
    if (event === 'rename' && filename && FILE_PROCESSING.SUPPORTED_FORMATS.some(format => filename.toLowerCase().endsWith(format))) {
      try {
        console.log('🖼️ New file detected:', filename);
        const input = path.join(WATCH_DIR, filename);

        // Wait for file to be fully written
        await new Promise(resolve => setTimeout(resolve, FILE_PROCESSING.WAIT_TIME));

        if (fs.existsSync(input) && !filename.startsWith(FILE_PROCESSING.OVERLAY_PREFIX)) {
          const output = path.join(WATCH_DIR, `${FILE_PROCESSING.OVERLAY_PREFIX}${filename}`);

          // Try to apply overlay if it exists
          if (fs.existsSync(OVERLAY_PATH)) {
            console.log('🎨 Attempting to apply overlay to:', filename);

            // Try to load Sharp and apply overlay
            const sharpModule = await loadSharp();
            if (sharpModule) {
              try {
                await sharpModule(input)
                  .composite([{ input: OVERLAY_PATH, gravity: 'center' }])
                  .toFile(output);
                console.log('✅ Overlay applied successfully');

                // Notify renderer about new image
                if (mainWindow && !mainWindow.isDestroyed()) {
                  mainWindow.webContents.send('digicam:new-image', {
                    original: filename,
                    processed: `${FILE_PROCESSING.OVERLAY_PREFIX}${filename}`
                  });
                  console.log('📢 Sent new-image notification to renderer');
                }
              } catch (overlayError) {
                console.error('❌ Error applying overlay:', overlayError);
                // Notify about original image even if overlay fails
                if (mainWindow && !mainWindow.isDestroyed()) {
                  mainWindow.webContents.send('digicam:new-image', {
                    original: filename,
                    processed: filename
                  });
                }
              }
            } else {
              console.log('⚠️ Sharp not available, skipping overlay processing');
              // Notify about original image without overlay
              if (mainWindow && !mainWindow.isDestroyed()) {
                mainWindow.webContents.send('digicam:new-image', {
                  original: filename,
                  processed: filename
                });
              }
            }
          } else {
            console.log('⚠️ No overlay file found at:', OVERLAY_PATH);

            // Still notify about new image even without overlay
            if (mainWindow && !mainWindow.isDestroyed()) {
              mainWindow.webContents.send('digicam:new-image', {
                original: filename,
                processed: filename
              });
            }
          }
        }
      } catch (error) {
        console.error('❌ Error processing new image:', error);
      }
    }
  });

  console.log('✅ File watcher setup complete');
}

// Express server setup for photo serving
import express from 'express';

export function setupExpressServer() {
  console.log('🌐 Setting up Express server...');

  const app = express();

  // Enable CORS for development
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
  });

  // Serve photos directory
  app.use(EXPRESS_CONFIG.PHOTO_ROUTE, express.static(WATCH_DIR));

  // Status endpoint
  app.get(EXPRESS_CONFIG.STATUS_ROUTE, (req, res) => {
    res.json({
      status: 'running',
      photoDir: WATCH_DIR,
      dccUrl: DIGICAM_CONFIG.BASE_URL,
      timestamp: new Date().toISOString()
    });
  });

  // Start server
  app.listen(EXPRESS_CONFIG.PORT, EXPRESS_CONFIG.HOST, () => {
    console.log(`✅ Express server running at http://localhost:${EXPRESS_CONFIG.PORT}`);
    console.log(`📸 Serving photos from: ${WATCH_DIR}`);
    console.log(`🔗 Gallery URL: http://localhost:${EXPRESS_CONFIG.PORT}/`);
  });

  return app;
}

// Register all DigiCamControl handlers
export function registerDigicamHandlers() {
  console.log('🔌 Registering DigiCamControl IPC handlers...');

  // Handlers are already registered above with ipcMain.handle()
  // This function can be used for initialization if needed

  console.log('✅ DigiCamControl IPC handlers registered');
}