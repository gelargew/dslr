import { useCallback, useState } from 'react';
import { useUIStore } from '@/stores';
import { useConfigStore } from '@/stores/config-store';
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

  // Get app ID from config store (used as group code)
  const appId = useConfigStore((state) => state.app.id);

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

  // Convert base64 to File
  const base64ToFile = useCallback((base64: string, filename: string): File => {
    const arr = base64.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);

    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }

    return new File([u8arr], filename, { type: mime });
  }, []);

  // Upload photo draft (after capture)
  const uploadPhotoDraft = useCallback(async (imageData: string, httpUrl?: string): Promise<PhotoRecord> => {
    setPhotoCapturing(true);

    try {
      if (!appId) {
        throw new Error('App ID not available');
      }

      // Convert base64 to File
      const file = base64ToFile(imageData, `photo-draft-${Date.now()}.jpg`);

      // Upload via HTTP API
      const result = await window.httpAPI.uploadPhotoDraft(file, appId);

      if (!result.success) {
        throw new Error(result.error || 'Failed to upload photo draft');
      }

      // Create photo record for local state
      const photoRecord: PhotoRecord = {
        id: result.data.id.toString(),
        filename: `photo-draft-${Date.now()}.jpg`,
        file_path: httpUrl || result.data.url, // Use HTTP URL if provided, otherwise uploaded URL
        original_width: 1920,
        original_height: 1080,
        file_size: file.size,
        created_at: result.data.createdAt,
        updated_at: result.data.createdAt,
        is_edited: false,
        is_deleted: false,
      };

      addCapturedPhoto(photoRecord);

      return photoRecord;
    } catch (error) {
      setPhotoCapturing(false);
      throw error;
    } finally {
      setPhotoCapturing(false);
    }
  }, [appId, setPhotoCapturing, addCapturedPhoto, base64ToFile]);

  // Legacy capturePhoto method for compatibility
  const capturePhoto = useCallback(async (imageData: string, httpUrl?: string): Promise<PhotoRecord> => {
    return uploadPhotoDraft(imageData, httpUrl);
  }, [uploadPhotoDraft]);

  const savePhotoEdit = useCallback(async (editData: CreatePhotoEditData): Promise<PhotoEditRecord> => {
    setPhotoSaving(true);

    try {
      // For now, just store the edit locally. The final upload will happen in uploadFinalPhoto
      const editRecord: PhotoEditRecord = {
        id: `edit-${Date.now()}`,
        photo_id: editData.photoId,
        frame_template_id: editData.frameTemplateId,
        frame_text: editData.frameText,
        text_settings: editData.textSettings ? JSON.stringify(editData.textSettings) : undefined,
        overlay_data: JSON.stringify(editData.overlays),
        edit_timestamp: new Date().toISOString(),
        is_current: true,
      };

      setCurrentEdit(editRecord);
      return editRecord;
    } catch (error) {
      setPhotoSaving(false);
      throw error;
    } finally {
      setPhotoSaving(false);
    }
  }, [setPhotoSaving, setCurrentEdit]);

  // Upload final photo with edits (after editing is complete)
  const uploadFinalPhoto = useCallback(async (
    imageData: string,
    editData: CreatePhotoEditData
  ): Promise<PhotoRecord> => {
    setPhotoSaving(true);

    try {
      if (!appId) {
        throw new Error('App ID not available');
      }

      // Convert base64 to File
      const file = base64ToFile(imageData, `final-photo-${Date.now()}.jpg`);

      // Prepare upload data
      const frame = editData.frameTemplateId || undefined;

      // Transform overlay data to match API format: [{x: number, y: number, iconId: number}]
      let iconData: string | undefined;
      if (editData.overlays.length > 0) {
        const formattedIcons = editData.overlays.map(overlay => ({
          x: Math.round(overlay.position.x),
          y: Math.round(overlay.position.y),
          iconId: parseInt(overlay.iconId.replace(/[^0-9]/g, '')) || 0 // Extract numeric part from string iconId
        }));
        iconData = JSON.stringify(formattedIcons);
      }

      // Upload via HTTP API
      const result = await window.httpAPI.uploadPhoto(file, appId, frame, iconData);

      if (!result.success) {
        throw new Error(result.error || 'Failed to upload final photo');
      }

      // Create photo record for local state
      const photoRecord: PhotoRecord = {
        id: result.data.id.toString(),
        filename: result.data.filename || `final-photo-${Date.now()}.jpg`,
        file_path: result.data.gcsUrl, // Use the uploaded GCS URL
        original_width: 1920,
        original_height: 1080,
        file_size: file.size,
        created_at: result.data.createdAt,
        updated_at: result.data.createdAt,
        is_edited: true,
        is_deleted: false,
      };

      return photoRecord;
    } catch (error) {
      setPhotoSaving(false);
      throw error;
    } finally {
      setPhotoSaving(false);
    }
  }, [appId, setPhotoSaving, base64ToFile]);

  const generateFinalPhoto = useCallback(async (
    photoId: string,
    editData: CreatePhotoEditData,
    frameTemplate?: any,
    availableIcons: any[] = []
  ): Promise<string> => {
    setPhotoSaving(true);

    try {
      // First, save the edit
      await savePhotoEdit(editData);

      // Generate the final photo with frame and overlays
      const { generateFinalPhoto: generatePhoto } = await import('@/helpers/photo-generator/photo-composer');

      if (!currentPhoto) throw new Error('No current photo to generate from');

      console.log('🔍 Using frame template:', {
        frameTemplateId: editData.frameTemplateId,
        frameTemplate: frameTemplate ? {
          id: frameTemplate.id,
          name: frameTemplate.name,
          frameImage: frameTemplate.frameImage,
          textSettings: frameTemplate.style.textSettings
        } : 'No frame selected'
      });

      const finalPhotoData = await generatePhoto(
        currentPhoto.file_path,
        frameTemplate,
        editData.frameText,
        editData.overlays,
        editData.textSettings,
        availableIcons
      );

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
      if (!appId) {
        throw new Error('App ID not available');
      }

      // Load photos from HTTP API
      const result = await window.httpAPI.getPhotos(appId);

      if (!result.success) {
        throw new Error(result.error || 'Failed to load photos');
      }

      // Convert API response to PhotoRecord format
      const photos: PhotoRecord[] = result.data.map((photo: any) => ({
        id: photo.id.toString(),
        filename: photo.filename,
        file_path: photo.gcsUrl,
        original_width: 1920, // Default values, API doesn't provide these
        original_height: 1080,
        file_size: 0, // API doesn't provide this
        created_at: photo.createdAt,
        updated_at: photo.createdAt,
        is_edited: !!photo.frame, // If frame exists, it's edited
        is_deleted: false,
      }));

      setCapturedPhotos(photos);
      return photos;
    } catch (error) {
      setPhotoLoading(false);
      throw error;
    } finally {
      setPhotoLoading(false);
    }
  }, [appId, setPhotoLoading, setCapturedPhotos]);

  const deletePhoto = useCallback(async (photoId: string): Promise<void> => {
    try {
      // For now, just remove from local state
      // Backend API doesn't have a delete endpoint in the documentation
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
    uploadPhotoDraft,
    uploadFinalPhoto,
    savePhotoEdit,
    generateFinalPhoto,
    loadRecentPhotos,
    deletePhoto,
    setCurrentPhoto,
    clearCurrentPhoto,
    clearCurrentEdit
  };
};