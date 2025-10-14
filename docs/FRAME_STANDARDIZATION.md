# Frame Standardization Documentation

## Overview

This document outlines the standardized frame system implemented for the DSLR photobooth application. All frames now follow consistent dimensions and positioning to simplify CMS management and ensure uniform behavior across different frame types.

## System Architecture

The system supports two distinct photo output modes:

### 1. With Frame (Framed Photos)
- **Canvas Size**: 1200 × 1800 px (2:3 portrait aspect ratio)
- **Photo Area**: 1000 × 1000 px square positioned at (100, 100)
- **Frame Borders**: 100px top/sides, 700px bottom
- **Text Area**: y = 1350–1700px (standardized position)

### 2. No Frame (Full Photos)
- **Canvas Size**: 1200 × 1800 px (2:3 portrait aspect ratio)
- **Photo Area**: Full canvas (0, 0) to (1200, 1800)
- **Frame**: None
- **Text**: None

## Technical Specifications

### Canvas Layout (1200 × 1800 px)

```
┌─────────────────────────────────────────┐ ← y = 0
│            Top Frame (100px)            │
├─────────────┬───────────────────────────┤ ← y = 100
│             │                           │
│ Left Frame  │    Inner Photo Area       │
│  (100px)    │   (1000 × 1000 px)       │
│             │  from (100,100) to       │
│             │    (1100,1100)           │
│             │                           │
├─────────────┼───────────────────────────┤ ← y = 1100
│             │                           │
│             │     Bottom Frame          │
│             │      (700px tall)         │
│             │   Text Area: y=1350-1700  │
│             │   Logo/Text: 600-800px    │
└─────────────┴───────────────────────────┘ ← y = 1800
   x = 0     x = 100       x = 1100    x = 1200
```

### Coordinate System
- **Origin**: Top-left corner (0, 0)
- **X-axis**: Increases to the right →
- **Y-axis**: Increases downward ↓
- **All measurements in pixels**

## Frame Implementation Guide

### CMS Frame Requirements

#### Frame Image Assets
- **Format**: PNG with transparency
- **Dimensions**: 1200 × 1800 px
- **DPI**: 300 (for print quality)
- **Color Space**: sRGB

#### Frame Structure
Each frame image must include:
1. **Top Border**: 100px height across full width
2. **Left Border**: 100px width across full height
3. **Right Border**: 100px width across full height
4. **Bottom Border**: 700px height across full width
5. **Photo Hole**: Transparent 1000 × 1000 px square at position (100, 100)

#### Text Area Specifications
- **Safe Area**: y = 1350–1700px (350px height)
- **Horizontal Center**: x = 600px (center of 1200px width)
- **Logo Width**: 600–800px (recommended)
- **Text Position**: (100, 1350) - left-aligned, 1000px max width
- **Font Size**: 40–60px (adjustable per frame design)
- **Padding**: 50px from bottom margin

### Frame Template Configuration

#### JavaScript/TypeScript Configuration
```typescript
{
  id: 'your-frame-id',
  name: 'Your Frame Name',
  category: 'your-category',
  previewImage: '/path/to/preview.png',
  frameImage: '/path/to/frame-1200x1800.png',
  cssClass: 'frame-your-style',
  style: {
    borderWidth: 0,
    borderColor: 'transparent',
    useFrameImage: true,
    textSettings: {
      enabled: true,
      position: { x: 100, y: 1350 }, // Standardized position
      maxWidth: 1000, // Standardized width
      fontSize: 48, // Adjust based on design
      fontFamily: 'Geist',
      color: '#ffffff', // Adjust based on design
      padding: 20, // Adjust based on design
      align: 'center',
      editable: {
        position: true,
        color: true,
        size: true,
      },
    },
  },
}
```

### UI Preview System

