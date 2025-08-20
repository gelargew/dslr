import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { usePhotoContext } from "@/contexts/PhotoContext";

export default function CameraPage() {
  const navigate = useNavigate();
  const { capturePhoto, isCapturing } = usePhotoContext();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

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

  const initializeCamera = async () => {
    try {
      // Request camera access - prefer square or high resolution
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1080 },
          height: { ideal: 1080 },
          facingMode: 'user'
        },
        audio: false
      });

      setStream(mediaStream);
      setHasPermission(true);

      // Set video stream
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error('Camera access error:', err);
      setError('Camera access denied. Please allow camera access and refresh the page.');
      setHasPermission(false);
    }
  };

  const handleCapture = async () => {
    if (!videoRef.current || !canvasRef.current || isCapturing) return;

    try {
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
      const savedPhoto = await capturePhoto(imageData);

      // Navigate to countdown page
      navigate({ to: "/countdown" });

    } catch (error) {
      console.error('Capture error:', error);
      setError('Failed to capture photo. Please try again.');
    }
  };

  const handleBack = () => {
    navigate({ to: "/" });
  };

  if (error) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-black text-white">
        <div className="text-center space-y-6">
          <h2 className="text-3xl font-bold text-red-400">Camera Error</h2>
          <p className="text-lg text-gray-300">{error}</p>
          <Button onClick={handleBack} variant="outline" size="lg">
            ← Back to Home
          </Button>
        </div>
      </div>
    );
  }

  if (!hasPermission) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-black text-white">
        <div className="text-center space-y-6">
          <h2 className="text-3xl font-bold">Requesting Camera Access...</h2>
          <p className="text-lg text-gray-300">Please allow camera access to continue</p>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-screen w-full bg-black overflow-hidden">
      {/* Video Stream */}
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

      {/* Square Capture Area Overlay */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="relative">
          {/* Square frame guide */}
          <div className="w-80 h-80 sm:w-96 sm:h-96 lg:w-[500px] lg:h-[500px] border-4 border-white/80 rounded-lg shadow-lg">
            {/* Corner guides */}
            <div className="absolute -top-2 -left-2 w-8 h-8 border-t-4 border-l-4 border-white rounded-tl-lg"></div>
            <div className="absolute -top-2 -right-2 w-8 h-8 border-t-4 border-r-4 border-white rounded-tr-lg"></div>
            <div className="absolute -bottom-2 -left-2 w-8 h-8 border-b-4 border-l-4 border-white rounded-bl-lg"></div>
            <div className="absolute -bottom-2 -right-2 w-8 h-8 border-b-4 border-r-4 border-white rounded-br-lg"></div>
          </div>

          {/* Center guide dot */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full opacity-60"></div>
        </div>
      </div>

      {/* Camera Controls Overlay */}
      <div className="absolute inset-0 flex flex-col justify-between p-8 pointer-events-none">
        {/* Top Bar */}
        <div className="flex justify-between items-center pointer-events-auto">
          <Button
            onClick={handleBack}
            variant="ghost"
            size="lg"
            className="text-white hover:bg-white/20"
          >
            ← Back
          </Button>

          <div className="text-white text-lg font-medium">
            Position yourself in the square
          </div>

          <div className="w-24" /> {/* Spacer for centering */}
        </div>

        {/* Bottom Controls */}
        <div className="flex justify-center items-center pointer-events-auto">
          <Button
            onClick={handleCapture}
            disabled={isCapturing}
            size="lg"
            className="h-20 w-20 rounded-full bg-white text-black hover:bg-gray-200 disabled:opacity-50 shadow-lg"
          >
            {isCapturing ? (
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-black" />
            )}
          </Button>
        </div>

        {/* Instructions */}
        <div className="text-center text-white/80 pointer-events-none">
          <p className="text-lg">Tap the circle to capture your square photo</p>
        </div>
      </div>
    </div>
  );
}
