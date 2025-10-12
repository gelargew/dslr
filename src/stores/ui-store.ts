import { create } from 'zustand';
import {
  PhotoRecord,
  PhotoEditRecord,
  CreatePhotoEditData,
  TextSettings,
  GeneratedPhotoMetadata
} from '@/types/photobooth';
import { FrameTemplate } from '@/assets/frames/frame-templates';
import { IconOverlay } from '@/assets/icons/overlay-icons';

// UI State - Not persisted (resets on app restart)
export interface UIState {
  // Debugger UI State
  debugger: {
    visible: boolean;
  };

  // Settings Dialog State
  settings: {
    isOpen: boolean;
  };

  // Photo State
  photos: {
    currentPhoto: PhotoRecord | null;
    currentEdit: PhotoEditRecord | null;
    capturedPhotos: PhotoRecord[];
    isCapturing: boolean;
    isSaving: boolean;
    isLoading: boolean;
  };

  // Edit State
  edit: {
    selectedFrame?: FrameTemplate;
    frameText: string;
    textSettings?: TextSettings;
    overlays: IconOverlay[];
  };

  // System UI State
  system: {
    isLoading: boolean;
    error: string | null;
    lastActivity: number;
  };
}

// Default UI state (resets on every app restart)
const defaultUIState: UIState = {
  debugger: {
    visible: false
  },
  settings: {
    isOpen: false
  },
  photos: {
    currentPhoto: null,
    currentEdit: null,
    capturedPhotos: [],
    isCapturing: false,
    isSaving: false,
    isLoading: false
  },
  edit: {
    selectedFrame: undefined,
    frameText: '',
    textSettings: undefined,
    overlays: []
  },
  system: {
    isLoading: false,
    error: null,
    lastActivity: Date.now()
  }
};

