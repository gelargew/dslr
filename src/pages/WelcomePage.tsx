import React from "react";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export default function WelcomePage() {
  const navigate = useNavigate();

  const handleStart = () => {
    navigate({ to: "/camera" });
  };

  const handleDebug = () => {
    navigate({ to: "/debug" });
  };

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      <div className="text-center space-y-8">
        {/* Main Title */}
        <div className="space-y-4">
          <h1 className="text-6xl font-bold text-gray-900 dark:text-white font-tomorrow">
            Welcome to
          </h1>
          <h2 className="text-7xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent font-tomorrow">
            Photobooth
          </h2>
        </div>

        {/* Subtitle */}
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-md mx-auto">
          Capture amazing moments and create beautiful memories with custom frames and fun overlays
        </p>

        {/* Start Button */}
        <div className="pt-8">
          <Button
            onClick={handleStart}
            size="lg"
            className="h-20 w-64 text-2xl font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            🎉 Start Photo Session
          </Button>
        </div>

        {/* Debug Button (Development) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="pt-4">
            <Button
              onClick={handleDebug}
              variant="outline"
              size="sm"
              className="text-sm"
            >
              🔧 Debug Center
            </Button>
          </div>
        )}

        {/* Instructions */}
        <div className="pt-8 text-sm text-gray-500 dark:text-gray-400">
          <p>Touch the button above to begin your photo experience</p>
          {process.env.NODE_ENV === 'development' && (
            <p className="mt-2 text-xs">Dev mode: Press Ctrl+Shift+I for console, or use Debug Center above</p>
          )}
        </div>
      </div>
    </div>
  );
}