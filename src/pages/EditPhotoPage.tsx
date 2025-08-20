import React, { useState, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { usePhotoContext } from "@/contexts/PhotoContext";
import { useEditContext } from "@/contexts/EditContext";
import { FrameTemplate, getDefaultTextSettings } from "@/assets/frames/frame-templates";
import FrameSelector from "@/components/photobooth/FrameSelector/FrameSelector";
import FrameDebugger from "@/components/photobooth/FrameDebugger";

interface TextSettings {
  position: { x: number; y: number };
  fontSize: number;
  color: string;
}

export default function EditPhotoPage() {
  const navigate = useNavigate();
  const { currentPhoto } = usePhotoContext();
  const {
    editState,
    setSelectedFrame,
    setFrameText,
    setTextSettings
  } = useEditContext();

  // Local state for UI only
  const [frameImageLoaded, setFrameImageLoaded] = useState<boolean>(false);
  const [frameImageError, setFrameImageError] = useState<string | null>(null);
  const [showDebugger, setShowDebugger] = useState<boolean>(false);

  // Extract values from edit context
  const { selectedFrame, frameText, textSettings } = editState;

  // Update text settings when frame changes
  useEffect(() => {
    if (selectedFrame && selectedFrame.style.textSettings.enabled) {
      const defaultSettings = getDefaultTextSettings(selectedFrame.id);
      if (defaultSettings) {
        setTextSettings(defaultSettings);
      }
    } else {
      setTextSettings(null);
    }

    // Reset frame image states
    setFrameImageLoaded(false);
    setFrameImageError(null);

    // Debug logging
    console.log('🖼️ Frame selected:', {
      name: selectedFrame?.name,
      frameImage: selectedFrame?.frameImage,
      useFrameImage: selectedFrame?.style.useFrameImage,
      textEnabled: selectedFrame?.style.textSettings.enabled
    });
  }, [selectedFrame]);

  const handleNext = () => {
    // Navigate to overlay page
    navigate({ to: "/edit/overlay" });
  };

  const handleBack = () => {
    navigate({ to: "/edit" });
  };

  const handleFrameSelect = (frame: FrameTemplate) => {
    setSelectedFrame(frame);
    // Clear text when changing frames
    setFrameText("");
  };

  const handleTextChange = (text: string) => {
    setFrameText(text);
  };

  const handleTextSettingsChange = (settings: TextSettings) => {
    setTextSettings(settings);
  };

  // Handle frame image loading
  const handleFrameImageLoad = () => {
    console.log('✅ Frame image loaded successfully');
    setFrameImageLoaded(true);
    setFrameImageError(null);
  };

  const handleFrameImageError = (error: any) => {
    console.error('❌ Frame image failed to load:', error);
    setFrameImageLoaded(false);
    setFrameImageError('Failed to load frame image');
  };

  if (!currentPhoto) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-black">
        <div className="text-center text-white space-y-4">
          <h2 className="text-2xl font-bold text-red-400">No Photo Found</h2>
          <p className="text-lg">Please take a photo first.</p>
          <Button onClick={() => navigate({ to: "/camera" })} size="lg">
            Take Photo
          </Button>
        </div>
      </div>
    );
  }

  // Apply frame styling to photo preview
  const getPhotoContainerStyle = () => {
    if (!selectedFrame) return {};

    if (selectedFrame.style.useFrameImage) {
      // For image overlay frames, we'll layer the frame image on top
      return {
        position: 'relative' as const,
      };
    } else {
      // For CSS border frames
      return {
        border: `${selectedFrame.style.borderWidth}px solid ${selectedFrame.style.borderColor}`,
        backgroundColor: selectedFrame.style.backgroundColor || 'transparent',
      };
    }
  };

    const getTextStyle = () => {
    if (!selectedFrame || !frameText || !textSettings) return { display: 'none' };

    return {
      position: 'absolute' as const,
      left: `${(textSettings.position.x / 1080) * 100}%`,
      top: `${(textSettings.position.y / 1080) * 100}%`,
      transform: 'translate(0, 0)', // No centering - start from exact position
      fontSize: `${textSettings.fontSize * 0.6}px`, // Scale down for square preview
      fontFamily: selectedFrame.style.textSettings.fontFamily,
      color: textSettings.color,
      backgroundColor: selectedFrame.style.textSettings.background || 'transparent',
      padding: `${(selectedFrame.style.textSettings.padding || 0) * 0.6}px`,
      textAlign: 'left', // Always left-align for consistent behavior
      maxWidth: '420px', // Fixed 700px * 0.6 scaling for preview
      wordWrap: 'break-word' as const,
      whiteSpace: 'pre-wrap' as const,
      zIndex: 10,
    };
  };

  return (
    <div className="flex h-screen w-full bg-gray-100 dark:bg-gray-900">
      {/* Photo Preview Panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="relative max-w-2xl">
                    {/* Photo with Frame Container - Square */}
          <div
            className="relative rounded-lg overflow-hidden shadow-2xl aspect-square w-full max-w-lg"
            style={getPhotoContainerStyle()}
          >
            {/* Base Photo - Square */}
            <img
              src={currentPhoto.file_path}
              alt="Photo with frame"
              className="w-full h-full object-cover"
            />

            {/* Frame Image Overlay (for image-based frames) */}
            {selectedFrame && selectedFrame.style.useFrameImage && selectedFrame.frameImage && (
              <>
                <img
                  src={selectedFrame.frameImage}
                  alt="Frame overlay"
                  className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                  style={{
                    mixBlendMode: 'normal', // Changed from multiply for better visibility
                    opacity: frameImageLoaded ? 1 : 0,
                    transition: 'opacity 0.3s ease'
                  }}
                  onLoad={handleFrameImageLoad}
                  onError={handleFrameImageError}
                />

                {/* Frame Loading Indicator */}
                {!frameImageLoaded && !frameImageError && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                    <div className="text-white text-sm">Loading frame...</div>
                  </div>
                )}

                {/* Frame Error Indicator */}
                {frameImageError && (
                  <div className="absolute inset-0 flex items-center justify-center bg-red-500/20">
                    <div className="text-red-300 text-sm text-center p-4">
                      <div>⚠️ Frame Image Error</div>
                      <div className="text-xs mt-1">{selectedFrame.frameImage}</div>
                      <div className="text-xs">Check dev tools console</div>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Frame Text Overlay */}
            {selectedFrame && frameText && textSettings && (
              <div style={getTextStyle()}>
                {frameText}
              </div>
            )}
          </div>

          {/* Preview Label & Debug Info */}
          <div className="text-center mt-4 text-gray-600 dark:text-gray-400">
            <p className="text-sm">Square Preview (1080x1080)</p>
            {textSettings && (
              <p className="text-xs mt-1">
                Text at ({textSettings.position.x}, {textSettings.position.y}) • {textSettings.fontSize}px • {textSettings.color}
              </p>
            )}
            {selectedFrame && selectedFrame.style.useFrameImage && (
              <div className="text-xs mt-2 p-2 bg-gray-200 dark:bg-gray-700 rounded">
                <div>Frame: {selectedFrame.frameImage}</div>
                <div>Status: {
                  frameImageLoaded ? '✅ Loaded' :
                  frameImageError ? '❌ Error' :
                  '🔄 Loading...'
                }</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Controls Panel */}
      <div className="w-96 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Add Frame & Text
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Step 1 of 2: Choose a frame and add text
          </p>

          {/* Debug Controls */}
          <div className="mt-3 flex space-x-2">
            <button
              onClick={() => setShowDebugger(!showDebugger)}
              className="text-xs px-2 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              {showDebugger ? 'Hide' : 'Show'} Debugger
            </button>
            <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
              Ctrl+Shift+I for dev tools
            </div>
          </div>
        </div>

        {/* Frame Debugger */}
        {showDebugger && (
          <div className="border-b border-gray-200 dark:border-gray-700">
            <FrameDebugger />
          </div>
        )}

        {/* Frame Selector */}
        <div className="flex-1 overflow-y-auto p-6">
          <FrameSelector
            selectedFrame={selectedFrame}
            onFrameSelect={handleFrameSelect}
            frameText={frameText}
            onTextChange={handleTextChange}
            textSettings={textSettings}
            onTextSettingsChange={handleTextSettingsChange}
          />
        </div>

        {/* Action Buttons */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 space-y-3">
          <Button
            onClick={handleNext}
            size="lg"
            className="w-full h-12 text-lg"
          >
            Next: Add Stickers →
          </Button>

          <Button
            onClick={handleBack}
            size="lg"
            variant="outline"
            className="w-full h-12 text-lg"
          >
            ← Back
          </Button>
        </div>

        {/* Progress Indicator */}
        <div className="px-6 pb-4">
          <div className="flex space-x-2">
            <div className="flex-1 h-2 bg-blue-500 rounded"></div>
            <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
            <span>Frame & Text</span>
            <span>Stickers</span>
          </div>
        </div>
      </div>
    </div>
  );
}