# Textimoni DSLR Photobooth System

A modular DSLR photobooth system built with Electron, React 19, and TypeScript. The system consists of multiple independent applications that can be deployed separately for different use cases.

## 🎯 Applications

### 1. Camera App
- **Purpose**: High-volume photo capture with automatic draft upload
- **Flow**: HomePage → CameraPage → CountdownPage → PreviewPage → ThankYouPage → back to HomePage
- **Features**:
  - DigiCamControl integration for DSLR capture
  - Live view control (start/stop)
  - Configurable countdown timer (3s, 5s, 10s)
  - Square 1:1 aspect ratio photo composition
  - 10-second thank you countdown with automatic photo draft upload
  - Seamless loop back to home for continuous operation

### 2. Edit App
- **Purpose**: Photo editing and customization
- **Flow**: EditLandingPage → EditPhotoPage → EditOverlayPage → CompletePage → back to EditLandingPage
- **Features**:
  - Fetch latest photo drafts by configurable App ID
  - Frame selection and text editing
  - Icon/sticker overlay placement
  - Built-in configuration modal for App ID management
  - Final photo upload to backend with frame URLs and text

### 3. Videotron App
- **Purpose**: Gallery display for large screens
- **Flow**: Gallery page with infinite scrolling
- **Features**:
  - 4-row infinite scrolling photo grid
  - Real-time photo synchronization
  - Optimized for large display screens

## 📋 System Requirements

### Hardware Requirements
- **Windows 10/11** (Primary target platform)
- **DSLR Camera** compatible with DigiCamControl
- **USB Cable** for camera connection
- **Minimum 4GB RAM** (8GB+ recommended)
- **Minimum 2GB disk space** for installation

### Software Prerequisites
- **Node.js 18+** and npm
- **DigiCamControl 2.1+** installed and configured
- **Windows 10/11** (tested on Windows 10)
- **Internet connection** for backend API access

## 🚀 Installation Guide

