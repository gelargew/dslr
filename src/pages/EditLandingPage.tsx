import React, { useState, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { usePhoto } from "@/hooks/usePhoto";
import { getEditLandingDuration } from "@/config/photobooth-config";
import { Button } from "@/components/ui/button";

// Helper function to load image as base64 from URL
const loadImageAsBase64 = async (imageUrl: string): Promise<string> => {
  try {
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('❌ Failed to load image as base64:', error);
    throw error;
  }
};

export default function EditLandingPage() {
  const navigate = useNavigate();
  const { currentPhoto, uploadPhotoDraft } = usePhoto();
  const [countdown, setCountdown] = useState(getEditLandingDuration());
  const [showGreatShot, setShowGreatShot] = useState(false);
  const [hasUploadedDraft, setHasUploadedDraft] = useState(false);

  // Photo draft upload logic
  useEffect(() => {
    // Start photo draft upload after 2 seconds into countdown
    if (!hasUploadedDraft && currentPhoto) {
      const uploadTimer = setTimeout(async () => {
        try {
          console.log('📤 Uploading photo draft during Thank You countdown...');
          // Extract base64 from the current photo's file_path if it's a data URL
          const base64Data = currentPhoto.file_path.startsWith('data:')
            ? currentPhoto.file_path
            : await loadImageAsBase64(currentPhoto.file_path);

          await uploadPhotoDraft(base64Data, currentPhoto.file_path);
          setHasUploadedDraft(true);
          console.log('✅ Photo draft uploaded successfully during Thank You countdown');
        } catch (error) {
          console.error('❌ Failed to upload photo draft:', error);
        }
      }, 2000); // 2 seconds into countdown

      return () => clearTimeout(uploadTimer);
    }
  }, [currentPhoto, hasUploadedDraft, uploadPhotoDraft]);

  // Countdown logic
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);

      return () => clearTimeout(timer);
    } else {
      // Countdown complete, show Great Shot UI
      setShowGreatShot(true);
    }
  }, [countdown]);

  const handleStartEdit = () => {
    navigate({ to: "/edit/photo" });
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

  if (!showGreatShot) {
    // Show countdown UI similar to Figma design
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-200">
        {/* White rounded container */}
        <div className="bg-white rounded-[32px] p-16 max-w-2xl mx-auto text-center shadow-2xl">
          <h1 className="text-5xl font-bold text-gray-700 mb-4">
            Thank You!
          </h1>
          <h2 className="text-4xl font-bold text-gray-600 mb-8">
            Your moment is saved.
          </h2>

          <p className="text-xl text-gray-600 mb-12 leading-relaxed">
            Continue the fun by editing and customizing your<br />
            photo at the tablet station outside the booth!
          </p>

          {/* Countdown Circle */}
          <div className="w-24 h-24 bg-[#585d68] opacity-80 rounded-full flex items-center justify-center shadow-xl mx-auto">
            <div className="text-4xl font-bold text-white">
              {countdown}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show simple Great Shot UI after countdown
  return (
    <div className="flex h-screen w-full items-center justify-center bg-gray-200">
      {/* White rounded container */}
      <div className="bg-white rounded-[32px] p-16 max-w-2xl mx-auto text-center shadow-2xl">
        <h1 className="text-5xl font-bold text-gray-700 mb-4">
          Great Shot!
        </h1>
        <h2 className="text-4xl font-bold text-gray-600 mb-8">
          Ready to customize?
        </h2>

        <p className="text-xl text-gray-600 mb-12 leading-relaxed">
          Add frames, stickers, and text to make your<br />
          photo even more special!
        </p>

        {/* Start Button */}
        <button
          onClick={handleStartEdit}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-[28px] leading-[54px] px-20 py-4 rounded-[32px] shadow-[32px_32px_64px_0px_inset_rgba(255,255,255,0.24)] transition-all duration-200"
        >
          Start Editing
        </button>
      </div>
    </div>
  );
}
