export interface OverlayIcon {
  id: string;
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

export const overlayIcons: OverlayIcon[] = [
  // Event category
  {
    id: 'plabs-logo',
    name: 'Event Logo',
    category: 'Event',
    iconPath: '/assets/icons/plabs.png',
    iconType: 'png',
    defaultSize: 80,
    defaultPosition: { x: 970, y: 200 },
  },

  // Stiker category
  {
    id: 'heart',
    name: 'Heart',
    category: 'Stiker',
    iconPath: '/assets/icons/heart.png',
    iconType: 'png',
    defaultSize: 64,
    defaultPosition: { x: 200, y: 400 },
  },
  {
    id: 'star',
    name: 'Star',
    category: 'Stiker',
    iconPath: '/assets/icons/star.png',
    iconType: 'png',
    defaultSize: 100,
    defaultPosition: { x: 840, y: 480 },
  },
  {
    id: 'sparkle',
    name: 'Sparkle',
    category: 'Stiker',
    iconPath: '/assets/icons/sparkle.png',
    iconType: 'png',
    defaultSize: 100,
    defaultPosition: { x: 620, y: 260 },
  },

  // Mood category
  {
    id: 'sun',
    name: 'Sun',
    category: 'Mood',
    iconPath: '/assets/icons/sun.png',
    iconType: 'png',
    defaultSize: 100,
    defaultPosition: { x: 200, y: 220 },
  },
  {
    id: 'moon',
    name: 'Moon',
    category: 'Mood',
    iconPath: '/assets/icons/moon.png',
    iconType: 'png',
    defaultSize: 100,
    defaultPosition: { x: 800, y: 280 },
  },
];

// Helper functions
export function getIconById(id: string): OverlayIcon | undefined {
  return overlayIcons.find(icon => icon.id === id);
}

export function getIconsByCategory(category: string): OverlayIcon[] {
  return overlayIcons.filter(icon => icon.category === category);
}

export function getIconCategories(): string[] {
  return [...new Set(overlayIcons.map(icon => icon.category))];
}

// Helper to create a new overlay instance with default position
export function createIconOverlay(
  iconId: string,
  position?: { x: number; y: number },
  options?: Partial<Pick<IconOverlay, 'size' | 'rotation' | 'zIndex'>>
): IconOverlay {
  const icon = getIconById(iconId);
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
export function createDefaultIconOverlay(iconId: string): IconOverlay {
  return createIconOverlay(iconId); // Uses default position automatically
}