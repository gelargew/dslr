import { app, BrowserWindow } from "electron";
import registerListeners from "./helpers/ipc/listeners-register";
import { registerStorageHandlers } from "./helpers/ipc/storage/storage-main";
import { registerConfigHandlers } from "./helpers/ipc/config/config-main";
import { registerDigicamHandlers, setDigicamMainWindow, setupFileWatcher, setupExpressServer } from "./helpers/ipc/digicam/digicam-main";
import { registerFileHandlers } from "./helpers/ipc/file/file-main";
import { registerDebuggerHandlers, setDebuggerMainWindow, setupLogCapture } from "./helpers/ipc/debugger/debugger-main";
import started from "electron-squirrel-startup";
import path from "path";
import { spawn } from "child_process";
// Dynamic import for dev tools - only in development

const inDevelopment = process.env.NODE_ENV === "development";

// Handle Squirrel startup - prevent app from running during installation
if (started) {
  console.log('🚫 Squirrel startup detected, exiting to prevent issues during installation');
  process.exit(0);
}

// Squirrel Windows Update.exe helper functions
const appFolder = path.resolve(process.execPath, '..');
const rootAtomFolder = path.resolve(appFolder, '..');
const updateDotExe = path.resolve(path.join(rootAtomFolder, 'Update.exe'));
const exeName = path.basename(process.execPath);

const spawnUpdate = function(args: string[]) {
  try {
    return spawn(updateDotExe, args, { detached: true });
  } catch (error) {
    console.error('Failed to spawn update process:', error);
    return null;
  }
};

// Handle Squirrel events for Windows
if (process.platform === 'win32') {
  const args = process.argv.slice(1);
  const squirrelEvent = args.find(arg => arg.startsWith('--squirrel'));

  if (squirrelEvent) {
    console.log('🐿️ Squirrel event detected:', squirrelEvent);

    switch (squirrelEvent) {
      case '--squirrel-install':
      case '--squirrel-updated':
        // Install desktop and start menu shortcuts
        console.log('📌 Creating shortcuts...');
        if (spawnUpdate(['--createShortcut', exeName])) {
          console.log('✅ Shortcuts created successfully');
        }
        setTimeout(() => app.quit(), 1000);
        break;

      case '--squirrel-uninstall':
        // Remove desktop and start menu shortcuts
        console.log('🗑️ Removing shortcuts...');
        if (spawnUpdate(['--removeShortcut', exeName])) {
          console.log('✅ Shortcuts removed successfully');
        }
        setTimeout(() => app.quit(), 1000);
        break;

      case '--squirrel-obsolete':
        // Handle obsolete event
        console.log('📦 App obsolete...');
        setTimeout(() => app.quit(), 1000);
        break;
    }

    process.exit(0);
  }
}

function createWindow() {
  const preload = path.join(__dirname, "preload.js");
  const mainWindow = new BrowserWindow({
    width: 1200, // Make wider for debug
    height: 800,
    fullscreen: true, // Start in fullscreen mode
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

  // Set window reference for debugger
  setDebuggerMainWindow(mainWindow);

  registerListeners(mainWindow);

  // Register storage handlers (GCS storage)
  registerStorageHandlers();

  // Register config handlers
  registerConfigHandlers();

  // Register file handlers for local file access
  registerFileHandlers();

  // Register debugger handlers
  registerDebuggerHandlers();

  // Register DigiCamControl handlers
  registerDigicamHandlers();

  // Set up DigiCamControl file watcher and Express server
  setupFileWatcher();
  setupExpressServer();

  // Set up log capture for debugger
  setupLogCapture();

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