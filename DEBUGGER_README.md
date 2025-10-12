# Debugger UI Feature

## Overview
The debugger UI provides a terminal-like interface in the bottom right corner of the application that displays server logs in real-time. This is useful for debugging when the app is built and running in production.

## Configuration
The debugger is controlled by a simple configuration in `src/config/app-config.ts`:

```typescript
export const APP_CONFIG = {
  debugger: {
    enabled: true, // Set to false to disable the debugger UI
  },
  // Other configurations...
};
```

## Features

### Visual Interface
- **Fixed position**: Bottom right corner with a terminal-like appearance
- **Collapsible**: Can be minimized to save space
- **Toggle button**: Bug icon in bottom right that shows/hides the debugger
- **Auto-scroll**: Automatically scrolls to show new logs (with manual override)
- **Clear logs**: Button to clear the log history

### Log Levels
The debugger displays different log levels with color coding:
- **INFO**: Green text
- **WARN**: Yellow text
- **ERROR**: Red text
- **DEBUG**: Blue text

### Log Management
- **Auto-cleanup**: Keeps only the last 1000 log entries
- **Timestamp**: Each log entry includes a timestamp
- **Scroll control**: Users can scroll up to view older logs, and a "Scroll to bottom" button appears when not at the bottom

## Usage

### Enabling/Disabling
1. Open `src/config/app-config.ts`
2. Set `APP_CONFIG.debugger.enabled` to `true` or `false`
3. Restart the application

### During Runtime
1. Look for the bug icon in the bottom right corner
2. Click it to open the debugger console
3. View real-time server logs
4. Use the minimize button to collapse it when not needed
5. Click "Clear" to clear the log history

## Development vs Production
- **Development**: Debugger is automatically enabled
- **Production**: Controlled by the `APP_CONFIG.debugger.enabled` setting

## Technical Details
- Uses Electron IPC to forward logs from main process to renderer
- Overrides console methods to capture all log output
- Maintains original console functionality while also sending to UI
- Handles uncaught exceptions and unhandled promise rejections
