import { app, BrowserWindow } from "electron";
import registerListeners from "./helpers/ipc/listeners-register";
import { registerDatabaseHandlers } from "./helpers/ipc/database/database-main";
import { registerStorageHandlers } from "./helpers/ipc/storage/storage-main";
import { registerCameraHandlers } from "./helpers/ipc/camera/camera-main";
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
      devTools: true, // Force enable dev tools
      contextIsolation: true,
      nodeIntegration: true,
      nodeIntegrationInSubFrames: false,
      preload: preload,
    },
    titleBarStyle: "hidden",
  });
    registerListeners(mainWindow);

    // Register database handlers
  registerDatabaseHandlers();

  // Register storage handlers
  registerStorageHandlers();

  // Register camera handlers
  registerCameraHandlers();

  // Initialize database after handlers are registered
  console.log('🔌 Initializing Turso database...');

  // Auto-open dev tools in development
  if (inDevelopment) {
    mainWindow.webContents.openDevTools();
  }

  // Add keyboard shortcut to toggle dev tools
  mainWindow.webContents.on('before-input-event', (event, input) => {
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

  // Debug logging for development
  if (inDevelopment) {
    console.log('Electron main process started');
    console.log('Dev tools enabled');
  }
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