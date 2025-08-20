import React from "react";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { usePhotoContext } from "@/contexts/PhotoContext";

export default function EditLandingPage() {
  const navigate = useNavigate();
  const { currentPhoto } = usePhotoContext();

  const handleStartEdit = () => {
    navigate({ to: "/edit/photo" });
  };

  const handleSkipEdit = () => {
    navigate({ to: "/thank-you" });
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

  return (
    <div className="flex h-screen w-full bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-purple-900">
      <div className="flex-1 flex items-center justify-center p-8">
        {/* Photo Preview */}
        <div className="relative max-w-2xl">
          <img
            src={currentPhoto.file_path}
            alt="Your captured photo"
            className="w-full h-auto rounded-lg shadow-2xl"
          />
          <div className="absolute inset-0 rounded-lg ring-4 ring-purple-300/50 pointer-events-none" />
        </div>
      </div>

      {/* Edit Options Panel */}
      <div className="w-96 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm flex flex-col justify-center p-8 space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4 font-tomorrow">
            Great Shot! 📸
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Would you like to add some creative touches to make it even more special?
          </p>
        </div>

        {/* Edit Features Preview */}
        <div className="space-y-4 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">🖼️</span>
            <span>Add beautiful frames</span>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-2xl">✨</span>
            <span>Place fun stickers and icons</span>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-2xl">📝</span>
            <span>Add custom text</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <Button
            onClick={handleStartEdit}
            size="lg"
            className="w-full h-16 text-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            ✨ Yes, Let's Edit!
          </Button>

          <Button
            onClick={handleSkipEdit}
            size="lg"
            variant="outline"
            className="w-full h-16 text-lg border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Skip & Save As Is
          </Button>
        </div>

        {/* Encouragement */}
        <div className="text-center text-sm text-purple-600 dark:text-purple-400">
          <p>💡 Tip: Editing is fun and takes less than a minute!</p>
        </div>
      </div>
    </div>
  );
}
