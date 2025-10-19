import React, { useState, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { usePhoto } from "@/hooks/usePhoto";
import { useEdit } from "@/hooks/useEdit";
import { useIcons } from "@/hooks/useIcons";
import { createDefaultIconOverlay } from "@/assets/icons/overlay-icons";
import { useIconDrag } from "@/hooks/useIconDrag";

export default function EditOverlayPage() {
  const navigate = useNavigate();
  const { currentPhoto, generateFinalPhoto, uploadFinalPhoto } = usePhoto();
  const { editState, addOverlay, removeOverlay, updateOverlay } = useEdit();
  const [selectedIcons, setSelectedIcons] = useState<string[]>([]);
  const [selectedIconId, setSelectedIconId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isPrinting, setIsPrinting] = useState<boolean>(false);

  // Load icons from backend
  const { icons, loading: iconsLoading, error: iconsError } = useIcons();

  // Canvas dimensions for the new square system
  const canvasWidth = 1080;
  const canvasHeight = 1080;

  // Initialize icon dragging hook
  const {
    isDragging,
    draggedIconId,
    canvasRef,
    handleIconMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleCanvasClick,
    updateIconPosition
  } = useIconDrag({
    canvasWidth,
    canvasHeight,
    onIconUpdate: (iconId, newPosition) => {
      // Update the overlay position in the store
      updateOverlay(iconId, { position: newPosition });
    },
    onIconSelect: setSelectedIconId
  });

  // Global mouse event listeners for dragging
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const handleBack = () => {
    navigate({ to: "/edit/photo" });
  };

  const handleFinish = async () => {
    if (!currentPhoto) {
      console.error('No current photo to save');
      return;
    }

    setIsSaving(true);

    try {
      console.log('🎨 Generating final photo with edits...');
      console.log('📸 Current photo:', currentPhoto.id);
      console.log('🖼️ Edit state:', editState);
      console.log('📝 Edit state frameText:', editState.frameText);

      // Prepare edit data from current edit state
      const editData = {
        photoId: currentPhoto.id,
        frameTemplateId: editState.selectedFrame?.id || undefined,
        frameText: editState.frameText || undefined,
        text: editState.frameText || '', // Add text field for backend
        textSettings: editState.selectedFrame?.style?.textSettings || undefined,
        overlays: editState.overlays || [],
      };

      console.log('💾 Preparing edit data:', editData);
      console.log('📝 Text being sent to photo composer:', editData.frameText);
      console.log('📝 textSettings being sent to photo composer:', editData.textSettings);

      // Generate the final photo with frame and overlays
      const finalPhotoData = await generateFinalPhoto(currentPhoto.id, editData, editState.selectedFrame, icons);

      console.log('✅ Final photo generated!');

      // Upload the final photo via HTTP API
      console.log('📤 Uploading final photo to backend...');
      const uploadedPhoto = await uploadFinalPhoto(finalPhotoData, editData, editState.selectedFrame);

      console.log('✅ Final photo uploaded successfully!', uploadedPhoto);

      // Navigate to completion page
      navigate({ to: "/complete" });
    } catch (error) {
      console.error('❌ Error saving final photo:', error);
      // Still navigate to show user completion, but log the error
      navigate({ to: "/complete" });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePrint = async () => {
    if (!currentPhoto) {
      console.error('No current photo to print');
      return;
    }

    setIsPrinting(true);

    try {
      console.log('🖨️ Starting print process...');

      // Generate final photo with edits
      const editData = {
        photoId: currentPhoto.id,
        frameTemplateId: editState.selectedFrame?.id || undefined,
        frameText: editState.frameText || undefined,
        text: editState.frameText || '', // Add text field for backend
        textSettings: editState.selectedFrame?.style?.textSettings || undefined,
        overlays: editState.overlays || [],
      };

      console.log('🎨 Generating final photo with edits for printing...');
      const finalPhotoData = await generateFinalPhoto(currentPhoto.id, editData, editState.selectedFrame, icons);

      console.log('✅ Final photo generated for printing!');

      // Upload the final photo to backend before printing
      console.log('📤 Uploading final photo to backend...');
      await uploadFinalPhoto(finalPhotoData, editData, editState.selectedFrame);
      console.log('✅ Final photo uploaded successfully!');

      // Create a temporary image element for printing
      const img = new Image();
      img.onload = async () => {
        // Create print window
        const printWindow = window.open('', '_blank');
        if (!printWindow) {
          throw new Error('Failed to open print window');
        }

        // Write image to print window
        printWindow.document.write(`
          <html>
            <head>
              <title>Print Photo</title>
              <style>
                body { margin: 0; padding: 0; }
                img { max-width: 100%; height: auto; }
                @page { margin: 0; }
              </style>
            </head>
            <body>
              <img src="${finalPhotoData}" alt="Photo to print" onload="window.print(); window.close();" />
            </body>
          </html>
        `);

        printWindow.document.close();
      };

      img.src = finalPhotoData;
    } catch (error) {
      console.error('❌ Error during print:', error);
    } finally {
      setIsPrinting(false);
    }
  };

  const handlePrintAndFinish = async () => {
    console.log('🖨️ Print button clicked!');

    if (!currentPhoto) {
      console.error('No current photo to print');
      return;
    }

    setIsPrinting(true);

    let finalPhotoData: string | undefined;

    try {
      console.log('🖨️ Starting print process...');

      // Generate final photo with edits
      const editData = {
        photoId: currentPhoto.id,
        frameTemplateId: editState.selectedFrame?.id || undefined,
        frameText: editState.frameText || undefined,
        text: editState.frameText || '', // Add text field for backend
        textSettings: editState.selectedFrame?.style?.textSettings || undefined,
        overlays: editState.overlays || [],
      };

      console.log('🎨 Generating final photo with edits for printing...');
      finalPhotoData = await generateFinalPhoto(currentPhoto.id, editData, editState.selectedFrame, icons);

      console.log('✅ Final photo generated for printing!');

      // Create a temporary image element for printing
      const img = new Image();
      img.onload = async () => {
        // Create print window
        const printWindow = window.open('', '_blank');
        if (!printWindow) {
          throw new Error('Failed to open print window');
        }

        // Write image to print window
        printWindow.document.write(`
          <html>
            <head>
              <title>Print Photo</title>
              <style>
                body { margin: 0; padding: 0; }
                img { max-width: 100%; height: auto; }
                @page { margin: 0; }
              </style>
            </head>
            <body>
              <img src="${finalPhotoData}" alt="Photo to print" onload="window.print(); window.close();" />
            </body>
          </html>
        `);

        printWindow.document.close();

        // After print completes (or is cancelled), continue with finish process
        console.log('🖨️ Print completed, continuing with finish process...');

        // Wait a moment for print to complete
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Now continue with the normal finish flow
        setIsSaving(true);

        try {
          console.log('📤 Uploading final photo to backend...');
          const uploadedPhoto = await uploadFinalPhoto(finalPhotoData, editData, editState.selectedFrame);
          console.log('✅ Final photo uploaded successfully!', uploadedPhoto);
        } catch (error) {
          console.error('❌ Error uploading after print:', error);
        }

        // Navigate to completion page
        navigate({ to: "/complete" });
      };

      img.src = finalPhotoData;
    } catch (error) {
      console.error('❌ Error during print:', error);
      // Still continue with finish process
      setIsSaving(true);

      try {
        console.log('📤 Uploading final photo to backend (fallback after print error)...');
        if (finalPhotoData) {
          const uploadedPhoto = await uploadFinalPhoto(finalPhotoData, editData, editState.selectedFrame);
          console.log('✅ Final photo uploaded successfully (fallback)!', uploadedPhoto);
        } else {
          console.warn('⚠️ No final photo data to upload after print error');
        }
      } catch (error) {
        console.error('❌ Error uploading after print error:', error);
      }

      // Navigate to completion page
      navigate({ to: "/complete" });
    } finally {
      setIsPrinting(false);
      setIsSaving(false);
    }
  };

  const handleNoOverlay = () => {
    // Remove all overlays manually and clear selected icons
    editState.overlays.forEach(overlay => {
      removeOverlay(overlay.id);
    });
    setSelectedIcons([]);
  };

  const handleIconClick = async (iconId: string) => {
    if (selectedIcons.includes(iconId)) {
      // Icon is already selected - unselect it
      const overlayToRemove = editState.overlays.find(overlay => overlay.iconId === iconId);
      if (overlayToRemove) {
        removeOverlay(overlayToRemove.id);
      }
      setSelectedIcons(selectedIcons.filter(id => id !== iconId));
    } else {
      // Icon is not selected - select it
      const overlay = await createDefaultIconOverlay(iconId);
      addOverlay(overlay);
      setSelectedIcons([...selectedIcons, iconId]);
    }
  };

  // Group icons dynamically by category from API response
  const iconsByCategory = icons.reduce((acc, icon) => {
    if (!acc[icon.category]) {
      acc[icon.category] = [];
    }
    acc[icon.category].push(icon);
    return acc;
  }, {} as Record<string, typeof icons>);

  // Get unique categories
  const categories = Object.keys(iconsByCategory);

  // Debug logging
  console.log('🔍 Debug - All icons:', icons);
  console.log('🔍 Debug - Categories:', categories);
  console.log('🔍 Debug - Icons by category:', iconsByCategory);

  // Show loading state while fetching icons
  if (iconsLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#fefcfc]">
        <div className="text-center text-[#585d68] space-y-4">
          <div className="text-2xl font-bold">Loading Icons...</div>
          <div className="text-lg">Please wait while we fetch the available icons.</div>
        </div>
      </div>
    );
  }

  // Show error state if icons failed to load
  if (iconsError) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#fefcfc]">
        <div className="text-center text-[#585d68] space-y-4">
          <div className="text-2xl font-bold text-red-400">Error Loading Icons</div>
          <div className="text-lg">{iconsError}</div>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!currentPhoto) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-black">
        <div className="text-center text-white space-y-4">
          <h2 className="text-2xl font-bold text-red-400">No Photo Found</h2>
          <p className="text-lg">Please take a photo first.</p>
          <button
            onClick={() => navigate({ to: "/camera" })}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Take Photo
          </button>
        </div>
      </div>
    );
  }

  // Get proper text style for preview (FIXED FOR VISIBILITY)
  const getTextStyle = () => {
    if (!editState.selectedFrame || !editState.frameText || !editState.selectedFrame.style.textSettings.enabled || editState.selectedFrame.id === 'none') return { display: 'none' };

    return {
      position: 'absolute' as const,
      left: '33px',    // Scaled from x:90 (90/1080 * 400)
      top: '326px',   // Scaled from y:880 (880/1080 * 400)
      fontSize: '13px', // Scaled from 36px for 400px preview (400/1080 = 0.370)
      fontFamily: 'Arial, sans-serif',
      color: 'white',
      zIndex: 20,
      textShadow: '2px 2px 4px rgba(0,0,0,0.8)', // Add shadow for better visibility
      maxWidth: '333px', // Constrain to preview width
      wordWrap: 'break-word' as const,
    };
  };

  return (
    <div
      className="bg-[#fefcfc] relative size-full grid grid-cols-2"
      style={{
        backgroundImage: "url('data:image/svg+xml;utf8,<svg viewBox=\\'0 0 1680 905\\' xmlns=\\'http://www.w3.org/2000/svg\\' preserveAspectRatio=\\'none\\'><rect x=\\'0\\' y=\\'0\\' height=\\'100%\\' width=\\'100%\\' fill=\\'url(%23grad)\\' opacity=\\'1\\'/><defs><radialGradient id=\\'grad\\' gradientUnits=\\'userSpaceOnUse\\' cx=\\'0\\' cy=\\'0\\' r=\\'10\\' gradientTransform=\\'matrix(158.87 -9.5359 17.702 85.58 -24.242 891.94)\\'><stop stop-color=\\'rgba(184,186,190,1)\\' offset=\\'0\\'/><stop stop-color=\\'rgba(231,232,233,1)\\' offset=\\'1\\'/></radialGradient></defs></svg>')"
      }}
    >
      {/* Left Panel - Photo */}
      <div className="bg-[#f3f3f4] flex flex-col gap-8 items-center justify-center overflow-hidden px-8 py-8 relative rounded-br-[32px] rounded-tr-[32px] shadow-[32px_32px_64px_0px_rgba(0,0,0,0.04)]">
        <div className="font-['Space_Grotesk'] font-bold leading-[72px] text-[#585d68] text-[64px] text-center tracking-[-1.28px]">
          Your Photo!
        </div>
        <div
          ref={canvasRef}
          className="h-[400px] w-[400px] overflow-hidden relative shadow-[0px_0px_32px_0px_rgba(0,0,0,0.08)] cursor-move"
          onClick={handleCanvasClick}
        >
          {/* Photo background - positioned based on frame selection */}
          {editState.selectedFrame && editState.selectedFrame.id !== 'none' ? (
            // WITH FRAME: Photo is positioned in frame area
            <img
              src={currentPhoto.file_path}
              alt="Your captured photo"
              className="absolute left-[33px] top-[33px] w-[333px] h-[281px] object-cover"
            />
          ) : (
            // NO FRAME: Photo fills entire preview area
            <img
              src={currentPhoto.file_path}
              alt="Your captured photo"
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}

          {/* Text overlay - STANDARDIZED POSITIONING */}
          {editState.selectedFrame && editState.frameText && editState.selectedFrame.style.textSettings.enabled && editState.selectedFrame.id !== 'none' && (
            <div style={getTextStyle()}>
              {editState.frameText}
            </div>
          )}

          {/* Frame overlay if selected (not for "none" frame) */}
          {editState.selectedFrame && editState.selectedFrame.frameImage && editState.selectedFrame.id !== 'none' && (
            <img
              src={editState.selectedFrame.frameImage}
              alt="Frame overlay"
              className="absolute inset-0 w-full h-full object-cover pointer-events-none"
            />
          )}

          {/* Icon Overlays - Interactive */}
          {editState.overlays.map((overlay) => {
            const icon = icons.find(i => i.id === overlay.iconId);
            if (!icon) return null;

            const isSelected = overlay.id === selectedIconId;
            const isBeingDragged = overlay.id === draggedIconId;

            return (
              <div
                key={overlay.id}
                className={`absolute transition-transform ${
                  isBeingDragged
                    ? 'cursor-grabbing scale-110'
                    : 'cursor-grab hover:scale-105'
                } ${isSelected ? 'ring-2 ring-blue-500 ring-offset-2 rounded-lg' : ''}`}
                style={{
                  left: `${(overlay.position.x / 1080) * 100}%`, // Scale from 1080px width
                  top: `${(overlay.position.y / 1080) * 100}%`, // Scale from 1080px height
                  transform: `translate(-50%, -50%) rotate(${overlay.rotation}deg)`,
                  zIndex: overlay.zIndex + (isBeingDragged ? 1000 : 0), // Bring to front when dragging
                  userSelect: 'none',
                }}
                onMouseDown={(e) => handleIconMouseDown(e, overlay)}
                onClick={(e) => {
                  e.stopPropagation(); // Prevent canvas click when clicking icon
                }}
                title={`${icon.name} (Click and drag to move)`}
              >
                <img
                  src={icon.iconPath}
                  alt={icon.name}
                  draggable={false}
                  style={{
                    width: `${(overlay.size * 0.370)}px`, // Scale for 400px preview (400/1080 = 0.370)
                    height: `${(overlay.size * 0.370)}px`,
                    pointerEvents: 'none', // Prevent image from interfering with drag
                  }}
                />

                {/* Selection indicator */}
                {isSelected && !isBeingDragged && (
                  <div className="absolute inset-0 border-2 border-blue-500 rounded-lg pointer-events-none" />
                )}
              </div>
            );
          })}
        </div>
        <div className="absolute inset-0 pointer-events-none shadow-[-32px_-32px_64px_0px_inset_rgba(0,0,0,0.04)]" />
      </div>

      {/* Right Panel - Controls */}
      <div className="flex flex-col gap-6 items-center justify-start overflow-hidden px-8 py-8 relative rounded-bl-[32px] rounded-tl-[32px]">
        {/* Header */}
        <div className="flex flex-col gap-2 items-center w-full">
          <div className="font-['Space_Grotesk'] font-bold leading-[40px] text-[#585d68] text-[36px] text-center tracking-[-0.72px]">
            Insert Overlay
          </div>
          <div className="font-['Public_Sans'] font-medium leading-[30px] text-[#888b93] text-[24px] text-center">
            Choose stickers and decorations for your photo
          </div>
          <div className="font-['Public_Sans'] font-medium leading-[20px] text-[#6b7280] text-[14px] text-center">
            💡 Tip: Click and drag icons on your photo to reposition them
          </div>

          {/* Selected Icon Status */}
          {selectedIconId && (
            <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-lg">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div className="font-['Public_Sans'] font-medium leading-[18px] text-[#1e40af] text-[12px]">
                {(() => {
                  const selectedOverlay = editState.overlays.find(o => o.id === selectedIconId);
                  const selectedIcon = icons.find(i => i.id === selectedOverlay?.iconId);
                  return selectedIcon ? `Selected: ${selectedIcon.name}` : 'Icon selected';
                })()}
              </div>
            </div>
          )}
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 w-full overflow-y-auto flex flex-col gap-8">
          {/* No Overlay Option */}
          <button
            onClick={handleNoOverlay}
            className="flex gap-8 items-center px-8 py-4 border border-[#888b93] rounded-xl w-full hover:border-red-500 hover:bg-red-50 transition-all duration-200"
          >
            <div className="flex-1 flex flex-col gap-2">
              <div className="font-['Public_Sans'] font-semibold leading-[32px] text-[#70747d] text-[28px]">
                No Overlay
              </div>
              <div className="font-['Plus_Jakarta_Sans'] font-medium leading-[22px] text-[#888b93] text-[16px]">
                Clean photo without decorations
              </div>
            </div>
            <div className="size-12 flex items-center justify-center">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none" className="text-[#888b93]">
                <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="2" fill="none"/>
                <line x1="16" y1="32" x2="32" y2="16" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
          </button>

          {/* Dynamic Category Sections */}
          {categories.length > 0 ? (
            categories.map((category) => (
              <div key={category} className="flex flex-col gap-2 w-full">
                <div className="font-['Space_Grotesk'] font-medium leading-[32px] text-[#70747d] text-[28px] tracking-[-0.56px]">
                  {category}
                </div>
                <div className="flex flex-wrap gap-8">
                  {iconsByCategory[category].map((icon) => (
                    <button
                      key={icon.id}
                      onClick={() => handleIconClick(icon.id)}
                      className={`flex flex-col gap-3 items-center px-8 py-4 border rounded-xl w-80 transition-all duration-200 ${
                        selectedIcons.includes(icon.id)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-[#888b93] hover:border-blue-300'
                      }`}
                    >
                      <div className="size-16 flex items-center justify-center">
                        <img src={icon.iconPath} alt={icon.name} className="w-full h-full object-contain" />
                      </div>
                      <div className="font-['Public_Sans'] font-medium leading-[26px] text-[#70747d] text-[20px] text-center">
                        {icon.name}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col gap-4 items-center justify-center w-full py-12">
              <div className="text-[#585d68] text-xl font-medium">No Icons Available</div>
              <div className="text-[#888b93] text-base">No icons were found. Please check back later.</div>
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="flex gap-[42px] items-center w-full">
          <button
            onClick={handleBack}
            className="flex-1 bg-[#585d68] opacity-70 hover:opacity-90 flex items-center justify-center px-8 py-6 rounded-xl shadow-[32px_32px_64px_0px_inset_rgba(255,255,255,0.24)] transition-all duration-200"
          >
            <div className="font-['Public_Sans'] font-semibold leading-[32px] text-[#fefcfc] text-[28px] text-center">
              Back
            </div>
          </button>
          <button
            onClick={handlePrintAndFinish}
            disabled={isPrinting || isSaving}
            className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 flex items-center justify-center px-8 py-6 rounded-xl shadow-[32px_32px_64px_0px_inset_rgba(255,255,255,0.24)] transition-all duration-200"
          >
            <div className="font-['Public_Sans'] font-semibold leading-[32px] text-[#fefcfc] text-[28px] text-center">
              {isPrinting ? 'Printing...' : 'Print'}
            </div>
          </button>
          <button
            onClick={handleFinish}
            disabled={isSaving || isPrinting}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center px-8 py-6 rounded-xl shadow-[32px_32px_64px_0px_inset_rgba(255,255,255,0.24)] transition-all duration-200"
          >
            <div className="font-['Public_Sans'] font-semibold leading-[32px] text-[#fefcfc] text-[28px] text-center">
              {isSaving ? 'Saving...' : 'Finish'}
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}