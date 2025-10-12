import { ipcMain, BrowserWindow } from 'electron';
import { v4 as uuidv4 } from 'uuid';
import { APP_CONFIG } from '../../../config/app-config';

let mainWindow: BrowserWindow | null = null;

export function setDebuggerMainWindow(window: BrowserWindow) {
  mainWindow = window;
}

export function registerDebuggerHandlers() {
  // Handler to receive log messages from renderer and forward to main window
  ipcMain.on('debugger:log', (event, logData: { level: string; message: string }) => {
    if (mainWindow && mainWindow.webContents) {
      const logEntry = {
        id: uuidv4(),
        timestamp: new Date().toISOString(),
        level: logData.level,
        message: logData.message
      };

      mainWindow.webContents.send('log-message', logEntry);
    }
  });
}

// Override console methods to capture server logs
export function setupLogCapture() {
  if (!APP_CONFIG.debugger.enabled && process.env.NODE_ENV !== 'development') {
    return; // Only capture logs when debugger is enabled or in development
  }

  const originalConsole = { ...console };

  // Helper function to send logs to renderer
  const sendLogToRenderer = (level: string, message: string) => {
    if (mainWindow && mainWindow.webContents) {
      const logEntry = {
        id: uuidv4(),
        timestamp: new Date().toISOString(),
        level,
        message: typeof message === 'string' ? message : JSON.stringify(message, null, 2),
        source: 'server'
      };

      mainWindow.webContents.send('log-message', logEntry);
    }
  };

  // Override console methods
  console.log = (...args: any[]) => {
    originalConsole.log(...args);
    sendLogToRenderer('info', args.join(' '));
  };

  console.info = (...args: any[]) => {
    originalConsole.info(...args);
    sendLogToRenderer('info', args.join(' '));
  };

  console.warn = (...args: any[]) => {
    originalConsole.warn(...args);
    sendLogToRenderer('warn', args.join(' '));
  };

  console.error = (...args: any[]) => {
    originalConsole.error(...args);
    sendLogToRenderer('error', args.join(' '));
  };

  console.debug = (...args: any[]) => {
    originalConsole.debug(...args);
    sendLogToRenderer('debug', args.join(' '));
  };

  // Also capture process errors
  process.on('uncaughtException', (error) => {
    sendLogToRenderer('error', `Uncaught Exception: ${error.message}\n${error.stack}`);
  });

  process.on('unhandledRejection', (reason, promise) => {
    sendLogToRenderer('error', `Unhandled Rejection at: ${promise}\nReason: ${reason}`);
  });
}
