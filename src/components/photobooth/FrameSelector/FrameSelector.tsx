import React from "react";
import { frameTemplates, FrameTemplate } from "@/assets/frames/frame-templates";
import { cn } from "@/utils/tailwind";

interface TextSettings {
  position: { x: number; y: number };
  fontSize: number;
  color: string;
}

interface FrameSelectorProps {
  selectedFrame?: FrameTemplate;
  onFrameSelect: (frame: FrameTemplate) => void;
  frameText: string;
  onTextChange: (text: string) => void;
  textSettings?: TextSettings;
  onTextSettingsChange?: (settings: TextSettings) => void;
  className?: string;
}

export default function FrameSelector({
  selectedFrame,
  onFrameSelect,
  frameText,
  onTextChange,
  textSettings,
  onTextSettingsChange,
  className,
}: FrameSelectorProps) {

  const handleTextPositionChange = (axis: 'x' | 'y', value: number) => {
    if (!textSettings || !onTextSettingsChange) return;

    onTextSettingsChange({
      ...textSettings,
      position: {
        ...textSettings.position,
        [axis]: value,
      },
    });
  };

  const handleTextColorChange = (color: string) => {
    if (!textSettings || !onTextSettingsChange) return;

    onTextSettingsChange({
      ...textSettings,
      color,
    });
  };

  const handleTextSizeChange = (fontSize: number) => {
    if (!textSettings || !onTextSettingsChange) return;

    onTextSettingsChange({
      ...textSettings,
      fontSize,
    });
  };

  // Get current text settings or defaults from frame
  const currentTextSettings = textSettings || (selectedFrame ? {
    position: { ...selectedFrame.style.textSettings.position },
    fontSize: selectedFrame.style.textSettings.fontSize,
    color: selectedFrame.style.textSettings.color,
  } : null);

  return (
    <div className={cn("space-y-6", className)}>
      {/* Frame Templates Grid */}
      <div>
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
          Choose a Frame
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {frameTemplates.map((frame) => (
            <button
              key={frame.id}
              onClick={() => onFrameSelect(frame)}
              className={cn(
                "relative p-3 rounded-lg border-2 transition-all duration-200 hover:scale-105",
                selectedFrame?.id === frame.id
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                  : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
              )}
            >
              {/* Frame Preview */}
              <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded border-2 flex items-center justify-center text-xs text-gray-500 dark:text-gray-400 relative overflow-hidden">
                {/* Preview frame styling */}
                {frame.style.useFrameImage ? (
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-200 to-purple-200 dark:from-blue-800 dark:to-purple-800 opacity-50" />
                ) : (
                  <div
                    className="absolute inset-0 border"
                    style={{
                      borderWidth: Math.max(1, frame.style.borderWidth / 15),
                      borderColor: frame.style.borderColor,
                      backgroundColor: frame.style.backgroundColor || 'transparent',
                    }}
                  />
                )}

                {/* Preview content */}
                <div className="relative z-10 text-center">
                  <div className="w-8 h-6 bg-gray-300 dark:bg-gray-600 rounded mb-1" />
                  {frame.style.textSettings.enabled && (
                    <div
                      className="w-12 h-1 rounded mx-auto"
                      style={{ backgroundColor: frame.style.textSettings.color }}
                    />
                  )}
                </div>
              </div>

              {/* Frame Name */}
              <div className="mt-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                {frame.name}
              </div>

              {/* Selected Indicator */}
              {selectedFrame?.id === frame.id && (
                <div className="absolute top-1 right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Text Input (only show if frame supports text) */}
      {selectedFrame && selectedFrame.style.textSettings.enabled && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Add Text to Frame
          </h3>

          {/* Text Input */}
          <div className="space-y-3">
            <input
              type="text"
              value={frameText}
              onChange={(e) => onTextChange(e.target.value)}
              placeholder="Enter your text here..."
              maxLength={100}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {frameText.length}/100 characters
            </div>
          </div>

          {/* Text Positioning Controls */}
          {selectedFrame.style.textSettings.editable.position && currentTextSettings && onTextSettingsChange && (
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900 dark:text-white">Text Position</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">X Position</label>
                  <input
                    type="range"
                    min="100"
                    max="980"
                    step="10"
                    value={currentTextSettings.position.x}
                    onChange={(e) => handleTextPositionChange('x', parseInt(e.target.value))}
                    className="w-full"
                  />
                  <div className="text-xs text-gray-500 text-center mt-1">{currentTextSettings.position.x}px (width: 700px)</div>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Y Position</label>
                  <input
                    type="range"
                    min="100"
                    max="980"
                    step="10"
                    value={currentTextSettings.position.y}
                    onChange={(e) => handleTextPositionChange('y', parseInt(e.target.value))}
                    className="w-full"
                  />
                  <div className="text-xs text-gray-500 text-center mt-1">{currentTextSettings.position.y}px</div>
                </div>
              </div>
            </div>
          )}

          {/* Text Color Control */}
          {selectedFrame.style.textSettings.editable.color && currentTextSettings && onTextSettingsChange && (
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900 dark:text-white">Text Color</h4>
              <div className="flex items-center space-x-3">
                <input
                  type="color"
                  value={currentTextSettings.color}
                  onChange={(e) => handleTextColorChange(e.target.value)}
                  className="w-12 h-10 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
                />
                <input
                  type="text"
                  value={currentTextSettings.color}
                  onChange={(e) => handleTextColorChange(e.target.value)}
                  placeholder="#ffffff"
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                />
              </div>

              {/* Quick Color Presets */}
              <div className="flex space-x-2">
                {['#ffffff', '#000000', '#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'].map((color) => (
                  <button
                    key={color}
                    onClick={() => handleTextColorChange(color)}
                    className="w-8 h-8 rounded border-2 border-gray-300 dark:border-gray-600 hover:scale-110 transition-transform"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Text Size Control */}
          {selectedFrame.style.textSettings.editable.size && currentTextSettings && onTextSettingsChange && (
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900 dark:text-white">Text Size</h4>
              <div>
                <input
                  type="range"
                  min="12"
                  max="72"
                  step="2"
                  value={currentTextSettings.fontSize}
                  onChange={(e) => handleTextSizeChange(parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="text-xs text-gray-500 text-center mt-1">{currentTextSettings.fontSize}px</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Frame Info */}
      {selectedFrame && (
        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <h4 className="font-medium text-gray-900 dark:text-white mb-2">
            Frame Details
          </h4>
          <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
            <div>Style: {selectedFrame.category}</div>
            <div>Type: {selectedFrame.style.useFrameImage ? 'Image Overlay' : 'CSS Border'}</div>
            {selectedFrame.style.textSettings.enabled && (
              <div>Text: Enabled with {
                [
                  selectedFrame.style.textSettings.editable.position && 'positioning',
                  selectedFrame.style.textSettings.editable.color && 'color',
                  selectedFrame.style.textSettings.editable.size && 'size'
                ].filter(Boolean).join(', ')
              } controls</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}