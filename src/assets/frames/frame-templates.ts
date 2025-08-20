export interface FrameTemplate {
  id: string;
  name: string;
  category: string;
  previewImage: string;
  frameImage?: string; // Actual frame image overlay
  cssClass: string;
  style: FrameStyleConfig;
}

export interface FrameStyleConfig {
  borderWidth: number;
  borderColor: string;
  backgroundColor?: string;
  useFrameImage: boolean; // Whether to use overlay image instead of CSS border
  textSettings: {
    enabled: boolean;
    position: { x: number; y: number }; // Text position in pixels
    maxWidth?: number; // Max width for text wrapping
    fontSize: number;
    fontFamily: string;
    color: string;
    background?: string;
    padding?: number;
    align: 'left' | 'center' | 'right';
    editable: {
      position: boolean; // Can user move text position?
      color: boolean; // Can user change text color?
      size: boolean; // Can user change font size?
    };
  };
}

export const frameTemplates: FrameTemplate[] = [
  {
    id: 'none',
    name: 'No Frame',
    category: 'basic',
    previewImage: '/assets/frames/previews/no-frame.png',
    cssClass: 'frame-none',
    style: {
      borderWidth: 0,
      borderColor: 'transparent',
      useFrameImage: false,
      textSettings: {
        enabled: false,
        position: { x: 540, y: 900 },
        fontSize: 0,
        fontFamily: 'Tomorrow',
        color: 'transparent',
        align: 'center',
        editable: {
          position: false,
          color: false,
          size: false,
        },
      },
    },
  },
  {
    id: 'spotify',
    name: 'Spotify Style',
    category: 'social',
    previewImage: '/assets/frames/previews/spotify-preview.png',
    frameImage: '/assets/frames/frame-spotify.png', // User can replace with frame-spotify.png
    cssClass: 'frame-spotify',
    style: {
      borderWidth: 0,
      borderColor: 'transparent',
      useFrameImage: true,
      textSettings: {
        enabled: true,
        position: { x: 24, y: 680 }, // Bottom center area of Spotify frame (square)
        maxWidth: 700,

        fontSize: 24,
        fontFamily: 'Geist',
        color: '#ffffff',
        padding: 12,
        align: 'left',
        editable: {
          position: true,
          color: true,
          size: true,
        },
      },
    },
  },
  {
    id: 'instagram',
    name: 'Instagram Style',
    category: 'social',
    previewImage: '/assets/frames/previews/instagram-preview.png',
    frameImage: '/assets/frames/frame-instagram.png', // User can replace with frame-instagram.png
    cssClass: 'frame-instagram',
    style: {
      borderWidth: 0,
      borderColor: 'transparent',
      useFrameImage: true,
      textSettings: {
        enabled: true,
        position: { x: 16, y: 940 }, // Bottom area of Instagram frame (square)
        maxWidth: 700,
        fontSize: 26,
        fontFamily: 'Geist',
        color: '#262626',
        padding: 15,
        align: 'left',
        editable: {
          position: true,
          color: true,
          size: true,
        },
      },
    },
  },
];

// Helper function to get frame by ID
export function getFrameById(id: string): FrameTemplate | undefined {
  return frameTemplates.find(frame => frame.id === id);
}

// Helper function to get frames by category
export function getFramesByCategory(category: string): FrameTemplate[] {
  return frameTemplates.filter(frame => frame.category === category);
}

// Helper function to get default text settings for a frame
export function getDefaultTextSettings(frameId: string) {
  const frame = getFrameById(frameId);
  if (!frame || !frame.style.textSettings.enabled) return null;

  return {
    position: { ...frame.style.textSettings.position },
    fontSize: frame.style.textSettings.fontSize,
    color: frame.style.textSettings.color,
  };
}