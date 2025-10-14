# Interactive Icon System Documentation

## Overview

This document outlines the interactive icon positioning system implemented for the DSLR photobooth application. Users can now click and drag icons directly on the photo canvas to reposition them, with automatic boundary constraints to keep icons within the canvas area.

## Features

### 🎯 Core Functionality
- **Click and Drag**: Users can click on any icon and drag it to a new position
- **Canvas Boundary Constraints**: Icons are automatically constrained within the 1200×1800px canvas
- **Visual Feedback**: Selected icons show blue border and scale effects
- **Real-time Updates**: Icon positions update in real-time as they're dragged
- **Selection Management**: Click to select, click canvas to deselect

### 🔧 Technical Implementation

#### Canvas Dimensions
- **Full Canvas**: 1200 × 1800 px (2:3 portrait aspect ratio)
- **Preview Canvas**: 400 × 600 px (scaled preview)
- **Boundary Constraints**: Icons constrained to stay within canvas bounds

#### Icon Movement Constraints
- **Minimum Position**: Icon center cannot go below half icon size from edges
- **Maximum Position**: Icon center cannot exceed canvas size minus half icon size
- **Automatic Snapping**: Icons automatically stop at canvas boundaries

## User Interface

### EditOverlayPage Enhancements

#### Visual Indicators
- **Selected Icon**: Blue border ring with 2px thickness
- **Dragging State**: Icon scales to 110% with "grabbing" cursor
- **Hover State**: Icon scales to 105% with "grab" cursor
- **Status Display**: Shows selected icon name in header

#### User Instructions
- **Tip Text**: "💡 Tip: Click and drag icons on your photo to reposition them"
- **Tooltips**: Icons show "Icon: {Name} (Click and drag to move)" on hover
- **Selection Status**: Blue indicator showing currently selected icon

### Interaction Flow

1. **Icon Selection**: Click on any icon to select it
2. **Visual Feedback**: Selected icon shows blue border
3. **Drag Initiation**: Press and hold mouse button on selected icon
4. **Drag Movement**: Move mouse to reposition icon
5. **Boundary Constraint**: Icon automatically stops at canvas edges
6. **Position Update**: Icon position updates in real-time
7. **Release**: Mouse release stops dragging and keeps final position
8. **Deselection**: Click on empty canvas area to deselect

## Technical Architecture

### Hook: useIconDrag

```typescript
const useIconDrag = ({
  canvasWidth: 1200,
  canvasHeight: 1800,
  onIconUpdate: updatePosition,
  onIconSelect: setSelected
}) => {
  // Returns:
  // - isDragging, draggedIconId
  // - handleIconMouseDown, handleMouseMove, handleMouseUp
  // - handleCanvasClick, updateIconPosition
  // - Canvas reference and utilities
}
```

#### Key Features
- **Coordinate Conversion**: Translates client coordinates to canvas-relative coordinates
- **Boundary Constraints**: Ensures icons stay within canvas bounds
- **Event Management**: Handles mouse events for drag operations
- **State Management**: Tracks dragging state and selected icons

### Position Calculation

#### Canvas to Preview Scaling
```typescript
// Full canvas (1200×1800) to preview (400×600)
scaleX = 400 / 1200 = 0.333
scaleY = 600 / 1800 = 0.333

// Position conversion
previewX = (canvasX / 1200) * 100%
previewY = (canvasY / 1800) * 100%
```

#### Boundary Constraint Logic
```typescript
const constrainPosition = (x, y, iconSize) => {
  const halfSize = iconSize / 2;
  return {
    x: Math.max(halfSize, Math.min(canvasWidth - halfSize, x)),
    y: Math.max(halfSize, Math.min(canvasHeight - halfSize, y))
  };
};
```

### Store Integration

#### Update Method
```typescript
// Update overlay position in Zustand store
updateOverlay(iconId, { position: newPosition });
```

#### State Structure
```typescript
interface IconOverlay {
  id: string;
  iconId: string;
  position: { x: number; y: number }; // Updated by dragging
  size: number;
  rotation: number;
  zIndex: number;
}
```

## File Structure