### Step 1: Install Node.js
1. Download Node.js from [https://nodejs.org](https://nodejs.org)
2. Install Node.js 18+ (LTS version recommended)
3. Verify installation:
   ```bash
   node --version
   npm --version
   ```

### Step 2: Install DigiCamControl
1. Download DigiCamControl from [https://digicamcontrol.com](https://digicamcontrol.com)
2. Install DigiCamControl 2.1 or higher
3. Enable the WebServer plugin:
   - Open DigiCamControl
   - Go to `Tools` → `Plugins` → `WebServer`
   - Enable the WebServer plugin
   - Note the port (default: 5513)
4. Test WebServer:
   - Open browser: `http://127.0.0.1:5513`
   - You should see the DigiCamControl web interface

### Step 3: Clone and Install Project
1. **Clone the repository**:
   ```bash
   git clone <your-repo-url>
   cd dslr
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Verify installation**:
   ```bash
   npm run test:unit
   ```

### Step 4: Camera Setup
1. **Connect your DSLR** to the computer via USB
2. **Configure DigiCamControl**:
   - Open DigiCamControl
   - Your camera should appear in the device list
   - Test live view: `Camera` → `Live View`
   - Test capture: Click the capture button
3. **Verify WebServer access**:
   - In browser, visit: `http://127.0.0.1:5513/liveview.jpeg`
   - You should see the live view feed

## ⚙️ Configuration

### Backend API Configuration

Edit `src/constants/api-constants.ts`:

```typescript
export const API_BASE_URL = 'https://your-backend-url.com';
export const API_KEY = 'your-api-key';
export const API_ENDPOINTS = {
  UPLOAD_PHOTO_DRAFT: '/api/photos/draft',
  UPLOAD_PHOTO: '/api/photos',
  GET_PHOTO_DRAFTS: '/api/photos/drafts',
  GET_PHOTOS: '/api/photos',
};
```

### DigiCamControl Configuration

Edit `src/constants/digicam.ts`:

```typescript
export const DIGICAM_CONFIG = {
  BASE_URL: 'http://127.0.0.1:5513',
  LIVEVIEW_URL: 'http://127.0.0.1:5513/liveview.jpeg',
  CAPTURE_URL: 'http://127.0.0.1:5513/?CMD=Capture',
  PHOTO_DIR: 'C:/Users/Public/Pictures/DigiCamControl', // Adjust to your setup
};
```

### App Mode Configuration

Edit `src/constants/app-config.ts`:

```typescript
// Available modes: 'CAMERA' | 'EDIT' | 'VIDEOTRON'
export const APP_MODE: AppMode = 'CAMERA';

// Default App ID for photo grouping (can be changed in Edit app)
export const DEFAULT_APP_ID = 'photobooth-1';
```

### App Icon Configuration

To customize the app icon:
1. Place your icon file at `src/assets/icon.ico` (Windows .ico format, 256x256px recommended)
2. The icon will be automatically used for:
   - Application executable
   - Windows desktop shortcut
   - Installer package
   - System tray (if implemented)

## 🎮 Running the Applications

### Development Mode

```bash
# Start the current app mode (based on APP_MODE constant)
npm run start

# Start Camera app
npm run start:camera

# Start Edit app
npm run start:edit

# Start Videotron app
npm run start:videotron

# Start dual apps for development (Camera + Edit)
npm run dev:dual
```

### Building Applications

```bash
# Build Camera app only
npm run build:camera

# Build Edit app only
npm run build:edit

# Build all apps
npm run build:all

# Package for distribution (uses current APP_MODE)
npm run package

# Create installers
npm run make

# Publish updates
npm run publish
```

### Code Quality

```bash
# Run ESLint
npm run lint

# Format code with Prettier
npm run format:write

# Run tests
npm run test:unit         # Unit tests (Vitest)
npm run test:e2e          # E2E tests (Playwright)
npm run test:all          # All tests
```

## 📱 App ID Management (Edit App)

### What is App ID?
- **Unique identifier** for grouping photos in the backend
- **Multi-booth support**: Each booth can have its own App ID
- **Event isolation**: Different events can use separate App IDs
- **No rebuild required**: Change App IDs dynamically

### Configuring App ID

1. **Start Edit App**:
   ```bash
   npm run start:edit
   ```

2. **Open Settings**:
   - Click the Settings (⚙️) button on EditLandingPage
   - Enter your desired App ID (e.g., "wedding-2024", "corporate-event", "booth-1")
   - Click "Save"

3. **Verification**:
   - The app will fetch photo drafts using the new App ID
   - Settings persist across app restarts
   - No need to rebuild the application

### Common App ID Patterns
```typescript
// By event
'wedding-john-jane-2024'
'corporate-abc-launch'
'birthday-sarah-30'

// By location
'booth-main-hall'
'booth-outdoor'
'booth-vip-lounge'

// By date
'photobooth-2024-03-15'
'event-20240315-morning'
```

## 📸 DigiCamControl Integration

### Supported Cameras
- **Canon**: EOS series ( Rebel, T-series, 5D, 6D, etc.)
- **Nikon**: D series ( D3000, D5000, D7000, D800, etc.)
- **Sony**: Alpha series
- **Other**: Check [DigiCamControl compatibility list](https://digicamcontrol.com/doku.php?id=compatibility)

### Live View Features
- **Real-time preview** at 10fps refresh rate
- **Automatic restart** when switching between pages
- **Error handling** with fallback mechanisms
- **Performance optimization** with controlled refresh intervals

### Photo Capture Process
1. **User clicks photo button**
2. **Countdown timer** (3s, 5s, or 10s)
3. **Live view stops** temporarily
4. **Camera captures** photo via DigiCamControl
5. **Image downloads** automatically
6. **Photo crops** to 1:1 square aspect ratio
7. **Base64 conversion** for processing
8. **Upload to backend** as photo draft

### Troubleshooting DigiCamControl

#### Camera Not Detected
```bash
# Check camera connection
1. Ensure USB cable is securely connected
2. Turn camera on and set to photo mode
3. Check DigiCamControl device list
4. Try different USB port
5. Restart DigiCamControl with admin privileges
```

#### Live View Not Working
```bash
# Verify live view access
1. Test in DigiCamControl desktop app
2. Check browser: http://127.0.0.1:5513/liveview.jpeg
3. Ensure camera supports live view
4. Check WebServer plugin is enabled
5. Verify no firewall blocking port 5513
```

#### Capture Fails
```bash
# Debug capture issues
1. Test capture in DigiCamControl desktop app
2. Check camera memory card space
3. Verify camera is in capture mode
4. Check WebServer logs for errors
5. Restart DigiCamControl service
```

## 🔧 Advanced Configuration

### Window Management
The application starts in fullscreen mode by default. To modify window behavior:

Edit `src/main.ts`:
```typescript
const mainWindow = new BrowserWindow({
  width: 1200,
  height: 800,
  fullscreen: true,  // Set to false for windowed mode
  // Other window options...
});
```

### Photo Processing Settings
Edit `src/pages/CameraPage.tsx` for photo processing:

```typescript
// Photo resolution
canvas.width = 1080;  // Change for different resolution
canvas.height = 1080; // Keep square aspect ratio

// JPEG quality
const base64 = canvas.toDataURL('image/jpeg', 0.9); // 0.1 - 1.0

// Live view refresh rate
setInterval(() => {
  setLiveViewKey(Date.now());
}, 100); // 100ms = 10fps
```

### Timer Duration Configuration
Modify timer options in `src/pages/CameraPage.tsx`:

```typescript
const handleTimerDurationToggle = () => {
  const durations = [3, 5, 10]; // Add/remove durations
  // ... existing code
};
```

## 🏗️ Project Architecture

### Directory Structure
```
src/
├── components/
│   ├── ui/                 # shadcn/ui components
│   └── ConfigModal.tsx     # App ID configuration modal
├── pages/                  # Route-based page components
│   ├── CameraPage.tsx      # DSLR interface with live view
│   ├── CountdownPage.tsx   # Pre-capture timer
│   ├── PreviewPage.tsx     # Photo review with retake option
│   ├── ThankYouPage.tsx    # Draft upload countdown
│   └── Edit*.tsx           # Edit app pages
├── constants/              # Configuration constants
│   ├── app-config.ts       # App mode selection
│   ├── api-constants.ts    # Backend API URLs
│   └── digicam.ts          # DigiCamControl settings
├── helpers/
│   ├── ipc/               # Electron IPC handlers
│   ├── database/          # Database operations
│   └── storage/           # File storage operations
├── hooks/                  # Custom React hooks
│   └── usePhoto.ts        # Photo state management
├── stores/                 # Zustand state management
│   └── ui-store.ts        # Global UI state
├── types/                  # TypeScript type definitions
│   └── photobooth.ts      # Photo-related types
└── assets/                 # Static assets
    ├── icon.ico           # App icon
    ├── frames/            # Photo frame templates
    └── icons/             # Overlay icons
```

### Key Technologies
- **Electron 37** - Desktop application framework
- **React 19** with **TypeScript 5.8** - Modern UI development
- **TanStack Router** - Type-safe routing with memory history
- **shadcn/ui** + **Tailwind CSS 4** - Beautiful UI components
- **Zustand** - Lightweight state management
- **Vitest** + **Playwright** - Comprehensive testing

### Data Flow
```
Camera Capture → Photo Draft → Edit App → Final Photo → Backend Storage
     ↓              ↓            ↓           ↓             ↓
DigiCamControl → Local Store → Frame/Text → Composite → GCS/Database
```

## 🐛 Troubleshooting

### Common Issues and Solutions

#### 1. Application Won't Start
```bash
# Check Node.js version
node --version  # Should be 18+

# Clear npm cache
npm cache clean --force

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

#### 2. DigiCamControl Connection Failed
```bash
# Verify DigiCamControl is running
# Check Task Manager for DigiCamControl.exe

# Test WebServer
curl http://127.0.0.1:5513

# Check port availability
netstat -an | findstr 5513
```

#### 3. Live View Shows Black Screen
```bash
# Check camera live view support
1. Test in DigiCamControl desktop app
2. Verify camera is not in movie mode
3. Check camera battery level
4. Ensure lens cap is removed
```

#### 4. Photo Upload Fails
```bash
# Check backend configuration
1. Verify API_BASE_URL in constants
2. Check API_KEY is valid
3. Test backend connectivity:
   curl -H "x-api-key: YOUR_KEY" https://your-backend.com/api/health
```

#### 5. Edit App Can't Fetch Photos
```bash
# Verify App ID configuration
1. Check App ID in settings modal
2. Ensure App ID matches Camera app
3. Test API endpoint:
   curl "https://your-backend.com/api/photos/drafts?code=YOUR_APP_ID"
```

### Debug Mode Features

The application includes comprehensive debug features:

#### Console Logging
- **Camera operations**: All DigiCamControl interactions
- **Photo processing**: Base64 conversion and upload progress
- **State changes**: Navigation and component lifecycle
- **API calls**: Request/response logging

#### Development Tools
- **Auto-open DevTools** in development mode
- **Hot reload** for rapid development
- **Component inspection** with React DevTools
- **Network monitoring** for API debugging

#### Status Indicators
- **DigiCamControl connection**: Visual connection status
- **Live view refresh**: 10fps refresh counter
- **Upload progress**: Real-time upload status
- **Error messages**: Detailed error descriptions

## 📄 Building for Distribution

### Build Configuration

The build system is configured in `forge.config.ts`:

```typescript
{
  packagerConfig: {
    asar: true,
    appBundleId: "com.textimoni.photobooth",
    name: "Textimoni Photobooth",
    icon: './src/assets/icon.ico',
    extraResources: [
      {
        from: 'src/assets',
        to: 'assets',
        filter: ['**/*']
      }
    ]
  }
}
```

### Build Scripts

#### Camera App Build
```bash
npm run build:camera
```
- **Output**: `out/Textimoni.exe`
- **Installer**: `out/textimoni-setup.exe`
- **Size**: ~150MB compressed

#### Edit App Build
```bash
npm run build:edit
```
- **Output**: `out/Textimoni Editor.exe`
- **Installer**: `out/textimoni-editor-setup.exe`
- **Size**: ~150MB compressed

### Distribution Checklist

Before distributing your application:

1. **Test on clean Windows machine**
2. **Verify DigiCamControl integration**
3. **Test all camera models**
4. **Check backend connectivity**
5. **Validate App ID configuration**
6. **Test fullscreen behavior**
7. **Verify icon display**
8. **Test installer on fresh system**

## 📞 Support

### Getting Help

1. **Documentation**: Read this README thoroughly
2. **Logs**: Check console logs for detailed error messages
3. **Community**: Visit project GitHub discussions
4. **Issues**: Report bugs on GitHub issues page

### Contributing

1. **Fork** the repository
2. **Create feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit changes**: `git commit -m 'Add amazing feature'`
4. **Push to branch**: `git push origin feature/amazing-feature`
5. **Open Pull Request**

### License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🎉 Quick Start Summary

1. **Install Node.js 18+**
2. **Install DigiCamControl** and enable WebServer plugin
3. **Clone repo**: `git clone <url> && cd dslr`
4. **Install deps**: `npm install`
5. **Configure API**: Edit `src/constants/api-constants.ts`
6. **Connect camera** via USB to DigiCamControl
7. **Start app**: `npm run start`
8. **Take photos!** 📸

For detailed setup and troubleshooting, see the relevant sections above.