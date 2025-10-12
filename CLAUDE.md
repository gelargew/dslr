# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **dual-application DSLR photobooth system** built with Electron, React 19, and TypeScript. The system consists of:

1. **Photobooth App** - Interactive photo capture and editing interface
2. **Videotron App** - Gallery display for showing captured photos

Both apps share the same codebase but run in different modes via command-line arguments.

## Development Commands

### Starting Applications
```bash
# Start photobooth app (main)
npm run start

# Start videotron app (gallery display)
npm run start:videotron

# Start both apps simultaneously for development
npm run dev:dual
```

### Testing
```bash
npm run test:unit               # Run unit tests (Vitest)
npm run test:e2e                # Run E2E tests (Playwright)
npm run test:all                # Run all tests
```

### Code Quality
```bash
npm run lint                    # ESLint code checking
npm run format:write            # Prettier code formatting
```

### Building & Distribution
```bash
npm run package                 # Package for distribution
npm run make                    # Create installers
npm run publish                 # Publish updates
```

## Architecture Overview

### Technology Stack
- **Electron 37** - Desktop application framework
- **React 19** with **TypeScript 5.8** - UI framework
- **TanStack Router** - Client-side routing with memory history
- **shadcn/ui** + **Tailwind CSS 4** - UI components and styling
- **Turso (libsql)** - Cloud SQLite database for photo metadata
- **Google Cloud Storage** - Photo file storage
- **Vitest** + **Playwright** - Testing frameworks

### Application Flow

#### Photobooth Workflow
1. **Welcome** (`/`) - Landing page with start button
2. **Camera** (`/camera`) - Webcam interface with capture functionality
3. **Countdown** (`/countdown`) - 3-second timer before capture
4. **Preview** (`/preview`) - Photo review with retake/finish options
5. **Thank You** (`/thank-you`) - Confirmation with auto-return
6. **Edit Landing** (`/edit`) - Entry point for editing flow
7. **Edit Photo** (`/edit/photo`) - Frame selection and text input
8. **Edit Overlay** (`/edit/overlay`) - Icon placement on photos
9. **Complete** (`/complete`) - Final thank you and completion

#### Videotron Gallery
- **Gallery** (`/gallery`) - 4-row infinite scrolling grid with auto-refresh

### Key Directories
```
src/
├── components/
│   ├── ui/             # shadcn/ui components
│   └── videotron/      # Gallery display components
├── pages/              # Route-based page components
├── routes/             # TanStack Router configuration
├── helpers/            # Utility functions and IPC handlers
│   ├── ipc/           # Electron IPC communication
│   ├── database/      # Database operations (Turso)
│   └── storage/       # File storage operations (GCS)
├── contexts/           # React context providers
├── hooks/              # Custom React hooks
├── styles/             # Global CSS and Tailwind config
└── assets/             # Static assets (fonts, images, frames)
```

## Database Schema (Turso)

```sql
CREATE TABLE photos (
  id TEXT PRIMARY KEY,
  filename TEXT NOT NULL,
  gcs_url TEXT,
  thumbnail_url TEXT,
  original_photo_id TEXT,
  frame_template_id TEXT,
  frame_text TEXT,
  text_settings TEXT, -- JSON
  overlays TEXT, -- JSON
  created_at TEXT,
  updated_at TEXT
);
```

## Electron Integration

### IPC Architecture
- **Main Process**: Camera access, file operations, database connections
- **Preload Script**: Exposes safe APIs to renderer process
- **Renderer Process**: React UI with IPC communication

### App Mode Detection
The application detects its mode based on command-line arguments:
- `npm run start` → Photobooth mode (starts at `/`)
- `npm run start:videotron` → Videotron mode (starts at `/gallery`)

### Camera Integration
- Uses WebRTC `getUserMedia` API through Electron IPC
- Enhanced camera permissions via main process
- Square format cropping for consistent photos
- Graceful permission handling with error guidance

## Component Patterns

### Photobooth Components
- Fullscreen layouts optimized for touch interaction
- Glass morphism design with backdrop blur effects
- Large buttons (44px+ touch targets) for kiosk use
- Auto-navigation with timers for seamless flow

### Videotron Components
- Infinite scrolling photo grid with 4-row layout
- Real-time photo synchronization between apps
- Animation effects for new photo highlights
- Performance optimized for large image galleries

## Development Guidelines

### State Management
- React Context for global photo state
- Local state for component-specific data
- IPC communication for system integration
- Database synchronization for multi-app data sharing

### Styling Conventions
- Tailwind CSS with custom theme in `src/styles/global.css`
- Geist font family for typography
- CSS custom properties for theming
- Responsive design with fullscreen optimization

### File Organization
- Create photo-specific components in `src/components/photobooth/`
- Create videotron components in `src/components/videotron/`
- Add camera utilities in `src/helpers/camera/`
- Store frame templates and overlay icons as local assets

## Testing Strategy

### Unit Testing
- Component testing with React Testing Library
- Utility function testing with Vitest
- IPC handler testing

### E2E Testing
- Full photobooth workflow testing with Playwright
- Dual-app communication testing
- Camera functionality testing
- Cross-platform compatibility testing

## Production Considerations

### Security
- Context isolation enabled in Electron
- Node integration disabled for security
- Sandboxing configurations
- Proper permission handling for camera access

### Performance
- Efficient photo processing with canvas manipulation
- Lazy loading for gallery components
- Memory management for large image files
- Optimized animations with CSS transforms

### Deployment
- Cross-platform builds (Windows, macOS, Linux)
- Auto-updater configuration
- Code signing setup
- Installer creation with Electron Forge

## Common Tasks

### Adding New Photo Frame
1. Add frame template to `src/assets/frames/`
2. Update `frameTemplates` array in relevant files
3. No database changes needed - uses local assets

### Adding New Overlay Icon
1. Add icon to `src/assets/icons/`
2. Update `overlayIcons` array
3. Icon will be available in editing flow

### Creating New Page
1. Create component in `src/pages/`
2. Add route in `src/routes/routes.tsx`
3. Follow existing fullscreen layout patterns

### Adding IPC Handler
1. Define channels in appropriate `src/helpers/ipc/[feature]/[feature]-channels.ts`
2. Implement handler in `[feature]-main.ts`
3. Expose context in `[feature]-context.ts`
4. Register in main process

## Configuration Files

- `forge.config.ts` - Electron Forge build configuration
- `tsconfig.json` - TypeScript configuration with path aliases
- `vitest.config.ts` - Unit testing configuration
- `src/styles/global.css` - Tailwind CSS with custom theme

## Environment Setup

### Database Setup
1. Configure Turso database connection in `src/helpers/database/turso-client.ts`
2. Set up Google Cloud Storage in `src/helpers/storage/gcs-storage.ts`
3. Ensure proper credentials configuration

### Development Environment
1. Install dependencies: `npm install`
2. Start development: `npm run start` or `npm run start:videotron`
3. Run tests: `npm run test:all`
4. Format code: `npm run format:write`