```
src/
├── hooks/
│   └── useIconDrag.ts              # Drag functionality hook
├── pages/
│   └── EditOverlayPage.tsx         # Interactive icon UI
├── assets/icons/
│   └── overlay-icons.ts           # Icon data with updated positions
└── helpers/photo-generator/
    └── photo-composer.ts          # Final position rendering
```

## Implementation Details

### CSS Classes and Styling

#### Icon Container Classes
```css
.cursor-grab          /* Hover state - grab cursor */
.cursor-grabbing     /* Dragging state - grabbing cursor */
.hover:scale-105     /* Hover scale effect */
.scale-110           /* Dragging scale effect */
.ring-2 ring-blue-500 ring-offset-2 rounded-lg  /* Selection border */
.transition-transform  /* Smooth transitions */
```

#### State-dependent Styling
- **Default**: `cursor-grab hover:scale-105`
- **Selected**: Add blue ring border
- **Dragging**: `cursor-grabbing scale-110` + bring to front (z-index + 1000)

### Event Handling

#### Mouse Events
```typescript
// Icon interaction
onMouseDown={(e) => handleIconMouseDown(e, overlay)}
onClick={(e) => e.stopPropagation()} // Prevent canvas click

// Canvas interaction
onClick={handleCanvasClick} // Deselect when clicking canvas
```

#### Global Event Listeners
```typescript
useEffect(() => {
  if (isDragging) {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }
}, [isDragging]);
```

## Final Photo Generation

### Position Persistence
- User-defined positions are saved in the edit state
- Final photo composer uses exact positions from overlay data
- Boundary constraints applied during final rendering for safety

### Photo Composer Integration
```typescript
// In photo-composer.ts
async function drawOverlay(ctx, overlay) {
  // Constrain position during final rendering
  const constrainedPosition = {
    x: Math.max(halfSize, Math.min(1200 - halfSize, overlay.position.x)),
    y: Math.max(halfSize, Math.min(1800 - halfSize, overlay.position.y))
  };

  ctx.translate(constrainedPosition.x, constrainedPosition.y);
  // ... draw icon
}
```

## User Experience

### Intuitive Interactions
- **Visual Feedback**: Clear indication of selected and dragging states
- **Smooth Movement**: Real-time position updates during drag
- **Safe Boundaries**: Icons can't be dragged outside the photo area
- **Easy Selection**: Click to select, click canvas to deselect

### Performance Optimizations
- **Efficient Rendering**: Only re-renders affected components
- **Event Cleanup**: Proper removal of global event listeners
- **State Management**: Optimized Zustand store updates
- **Canvas Optimization**: Efficient coordinate calculations

## Troubleshooting

### Common Issues

#### Icon Not Draggable
- **Check**: Icon has `draggable={false}` attribute
- **Verify**: `onMouseDown` handler is attached
- **Confirm**: Icon is rendered within canvas bounds

#### Position Not Updating
- **Check**: `updateOverlay` function is called
- **Verify**: Store state updates correctly
- **Confirm**: Preview renders new positions

#### Boundary Constraints Not Working
- **Check**: Canvas dimensions are correctly set (1200×1800)
- **Verify**: Icon size is considered in constraints
- **Confirm**: Constraint logic applied in both preview and final render

#### Visual Feedback Missing
- **Check**: CSS classes applied correctly
- **Verify**: State updates trigger re-renders
- **Confirm**: Z-index management works properly

## Future Enhancements

### Potential Improvements
- **Multi-select**: Select and drag multiple icons
- **Rotation Control**: Add rotation handles to icons
- **Size Control**: Add resize handles to icons
- **Snap to Grid**: Optional grid snapping for precise positioning
- **Undo/Redo**: History of icon position changes
- **Keyboard Controls**: Arrow keys for fine-tuning positions

### Mobile Support
- **Touch Events**: Convert mouse events to touch events
- **Mobile Gestures**: Support for drag gestures on touch devices
- **Responsive UI**: Adapt interface for mobile screens

---

This interactive icon system provides an intuitive and responsive way for users to customize their photos with precise icon positioning, while maintaining technical robustness and performance.