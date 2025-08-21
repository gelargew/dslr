import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "@tanstack/react-router";
import { usePhotoContext } from "@/contexts/PhotoContext";
import { getCountdownDuration } from "@/config/photobooth-config";

export default function CountdownPage() {
  const navigate = useNavigate();
  const { capturePhoto } = usePhotoContext();
  const [countdown, setCountdown] = useState(getCountdownDuration());
  const [isCapturing, setIsCapturing] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  // Initialize camera on component mount
  useEffect(() => {
    initializeCamera();

    // Cleanup stream on unmount
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Countdown logic
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);

      return () => clearTimeout(timer);
    } else {
      // Countdown complete, capture photo automatically
      handleAutoCapture();
    }
  }, [countdown]);

  const initializeCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1080 },
          height: { ideal: 1080 },
          facingMode: 'user'
        },
        audio: false
      });

      setStream(mediaStream);

      // Set video stream
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error('Camera access error:', err);
      // If camera fails, still allow countdown and navigate
    }
  };

  const handleAutoCapture = async () => {
    if (!videoRef.current || !canvasRef.current || isCapturing) return;

    try {
      setIsCapturing(true);
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      if (!ctx) return;

      // Set canvas to square dimensions
      const size = 1080;
      canvas.width = size;
      canvas.height = size;

      // Calculate crop area to center the video in square format
      const videoAspect = video.videoWidth / video.videoHeight;
      let sourceX = 0, sourceY = 0, sourceWidth = video.videoWidth, sourceHeight = video.videoHeight;

      if (videoAspect > 1) {
        // Video is wider than square - crop sides
        sourceWidth = video.videoHeight;
        sourceX = (video.videoWidth - sourceWidth) / 2;
      } else if (videoAspect < 1) {
        // Video is taller than square - crop top/bottom
        sourceHeight = video.videoWidth;
        sourceY = (video.videoHeight - sourceHeight) / 2;
      }

      // Draw cropped video frame to square canvas
      ctx.drawImage(
        video,
        sourceX, sourceY, sourceWidth, sourceHeight, // Source (crop area)
        0, 0, size, size // Destination (full canvas)
      );

      // Convert to base64
      const imageData = canvas.toDataURL('image/jpeg', 0.9);

      // Save photo via context
      await capturePhoto(imageData);

      // Navigate to preview page
      navigate({ to: "/preview" });

    } catch (error) {
      console.error('Capture error:', error);
      // Even if capture fails, navigate to preview
      navigate({ to: "/preview" });
    }
  };

  const getCountdownText = () => {
    return countdown.toString();
  };

  const getCountdownColor = () => {
    if (countdown === 1) return "text-red-400";
    if (countdown === 2) return "text-orange-400";
    return "text-white";
  };

  return (
    <div className="relative h-screen w-full bg-black overflow-hidden">
      {/* Webcam Background */}
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Hidden canvas for capture */}
      <canvas
        ref={canvasRef}
        className="hidden"
      />

      {/* Countdown Circle Overlay - Only show when countdown > 0 */}
      {countdown > 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-48 h-48 bg-[#585d68] opacity-80 rounded-full flex items-center justify-center shadow-2xl">
            <div className={`text-8xl font-bold ${getCountdownColor()} transition-all duration-300 animate-pulse`}>
              {getCountdownText()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
