import React, { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { usePhotoContext } from "@/contexts/PhotoContext";
import { useEditContext } from "@/contexts/EditContext";
import { overlayIcons, getIconsByCategory, getIconCategories, createDefaultIconOverlay } from "@/assets/icons/overlay-icons";
import { cn } from "@/utils/tailwind";

export default function EditOverlayPage() {
  const navigate = useNavigate();
  const { currentPhoto } = usePhotoContext();
  const { editState, addOverlay, removeOverlay } = useEditContext();
  const [selectedCategory, setSelectedCategory] = useState<string>("Event");

  const categories = getIconCategories();
  const categoryIcons = getIconsByCategory(selectedCategory);

  const handleBack = () => {
    navigate({ to: "/edit/photo" });
  };

  const handleFinish = () => {
    navigate({ to: "/complete" });
  };

  const handleIconClick = (iconId: string) => {
    const overlay = createDefaultIconOverlay(iconId);
    addOverlay(overlay);
  };

  const handleRemoveOverlay = (overlayId: string) => {
    removeOverlay(overlayId);
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

  // Apply frame styling to photo preview (same as EditPhotoPage)
  const getPhotoContainerStyle = () => {
    if (!editState.selectedFrame) return {};

    if (editState.selectedFrame.style.useFrameImage) {
      return { position: 'relative' as const };
    } else {
      return {
        border: `${editState.selectedFrame.style.borderWidth}px solid ${editState.selectedFrame.style.borderColor}`,
        backgroundColor: editState.selectedFrame.style.backgroundColor || 'transparent',
      };
    }
  };

  const getTextStyle = () => {
    if (!editState.selectedFrame || !editState.frameText || !editState.textSettings) return { display: 'none' };

    return {
      position: 'absolute' as const,
      left: `${(editState.textSettings.position.x / 1080) * 100}%`,
      top: `${(editState.textSettings.position.y / 1080) * 100}%`,
      transform: 'translate(0, 0)',
      fontSize: `${editState.textSettings.fontSize * 0.6}px`,
      fontFamily: editState.selectedFrame.style.textSettings.fontFamily,
      color: editState.textSettings.color,
      backgroundColor: editState.selectedFrame.style.textSettings.background || 'transparent',
      padding: `${(editState.selectedFrame.style.textSettings.padding || 0) * 0.6}px`,
      textAlign: 'left' as const,
      maxWidth: '420px',
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
          {/* Photo with Frame and Overlays Container - Square */}
          <div
            className="relative rounded-lg overflow-hidden shadow-2xl aspect-square w-full max-w-lg"
            style={getPhotoContainerStyle()}
          >
            {/* Base Photo */}
            <img
              src={currentPhoto.file_path}
              alt="Photo with frame and overlays"
              className="w-full h-full object-cover"
            />

            {/* Frame Image Overlay */}
            {editState.selectedFrame && editState.selectedFrame.style.useFrameImage && editState.selectedFrame.frameImage && (
              <img
                src={editState.selectedFrame.frameImage}
                alt="Frame overlay"
                className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                style={{ mixBlendMode: 'normal' }}
              />
            )}

            {/* Frame Text Overlay */}
            {editState.selectedFrame && editState.frameText && editState.textSettings && (
              <div style={getTextStyle()}>
                {editState.frameText}
              </div>
            )}

            {/* Icon Overlays */}
            {editState.overlays.map((overlay) => {
              const icon = overlayIcons.find(i => i.id === overlay.iconId);
              if (!icon) return null;

              return (
                <div
                  key={overlay.id}
                  className="absolute cursor-pointer hover:scale-110 transition-transform"
                  style={{
                    left: `${(overlay.position.x / 1080) * 100}%`,
                    top: `${(overlay.position.y / 1080) * 100}%`,
                    transform: `translate(-50%, -50%) rotate(${overlay.rotation}deg)`,
                    zIndex: overlay.zIndex,
                  }}
                  onClick={() => handleRemoveOverlay(overlay.id)}
                  title={`Click to remove ${icon.name}`}
                >
                  <img
                    src={icon.iconPath}
                    alt={icon.name}
                    style={{
                      width: `${overlay.size * 0.6}px`, // Scale for preview
                      height: `${overlay.size * 0.6}px`,
                    }}
                  />
                </div>
              );
            })}
          </div>

          {/* Preview Label */}
          <div className="text-center mt-4 text-gray-600 dark:text-gray-400">
            <p className="text-sm">Square Preview with Frame & Icons (1080x1080)</p>
            <p className="text-xs mt-1">
              Frame: {editState.selectedFrame?.name || 'None'} •
              Text: "{editState.frameText}" •
              Icons: {editState.overlays.length}
            </p>
          </div>
        </div>
      </div>

      {/* Icon Selection Panel */}
      <div className="w-96 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Add Icons & Stickers
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Step 2 of 2: Tap icons to add them to your photo
          </p>
        </div>

        {/* Category Tabs */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex space-x-2 overflow-x-auto">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors",
                  selectedCategory === category
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                )}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Icon Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-3 gap-3">
            {categoryIcons.map((icon) => (
              <button
                key={icon.id}
                onClick={() => handleIconClick(icon.id)}
                className="p-3 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200 group"
                title={`Add ${icon.name}`}
              >
                <div className="aspect-square flex items-center justify-center mb-2">
                  <img
                    src={icon.iconPath}
                    alt={icon.name}
                    className="w-12 h-12 object-contain group-hover:scale-110 transition-transform"
                  />
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400 text-center">
                  {icon.name}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Current Overlays */}
        {editState.overlays.length > 0 && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
              Added Icons ({editState.overlays.length})
            </h3>
            <div className="flex flex-wrap gap-2">
              {editState.overlays.map((overlay) => {
                const icon = overlayIcons.find(i => i.id === overlay.iconId);
                if (!icon) return null;

                return (
                  <button
                    key={overlay.id}
                    onClick={() => handleRemoveOverlay(overlay.id)}
                    className="flex items-center space-x-2 px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-xs hover:bg-red-100 dark:hover:bg-red-900 hover:text-red-800 dark:hover:text-red-200 transition-colors"
                    title={`Remove ${icon.name}`}
                  >
                    <img src={icon.iconPath} alt={icon.name} className="w-4 h-4" />
                    <span>{icon.name}</span>
                    <span>×</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 space-y-3">
          <Button
            onClick={handleFinish}
            size="lg"
            className="w-full h-12 text-lg"
          >
            Finish & Generate Photo →
          </Button>

          <Button
            onClick={handleBack}
            size="lg"
            variant="outline"
            className="w-full h-12 text-lg"
          >
            ← Back to Frames
          </Button>
        </div>

        {/* Progress Indicator */}
        <div className="px-6 pb-4">
          <div className="flex space-x-2">
            <div className="flex-1 h-2 bg-blue-500 rounded"></div>
            <div className="flex-1 h-2 bg-blue-500 rounded"></div>
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