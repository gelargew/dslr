# Frame Assets

## Current Files

- `frame-spotify.svg` - Placeholder Spotify-style frame (replace with your `frame-spotify.png`)
- `frame-instagram.svg` - Placeholder Instagram-style frame (replace with your `frame-instagram.png`)

## How to Replace with Your PNG Files

1. Copy your `frame-spotify.png` and `frame-instagram.png` files to this directory
2. Update the frame templates in `frame-templates.ts`:
   - Change `frameImage: '/assets/frames/frame-spotify.svg'` to `frameImage: '/assets/frames/frame-spotify.png'`
   - Change `frameImage: '/assets/frames/frame-instagram.svg'` to `frameImage: '/assets/frames/frame-instagram.png'`

## Frame Requirements

- **Size**: 1920x1080 pixels (recommended)
- **Format**: PNG with transparency support
- **Style**: Should overlay on top of the photo
- **Text Areas**: Consider where text will be positioned when designing frames

## Text Positioning

The text positioning in `frame-templates.ts` can be adjusted for your specific frame designs:

```typescript
textSettings: {
  position: { x: 960, y: 950 }, // Adjust x,y for your frame
  fontSize: 32,                 // Default font size
  color: '#ffffff',            // Default text color
  // ... other settings
}
```
