import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import {
  PhotoRecord,
  PhotoEditRecord,
  CreatePhotoEditData,
  PhotoContextState,
  GeneratedPhotoMetadata,
  TextSettings
} from '@/types/photobooth';

interface PhotoContextType extends PhotoContextState {
  // Actions
  capturePhoto: (imageData: string) => Promise<PhotoRecord>;
  savePhotoEdit: (editData: CreatePhotoEditData) => Promise<PhotoEditRecord>;
  generateFinalPhoto: (photoId: string, editData: CreatePhotoEditData) => Promise<string>;
  loadRecentPhotos: () => Promise<PhotoRecord[]>;
  deletePhoto: (photoId: string) => Promise<void>;
  clearCurrentPhoto: () => void;
  clearCurrentEdit: () => void;
  // Timer controls
  countdownDuration: number;
  setCountdownDuration: (duration: number) => void;
}

const PhotoContext = createContext<PhotoContextType | undefined>(undefined);

export const PhotoContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<PhotoContextState>({
    currentPhoto: null,
    currentEdit: null,
    capturedPhotos: [],
    isCapturing: false,
    isSaving: false,
    isLoading: false,
  });

  const [countdownDuration, setCountdownDuration] = useState<number>(3);

  const capturePhoto = useCallback(async (imageData: string): Promise<PhotoRecord> => {
    setState(prev => ({ ...prev, isCapturing: true }));

    try {
      // Create metadata for the photo
      const metadata = {
        frameTemplateId: undefined,
        frameText: undefined,
        textSettings: undefined,
        overlays: [],
      };

      // Save via IPC to main process
      const savedPhoto = await window.storageAPI.savePhoto(imageData, metadata);

      setState(prev => ({
        ...prev,
        currentPhoto: savedPhoto,
        capturedPhotos: [savedPhoto, ...prev.capturedPhotos],
        isCapturing: false,
      }));

      return savedPhoto;
    } catch (error) {
      setState(prev => ({ ...prev, isCapturing: false }));
      throw error;
    }
  }, []);

  const savePhotoEdit = useCallback(async (editData: CreatePhotoEditData): Promise<PhotoEditRecord> => {
    setState(prev => ({ ...prev, isSaving: true }));

    try {
      // Save edit via IPC
      const savedEdit = await window.storageAPI.savePhotoEdit(editData);

      setState(prev => ({
        ...prev,
        currentEdit: savedEdit,
        isSaving: false,
      }));

      return savedEdit;
    } catch (error) {
      setState(prev => ({ ...prev, isSaving: false }));
      throw error;
    }
  }, []);

  const generateFinalPhoto = useCallback(async (
    photoId: string,
    editData: CreatePhotoEditData
  ): Promise<string> => {
    setState(prev => ({ ...prev, isSaving: true }));

    try {
      // First, save the edit
      await savePhotoEdit(editData);

      // Generate the final photo with frame and overlays
      // This will be implemented in photo-generator helper
      const { generateFinalPhoto: generatePhoto } = await import('@/helpers/photo-generator/photo-composer');

      const photo = state.currentPhoto;
      if (!photo) throw new Error('No current photo to generate from');

      const frameTemplate = editData.frameTemplateId
        ? (await import('@/assets/frames/frame-templates')).getFrameById(editData.frameTemplateId)
        : undefined;

      const finalPhotoData = await generatePhoto(
        photo.file_path,
        frameTemplate,
        editData.frameText,
        editData.overlays,
        editData.textSettings
      );

      // Save the generated photo
      const generatedMetadata: GeneratedPhotoMetadata = {
        originalPhotoId: photoId,
        frameTemplateId: editData.frameTemplateId,
        frameText: editData.frameText,
        textSettings: editData.textSettings,
        overlays: editData.overlays,
      };

      await window.storageAPI.saveGeneratedPhoto(finalPhotoData, generatedMetadata);

      setState(prev => ({ ...prev, isSaving: false }));

      return finalPhotoData;
    } catch (error) {
      setState(prev => ({ ...prev, isSaving: false }));
      throw error;
    }
  }, [savePhotoEdit, state.currentPhoto]);

  const loadRecentPhotos = useCallback(async (): Promise<PhotoRecord[]> => {
    setState(prev => ({ ...prev, isLoading: true }));

    try {
      const photos = await window.storageAPI.getPhotos();

      setState(prev => ({
        ...prev,
        capturedPhotos: photos,
        isLoading: false,
      }));

      return photos;
    } catch (error) {
      setState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  }, []);

  const deletePhoto = useCallback(async (photoId: string): Promise<void> => {
    try {
      await window.storageAPI.deletePhoto(photoId);

      setState(prev => ({
        ...prev,
        capturedPhotos: prev.capturedPhotos.filter(photo => photo.id !== photoId),
        currentPhoto: prev.currentPhoto?.id === photoId ? null : prev.currentPhoto,
      }));
    } catch (error) {
      throw error;
    }
  }, []);

  const clearCurrentPhoto = useCallback(() => {
    setState(prev => ({ ...prev, currentPhoto: null }));
  }, []);

  const clearCurrentEdit = useCallback(() => {
    setState(prev => ({ ...prev, currentEdit: null }));
  }, []);

  return (
    <PhotoContext.Provider
      value={{
        ...state,
        capturePhoto,
        savePhotoEdit,
        generateFinalPhoto,
        loadRecentPhotos,
        deletePhoto,
        clearCurrentPhoto,
        clearCurrentEdit,
        countdownDuration,
        setCountdownDuration,
      }}
    >
      {children}
    </PhotoContext.Provider>
  );
};

export const usePhotoContext = (): PhotoContextType => {
  const context = useContext(PhotoContext);
  if (!context) {
    throw new Error('usePhotoContext must be used within PhotoContextProvider');
  }
  return context;
};