// Create the UI store (no persistence)
export const useUIStore = create<UIState>()((set, get) => ({
  ...defaultUIState,

  // Debugger Actions
  setDebuggerVisible: (visible: boolean) => {
    set((state) => ({
      ...state,
      debugger: {
        ...state.debugger,
        visible
      }
    }));
    console.log(`🐛 UI Store: Debugger ${visible ? 'shown' : 'hidden'}`);
  },

  toggleDebugger: () => {
    const currentVisible = get().debugger.visible;
    set((state) => ({
      ...state,
      debugger: {
        ...state.debugger,
        visible: !currentVisible
      }
    }));
    console.log(`🐛 UI Store: Debugger toggled (${!currentVisible ? 'shown' : 'hidden'})`);
  },

  // Settings Dialog Actions
  setSettingsOpen: (isOpen: boolean) => {
    set((state) => ({
      ...state,
      settings: {
        ...state.settings,
        isOpen
      }
    }));
    console.log(`🔧 UI Store: Settings dialog ${isOpen ? 'opened' : 'closed'}`);
  },

  openSettings: () => {
    set((state) => ({
      ...state,
      settings: {
        ...state.settings,
        isOpen: true
      }
    }));
    console.log('🔧 UI Store: Opening settings dialog');
  },

  closeSettings: () => {
    set((state) => ({
      ...state,
      settings: {
        ...state.settings,
        isOpen: false
      }
    }));
    console.log('🔧 UI Store: Closing settings dialog');
  },

  toggleSettings: () => {
    const currentOpen = get().settings.isOpen;
    set((state) => ({
      ...state,
      settings: {
        ...state.settings,
        isOpen: !currentOpen
      }
    }));
    console.log(`🔧 UI Store: Settings toggled (${!currentOpen ? 'opened' : 'closed'})`);
  },

  // Photo Actions
  setCurrentPhoto: (photo: PhotoRecord | null) => {
    set((state) => ({
      ...state,
      photos: {
        ...state.photos,
        currentPhoto: photo
      }
    }));
  },

  setCurrentEdit: (edit: PhotoEditRecord | null) => {
    set((state) => ({
      ...state,
      photos: {
        ...state.photos,
        currentEdit: edit
      }
    }));
  },

  setCapturedPhotos: (photos: PhotoRecord[]) => {
    set((state) => ({
      ...state,
      photos: {
        ...state.photos,
        capturedPhotos: photos
      }
    }));
  },

  addCapturedPhoto: (photo: PhotoRecord) => {
    set((state) => ({
      ...state,
      photos: {
        ...state.photos,
        currentPhoto: photo,
        capturedPhotos: [photo, ...state.photos.capturedPhotos]
      }
    }));
  },

  setPhotoCapturing: (isCapturing: boolean) => {
    set((state) => ({
      ...state,
      photos: {
        ...state.photos,
        isCapturing
      }
    }));
  },

  setPhotoSaving: (isSaving: boolean) => {
    set((state) => ({
      ...state,
      photos: {
        ...state.photos,
        isSaving
      }
    }));
  },

  setPhotoLoading: (isLoading: boolean) => {
    set((state) => ({
      ...state,
      photos: {
        ...state.photos,
        isLoading
      }
    }));
  },

  removePhoto: (photoId: string) => {
    set((state) => ({
      ...state,
      photos: {
        ...state.photos,
        capturedPhotos: state.photos.capturedPhotos.filter(photo => photo.id !== photoId),
        currentPhoto: state.photos.currentPhoto?.id === photoId ? null : state.photos.currentPhoto
      }
    }));
  },

  clearCurrentPhoto: () => {
    set((state) => ({
      ...state,
      photos: {
        ...state.photos,
        currentPhoto: null
      }
    }));
  },

  clearCurrentEdit: () => {
    set((state) => ({
      ...state,
      photos: {
        ...state.photos,
        currentEdit: null
      }
    }));
  },

  // Edit Actions
  setSelectedFrame: (frame?: FrameTemplate) => {
    set((state) => ({
      ...state,
      edit: {
        ...state.edit,
        selectedFrame: frame
      }
    }));
  },

  setFrameText: (text: string) => {
    set((state) => ({
      ...state,
      edit: {
        ...state.edit,
        frameText: text
      }
    }));
  },

  setTextSettings: (settings?: TextSettings) => {
    set((state) => ({
      ...state,
      edit: {
        ...state.edit,
        textSettings: settings
      }
    }));
  },

  addOverlay: (overlay: IconOverlay) => {
    set((state) => ({
      ...state,
      edit: {
        ...state.edit,
        overlays: [...state.edit.overlays, overlay]
      }
    }));
  },

  removeOverlay: (overlayId: string) => {
    set((state) => ({
      ...state,
      edit: {
        ...state.edit,
        overlays: state.edit.overlays.filter(overlay => overlay.id !== overlayId)
      }
    }));
  },

  updateOverlay: (overlayId: string, updates: Partial<IconOverlay>) => {
    set((state) => ({
      ...state,
      edit: {
        ...state.edit,
        overlays: state.edit.overlays.map(overlay =>
          overlay.id === overlayId ? { ...overlay, ...updates } : overlay
        )
      }
    }));
  },

  clearEdit: () => {
    set((state) => ({
      ...state,
      edit: {
        selectedFrame: undefined,
        frameText: '',
        textSettings: undefined,
        overlays: []
      }
    }));
  },

  // System Actions
  setSystemLoading: (isLoading: boolean) => {
    set((state) => ({
      ...state,
      system: {
        ...state.system,
        isLoading,
        lastActivity: Date.now()
      }
    }));
  },

  setSystemError: (error: string | null) => {
    set((state) => ({
      ...state,
      system: {
        ...state.system,
        error,
        lastActivity: Date.now()
      }
    }));
  },

  clearSystemError: () => {
    set((state) => ({
      ...state,
      system: {
        ...state.system,
        error: null,
        lastActivity: Date.now()
      }
    }));
  },

  // Reset Actions
  resetUI: () => {
    set(defaultUIState);
    console.log('🔄 UI Store: UI state reset to defaults');
  },

  resetPhotos: () => {
    set((state) => ({
      ...state,
      photos: {
        ...defaultUIState.photos
      }
    }));
  },

  resetEdit: () => {
    set((state) => ({
      ...state,
      edit: {
        ...defaultUIState.edit
      }
    }));
  }
}));

// Export store type for TypeScript
export type UIStore = ReturnType<typeof useUIStore>;