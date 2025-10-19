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
  textSettings: {
    enabled: boolean;
    position: { x: number; y: number }; // Text position in pixels
    fontSize: number;
    fontFamily: string;
    color: string;
  };
}

// Dynamic frame templates will be loaded from backend API
// This now serves as a fallback and interface definition
export const frameTemplates: FrameTemplate[] = [];

/**
 * Load frame templates dynamically from API
 * This replaces the static array with API-loaded data
 */
export const loadFrameTemplates = async (): Promise<FrameTemplate[]> => {
  const { frameService } = await import('@/services/frameService');
  return frameService.loadFrames();
};

/**
 * Get frame by ID (works with both static and dynamic data)
 */
export function getFrameById(id: string): FrameTemplate | undefined {
  // Note: This function is kept for backward compatibility
  // In practice, use the useFrames hook for dynamic loading
  return frameTemplates.find(frame => frame.id === id);
}

/**
 * Get frames by category (works with both static and dynamic data)
 */
export function getFramesByCategory(category: string): FrameTemplate[] {
  // Note: This function is kept for backward compatibility
  // In practice, use the useFramesByCategory hook for dynamic loading
  return frameTemplates.filter(frame => frame.category === category);
}

/**
 * Get default text settings for a frame
 */
export function getDefaultTextSettings(frameId: string) {
  const frame = getFrameById(frameId);
  if (!frame || !frame.style.textSettings.enabled) return null;

  return {
    position: { ...frame.style.textSettings.position },
    fontSize: frame.style.textSettings.fontSize,
    color: frame.style.textSettings.color,
  };
}

// Export types for backward compatibility
export type { FrameTemplate, FrameStyleConfig };