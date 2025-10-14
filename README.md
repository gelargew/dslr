# Textimoni DSLR Photobooth System

A modular DSLR photobooth system built with Electron, React 19, and TypeScript. The system consists of multiple independent applications that can be deployed separately for different use cases.

## 🎯 Applications

### 1. Camera App
- **Purpose**: High-volume photo capture with automatic draft upload
- **Flow**: HomePage → CameraPage → CountdownPage → PreviewPage → ThankYouPage → back to HomePage
- **Features**:
  - DigiCamControl integration for DSLR capture
  - Live view control (start/stop)
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
  - Final photo upload to backend

### 3. Videotron App
- **Purpose**: Gallery display for large screens
- **Flow**: Gallery page with infinite scrolling
- **Features**:
  - 4-row infinite scrolling photo grid
  - Real-time photo synchronization
  - Optimized for large display screens

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- DigiCamControl software installed and running
- Access to the backend API

### Installation

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd dslr
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure App Mode**
   Edit `src/constants/app-config.ts` to set your desired app mode:
   ```typescript
   export const APP_MODE: AppMode = 'CAMERA'; // or 'EDIT' or 'VIDEOTRON'
   ```

4. **Start the application**
```bash
npm run start
```

## ⚙️ App Mode Configuration

### Switching Between Apps

To switch between different app modes, edit the `APP_MODE` constant in `src/constants/app-config.ts`:

```typescript
// src/constants/app-config.ts

// Available modes
export type AppMode = 'CAMERA' | 'EDIT' | 'VIDEOTRON';

// Change this line to switch apps
export const APP_MODE: AppMode = 'CAMERA'; // ← Change this value

// Options:
// 'CAMERA'  - Photo capture and draft upload
// 'EDIT'    - Photo editing with configuration
// 'VIDEOTRON' - Gallery display
```

### Each App Mode Details

#### **CAMERA Mode**
```typescript
export const APP_MODE: AppMode = 'CAMERA';
```
- **Entry Point**: Starts at HomePage (`/`)
- **Use Case**: High-volume photobooth operation
- **Features**: Photo capture, live view control, automatic draft upload

#### **EDIT Mode**
```typescript
export const APP_MODE: AppMode = 'EDIT';
```
- **Entry Point**: Starts at EditLandingPage (`/edit`)
- **Use Case**: Photo editing station
- **Features**: Edit captured photos, configure App ID
- **Config**: Built-in settings modal for App ID management

#### **VIDEOTRON Mode**
```typescript
export const APP_MODE: AppMode = 'VIDEOTRON';
```
- **Entry Point**: Starts at Gallery page (`/gallery`)
- **Use Case**: Photo display on large screens
- **Features**: Infinite scrolling gallery, real-time updates

## 📱 App ID Configuration (Edit App)

The Edit App includes a built-in configuration system for managing the App ID:

### What is App ID?
- Used for grouping photos in the backend
- Allows multiple photobooth setups to work independently
- Controls which photo drafts are fetched for editing

### How to Configure App ID

1. **Start the app in EDIT mode**:
   ```typescript
   export const APP_MODE: AppMode = 'EDIT';
   ```

2. **Open the Settings**:
   - Click the Settings button on EditLandingPage
   - Enter your desired App ID (e.g., "booth-1", "event-name", etc.)

3. **App ID Persistence**:
   - App ID is automatically saved
   - Persists across app restarts
   - No rebuild required when changing

### Use Cases for Multiple App IDs
- **Multiple Events**: Each event gets its own App ID
- **Multiple Booths**: Each booth location has separate App ID
- **Testing**: Use different App IDs for testing vs production

## 🛠️ Development

### Available Scripts

```bash
# Development
npm run start              # Start app in development mode (uses current APP_MODE setting)

# Building (App-Specific)
npm run build:camera       # Build Camera app only (Textimoni.exe)
npm run build:edit         # Build Edit app only (Textimoni Editor.exe)
npm run build:all          # Build all apps (creates separate executables)

# Regular Building
npm run package           # Package for distribution (uses current APP_MODE setting)
npm run make              # Create installers (uses current APP_MODE setting)
npm run publish           # Publish updates

# Code Quality
npm run lint              # ESLint code checking
npm run format:write      # Prettier code formatting

# Testing
npm run test:unit         # Run unit tests (Vitest)
npm run test:e2e          # Run E2E tests (Playwright)
npm run test:all          # Run all tests
```

