import { useUIStore } from '@/stores';
import { FrameTemplate } from '@/assets/frames/frame-templates';
import { IconOverlay } from '@/assets/icons/overlay-icons';

interface TextSettings {
  position: { x: number; y: number };
  fontSize: number;
  color: string;
}

interface EditState {
  selectedFrame?: FrameTemplate;
  frameText: string;
  textSettings?: TextSettings;
  overlays: IconOverlay[];
}

/**
 * Edit hook using Zustand store
 * Replaces the old EditContext
 */
export const useEdit = () => {
  // Selectors from UI store
  const selectedFrame = useUIStore((state) => state.edit.selectedFrame);
  const frameText = useUIStore((state) => state.edit.frameText);
  const textSettings = useUIStore((state) => state.edit.textSettings);
  const overlays = useUIStore((state) => state.edit.overlays);

  // Computed edit state
  const editState: EditState = {
    selectedFrame,
    frameText,
    textSettings,
    overlays
  };

  // Actions from UI store
  const setSelectedFrame = useUIStore((state) => state.setSelectedFrame);
  const setFrameText = useUIStore((state) => state.setFrameText);
  const setTextSettings = useUIStore((state) => state.setTextSettings);
  const addOverlay = useUIStore((state) => state.addOverlay);
  const removeOverlay = useUIStore((state) => state.removeOverlay);
  const updateOverlay = useUIStore((state) => state.updateOverlay);
  const clearEdit = useUIStore((state) => state.clearEdit);

  return {
    editState,
    setSelectedFrame,
    setFrameText,
    setTextSettings,
    addOverlay,
    removeOverlay,
    updateOverlay,
    clearEdit
  };
};