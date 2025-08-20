import React, { useState, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { usePhotoContext } from "@/contexts/PhotoContext";

export default function ThankYouPage() {
  const navigate = useNavigate();
  const { clearCurrentPhoto, clearCurrentEdit } = usePhotoContext();
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    // Auto-navigate after 10 seconds
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          // Clear current photo/edit state and return to welcome
          clearCurrentPhoto();
          clearCurrentEdit();
          navigate({ to: "/" });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate, clearCurrentPhoto, clearCurrentEdit]);

  const handleReturnNow = () => {
    clearCurrentPhoto();
    clearCurrentEdit();
    navigate({ to: "/" });
  };

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <div className="text-center space-y-8 max-w-2xl px-8">
        {/* Success Icon */}
        <div className="text-8xl animate-bounce">
          🎉
        </div>

        {/* Main Message */}
        <div className="space-y-4">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white font-tomorrow">
            Thank You!
          </h1>
          <h2 className="text-3xl font-semibold text-green-600 dark:text-green-400">
            Your moment is saved
          </h2>
        </div>

        {/* Description */}
        <div className="space-y-4 text-lg text-gray-600 dark:text-gray-300">
          <p>
            Your beautiful photo has been captured and saved successfully.
          </p>
          <p>
            Thank you for using our photobooth experience!
          </p>
        </div>

        {/* Countdown */}
        <div className="bg-white/80 dark:bg-gray-800/80 rounded-2xl p-6 shadow-lg">
          <div className="text-2xl font-semibold text-gray-700 dark:text-gray-200 mb-2">
            Returning to start in
          </div>
          <div className="text-6xl font-bold text-blue-600 dark:text-blue-400 animate-pulse">
            {countdown}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            seconds
          </div>
        </div>

        {/* Manual Return Button */}
        <button
          onClick={handleReturnNow}
          className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline transition-colors duration-200"
        >
          Return to start now
        </button>

        {/* Fun elements */}
        <div className="flex justify-center space-x-4 text-4xl">
          <span className="animate-pulse">⭐</span>
          <span className="animate-pulse delay-100">💫</span>
          <span className="animate-pulse delay-200">✨</span>
          <span className="animate-pulse delay-300">🌟</span>
        </div>
      </div>

      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-20 text-6xl opacity-20 animate-spin-slow">🎊</div>
        <div className="absolute top-40 right-32 text-4xl opacity-30 animate-bounce">🎈</div>
        <div className="absolute bottom-32 left-40 text-5xl opacity-25 animate-pulse">🎭</div>
        <div className="absolute bottom-20 right-20 text-4xl opacity-20 animate-spin-slow">🎪</div>
      </div>
    </div>
  );
}