### Building Different Apps

#### Method 1: Using Build Scripts (Recommended)
```bash
# Build Camera app
npm run build:camera

# Build Edit app
npm run build:edit

# Build all apps
npm run build:all
```

#### Method 2: Manual Configuration
1. Edit `src/constants/app-config.ts`:
   ```typescript
   export const APP_MODE: AppMode = 'CAMERA'; // or 'EDIT'
   ```
2. Run build command:
   ```bash
   npm run make
   ```

### Generated Files

#### Camera App (`npm run build:camera`)
- **Executable**: `Textimoni.exe`
- **Installer**: `textimoni-setup.exe`
- **Bundle ID**: `com.textimoni.textimoni`

#### Edit App (`npm run build:edit`)
- **Executable**: `Textimoni Editor.exe`
- **Installer**: `textimoni-editor-setup.exe`
- **Bundle ID**: `com.textimoni.textimoni_editor`

### Technology Stack

- **Electron 37** - Desktop application framework
- **React 19** with **TypeScript 5.8** - UI framework
- **TanStack Router** - Client-side routing
- **shadcn/ui** + **Tailwind CSS 4** - UI components and styling
- **Zustand** - State management
- **Vitest** + **Playwright** - Testing frameworks

### DigiCamControl Integration

The system integrates with DigiCamControl for DSLR camera control:

- **Live View**: Real-time camera preview via HTTP
- **Photo Capture**: Programmatic capture through web API
- **File Download**: Automatic download of captured photos
- **Control Commands**: Start/stop live view functionality

### Backend API Integration

The system connects to a RESTful backend for:

- **Photo Draft Upload**: Upload captured photos as drafts
- **Final Photo Upload**: Upload edited photos with frames and overlays
- **Photo Retrieval**: Fetch drafts for editing by App ID

## 📁 Project Structure

```
src/
├── components/
│   ├── ui/             # shadcn/ui components
│   └── ConfigModal.tsx # App ID configuration modal
├── pages/              # Route-based page components
│   ├── HomePage.tsx     # Welcome screen
│   ├── CameraPage.tsx   # DSLR interface
│   ├── CountdownPage.tsx # Pre-capture countdown
│   ├── PreviewPage.tsx  # Photo review
│   ├── ThankYouPage.tsx # Draft upload countdown
│   ├── EditLandingPage.tsx # Edit app entry
│   ├── EditPhotoPage.tsx # Frame & text editing
│   ├── EditOverlayPage.tsx # Icon placement
│   ├── CompletePage.tsx # Final screen
│   └── GalleryPage.tsx # Videotron gallery
├── constants/
│   ├── app-config.ts   # App mode configuration
│   ├── api-constants.ts # Backend API URLs
│   └── digicam.ts      # DigiCamControl settings
├── helpers/            # Utility functions and IPC handlers
├── hooks/              # Custom React hooks
├── routes/             # TanStack Router configuration
└── stores/             # Zustand state management
```

## 🔧 Configuration

### Backend API Configuration

Edit `src/constants/api-constants.ts`:

```typescript
export const API_BASE_URL = 'https://your-backend-url.com';
export const API_KEY = 'your-api-key';
```

### DigiCamControl Configuration

Edit `src/constants/digicam.ts`:

```typescript
export const DIGICAM_CONFIG = {
  BASE_URL: 'http://127.0.0.1:5513',
  LIVEVIEW_URL: 'http://127.0.0.1:5513/liveview.jpeg',
  CAPTURE_URL: 'http://127.0.0.1:5513/?CMD=Capture',
  // ... other settings
};
```

## 🐛 Troubleshooting

### Common Issues

1. **DigiCamControl Connection Failed**
   - Ensure DigiCamControl is running
   - Check that WebServer plugin is enabled in DigiCamControl
   - Verify port 5513 is available

2. **Backend API Errors**
   - Check API_BASE_URL and API_KEY configuration
   - Verify backend server is running
   - Check network connectivity

3. **App ID Not Saving**
   - Ensure Edit app mode is selected
   - Check settings modal is opening properly
   - Verify app has file system permissions

4. **Live View Not Working**
   - Check DigiCamControl live view settings
   - Verify live view URL configuration
   - Check for firewall blocking port 5513

### Debug Mode

The app includes debug features:
- Developer tools automatically open in development
- Console logging for all major operations
- Status indicators for DigiCamControl connection

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.