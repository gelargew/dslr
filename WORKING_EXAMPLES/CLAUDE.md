# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Architecture

This is an **Electron Forge + TypeScript** photobooth application that integrates with **DigiCamControl** for Windows DSLR camera control. The app uses a dual-server architecture:

1. **Electron Main Process** (`src/index.ts`): Handles camera control, file watching, and image processing
2. **Express Server** (embedded in main process): Serves photos via HTTP for network sharing

### Key Architecture Components

**Process Separation:**
- **Main Process**: Camera operations, file system, Express server (Node.js environment)
- **Renderer Process**: React UI, live view display, user interactions (Browser environment)
- **Preload Script**: Secure bridge between main and renderer processes using `contextBridge`

**Critical Constants Location:**
- All DigiCamControl configuration is in `src/constants/digicam.ts`
- **NEVER hardcode URLs** - always import from `DIGICAM_CONFIG`
- Base URL uses `127.0.0.1:5513` (not localhost) to avoid CSP issues

**Content Security Policy (CSP):**
- CSP is configured in `package.json` via `devContentSecurityPolicy`
- This allows external image loading from DigiCamControl
- **Do not modify CSP configuration** unless absolutely necessary

## Development Commands

⚠️ **CRITICAL: NEVER run `npm start` - it's always already running in another terminal!**
Running `npm start` will cause port 9000 conflicts and fail.

```bash
# Build for production
npm run make

# Package without installer
npm run package

# Lint code
npm run lint
```

**Note:** The development server is always running in a separate terminal. Do not attempt to start it again.

## Constants and Configuration

**DigiCamControl Integration:**
```typescript
import { DIGICAM_CONFIG, WATCH_DIR, OVERLAY_PATH } from './constants/digicam';

// Usage examples:
await axios.get(DIGICAM_CONFIG.CAPTURE_URL());
fs.watch(WATCH_DIR, callback);
const liveViewUrl = DIGICAM_CONFIG.LIVEVIEW_URL();
```

**File Structure Constants:**
- `WATCH_DIR`: `%USERPROFILE%\Pictures\digiCamControl` - monitored for new photos
- `OVERLAY_PATH`: `%USERPROFILE%\Pictures\digiCamControl\overlay.png` - overlay image
- All file operations use these constants

## IPC Communication Pattern

**Main Process Handlers:**
```typescript
ipcMain.handle('capture', async () => {
  // Camera capture logic
});

ipcMain.handle('check-dcc-status', async () => {
  // DigiCamControl connectivity check
});
```

**Renderer Process Usage:**
```typescript
// Via exposed electronAPI
await window.electronAPI.capture();
await window.electronAPI.checkDccStatus();

// Listen for events
window.electronAPI.onNewImage((data) => {
  // Handle new image notification
});
```

## Express Server Integration

The Express server runs on port 3000 and serves:
- `/photos` - Static file serving of processed images
- `/status` - Application status endpoint

**Important:** Express server is started from the main process, not as a separate service.

## Webpack and Build Configuration

- Main process: `webpack.main.config.ts`
- Renderer process: `webpack.renderer.config.ts`
- Entry point: `src/index.html` → `src/renderer.tsx`
- Preload script: `src/preload.ts`

**TSConfig Note:** JSX support is enabled for `.tsx` files in renderer.

## Common Pitfalls

1. **Module Resolution**: Always use relative imports from `src/` directory
2. **Constants**: Import from `./constants/digicam` - never hardcode URLs
3. **CSP Issues**: External resources blocked → check `package.json` CSP configuration
4. **File Paths**: Use Windows-style paths with proper escaping
5. **Async Operations**: Camera operations and file processing are async - use proper await/error handling

## CSP Debugging

⚠️ **CRITICAL: If you encounter CSP issues, ALWAYS document your debugging process in CSP_DEBUG.md**

**Current CSP Configuration:**
- `webSecurity: false` in main process (src/index.ts)
- CSP meta tag in HTML allowing external images from 127.0.0.1
- NO `devContentSecurityPolicy` in package.json

**Debugging Steps:**
1. Check exact CSP error message
2. Verify CSP changes are actually being applied
3. Test changes incrementally, not all at once
4. Document ALL attempts in CSP_DEBUG.md
5. Never revert to previous broken configurations

**Reference:** See `CSP_DEBUG.md` for complete debugging history and solutions.

## Express Server Debugging

⚠️ **CRITICAL: If you encounter Express server issues, ALWAYS document your debugging process in EXPRESS_DEBUG.md**

**Current Express Configuration:**
- Port: 3000 (bound to 0.0.0.0 for network access)
- Routes: `/`, `/status`, `/api/photos`, `/photos/`
- CORS enabled for cross-origin requests

**Debugging Steps:**
1. Check Electron app starts successfully (no compilation errors)
2. Look for "✅ Express server SUCCESSFULLY started" message in console
3. Test basic route: `http://localhost:3000/status`
4. Verify port 3000 is not already in use
5. Document ALL attempts in EXPRESS_DEBUG.md

**Common Issues:**
- Electron compilation errors prevent Express server from starting
- Port conflicts with other services
- Routes return 404 when app never actually starts

**Reference:** See `EXPRESS_DEBUG.md` for complete Express server debugging history.

## DigiCamControl Integration

The app communicates with DigiCamControl via HTTP API:
- Live view: `GET /liveview.jpg`
- Capture: `GET /json/capture`
- Status: `GET /json/liveview`

**Connection Check:** App verifies DigiCamControl connectivity before allowing capture operations.