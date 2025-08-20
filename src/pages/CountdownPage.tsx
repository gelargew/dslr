import React, { useState, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";

export default function CountdownPage() {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(3);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);

      return () => clearTimeout(timer);
    } else {
      // Countdown complete, navigate to preview
      setIsComplete(true);
      const navTimer = setTimeout(() => {
        navigate({ to: "/preview" });
      }, 500); // Small delay for smooth transition

      return () => clearTimeout(navTimer);
    }
  }, [countdown, navigate]);

  const getCountdownText = () => {
    if (isComplete) return "📸";
    if (countdown === 0) return "Say Cheese!";
    return countdown.toString();
  };

  const getCountdownColor = () => {
    if (isComplete) return "text-green-400";
    if (countdown === 0) return "text-yellow-400";
    if (countdown === 1) return "text-red-400";
    if (countdown === 2) return "text-orange-400";
    return "text-white";
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-black">
      <div className="text-center">
        {/* Countdown Display */}
        <div className={`text-9xl font-bold ${getCountdownColor()} transition-all duration-300 animate-pulse`}>
          {getCountdownText()}
        </div>

        {/* Instructions */}
        <div className="mt-8 text-white/80 text-xl">
          {isComplete ? (
            <p className="animate-fade-in">Perfect! 🎉</p>
          ) : countdown === 0 ? (
            <p className="animate-bounce">Say Cheese! 📸</p>
          ) : (
            <p>Get ready...</p>
          )}
        </div>

        {/* Progress indicator */}
        <div className="mt-12 flex justify-center space-x-2">
          {[3, 2, 1].map((num) => (
            <div
              key={num}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                countdown < num
                  ? 'bg-green-400'
                  : countdown === num
                    ? 'bg-white animate-pulse'
                    : 'bg-white/30'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Background animation */}
      <div className="absolute inset-0 pointer-events-none">
        <div className={`absolute inset-0 transition-all duration-1000 ${
          countdown <= 1 ? 'bg-white/10' : 'bg-transparent'
        }`} />
      </div>
    </div>
  );
}