#### Preview Dimensions
- **Size**: 400 × 600 px (maintains 2:3 aspect ratio)
- **Scale Factor**: 0.333 (400/1200)
- **Photo Area**: 333 × 333 px at position (33, 33)
- **Text Scaling**: Font size × 0.333
- **Position Scaling**: Divide by 1200 for X, 1800 for Y

#### Preview Layout
```
┌─────────────────────┐ ← 400px width
│                     │
│    Top Frame (33px) │
├───┬─────────────────┤ ← y = 33px
│   │                 │
│   │  Photo Area     │
│33 │   (333×333)     │
│px │  from (33,33)   │
│   │    to (366,366) │
├───┼─────────────────┤ ← y = 366px
│   │                 │
│   │  Bottom Frame   │
│   │   (233px tall)  │
│   │ Text: y=450-566 │
└───┴─────────────────┘ ← 600px height
```

## Implementation Checklist

### For CMS Frame Creation

#### ✅ Frame Image
- [ ] Create 1200 × 1800 px PNG with transparency
- [ ] Add 100px borders on top, left, and right
- [ ] Add 700px border on bottom
- [ ] Create transparent 1000 × 1000 px square hole at (100, 100)
- [ ] Design text area in bottom section (y = 1350–1700)

#### ✅ Preview Image
- [ ] Create 400 × 600 px preview
- [ ] Show frame with sample photo
- [ ] Maintain same proportions as full frame

#### ✅ Configuration
- [ ] Set standardized text position: `{ x: 100, y: 1350 }`
- [ ] Set max text width: `1000` px
- [ ] Configure font size (40-60px recommended)
- [ ] Set text color based on frame background
- [ ] Configure padding (20px recommended)

#### ✅ Asset Placement
- [ ] Place frame image in `/assets/frames/frame-[name].png`
- [ ] Place preview in `/assets/frames/previews/[name]-preview.png`
- [ ] Update frame template configuration

## Testing Guide

### Manual Testing Steps
1. **Select Frame**: Choose the new frame in EditPhotoPage
2. **Preview Check**: Verify 400×600px preview shows correctly
3. **Text Input**: Test text positioning and wrapping
4. **Final Generation**: Generate final photo to confirm 1200×1800 output
5. **No Frame Test**: Verify "No Frame" option shows full 2:3 photo

### Quality Assurance
- [ ] Photo appears correctly in frame hole
- [ ] Text positioned at y = 1350px
- [ ] Text wrapping respects 1000px width
- [ ] Final output matches preview proportions
- [ ] No frame option shows full portrait photo

## File Structure

```
src/assets/frames/
├── frame-templates.ts          # Configuration file
├── frame-spotify.png          # 1200×1800 frame image
├── frame-instagram.png        # 1200×1800 frame image
└── previews/
    ├── spotify-preview.png    # 400×600 preview
    └── instagram-preview.png  # 400×600 preview
```

## Common Issues & Solutions

### Issue: Photo appears stretched
**Solution**: Ensure frame image has correct 1000×1000px transparent hole at (100, 100)

### Issue: Text appears wrong position
**Solution**: Verify text position is set to `{ x: 100, y: 1350 }` in configuration

### Issue: Preview doesn't match final output
**Solution**: Check scaling calculations use 0.333 factor (400/1200)

### Issue: Text gets cut off
**Solution**: Ensure maxWidth is set to 1000px and text stays within y = 1350–1700 range

## Migration Guide

### Converting Existing Frames
1. **Resize Canvas**: Change from 1080×1080 to 1200×1800
2. **Reposition Photo**: Move from full canvas to (100, 100) with 1000×1000 size
3. **Update Text**: Move text position to `{ x: 100, y: 1350 }`
4. **Adjust Font**: Scale up font sizes by ~1.5x
5. **Update Preview**: Change from 400×400 to 400×600

### Backward Compatibility
- Existing frames will be automatically converted
- Photo positioning handled by composer logic
- Text positioning standardized automatically
- UI preview updated proportionally

---

This documentation ensures consistent frame implementation across the CMS and maintains the standardized system for easy management and future additions.