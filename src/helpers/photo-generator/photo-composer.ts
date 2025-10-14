import { FrameTemplate } from '@/assets/frames/frame-templates';
import { IconOverlay, overlayIcons } from '@/assets/icons/overlay-icons';

interface TextSettings {
  position: { x: number; y: number };
  fontSize: number;
  color: string;
}

// Generate final photo with frame and overlays using HTML Canvas
export async function generateFinalPhoto(
  originalPhoto: string,
  frameTemplate?: FrameTemplate,
  frameText?: string,
  overlays: IconOverlay[] = [],
  textSettings?: TextSettings
): Promise<string> {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Unable to create canvas context');
  }

  // Set 2:3 portrait canvas size
  canvas.width = 1200;
  canvas.height = 1800;

  console.log('🎨 Generating final photo:', {
    frameTemplate: frameTemplate?.name,
    frameImage: frameTemplate?.frameImage,
    frameText,
    textSettings,
    overlaysCount: overlays.length,
    canvasSize: `${canvas.width}x${canvas.height}`
  });

  try {
    // 1. Draw original photo
    console.log('📸 Loading original photo...');
    const img = await loadImage(originalPhoto);

    // Draw photo based on frame selection
    if (frameTemplate && frameTemplate.id !== 'none') {
      // WITH FRAME: Draw square photo at (100, 100) with 1000×1000px size
      console.log('📐 Drawing square photo with frame...');
      ctx.drawImage(img, 100, 100, 1000, 1000);
    } else {
      // NO FRAME: Draw photo filling entire canvas (1200×1800)
      console.log('📐 Drawing full portrait photo without frame...');
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    }

    console.log('✅ Original photo loaded and drawn');

    // 2. Apply frame if selected (not for "none" frame)
    if (frameTemplate && frameTemplate.id !== 'none') {
      console.log('🖼️ Applying frame:', frameTemplate.name);
      await applyFrame(ctx, frameTemplate, frameText, textSettings, canvas.width, canvas.height);
      console.log('✅ Frame applied');
    }

    // 3. Add overlay icons
    for (const overlay of overlays) {
      await drawOverlay(ctx, overlay);
    }

    console.log('✅ Final photo generated successfully');
    return canvas.toDataURL('image/jpeg', 0.9);
  } catch (error) {
    console.error('❌ Error generating final photo:', error);
    throw error;
  }
}

// Helper function to load image (handles both local and remote URLs)
async function loadImage(src: string): Promise<HTMLImageElement> {
  console.log('🔄 Loading image:', src);

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      console.log('✅ Image loaded successfully:', src, `${img.width}x${img.height}`);
      resolve(img);
    };
    img.onerror = (error) => {
      console.error('❌ Failed to load image:', src, error);
      reject(new Error(`Failed to load image: ${src}`));
    };
    img.crossOrigin = 'anonymous'; // Handle CORS if needed
    img.src = src;
  });
}

// Apply frame styling to the canvas
async function applyFrame(
  ctx: CanvasRenderingContext2D,
  frame: FrameTemplate,
  text?: string,
  textSettings?: TextSettings,
  width: number = 1080,
  height: number = 1080
) {
  const { style } = frame;

  console.log('🎨 Applying frame:', {
    name: frame.name,
    useFrameImage: style.useFrameImage,
    frameImage: frame.frameImage,
    hasText: !!text
  });

  if (style.useFrameImage && frame.frameImage) {
    // Use frame image overlay
    try {
      console.log('🖼️ Loading frame image:', frame.frameImage);
      const frameImg = await loadImage(frame.frameImage);

      // Apply the frame image as an overlay
      console.log('🎨 Applying frame image overlay...');
      ctx.globalCompositeOperation = 'source-over'; // Changed from 'multiply' for better visibility
      ctx.drawImage(frameImg, 0, 0, width, height);
      console.log('✅ Frame image applied successfully');

    } catch (error) {
      console.warn(`⚠️ Failed to load frame image: ${frame.frameImage}`, error);
      // Fall back to CSS-style frame
      console.log('🔄 Falling back to CSS frame...');
      drawCSSFrame(ctx, style, width, height);
    }
  } else {
    // Use CSS-style frame (border + background)
    console.log('🎨 Using CSS-style frame...');
    drawCSSFrame(ctx, style, width, height);
  }

  // Draw frame text if provided
  if (text && style.textSettings.enabled) {
    console.log('📝 Drawing frame text:', text);
          drawFrameText(ctx, text, frame, textSettings);
    console.log('✅ Frame text drawn');
  }
}

