import { useState, useRef, useCallback } from 'react';
import { IconOverlay } from '@/assets/icons/overlay-icons';

interface DragState {
  isDragging: boolean;
  draggedIconId: string | null;
  dragOffset: { x: number; y: number };
}

interface UseIconDragOptions {
  canvasWidth: number;
  canvasHeight: number;
  onIconUpdate: (iconId: string, newPosition: { x: number; y: number }) => void;
  onIconSelect?: (iconId: string | null) => void;
}

export function useIconDrag({
  canvasWidth,
  canvasHeight,
  onIconUpdate,
  onIconSelect
}: UseIconDragOptions) {
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    draggedIconId: null,
    dragOffset: { x: 0, y: 0 }
  });

  const canvasRef = useRef<HTMLDivElement>(null);

  // Convert client coordinates to canvas-relative coordinates
  const getCanvasCoordinates = useCallback((clientX: number, clientY: number) => {
    if (!canvasRef.current) return { x: 0, y: 0 };

    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = canvasWidth / rect.width;
    const scaleY = canvasHeight / rect.height;

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  }, [canvasWidth, canvasHeight]);

  // Constrain position within canvas bounds
  const constrainPosition = useCallback((x: number, y: number, iconSize: number) => {
    const halfSize = iconSize / 2;

    return {
      x: Math.max(halfSize, Math.min(canvasWidth - halfSize, x)),
      y: Math.max(halfSize, Math.min(canvasHeight - halfSize, y))
    };
  }, [canvasWidth, canvasHeight]);

  // Handle mouse down on icon
  const handleIconMouseDown = useCallback((
    event: React.MouseEvent,
    icon: IconOverlay
  ) => {
    event.preventDefault();
    event.stopPropagation();

    const canvasCoords = getCanvasCoordinates(event.clientX, event.clientY);

    setDragState({
      isDragging: true,
      draggedIconId: icon.id,
      dragOffset: {
        x: canvasCoords.x - icon.position.x,
        y: canvasCoords.y - icon.position.y
      }
    });

    // Select the icon
    onIconSelect?.(icon.id);
  }, [getCanvasCoordinates, onIconSelect]);

  // Handle mouse move for dragging
  const handleMouseMove = useCallback((event: MouseEvent) => {
    if (!dragState.isDragging || !dragState.draggedIconId) return;

    const canvasCoords = getCanvasCoordinates(event.clientX, event.clientY);

    // Calculate new position with drag offset
    const newX = canvasCoords.x - dragState.dragOffset.x;
    const newY = canvasCoords.y - dragState.dragOffset.y;

    // We'll get the icon size from the current overlays in EditOverlayPage
    // For now, use a default size constraint
    const constrainedPosition = constrainPosition(newX, newY, 100);

    onIconUpdate(dragState.draggedIconId, constrainedPosition);
  }, [dragState, getCanvasCoordinates, constrainPosition, onIconUpdate]);

  // Handle mouse up to stop dragging
  const handleMouseUp = useCallback(() => {
    if (dragState.isDragging) {
      setDragState({
        isDragging: false,
        draggedIconId: null,
        dragOffset: { x: 0, y: 0 }
      });
    }
  }, [dragState.isDragging]);

  // Handle click on canvas to deselect
  const handleCanvasClick = useCallback((event: React.MouseEvent) => {
    // Only deselect if clicking directly on canvas (not on an icon)
    if (event.target === event.currentTarget) {
      onIconSelect?.(null);
    }
  }, [onIconSelect]);

  // Update icon position with size constraint
  const updateIconPosition = useCallback((
    iconId: string,
    newPosition: { x: number; y: number },
    iconSize: number
  ) => {
    const constrainedPosition = constrainPosition(newPosition.x, newPosition.y, iconSize);
    onIconUpdate(iconId, constrainedPosition);
  }, [constrainPosition, onIconUpdate]);

  return {
    // State
    isDragging: dragState.isDragging,
    draggedIconId: dragState.draggedIconId,

    // Ref
    canvasRef,

    // Event handlers
    handleIconMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleCanvasClick,
    updateIconPosition,

    // Utilities
    getCanvasCoordinates,
    constrainPosition
  };
}