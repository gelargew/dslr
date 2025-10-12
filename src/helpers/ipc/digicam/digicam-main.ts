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
ipcMain.handle('capture', async () => {
  try {
    console.log('📸 Initiating DigiCamControl capture...');
    console.log('🌐 Capture URL:', DIGICAM_CONFIG.CAPTURE_URL);
    const response = await axios.get(DIGICAM_CONFIG.CAPTURE_URL);
    console.log('✅ Capture initiated successfully');
    console.log('📊 Response status:', response.status);

    // After capture, check what files exist in the watch directory
    setTimeout(() => {
      console.log('🔍 Checking watch directory after capture...');
      console.log('📁 Watch directory path:', WATCH_DIR);
      if (fs.existsSync(WATCH_DIR)) {
        try {
          const files = fs.readdirSync(WATCH_DIR);
          console.log('📂 Files in watch directory after capture:', files.length, 'files');
          files.forEach((file, index) => {
            console.log(`  ${index + 1}. ${file}`);
          });
        } catch (error) {
          console.error('❌ Error reading watch directory:', error);
        }
      } else {
        console.log('❌ Watch directory does not exist:', WATCH_DIR);
      }
    }, 2000); // Check 2 seconds after capture

    return { success: true, message: 'Capture initiated' };
  } catch (error: any) {
    console.error('❌ DigiCamControl capture error:', error.message);
    console.error('❌ Full error:', error);
    return { success: false, error: error.message };
  }
});

