import { FrameTemplate, IconOverlay } from '@/assets/frames/frame-templates';

// Photo records from database
export interface PhotoRecord {
  id: string;
  filename: string;
  file_path: string;
  thumbnail_path?: string;
  original_width: number;
  original_height: number;
  file_size: number;
  created_at: string;
  updated_at: string;
  is_edited: boolean;
  is_deleted: boolean;
  photoDraftId?: string; // Optional draft ID from initial upload
}

export interface CreatePhotoData {
  filename: string;
  filePath: string;
  width: number;
  height: number;
  fileSize: number;
}

// Text settings for custom positioning and styling
export interface TextSettings {
  position: { x: number; y: number };
  fontSize: number;
  color: string;
}

// Photo edit records
export interface PhotoEditRecord {
  id: string;
  photo_id: string;
  frame_template_id?: string;
  frame_text?: string;
  text_settings?: string; // JSON string of TextSettings
  overlay_data: string; // JSON string of IconOverlay[]
  edit_timestamp: string;
  is_current: boolean;
}

export interface CreatePhotoEditData {
  photoId: string;
  frameTemplateId?: string;
  frameText?: string;
  textSettings?: TextSettings;
  overlays: IconOverlay[];
}

// Generated photo metadata
export interface GeneratedPhotoMetadata {
  originalPhotoId: string;
  frameTemplateId?: string;
  frameText?: string;
  textSettings?: TextSettings;
  overlays: IconOverlay[];
}

// Camera device types
export interface CameraDevice {
  id: string;
  label: string;
  kind: 'videoinput';
}

// Display queue for videotron
export interface DisplayQueueItem {
  id: string;
  photo_id: string;
  queue_position: number;
  display_duration: number;
  is_displayed: boolean;
  queued_at: string;
  file_path: string;
  filename: string;
}

// App mode types
export type AppMode = 'photobooth' | 'videotron';

// Photo state for React context
export interface PhotoContextState {
  currentPhoto: PhotoRecord | null;
  currentEdit: PhotoEditRecord | null;
  capturedPhotos: PhotoRecord[];
  isCapturing: boolean;
  isSaving: boolean;
  isLoading: boolean;
}

// Gallery state for videotron
export interface GalleryContextState {
  photos: PhotoRecord[];
  displayQueue: DisplayQueueItem[];
  currentDisplayPhoto: PhotoRecord | null;
  isLoading: boolean;
}

// Countdown states
export interface CountdownState {
  isActive: boolean;
  currentValue: number;
  initialValue: number;
}

// Photo editor state
export interface PhotoEditorState {
  selectedFrame?: FrameTemplate;
  frameText: string;
  textSettings?: TextSettings;
  overlays: IconOverlay[];
  isGenerating: boolean;
}