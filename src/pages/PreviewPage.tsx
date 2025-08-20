import React from "react";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { usePhotoContext } from "@/contexts/PhotoContext";

export default function PreviewPage() {
  const navigate = useNavigate();
  const { currentPhoto, isLoading } = usePhotoContext();

  const handleRetake = () => {
    navigate({ to: "/camera" });
  };

  const handleFinish = () => {
    navigate({ to: "/thank-you" });
  };

  const handleEdit = () => {
    navigate({ to: "/edit" });
  };

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-black">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-lg">Processing your photo...</p>
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
          <Button onClick={() => navigate({ to: "/camera" })} size="lg">
            Take Photo
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-black">
      {/* Photo Display - Square */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="relative aspect-square w-full max-w-lg">
          <img
            src={currentPhoto.file_path}
            alt="Captured photo"
            className="w-full h-full object-cover rounded-lg shadow-2xl"
          />

          {/* Photo border effect */}
          <div className="absolute inset-0 rounded-lg ring-4 ring-white/20 pointer-events-none" />
        </div>
      </div>

      {/* Controls Panel */}
      <div className="w-80 bg-gray-900 flex flex-col justify-center p-8 space-y-6">
        <div className="text-center text-white mb-8">
          <h2 className="text-3xl font-bold mb-2">How does it look?</h2>
          <p className="text-gray-300">Choose what you'd like to do next</p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <Button
            onClick={handleEdit}
            size="lg"
            className="w-full h-16 text-lg bg-blue-600 hover:bg-blue-700"
          >
            ✨ Edit & Add Effects
          </Button>

          <Button
            onClick={handleFinish}
            size="lg"
            variant="outline"
            className="w-full h-16 text-lg border-green-500 text-green-500 hover:bg-green-500 hover:text-white"
          >
            ✅ Finish & Save
          </Button>

          <Button
            onClick={handleRetake}
            size="lg"
            variant="outline"
            className="w-full h-16 text-lg border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white"
          >
            📷 Retake Photo
          </Button>
        </div>

        {/* Photo Info */}
        <div className="mt-8 pt-6 border-t border-gray-700 text-sm text-gray-400">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Resolution:</span>
              <span>{currentPhoto.original_width} × {currentPhoto.original_height}</span>
            </div>
            <div className="flex justify-between">
              <span>Size:</span>
              <span>{(currentPhoto.file_size / (1024 * 1024)).toFixed(1)} MB</span>
            </div>
            <div className="flex justify-between">
              <span>Time:</span>
              <span>{new Date(currentPhoto.created_at).toLocaleTimeString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
