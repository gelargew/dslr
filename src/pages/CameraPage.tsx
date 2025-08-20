import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { usePhotoContext } from "@/contexts/PhotoContext";
import { Camera } from "lucide-react";

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
      await capturePhoto(imageData);

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

      {/* Camera Button */}
      <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2">
        <button
          onClick={handleCapture}
          disabled={isCapturing}
          className="bg-[#585d68] opacity-80 hover:opacity-70 disabled:opacity-50 px-16 py-4 rounded-[120px] flex flex-col gap-2.5 items-center justify-center transition-opacity duration-200 shadow-2xl"
        >

            {isCapturing ? (
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600" />
            ) : (
              <Camera size={36} className="text-gray-700" />
            )}

        </button>
      </div>
    </div>
  );
}
