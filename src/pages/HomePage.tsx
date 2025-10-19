import React, { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import startImage from '/start.png';
import { configManager } from '@/services/config-manager';
import { useEdit } from "@/hooks/useEdit";

// TypeScript declarations for the DigiCamControl API
declare global {
  interface Window {
    electronAPI: {
      startLiveView: () => Promise<{ success: boolean; message?: string; error?: string }>;
      stopLiveView: () => Promise<{ success: boolean; message?: string; error?: string }>;
    };
  }
}

export default function HomePage() {
  const navigate = useNavigate();
  const { clearEdit } = useEdit();

  const handleStart = async () => {
    try {
      // Clear edit state before starting new session
      console.log('🧹 Clearing edit state for new session...');
      clearEdit();

      // Start live view before navigating to camera
      console.log('🎬 Starting live view from homepage...');
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

  // const handleGallery = () => {
  //   navigate({ to: "/gallery" });
  // };

  // const testDebuggerToggle = () => {
  //   const current = configManager.getDebuggerEnabled();
  //   console.log('🧪 Test toggle - Current debugger state:', current);
  //   const newState = !current;
  //   const result = configManager.setDebuggerEnabled(newState);
  //   console.log('🧪 Test toggle - Set result:', result, 'New state should be:', newState);
  // };

  return (
    <div className="bg-gray-900 relative size-full overflow-hidden">
      <img src={startImage} alt="Textimoni Background" className="absolute inset-0 w-full h-full object-cover" />


      {/* Main content container with glass morphism */}
      <div
        className="absolute backdrop-blur-2xl backdrop-filter bg-black/30 border border-white/20 box-border content-stretch flex flex-col gap-16 items-center justify-center overflow-clip p-32 rounded-[32px] translate-x-[-50%] translate-y-[-50%] max-w-4xl w-full mx-auto"
        style={{ top: "calc(50% + 0.5px)", left: "calc(50% - 0.5px)" }}
      >
        <div className="font-bold leading-tight relative shrink-0 text-white text-4xl md:text-6xl text-center tracking-tight">
          <h1 className="leading-tight whitespace-pre">
            <span className="font-normal">Welcome to the</span>
            <span className="font-bold"> Textimoni!</span>
          </h1>
        </div>

        <div className="font-semibold leading-relaxed relative shrink-0 text-white text-lg md:text-3xl text-center max-w-2xl">
          <p className="block leading-relaxed">
            Get ready to strike your best pose.
            <br />
            Tap Start when you&apos;re ready!
          </p>
        </div>

        <div className="flex flex-col gap-6 items-center">
          <Button
            onClick={handleStart}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-2xl md:text-4xl leading-tight px-16 md:px-32 py-6 md:py-8 rounded-[32px] h-auto shadow-[inset_0_0_0_1px_rgba(255,255,255,0.24)] transition-all duration-200 hover:scale-105 active:scale-95 touch-manipulation"
            size="lg"
          >
            Start
          </Button>

        </div>
      </div>
    </div>
  );
}
