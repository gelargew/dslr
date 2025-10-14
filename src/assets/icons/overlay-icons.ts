export interface OverlayIcon {
  id: string;
  backendId?: number; // Optional backend ID for database references
  name: string;
  category: string;
  iconPath: string;
  iconType: 'svg' | 'png' | 'jpg';
  defaultSize: number;
  defaultPosition: { x: number; y: number }; // Default position for quick placement
}

export interface IconOverlay {
  id: string;
  iconId: string;
  position: { x: number; y: number };
  size: number;
  rotation: number;
  zIndex: number;
}

// Dynamic overlay icons will be loaded from backend API
// This now serves as a fallback and interface definition
export const overlayIcons: OverlayIcon[] = [];

/**
 * Load overlay icons dynamically from API
 * This replaces the static array with API-loaded data
 */
export const loadOverlayIcons = async (): Promise<OverlayIcon[]> => {
  const { iconService } = await import('@/services/iconService');
  return iconService.loadIcons();
};

/**
 * Get icon by ID (works with both static and dynamic data)
 */
export function getIconById(id: string): OverlayIcon | undefined {
  // Note: This function is kept for backward compatibility
  // In practice, use the useIcons hook for dynamic loading
  return overlayIcons.find(icon => icon.id === id);
}

/**
 * Get icons by category (works with both static and dynamic data)
 */
export function getIconsByCategory(category: string): OverlayIcon[] {
  // Note: This function is kept for backward compatibility
  // In practice, use the useIconsByCategory hook for dynamic loading
  return overlayIcons.filter(icon => icon.category === category);
}

/**
 * Get icon categories (works with both static and dynamic data)
 */
export function getIconCategories(): string[] {
  // Note: This function is kept for backward compatibility
  // In practice, use the useIconCategories hook for dynamic loading
  return [...new Set(overlayIcons.map(icon => icon.category))];
}

// Helper functions for creating overlay instances (still needed for the interactive system)
export async function createIconOverlay(
  iconId: string,
  position?: { x: number; y: number },
  options?: Partial<Pick<IconOverlay, 'size' | 'rotation' | 'zIndex'>>
): Promise<IconOverlay> {
  // Load icons dynamically from API
  const icons = await loadOverlayIcons();
  const icon = icons.find(i => i.id === iconId);
  if (!icon) {
    throw new Error(`Icon with id ${iconId} not found`);
  }

  return {
    id: `overlay-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    iconId,
    position: position || icon.defaultPosition, // Use provided position or default
    size: options?.size ?? icon.defaultSize,
    rotation: options?.rotation ?? 0,
    zIndex: options?.zIndex ?? 1,
  };
}

// Helper to quickly add icon at default position
export async function createDefaultIconOverlay(iconId: string): Promise<IconOverlay> {
  return createIconOverlay(iconId); // Uses default position automatically
}

// Export types for backward compatibility
export type { OverlayIcon, IconOverlay };