import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "@tanstack/react-router";
import { usePhotoContext } from "@/contexts/PhotoContext";
import { getCountdownDuration } from "@/config/photobooth-config";
import { Camera } from "lucide-react";

// TypeScript declarations for the DigiCamControl API
declare global {
  interface Window {
    electronAPI: {
      capture: () => Promise<{ success: boolean; message?: string; error?: string }>;
      checkDccStatus: () => Promise<{ connected: boolean; message?: string; error?: string }>;
      onNewImage: (callback: (data: { original: string; processed: string }) => void) => void;
      removeAllListeners: (channel: string) => void;
    };
    dccConfig: {
      liveViewUrl: string;
      photoUrl: string;
      baseUrl: string;
      captureUrl: string;
    };
    fileAPI: {
      readLocalFile: (filePath: string) => Promise<{ success: boolean; data?: string; error?: string }>;
      fileExists: (filePath: string) => Promise<{ success: boolean; exists: boolean; error?: string }>;
      getPhotoPath: (filename: string) => Promise<{ success: boolean; path?: string; error?: string }>;
    };
  }
}

export default function CountdownPage() {
  const navigate = useNavigate();
  const { capturePhoto } = usePhotoContext();
  const [countdown, setCountdown] = useState(getCountdownDuration());
  const [isCapturing, setIsCapturing] = useState(false);
  const [dccConnected, setDccConnected] = useState(false);
  const [captureStatus, setCaptureStatus] = useState<string>('');
  const [liveViewKey, setLiveViewKey] = useState(Date.now());
  const [shouldRefreshLiveView, setShouldRefreshLiveView] = useState(true);
  const refreshInterval = useRef<NodeJS.Timeout | null>(null);

  // Check DigiCamControl status on mount
  useEffect(() => {
    const checkDccStatus = async () => {
      try {
        const result = await window.electronAPI.checkDccStatus();
        setDccConnected(result.connected);
      } catch (error) {
        setDccConnected(false);
      }
    };

    checkDccStatus();
  }, []);

  // Listen for new images from DigiCamControl
  useEffect(() => {
    const handleNewImage = async (data: { original: string; processed: string }) => {
      console.log('📸 New image received in countdown:', data);
      setCaptureStatus('Photo captured successfully!');

      try {
        // Get the full file path for the captured image
        const pathResult = await window.fileAPI.getPhotoPath(data.processed);
        if (!pathResult.success) {
          console.error('❌ Failed to get photo path:', pathResult.error);
          // Fallback to HTTP method
          await loadImageViaHTTP(data.processed);
          return;
        }

        // Read the file using the file API
        const fileResult = await window.fileAPI.readLocalFile(pathResult.path);
        if (!fileResult.success) {
          console.error('❌ Failed to read image file:', fileResult.error);
          // Fallback to HTTP method
          await loadImageViaHTTP(data.processed);
          return;
        }

        // Create an image element to convert to base64
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = 1080;
          canvas.height = 1080;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            // Draw and crop to square
            const size = Math.min(img.width, img.height);
            const x = (img.width - size) / 2;
            const y = (img.height - size) / 2;
            ctx.drawImage(img, x, y, size, size, 0, 0, 1080, 1080);

            const base64 = canvas.toDataURL('image/jpeg', 0.9);
            capturePhoto(base64);

            // Navigate to preview page after successful capture
            navigate({ to: "/preview" });
          }
        };
        img.onerror = () => {
          console.error('Failed to load captured image from file, falling back to HTTP');
          // Fallback to HTTP method
          loadImageViaHTTP(data.processed);
        };

        img.src = `data:image/jpeg;base64,${fileResult.data}`;
      } catch (error) {
        console.error('❌ Error processing captured image:', error);
        // Fallback to HTTP method
        await loadImageViaHTTP(data.processed);
      }
    };

    window.electronAPI.onNewImage(handleNewImage);

    return () => {
      window.electronAPI.removeAllListeners('new-image');
    };
  }, [capturePhoto, navigate]);

  // Fallback method: try HTTP method if file access fails
  const loadImageViaHTTP = async (filename: string) => {
    try {
      const imageUrl = `http://localhost:3001/photos/${filename}`;
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 1080;
        canvas.height = 1080;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          // Draw and crop to square
          const size = Math.min(img.width, img.height);
          const x = (img.width - size) / 2;
          const y = (img.height - size) / 2;
          ctx.drawImage(img, x, y, size, size, 0, 0, 1080, 1080);

          const base64 = canvas.toDataURL('image/jpeg', 0.9);
          capturePhoto(base64);

          // Navigate to preview page after successful capture
          navigate({ to: "/preview" });
        }
      };
      img.onerror = () => {
        console.error('Failed to load captured image via HTTP');
        // Even if capture fails, navigate to preview after a delay
        setTimeout(() => {
          navigate({ to: "/preview" });
        }, 2000);
      };
      img.src = imageUrl;
    } catch (error) {
      console.error('❌ Error loading image via HTTP:', error);
      // Even if capture fails, navigate to preview after a delay
      setTimeout(() => {
        navigate({ to: "/preview" });
      }, 2000);
    }
  };

  // 10fps live view refresh
  useEffect(() => {
    if (dccConnected && shouldRefreshLiveView) {
      refreshInterval.current = setInterval(() => {
        setLiveViewKey(Date.now());
      }, 100); // 10fps = 100ms interval

      console.log('🎬 Countdown: Started 10fps live view refresh');
    } else {
      if (refreshInterval.current) {
        clearInterval(refreshInterval.current);
        refreshInterval.current = null;
        console.log('⏸️ Countdown: Paused live view refresh');
      }
    }

    return () => {
      if (refreshInterval.current) {
        clearInterval(refreshInterval.current);
      }
    };
  }, [dccConnected, shouldRefreshLiveView]);

  // Countdown logic
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);

      return () => clearTimeout(timer);
    } else {
      // Countdown complete, stop live view refresh and capture photo
      setShouldRefreshLiveView(false);
      handleDigiCamControlCapture();
    }
  }, [countdown]);

  const handleDigiCamControlCapture = async () => {
    if (!dccConnected || isCapturing) return;

    try {
      setIsCapturing(true);
      setCaptureStatus('Capturing...');

      const result = await window.electronAPI.capture();
      if (result.success) {
        setCaptureStatus('Capture initiated, waiting for image...');
        // Don't navigate here - wait for the new-image event
      } else {
        console.error('DigiCamControl capture failed:', result.error);
        setCaptureStatus(`Capture failed: ${result.error}`);
        // Even if capture fails, navigate to preview after a delay
        setTimeout(() => {
          navigate({ to: "/preview" });
        }, 2000);
      }
    } catch (error) {
      console.error('Capture error:', error);
      setCaptureStatus('Failed to capture photo');
      // Even if capture fails, navigate to preview after a delay
      setTimeout(() => {
        navigate({ to: "/preview" });
      }, 2000);
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
      {/* DigiCamControl Live View Background */}
      {dccConnected ? (
        <img
          src={`${window.dccConfig.liveViewUrl}${shouldRefreshLiveView ? `?t=${liveViewKey}` : ''}`}
          alt="Live View"
          className="absolute inset-0 w-full h-full object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            // If live view fails, show a placeholder
            target.style.display = 'none';
          }}
        />
      ) : (
        <div className="absolute inset-0 w-full h-full bg-gray-900 flex items-center justify-center">
          <div className="text-center text-white">
            <Camera size={48} className="mx-auto mb-4 opacity-50" />
            <p className="text-lg">Waiting for DigiCamControl...</p>
          </div>
        </div>
      )}

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

      {/* Capture Status Overlay - Show when countdown is 0 and capturing */}
      {countdown === 0 && captureStatus && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="text-center text-white">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4" />
            <p className="text-lg">{captureStatus}</p>
          </div>
        </div>
      )}
    </div>
  );
}
