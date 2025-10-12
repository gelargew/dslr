import { useCallback } from 'react';
import { useUIStore } from '@/stores';
import {
  PhotoRecord,
  PhotoEditRecord,
  CreatePhotoEditData,
  PhotoContextState,
  GeneratedPhotoMetadata,
  TextSettings
} from '@/types/photobooth';

/**
 * Photo hook using Zustand store
 * Replaces the old PhotoContext
 */
export const usePhoto = () => {
  // Selectors from UI store
  const currentPhoto = useUIStore((state) => state.photos.currentPhoto);
  const currentEdit = useUIStore((state) => state.photos.currentEdit);
  const capturedPhotos = useUIStore((state) => state.photos.capturedPhotos);
  const isCapturing = useUIStore((state) => state.photos.isCapturing);
  const isSaving = useUIStore((state) => state.photos.isSaving);
  const isLoading = useUIStore((state) => state.photos.isLoading);

  // Actions from UI store
  const setCurrentPhoto = useUIStore((state) => state.setCurrentPhoto);
  const setCurrentEdit = useUIStore((state) => state.setCurrentEdit);
  const setCapturedPhotos = useUIStore((state) => state.setCapturedPhotos);
  const addCapturedPhoto = useUIStore((state) => state.addCapturedPhoto);
  const setPhotoCapturing = useUIStore((state) => state.setPhotoCapturing);
  const setPhotoSaving = useUIStore((state) => state.setPhotoSaving);
  const setPhotoLoading = useUIStore((state) => state.setPhotoLoading);
  const removePhoto = useUIStore((state) => state.removePhoto);
  const clearCurrentPhoto = useUIStore((state) => state.clearCurrentPhoto);
  const clearCurrentEdit = useUIStore((state) => state.clearCurrentEdit);

  // Actions with IPC calls
  const capturePhoto = useCallback(async (imageData: string): Promise<PhotoRecord> => {
    setPhotoCapturing(true);

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

      addCapturedPhoto(savedPhoto);

      return savedPhoto;
    } catch (error) {
      setPhotoCapturing(false);
      throw error;
    } finally {
      setPhotoCapturing(false);
    }
  }, [setPhotoCapturing, addCapturedPhoto]);

  const savePhotoEdit = useCallback(async (editData: CreatePhotoEditData): Promise<PhotoEditRecord> => {
    setPhotoSaving(true);

    try {
      // Save edit via IPC
      const savedEdit = await window.storageAPI.savePhotoEdit(editData);

      setCurrentEdit(savedEdit);

      return savedEdit;
    } catch (error) {
      setPhotoSaving(false);
      throw error;
    } finally {
      setPhotoSaving(false);
    }
  }, [setPhotoSaving, setCurrentEdit]);

  const generateFinalPhoto = useCallback(async (
    photoId: string,
    editData: CreatePhotoEditData
  ): Promise<string> => {
    setPhotoSaving(true);

    try {
      // First, save the edit
      await savePhotoEdit(editData);

      // Generate the final photo with frame and overlays
      const { generateFinalPhoto: generatePhoto } = await import('@/helpers/photo-generator/photo-composer');

      if (!currentPhoto) throw new Error('No current photo to generate from');

      const frameTemplate = editData.frameTemplateId
        ? (await import('@/assets/frames/frame-templates')).getFrameById(editData.frameTemplateId)
        : undefined;

      const finalPhotoData = await generatePhoto(
        currentPhoto.file_path,
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

      return finalPhotoData;
    } catch (error) {
      setPhotoSaving(false);
      throw error;
    } finally {
      setPhotoSaving(false);
    }
  }, [savePhotoEdit, currentPhoto, setPhotoSaving]);

  const loadRecentPhotos = useCallback(async (): Promise<PhotoRecord[]> => {
    setPhotoLoading(true);

    try {
      const photos = await window.storageAPI.getPhotos();

      setCapturedPhotos(photos);

      return photos;
    } catch (error) {
      setPhotoLoading(false);
      throw error;
    } finally {
      setPhotoLoading(false);
    }
  }, [setPhotoLoading, setCapturedPhotos]);

  const deletePhoto = useCallback(async (photoId: string): Promise<void> => {
    try {
      await window.storageAPI.deletePhoto(photoId);

      removePhoto(photoId);
    } catch (error) {
      throw error;
    }
  }, [removePhoto]);

  return {
    // State
    currentPhoto,
    currentEdit,
    capturedPhotos,
    isCapturing,
    isSaving,
    isLoading,

    // Actions
    capturePhoto,
    savePhotoEdit,
    generateFinalPhoto,
    loadRecentPhotos,
    deletePhoto,
    clearCurrentPhoto,
    clearCurrentEdit
  };
};