// Draw CSS-style frame (border and background) - Only for framed templates
function drawCSSFrame(ctx: CanvasRenderingContext2D, style: FrameTemplate['style'], width: number, height: number) {
  console.log('🎨 Drawing standardized CSS frame:', {
    canvasSize: `${width}x${height}`,
    borderWidth: style.borderWidth,
    borderColor: style.borderColor,
    backgroundColor: style.backgroundColor
  });

  // Draw frame background (the frame itself, not the photo area)
  if (style.backgroundColor && style.backgroundColor !== 'transparent') {
    ctx.fillStyle = style.backgroundColor;

    // Draw top frame (0,0) to (1200,100)
    ctx.fillRect(0, 0, width, 100);

    // Draw left frame (0,0) to (100,1800)
    ctx.fillRect(0, 0, 100, height);

    // Draw right frame (1100,0) to (1200,1800)
    ctx.fillRect(width - 100, 0, 100, height);

    // Draw bottom frame (0,1100) to (1200,1800)
    ctx.fillRect(0, 1100, width, 700);

    console.log('✅ Standardized frame background drawn');
  }

  // Draw frame border if specified
  if (style.borderWidth > 0) {
    ctx.strokeStyle = style.borderColor;
    ctx.lineWidth = style.borderWidth;

    // Draw outer border around entire canvas
    ctx.strokeRect(
      style.borderWidth / 2,
      style.borderWidth / 2,
      width - style.borderWidth,
      height - style.borderWidth
    );

    // Draw inner border around photo area
    ctx.strokeRect(100, 100, 1000, 1000);

    console.log('✅ Frame borders drawn');
  }
}

// Draw frame text with custom positioning
function drawFrameText(
  ctx: CanvasRenderingContext2D,
  text: string,
  frame: FrameTemplate,
  textSettings?: TextSettings
) {
  const { style } = frame;

  ctx.save();

  // Use custom text settings if provided, otherwise use frame defaults
  const position = textSettings?.position || style.textSettings.position;
  const fontSize = textSettings?.fontSize || style.textSettings.fontSize;
  const color = textSettings?.color || style.textSettings.color;

  console.log('📝 Drawing text:', {
    text,
    position,
    fontSize,
    color,
    fontFamily: style.textSettings.fontFamily
  });

    // Set text styling
  ctx.font = `${fontSize}px ${style.textSettings.fontFamily}`;
  ctx.fillStyle = color;
  ctx.textAlign = 'left'; // Always align text to the left for consistent positioning
  ctx.textBaseline = 'top'; // Use top baseline for consistent line positioning

  // Text position
  const textX = position.x;
  const textY = position.y;

    // Always use 1000px width for text wrapping (standardized for all frames)
  const fixedWidth = 1000;
  drawWrappedText(ctx, text, textX, textY, fixedWidth, fontSize);

  ctx.restore();
}

// Helper function to draw wrapped text with standardized 1000px width
function drawWrappedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  fixedWidth: number,
  lineHeight: number
) {
  const words = text.split(' ');
  let line = '';
  const lines: string[] = [];

  console.log('📝 Drawing text with standardized width:', fixedWidth, 'px at position:', x, y);

  // Calculate lines to fit within fixed width
  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = ctx.measureText(testLine);
    const testWidth = metrics.width;

    if (testWidth > fixedWidth && n > 0) {
      lines.push(line);
      line = words[n] + ' ';
    } else {
      line = testLine;
    }
  }
  lines.push(line);

    // Draw lines starting from the exact Y position (top-aligned)
  lines.forEach((line, index) => {
    const lineText = line.trim();
    if (lineText) {
      ctx.fillText(lineText, x, y + (index * lineHeight));
    }
  });

  console.log('✅ Text drawn with standardized 1000px width:', lines.length, 'lines');
}

