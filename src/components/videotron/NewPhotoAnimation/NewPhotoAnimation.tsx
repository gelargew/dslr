import React, { useEffect, useState } from 'react';
import { cn } from '@/utils/tailwind';

interface NewPhotoAnimationProps {
  photoUrl: string;
  onAnimationComplete: () => void;
  duration?: number; // in milliseconds
}

export default function NewPhotoAnimation({
  photoUrl,
  onAnimationComplete,
  duration = 5000
}: NewPhotoAnimationProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Start entrance animation
    const showTimer = setTimeout(() => {
      setIsVisible(true);
    }, 100);

    // Start exit animation
    const exitTimer = setTimeout(() => {
      setIsExiting(true);
    }, duration - 500);

    // Complete animation and notify parent
    const completeTimer = setTimeout(() => {
      onAnimationComplete();
    }, duration);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(exitTimer);
      clearTimeout(completeTimer);
    };
  }, [duration, onAnimationComplete]);

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center",
        "transition-opacity duration-500",
        isVisible && !isExiting ? "opacity-100" : "opacity-0"
      )}
    >
      <div
        className={cn(
          "relative transition-all duration-700 ease-out",
          isVisible && !isExiting
            ? "scale-100 opacity-100"
            : isExiting
            ? "scale-95 opacity-0"
            : "scale-110 opacity-0"
        )}
      >
        {/* Glow effect */}
        <div className="absolute inset-0 bg-white rounded-2xl blur-xl opacity-20 scale-110" />

        {/* Photo container */}
        <div className="relative bg-white p-4 rounded-2xl shadow-2xl">
          <img
            src={photoUrl}
            alt="New photo"
            className="w-96 h-96 object-cover rounded-lg"
            draggable={false}
          />

          {/* Text overlay */}
          <div className="absolute bottom-6 left-6 right-6">
            <div className="bg-black bg-opacity-60 rounded-lg px-4 py-2">
              <p className="text-white text-xl font-semibold text-center">
                📸 New Photo Captured!
              </p>
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute -top-4 -right-4 text-6xl animate-bounce">✨</div>
        <div className="absolute -bottom-4 -left-4 text-5xl animate-pulse">🌟</div>
      </div>
    </div>
  );
}
