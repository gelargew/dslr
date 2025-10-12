import React, { useState, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { usePhoto } from "@/hooks/usePhoto";
import { getThankYouDuration } from "@/config/photobooth-config";

export default function CompletePage() {
  const navigate = useNavigate();
  const { clearCurrentPhoto, clearCurrentEdit } = usePhoto();
  const [countdown, setCountdown] = useState(getThankYouDuration());

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
    <div
      className="bg-[#fefcfc] relative size-full"
      style={{
        backgroundImage: "url('data:image/svg+xml;utf8,<svg viewBox=\\'0 0 1680 905\\' xmlns=\\'http://www.w3.org/2000/svg\\' preserveAspectRatio=\\'none\\'><rect x=\\'0\\' y=\\'0\\' height=\\'100%\\' width=\\'100%\\' fill=\\'url(%23grad)\\' opacity=\\'1\\'/><defs><radialGradient id=\\'grad\\' gradientUnits=\\'userSpaceOnUse\\' cx=\\'0\\' cy=\\'0\\' r=\\'10\\' gradientTransform=\\'matrix(158.87 -9.5359 17.702 85.58 -24.242 891.94)\\'><stop stop-color=\\'rgba(184,186,190,1)\\' offset=\\'0\\'/><stop stop-color=\\'rgba(231,232,233,1)\\' offset=\\'1\\'/></radialGradient></defs></svg>')"
      }}
    >
      <div
        className="absolute bg-[#fefcfc] box-border content-stretch flex flex-col gap-16 items-center justify-center overflow-clip p-32 rounded-[32px] shadow-[32px_32px_64px_0px_rgba(0,0,0,0.04)] translate-x-[-50%] translate-y-[-50%]"
        style={{
          top: "calc(50% + 0.5px)",
          left: "calc(50% + 0.5px)",
          width: "1117px",
          height: "682px"
        }}
      >
        {/* Thank You Message */}
        <div className="box-border content-stretch flex flex-col gap-8 items-center justify-start p-0 w-full">
          <div className="font-['Space_Grotesk'] font-bold leading-[72px] text-[#585d68] text-[64px] text-center tracking-[-1.28px] w-full">
            <p className="block mb-0">Thank you!</p>
            <p className="block">Your photo will appear soon on the videotron.</p>
          </div>
        </div>

        {/* Countdown Circle */}
        <div className="bg-[#585d68] flex items-center justify-center opacity-70 px-32 py-8 rounded-[64px] shadow-[32px_32px_64px_0px_inset_rgba(255,255,255,0.24)]">
          <div className="font-['Public_Sans'] font-semibold leading-[54px] text-[#fefcfc] text-[36px] text-center">
            {countdown}
          </div>
        </div>

        {/* Container shadow */}
        <div className="absolute inset-0 pointer-events-none shadow-[-32px_-32px_64px_0px_inset_rgba(0,0,0,0.04)]" />
      </div>
    </div>
  );
}
