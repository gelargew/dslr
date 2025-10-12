import React from "react";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { usePhoto } from "@/hooks/usePhoto";

// TypeScript declarations for the DigiCamControl API
declare global {
  interface Window {
    electronAPI: {
      startLiveView: () => Promise<{ success: boolean; message?: string; error?: string }>;
    };
  }
}

export default function PreviewPage() {
  const navigate = useNavigate();
  const { currentPhoto, isLoading } = usePhoto();

  const handleRetake = async () => {
    try {
      // Start live view before going back to camera
      console.log('🎬 Starting live view from retake button...');
      const result = await window.electronAPI.startLiveView();
      if (result.success) {
        console.log('✅ Live view started successfully');
      } else {
        console.warn('⚠️ Failed to start live view:', result.error);
      }
    } catch (error) {
      console.error('❌ Error starting live view:', error);
    }

    // Navigate to camera page regardless of live view status
    navigate({ to: "/camera" });
  };

  const handleFinish = () => {
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
    <div className="relative h-screen w-full">
      {/* Fullscreen Photo Background */}
      <img
        src={currentPhoto.file_path}
        alt="Captured photo"
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Two Buttons at Bottom */}
      <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 flex gap-[42px] items-center">
        {/* Finish Button (Blue) */}
        <button
          onClick={handleFinish}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-[28px] leading-[54px] px-20 py-4 rounded-[32px] shadow-[32px_32px_64px_0px_inset_rgba(255,255,255,0.24)] transition-all duration-200"
        >
          Finish
        </button>

        {/* Retake Button (Gray) */}
        <button
          onClick={handleRetake}
          className="bg-[#585d68] opacity-70 hover:opacity-90 text-white font-semibold text-[28px] leading-[54px] px-20 py-4 rounded-[32px] shadow-[32px_32px_64px_0px_inset_rgba(255,255,255,0.24)] transition-all duration-200"
        >
          Retake
        </button>
      </div>
    </div>
  );
}
