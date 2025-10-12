import { app, BrowserWindow } from "electron";
import registerListeners from "./helpers/ipc/listeners-register";
import { registerDatabaseHandlers } from "./helpers/ipc/database/database-main";
import { registerStorageHandlers } from "./helpers/ipc/storage/storage-main";
import { registerConfigHandlers } from "./helpers/ipc/config/config-main";
import { registerModalHandlers } from "./helpers/ipc/modal/modal-main";
import { registerDigicamHandlers, setDigicamMainWindow, setupFileWatcher, setupExpressServer } from "./helpers/ipc/digicam/digicam-main";
// "electron-squirrel-startup" seems broken when packaging with vite
//import started from "electron-squirrel-startup";
import path from "path";
// Dynamic import for dev tools - only in development

const inDevelopment = process.env.NODE_ENV === "development";

function createWindow() {
  const preload = path.join(__dirname, "preload.js");
  const mainWindow = new BrowserWindow({
    width: 1200, // Make wider for debug
    height: 800,
    webPreferences: {
      devTools: true,
      contextIsolation: true, // Keep context isolation for security
      nodeIntegration: false, // Keep node integration disabled
      nodeIntegrationInSubFrames: false,
      preload: preload,
      sandbox: false, // But disable sandbox
      // Enable media access for camera and microphone
      enableBlinkFeatures: 'MediaDevices,GetUserMedia',
      webSecurity: false, // Disable web security for DigiCamControl external images
      allowRunningInsecureContent: true,
      nodeIntegrationInWorker: true,
    },
    titleBarStyle: "hidden",
    // For production, start with a reasonable size
    show: false, // Don't show until ready
  });

  // CSP bypass for DigiCamControl images
  mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': undefined
      }
    });
  });

  // Set window reference for DigiCamControl notifications
  setDigicamMainWindow(mainWindow);

  registerListeners(mainWindow);

    // Register database handlers
  registerDatabaseHandlers();

  // Register storage handlers
  registerStorageHandlers();

  // Register config handlers
  registerConfigHandlers();

  // Register modal handlers
  registerModalHandlers();

  // Register DigiCamControl handlers
  registerDigicamHandlers();

  // Set up DigiCamControl file watcher and Express server
  setupFileWatcher();
  setupExpressServer();

  // Set up permission handler for media devices
  mainWindow.webContents.session.setPermissionRequestHandler((webContents, permission, callback, details) => {
    console.log(`🔐 Permission requested: ${permission}`, details);

    // Allow camera and microphone permissions automatically
    if (permission === 'media' || permission === 'camera' || permission === 'microphone') {
      console.log(`✅ Granting ${permission} permission`);
      callback(true);
    } else {
      console.log(`❓ Unknown permission request: ${permission} - DENYING`);
      callback(false);
    }
  });

  // Set up permission check handler
  mainWindow.webContents.session.setPermissionCheckHandler((webContents, permission, requestingOrigin) => {
    console.log(`🔍 Permission check: ${permission} from ${requestingOrigin}`);

    // Allow media permissions
    if (permission === 'media' || permission === 'camera' || permission === 'microphone') {
      return true;
    }

    return false;
  });

  // Initialize database after handlers are registered
  console.log('🔌 Initializing Turso database...');

  // Ensure database is properly initialized for production
  const initializeDatabase = async () => {
    try {
      const { photoDatabase } = await import('./helpers/database/turso-client');
      await photoDatabase.initialize();
      console.log('✅ Database initialized successfully');
    } catch (error) {
      console.error('❌ Database initialization failed:', error);
    }
  };

  // Initialize database
  initializeDatabase();

  // Add keyboard shortcuts
  mainWindow.webContents.on('before-input-event', (event, input) => {
    // Toggle dev tools
    if (input.control && input.shift && input.key.toLowerCase() === 'i') {
      mainWindow.webContents.toggleDevTools();
    }
  });

  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`),
    );
  }

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();

    // Auto-open dev tools only in development
    if (inDevelopment) {
      mainWindow.webContents.openDevTools();
      console.log('Electron main process started');
      console.log('Dev tools enabled');
    }
  });
}

async function installExtensions() {
  // Only install extensions in development
  if (!inDevelopment) {
    console.log('Production mode: Skipping dev tools installation');
    return;
  }

  try {
    // Dynamic import to avoid bundling in production
    const { installExtension, REACT_DEVELOPER_TOOLS } = await import("electron-devtools-installer");
    const result = await installExtension(REACT_DEVELOPER_TOOLS);
    console.log(`Extensions installed successfully: ${result.name}`);
  } catch (error) {
    console.error("Failed to install extensions:", error.message);
  }
}

app.whenReady().then(createWindow).then(installExtensions);

//osX only
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
//osX only ends