// Mock IPC handlers for development
// This allows the photobooth app to run in browser during development

import { PhotoRecord, CreatePhotoEditData, PhotoEditRecord, GeneratedPhotoMetadata, TextSettings } from '@/types/photobooth';

// Mock photo storage
let mockPhotos: PhotoRecord[] = [];
let mockPhotoEdits: PhotoEditRecord[] = [];

// Generate mock ID
function generateId(): string {
  return `mock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Mock storage API
const mockStorageAPI = {
  async savePhoto(imageData: string, metadata: any): Promise<PhotoRecord> {
    // Convert data URL to blob size estimation
    const sizeInBytes = imageData.length * 0.75; // Rough estimate for base64

    const photo: PhotoRecord = {
      id: generateId(),
      filename: `photo-${Date.now()}.jpg`,
      file_path: imageData, // Use data URL directly for mock
      original_width: 1920,
      original_height: 1080,
      file_size: sizeInBytes,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_edited: false,
      is_deleted: false,
    };

    mockPhotos.unshift(photo);
    console.log('Mock: Saved photo', photo.id);
    return photo;
  },

  async savePhotoEdit(editData: CreatePhotoEditData): Promise<PhotoEditRecord> {
    // Mark previous edits as not current
    mockPhotoEdits.forEach(edit => {
      if (edit.photo_id === editData.photoId) {
        edit.is_current = false;
      }
    });

    const edit: PhotoEditRecord = {
      id: generateId(),
      photo_id: editData.photoId,
      frame_template_id: editData.frameTemplateId,
      frame_text: editData.frameText,
      text_settings: editData.textSettings ? JSON.stringify(editData.textSettings) : undefined,
      overlay_data: JSON.stringify(editData.overlays),
      edit_timestamp: new Date().toISOString(),
      is_current: true,
    };

    mockPhotoEdits.unshift(edit);

    // Mark photo as edited
    const photo = mockPhotos.find(p => p.id === editData.photoId);
    if (photo) {
      photo.is_edited = true;
      photo.updated_at = new Date().toISOString();
    }

    console.log('Mock: Saved photo edit', edit.id, {
      frame: editData.frameTemplateId,
      text: editData.frameText,
      textSettings: editData.textSettings,
      overlays: editData.overlays.length,
    });
    return edit;
  },

  async saveGeneratedPhoto(photoData: string, metadata: GeneratedPhotoMetadata): Promise<PhotoRecord> {
    const generatedPhoto: PhotoRecord = {
      id: generateId(),
      filename: `generated-${Date.now()}.jpg`,
      file_path: photoData,
      original_width: 1920,
      original_height: 1080,
      file_size: photoData.length * 0.75,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_edited: true,
      is_deleted: false,
    };

    mockPhotos.unshift(generatedPhoto);
    console.log('Mock: Saved generated photo', generatedPhoto.id, {
      originalPhoto: metadata.originalPhotoId,
      frame: metadata.frameTemplateId,
      text: metadata.frameText,
      textSettings: metadata.textSettings,
    });
    return generatedPhoto;
  },

  async getPhotos(): Promise<PhotoRecord[]> {
    console.log('Mock: Retrieved photos', mockPhotos.length);
    return [...mockPhotos].filter(p => !p.is_deleted);
  },

  async deletePhoto(photoId: string): Promise<void> {
    const photo = mockPhotos.find(p => p.id === photoId);
    if (photo) {
      photo.is_deleted = true;
      console.log('Mock: Deleted photo', photoId);
    }
  },

  async getStoragePath(): Promise<string> {
    return '/mock/storage/path';
  },

  async addToDisplayQueue(photoId: string): Promise<void> {
    console.log('Mock: Added to display queue', photoId);
  },
};

// Mock camera API
const mockCameraAPI = {
  async getDevices() {
    return [
      { id: 'mock-camera-1', label: 'Mock Camera', kind: 'videoinput' as const }
    ];
  },

  async getPermissions(): Promise<boolean> {
    return true;
  },

  async capturePhoto(deviceId?: string): Promise<string> {
    // Return a mock data URL (1x1 pixel image for demo)
    const canvas = document.createElement('canvas');
    canvas.width = 1920;
    canvas.height = 1080;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      // Create a gradient background for demo
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, '#667eea');
      gradient.addColorStop(1, '#764ba2');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Add some text for demo
      ctx.fillStyle = 'white';
      ctx.font = '48px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('📸 Mock Photo', canvas.width / 2, canvas.height / 2);
      ctx.font = '24px Arial';
      ctx.fillText(new Date().toLocaleString(), canvas.width / 2, canvas.height / 2 + 60);
    }

    return canvas.toDataURL('image/jpeg', 0.9);
  },
};

// Setup mock APIs in development
export function setupMockIPC() {
  if (typeof window !== 'undefined') {
    // Only setup in browser environment
    (window as any).storageAPI = mockStorageAPI;
    (window as any).cameraAPI = mockCameraAPI;

    console.log('Mock IPC APIs initialized for development');
  }
}

// Auto-setup if we're in development
if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  setupMockIPC();
}