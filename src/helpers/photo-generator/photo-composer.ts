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

  // Set square photo size for frames
  canvas.width = 1080;
  canvas.height = 1080;

  console.log('🎨 Generating final photo:', {
    frameTemplate: frameTemplate?.name,
    frameImage: frameTemplate?.frameImage,
    frameText,
    textSettings,
    overlaysCount: overlays.length
  });

  try {
    // 1. Draw original photo
    console.log('📸 Loading original photo...');
    const img = await loadImage(originalPhoto);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    console.log('✅ Original photo loaded and drawn');

    // 2. Apply frame if selected
    if (frameTemplate) {
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

// Helper function to load image
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

// Draw CSS-style frame (border and background)
function drawCSSFrame(ctx: CanvasRenderingContext2D, style: FrameTemplate['style'], width: number, height: number) {
  console.log('🎨 Drawing CSS frame:', {
    borderWidth: style.borderWidth,
    borderColor: style.borderColor,
    backgroundColor: style.backgroundColor
  });

  // Draw frame background if specified
  if (style.backgroundColor && style.backgroundColor !== 'transparent') {
    ctx.fillStyle = style.backgroundColor;
    ctx.fillRect(0, 0, width, height);
    console.log('✅ Frame background drawn');
  }

  // Draw frame border
  if (style.borderWidth > 0) {
    ctx.strokeStyle = style.borderColor;
    ctx.lineWidth = style.borderWidth;
    ctx.strokeRect(
      style.borderWidth / 2,
      style.borderWidth / 2,
      width - style.borderWidth,
      height - style.borderWidth
    );
    console.log('✅ Frame border drawn');
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

    // Always use 700px width for text wrapping
  const fixedWidth = 700;
  drawWrappedText(ctx, text, textX, textY, fixedWidth, fontSize);

  ctx.restore();
}

// Helper function to draw wrapped text with fixed 700px width
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

  console.log('📝 Drawing text with fixed width:', fixedWidth, 'px at position:', x, y);

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

  console.log('✅ Text drawn with fixed 700px width:', lines.length, 'lines');
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

    ctx.save();

    // Apply transformations
    ctx.translate(overlay.position.x, overlay.position.y);
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
    console.log('✅ Overlay drawn successfully');
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

// Preview function for real-time editing (optional optimization)
export function generateQuickPreview(
  photoElement: HTMLImageElement,
  frameTemplate?: FrameTemplate,
  frameText?: string,
  textSettings?: TextSettings
): string {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) return '';

  // Use smaller square size for preview
  canvas.width = 450;
  canvas.height = 450;

  try {
    // Draw scaled photo
    ctx.drawImage(photoElement, 0, 0, canvas.width, canvas.height);

    // Apply frame (scaled down)
    if (frameTemplate) {
      const scaledTextSettings = textSettings ? {
        position: {
          x: (textSettings.position.x / 1080) * canvas.width,
          y: (textSettings.position.y / 1080) * canvas.height,
        },
        fontSize: (textSettings.fontSize / 1080) * canvas.width,
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