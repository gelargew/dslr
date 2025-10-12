import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { usePhoto } from "@/hooks/usePhoto";
import { Camera, Settings } from "lucide-react";

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
    cameraAPI: {
      getPermissions: () => Promise<{ success: boolean; hasPermission: boolean; error?: string }>;
      requestPermissions: () => Promise<{ success: boolean; hasPermission: boolean; error?: string }>;
    };
    fileAPI: {
      readLocalFile: (filePath: string) => Promise<{ success: boolean; data?: string; error?: string }>;
      fileExists: (filePath: string) => Promise<{ success: boolean; exists: boolean; error?: string }>;
      getPhotoPath: (filename: string) => Promise<{ success: boolean; path?: string; error?: string }>;
    };
  }
}

export default function CameraPage() {
  const navigate = useNavigate();
  const { capturePhoto, isCapturing } = usePhoto();
  const [dccConnected, setDccConnected] = useState(false);
  const [dccStatus, setDccStatus] = useState<string>('Checking DigiCamControl...');
  const [lastImage, setLastImage] = useState<string | null>(null);
  const [liveViewKey, setLiveViewKey] = useState(Date.now());
  const [shouldRefreshLiveView, setShouldRefreshLiveView] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const refreshInterval = useRef<NodeJS.Timeout | null>(null);

  // 10fps live view refresh
  useEffect(() => {
    if (dccConnected && shouldRefreshLiveView) {
      refreshInterval.current = setInterval(() => {
        setLiveViewKey(Date.now());
      }, 100); // 10fps = 100ms interval

      console.log('🎬 Started 10fps live view refresh');
    } else {
      if (refreshInterval.current) {
        clearInterval(refreshInterval.current);
        refreshInterval.current = null;
        console.log('⏸️ Paused live view refresh');
      }
    }

    return () => {
      if (refreshInterval.current) {
        clearInterval(refreshInterval.current);
      }
    };
  }, [dccConnected, shouldRefreshLiveView]);

  // Check DigiCamControl status on mount
  useEffect(() => {
    const checkDccStatus = async () => {
      try {
        const result = await window.electronAPI.checkDccStatus();
        setDccConnected(result.connected);
        setDccStatus(result.connected ? 'DigiCamControl Connected' : result.error || 'Not connected');
      } catch (error) {
        setDccStatus('Failed to check DigiCamControl');
        setDccConnected(false);
      }
    };

    checkDccStatus();
    const interval = setInterval(checkDccStatus, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, []);

  // Listen for new images from DigiCamControl
  useEffect(() => {
    const handleNewImage = async (data: { original: string; processed: string }) => {
      console.log('📸 New image received:', data);
      setLastImage(data.processed);
      setDccStatus('Photo captured successfully!');

      try {
        // Get the full file path for the captured image
        const pathResult = await window.fileAPI.getPhotoPath(data.processed);
        if (!pathResult.success) {
          console.error('❌ Failed to get photo path:', pathResult.error);
          // Fallback to HTTP method
          loadImageViaHTTP(data.processed);
          return;
        }

        // Read the file using the file API
        const fileResult = await window.fileAPI.readLocalFile(pathResult.path);
        if (!fileResult.success) {
          console.error('❌ Failed to read image file:', fileResult.error);
          // Fallback to HTTP method
          loadImageViaHTTP(data.processed);
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

            // Navigate to countdown after successful capture
            navigate({ to: "/countdown" });
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
        loadImageViaHTTP(data.processed);
      }
    };

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

            // Navigate to countdown after successful capture
            navigate({ to: "/countdown" });
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

    window.electronAPI.onNewImage(handleNewImage);

    return () => {
      window.electronAPI.removeAllListeners('new-image');
    };
  }, [capturePhoto, navigate]);

  const handleCapture = async () => {
    if (!dccConnected) {
      setError('DigiCamControl not connected. Please start DigiCamControl and enable WebServer plugin.');
      return;
    }

    if (isCapturing) return;

    setError(null);

    // Pause live view refresh when starting countdown
    setShouldRefreshLiveView(false);

    // Start countdown - the countdown page will handle the capture
    navigate({ to: "/countdown" });
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

  return (
    <div className="relative h-screen w-full bg-black overflow-hidden">
      {/* DigiCamControl Live View */}
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
            <p className="text-sm text-gray-400 mt-2">{dccStatus}</p>
          </div>
        </div>
      )}

      {/* Status Indicator */}
      <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm rounded-lg px-3 py-2 flex items-center gap-2">
        <div className={`w-3 h-3 rounded-full ${dccConnected ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
        <span className="text-white text-sm">{dccStatus}</span>
      </div>

      {/* Camera Button */}
      <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2">
        <button
          onClick={handleCapture}
          disabled={!dccConnected || isCapturing}
          className="bg-[#585d68] opacity-80 hover:opacity-70 disabled:opacity-50 px-16 py-4 rounded-[120px] flex flex-col gap-2.5 items-center justify-center transition-opacity duration-200 shadow-2xl"
        >
          {isCapturing ? (
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600" />
          ) : (
            <Camera size={36} className="text-gray-700" />
          )}
        </button>
      </div>

      {/* Debug Info (can be removed in production) */}
      {process.env.NODE_ENV === 'development' && lastImage && (
        <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-sm rounded-lg p-2">
          <p className="text-white text-xs">Last: {lastImage}</p>
        </div>
      )}
    </div>
  );
}