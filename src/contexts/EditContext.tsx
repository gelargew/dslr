import React, { createContext, useContext, useState, ReactNode } from 'react';
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

interface EditContextType {
  editState: EditState;
  setSelectedFrame: (frame?: FrameTemplate) => void;
  setFrameText: (text: string) => void;
  setTextSettings: (settings?: TextSettings) => void;
  addOverlay: (overlay: IconOverlay) => void;
  removeOverlay: (overlayId: string) => void;
  updateOverlay: (overlayId: string, updates: Partial<IconOverlay>) => void;
  clearEdit: () => void;
}

const EditContext = createContext<EditContextType | undefined>(undefined);

export const EditContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [editState, setEditState] = useState<EditState>({
    selectedFrame: undefined,
    frameText: '',
    textSettings: undefined,
    overlays: [],
  });

  const setSelectedFrame = (frame?: FrameTemplate) => {
    setEditState(prev => ({ ...prev, selectedFrame: frame }));
  };

  const setFrameText = (text: string) => {
    setEditState(prev => ({ ...prev, frameText: text }));
  };

  const setTextSettings = (settings?: TextSettings) => {
    setEditState(prev => ({ ...prev, textSettings: settings }));
  };

  const addOverlay = (overlay: IconOverlay) => {
    setEditState(prev => ({
      ...prev,
      overlays: [...prev.overlays, overlay],
    }));
  };

  const removeOverlay = (overlayId: string) => {
    setEditState(prev => ({
      ...prev,
      overlays: prev.overlays.filter(overlay => overlay.id !== overlayId),
    }));
  };

  const updateOverlay = (overlayId: string, updates: Partial<IconOverlay>) => {
    setEditState(prev => ({
      ...prev,
      overlays: prev.overlays.map(overlay =>
        overlay.id === overlayId ? { ...overlay, ...updates } : overlay
      ),
    }));
  };

  const clearEdit = () => {
    setEditState({
      selectedFrame: undefined,
      frameText: '',
      textSettings: undefined,
      overlays: [],
    });
  };

  return (
    <EditContext.Provider
      value={{
        editState,
        setSelectedFrame,
        setFrameText,
        setTextSettings,
        addOverlay,
        removeOverlay,
        updateOverlay,
        clearEdit,
      }}
    >
      {children}
    </EditContext.Provider>
  );
};

export const useEditContext = (): EditContextType => {
  const context = useContext(EditContext);
  if (!context) {
    throw new Error('useEditContext must be used within EditContextProvider');
  }
  return context;
};