// Draw overlay icon on the canvas
async function drawOverlay(ctx: CanvasRenderingContext2D, overlay: IconOverlay) {
  const icon = overlayIcons.find(i => i.id === overlay.iconId);
  if (!icon) {
    console.warn(`⚠️ Icon not found: ${overlay.iconId}`);
    return;
  }

  try {
    console.log('🎯 Drawing overlay:', icon.name, 'at', overlay.position);
    // For SVG icons, we need to convert them to images
    const img = await loadSVGAsImage(icon.iconPath);

    // Constrain position within canvas bounds (1200×1800)
    const halfSize = overlay.size / 2;
    const constrainedPosition = {
      x: Math.max(halfSize, Math.min(1200 - halfSize, overlay.position.x)),
      y: Math.max(halfSize, Math.min(1800 - halfSize, overlay.position.y))
    };

    // Log if position was constrained
    if (constrainedPosition.x !== overlay.position.x || constrainedPosition.y !== overlay.position.y) {
      console.log('📐 Constrained icon position from', overlay.position, 'to', constrainedPosition);
    }

    ctx.save();

    // Apply transformations with constrained position
    ctx.translate(constrainedPosition.x, constrainedPosition.y);
    ctx.rotate((overlay.rotation * Math.PI) / 180);

    // Draw the icon centered at the position
    ctx.drawImage(
      img,
      -overlay.size / 2,
      -overlay.size / 2,
      overlay.size,
      overlay.size
    );

    ctx.restore();
    console.log('✅ Overlay drawn successfully at', constrainedPosition);
  } catch (error) {
    console.warn(`❌ Failed to draw overlay ${overlay.iconId}:`, error);
  }
}

// Convert SVG to image for canvas drawing
async function loadSVGAsImage(svgPath: string): Promise<HTMLImageElement> {
  console.log('🔄 Loading SVG as image:', svgPath);

  return new Promise((resolve, reject) => {
    // Fetch the SVG content
    fetch(svgPath)
      .then(response => response.text())
            .then(svgText => {
        // Create a blob from the SVG
        const svgBlob = new Blob([svgText], { type: 'image/svg+xml' });
        const svgUrl = URL.createObjectURL(svgBlob);

        // Create image from the blob URL
        const img = new Image();
        img.onload = () => {
          URL.revokeObjectURL(svgUrl); // Clean up
          console.log('✅ SVG loaded as image successfully');
          resolve(img);
        };
        img.onerror = () => {
          URL.revokeObjectURL(svgUrl); // Clean up
          reject(new Error(`Failed to load SVG: ${svgPath}`));
        };
        img.src = svgUrl;
      })
      .catch(error => {
        console.error('❌ Error loading SVG:', error);
        reject(error);
      });
  });
}

// Preview function for real-time editing (2:3 aspect ratio)
export function generateQuickPreview(
  photoElement: HTMLImageElement,
  frameTemplate?: FrameTemplate,
  frameText?: string,
  textSettings?: TextSettings
): string {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) return '';

  // Use 2:3 portrait size for preview (400×600px)
  canvas.width = 400;
  canvas.height = 600;

  try {
    // Draw photo based on frame selection
    if (frameTemplate && frameTemplate.id !== 'none') {
      // WITH FRAME: Draw square photo scaled to frame area
      const frameAreaX = (100 / 1200) * canvas.width;  // 33px
      const frameAreaY = (100 / 1800) * canvas.height; // 33px
      const frameSize = (1000 / 1200) * canvas.width;  // 333px
      ctx.drawImage(photoElement, frameAreaX, frameAreaY, frameSize, frameSize);
    } else {
      // NO FRAME: Draw photo filling entire preview canvas
      ctx.drawImage(photoElement, 0, 0, canvas.width, canvas.height);
    }

    // Apply frame (scaled down)
    if (frameTemplate && frameTemplate.id !== 'none') {
      const scaledTextSettings = textSettings ? {
        position: {
          x: (textSettings.position.x / 1200) * canvas.width,   // Scale from 1200px width
          y: (textSettings.position.y / 1800) * canvas.height, // Scale from 1800px height
        },
        fontSize: (textSettings.fontSize / 1200) * canvas.width, // Scale font size
        color: textSettings.color,
      } : undefined;

      applyFrame(ctx, frameTemplate, frameText, scaledTextSettings, canvas.width, canvas.height);
    }

    return canvas.toDataURL('image/jpeg', 0.7);
  } catch (error) {
    console.error('❌ Error generating preview:', error);
    return '';
  }
}