// DigiCamControl status check
ipcMain.handle('check-dcc-status', async () => {
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
  console.log('📁 Watch directory:', WATCH_DIR);

  // Ensure watch directory exists
  if (!fs.existsSync(WATCH_DIR)) {
    console.log('📁 Creating watch directory:', WATCH_DIR);
    fs.mkdirSync(WATCH_DIR, { recursive: true });
  } else {
    console.log('✅ Watch directory exists');
    // List existing files
    try {
      const files = fs.readdirSync(WATCH_DIR);
      console.log('📂 Existing files in watch directory:', files.length, 'files');
      if (files.length > 0) {
        console.log('📄 Files:', files.slice(0, 5)); // Show first 5 files
      }
    } catch (error) {
      console.error('❌ Error reading watch directory:', error);
    }
  }

  // Watch for file changes
  fs.watch(WATCH_DIR, async (event, filename) => {
    console.log(`🔍 File event: ${event}`, filename ? `File: ${filename}` : 'No filename');

    if (event === 'rename' && filename && FILE_PROCESSING.SUPPORTED_FORMATS.some(format => filename.toLowerCase().endsWith(format))) {
      try {
        console.log('🖼️ New file detected:', filename);
        const input = path.join(WATCH_DIR, filename);
        console.log('📂 Full path:', input);

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
                  mainWindow.webContents.send('new-image', {
                    original: filename,
                    processed: `${FILE_PROCESSING.OVERLAY_PREFIX}${filename}`
                  });
                  console.log('📢 Sent new-image notification to renderer');
                }
              } catch (overlayError) {
                console.error('❌ Error applying overlay:', overlayError);
                // Notify about original image even if overlay fails
                if (mainWindow && !mainWindow.isDestroyed()) {
                  mainWindow.webContents.send('new-image', {
                    original: filename,
                    processed: filename
                  });
                }
              }
            } else {
              console.log('⚠️ Sharp not available, skipping overlay processing');
              // Notify about original image without overlay
              if (mainWindow && !mainWindow.isDestroyed()) {
                mainWindow.webContents.send('new-image', {
                  original: filename,
                  processed: filename
                });
              }
            }
          } else {
            console.log('⚠️ No overlay file found at:', OVERLAY_PATH);

            // Still notify about new image even without overlay
            if (mainWindow && !mainWindow.isDestroyed()) {
              mainWindow.webContents.send('new-image', {
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

// Express server setup for photo sharing
import express from 'express';

export function setupExpressServer() {
  const app = express();

  // Request logging middleware
  app.use((req, res, next) => {
    console.log(`🌐 [${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
  });

  // Enable CORS for all routes
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    console.log(`🔓 CORS headers added for ${req.method} ${req.url}`);
    next();
  });

  // Serve photos directory
  app.use('/photos', express.static(WATCH_DIR));

  // Main gallery route
  app.get('/', (req, res) => {
    console.log(`🏠 Serving main gallery page`);
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Textimoni Gallery</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
          .header { text-align: center; margin-bottom: 30px; }
          .gallery { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; }
          .photo-item { background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .photo-item img { width: 100%; height: 200px; object-fit: cover; }
          .photo-info { padding: 15px; }
          .status { background: #e3f2fd; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>📸 Textimoni Gallery</h1>
          <div class="status">
            <strong>Server Status:</strong> Running<br>
            <strong>Photo Directory:</strong> ${WATCH_DIR}<br>
            <strong>DigiCamControl:</strong> ${DIGICAM_CONFIG.BASE_URL}
          </div>
        </div>
        <div class="gallery" id="gallery">
          <p>Loading photos...</p>
        </div>
        <script>
          // Load photos dynamically
          fetch('/photos/')
            .then(response => response.text())
            .then(html => {
              const parser = new DOMParser();
              const doc = parser.parseFromString(html, 'text/html');
              const links = Array.from(doc.querySelectorAll('a[href$=".jpg"]'));
              const gallery = document.getElementById('gallery');

              if (links.length === 0) {
                gallery.innerHTML = '<p>No photos found. Capture some photos first!</p>';
              } else {
                gallery.innerHTML = links.map(link => \`
                  <div class="photo-item">
                    <img src="/photos/\${link.href.split('/').pop()}" alt="\${link.textContent}">
                    <div class="photo-info">
                      <strong>\${link.textContent}</strong><br>
                      <small><a href="/photos/\${link.href.split('/').pop()}" target="_blank">View Full Size</a></small>
                    </div>
                  </div>
                \`).join('');
              }
            })
            .catch(err => {
              document.getElementById('gallery').innerHTML = '<p>Error loading photos.</p>';
            });
        </script>
      </body>
      </html>
    `);
  });

  // API status endpoint
  app.get('/status', (req, res) => {
    console.log(`📊 Serving status API endpoint`);
    res.json({
      status: 'running',
      photoDir: WATCH_DIR,
      dccUrl: DIGICAM_CONFIG.BASE_URL,
      timestamp: new Date().toISOString()
    });
  });

  // Photos list API
  app.get('/api/photos', (req, res) => {
    try {
      const files = fs.readdirSync(WATCH_DIR)
        .filter(file => file.endsWith('.jpg'))
        .sort((a, b) => b.localeCompare(a)); // Most recent first

      res.json({
        photos: files.map(file => ({
          name: file,
          url: `/photos/${file}`,
          isProcessed: file.startsWith('overlay_'),
          timestamp: fs.statSync(path.join(WATCH_DIR, file)).mtime
        }))
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to read photos directory' });
    }
  });

  // 404 handler (use proper Express 404 handling)
  app.use((req, res) => {
    console.log(`❌ 404 - Route not found: ${req.method} ${req.url}`);
    res.status(404).json({
      error: 'Route not found',
      method: req.method,
      url: req.url,
      availableRoutes: ['/', '/status', '/api/photos', '/photos/']
    });
  });

  const PORT = 3001; // Change port to avoid conflicts
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Express server SUCCESSFULLY started on port ${PORT}!`);
    console.log(`📸 Express server running at http://localhost:${PORT}`);
    console.log('📁 Serving photos from:', WATCH_DIR);
    console.log(`🌐 Gallery available at: http://localhost:${PORT}`);
    console.log(`📊 API status at: http://localhost:${PORT}/status`);
    console.log(`🔍 Test this URL in browser: http://localhost:${PORT}/status`);
  });
}

// Download photo from DigiCamControl web server via HTTP
ipcMain.handle('digicam:download-photo', async (event, filename: string) => {
  try {
    console.log('🌐 Downloading photo from DigiCamControl web server:', filename);

    // Use dynamic URL from configuration
    const photoUrl = DIGICAM_CONFIG.getPhotoDownloadUrl(filename);
    console.log('📸 Photo URL:', photoUrl);

    const response = await axios.get(photoUrl, {
      responseType: 'arraybuffer',
      timeout: 10000
    });

    console.log('✅ Successfully downloaded photo from DigiCamControl:', filename);
    console.log('📊 Response status:', response.status);
    console.log('📊 Response size:', response.data.byteLength, 'bytes');

    // Convert to base64 for UI consumption
    const base64 = Buffer.from(response.data).toString('base64');

    return {
      success: true,
      data: base64,
      filename: filename
    };

  } catch (error: any) {
    console.error('❌ Failed to download photo from DigiCamControl:', error.message);
    console.error('❌ Full error:', error);
    return {
      success: false,
      error: error.message,
      filename: filename
    };
  }
});

// Register all DigiCamControl handlers
export function registerDigicamHandlers() {
  console.log('🔌 Registering DigiCamControl IPC handlers...');

  // Handlers are already registered above with ipcMain.handle()
  // This function can be used for initialization if needed

  console.log('✅ DigiCamControl IPC handlers registered');
}