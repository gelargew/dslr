import React from "react";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import startImage from '/start.png';

export default function HomePage() {
  const navigate = useNavigate();

  const handleStart = () => {
    navigate({ to: "/camera" });
  };

  const handleGallery = () => {
    navigate({ to: "/gallery" });
  };

  return (
    <div className="bg-gray-900 relative size-full overflow-hidden">
      <img src={startImage} alt="Photobooth Background" className="absolute inset-0 w-full h-full object-cover" />


      {/* Main content container with glass morphism */}
      <div
        className="absolute backdrop-blur-2xl backdrop-filter bg-black/30 border border-white/20 box-border content-stretch flex flex-col gap-16 items-center justify-center overflow-clip p-32 rounded-[32px] translate-x-[-50%] translate-y-[-50%] max-w-4xl w-full mx-auto"
        style={{ top: "calc(50% + 0.5px)", left: "calc(50% - 0.5px)" }}
      >
        <div className="font-bold leading-tight relative shrink-0 text-white text-4xl md:text-6xl text-center tracking-tight">
          <h1 className="leading-tight whitespace-pre">
            <span className="font-normal">Welcome to the</span>
            <span className="font-bold"> Textimoni Photobooth!</span>
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

          <Button
            onClick={handleGallery}
            className="bg-purple-600 hover:bg-purple-700 text-white font-medium text-lg md:text-xl leading-tight px-8 md:px-12 py-3 md:py-4 rounded-[20px] h-auto shadow-[inset_0_0_0_1px_rgba(255,255,255,0.20)] transition-all duration-200 hover:scale-105 active:scale-95 touch-manipulation"
            size="default"
          >
            📸 View Gallery
          </Button>
        </div>
      </div>
    </div>
  );
}
