import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { usePhotoContext } from "@/contexts/PhotoContext";
import { useConfigModalContext } from "@/contexts/ConfigModalContext";
import { Camera, Settings } from "lucide-react";

// DigiCamControl types
interface DigicamStatus {
  connected: boolean;
  message?: string;
  error?: string;
}

interface DigicamCaptureResult {
  success: boolean;
  message?: string;
  error?: string;
}

export default function CameraPage() {
  const navigate = useNavigate();
  const { capturePhoto, isCapturing } = usePhotoContext();
  const imageRef = useRef<HTMLImageElement>(null);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [hasConnection, setHasConnection] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isImageLoading, setIsImageLoading] = useState(true);
  const { isOpen: isConfigModalOpen, open: openConfigModal, close: closeConfigModal } = useConfigModalContext();

  // Initialize camera on component mount
  useEffect(() => {
    initializeCamera();

    // Cleanup on unmount
    return () => {
      stopImageRefresh();
      if (window.digicamAPI) {
        window.digicamAPI.removeAllListeners('digicam:new-image');
      }
    };
  }, []);

  const initializeCamera = async () => {
    try {
      console.log('🔧 Initializing DigiCamControl...');

      // Check if DigiCamControl APIs are available
      if (!window.digicamAPI || !window.dccConfig) {
        console.error('❌ DigiCamControl APIs not available');
        setError('DigiCamControl integration not available. Please ensure DigiCamControl is installed and running.');
        return;
      }

      console.log('📋 DigiCamControl configuration:', window.dccConfig);

      // Test DigiCamControl connection
      const statusResult: DigicamStatus = await window.digicamAPI.checkStatus();
      if (statusResult.connected) {
        setHasConnection(true);
        console.log('✅ DigiCamControl connection established');

        // Start image refresh
        startImageRefresh();

        // Set up new image listener
        window.digicamAPI.onNewImage((data) => {
          console.log('🖼️ New image received:', data);
          // Handle new image if needed
        });
      } else {
        console.warn('⚠️ DigiCamControl connection failed:', statusResult.error);
        setError('DigiCamControl not connected. Please ensure DigiCamControl is running with WebServer plugin enabled.');
      }
    } catch (err: any) {
      console.error('❌ DigiCamControl initialization error:', err);
      setError(`DigiCamControl initialization failed: ${err.message}`);
    }
  };

  // Start 20fps image refresh
  let refreshInterval: NodeJS.Timeout | null = null;

  const startImageRefresh = () => {
    stopImageRefresh(); // Clear any existing interval

    const fps = 20; // Fixed 20fps for DigiCamControl
    const intervalMs = Math.round(1000 / fps);
    console.log(`🔄 Starting DigiCamControl live view refresh at ${fps}fps (${intervalMs}ms)`);

    refreshInterval = setInterval(() => {
      const timestamp = Date.now();
      const newUrl = `${window.dccConfig.liveViewUrl}?t=${timestamp}`;
      setImageUrl(newUrl);
    }, intervalMs);

    // Set initial image
    setImageUrl(`${window.dccConfig.liveViewUrl}?t=${Date.now()}`);
  };

  const stopImageRefresh = () => {
    if (refreshInterval) {
      clearInterval(refreshInterval);
      refreshInterval = null;
      console.log('⏹️ Stopped image refresh');
    }
  };

  // Handle image load events
  const handleImageLoad = () => {
    setIsImageLoading(false);
  };

  const handleImageError = () => {
    setIsImageLoading(false);
    console.error('❌ Failed to load live feed image');
    if (!error) {
      setError('Failed to load live feed. Check camera connection.');
    }
  };

  const handleCapture = async () => {
    if (isCapturing) return;

    try {
      console.log('📸 Capturing photo from DigiCamControl...');

      if (!window.digicamAPI) {
        throw new Error('DigiCamControl API not available');
      }

      // Capture photo from DigiCamControl
      const result: DigicamCaptureResult = await window.digicamAPI.capture();

      if (result.success) {
        console.log('✅ Photo capture initiated successfully');

        // Wait a moment for capture to complete
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Navigate to countdown page
        navigate({ to: "/countdown" });
      } else {
        throw new Error(result.error || 'Failed to capture photo from DigiCamControl');
      }

    } catch (error: any) {
      console.error('❌ DigiCamControl capture error:', error);
      setError(`Failed to capture photo: ${error.message}`);
    }
  };

  const handleBack = () => {
    navigate({ to: "/" });
  };

  const handleOpenConfig = () => {
    openConfigModal();
  };

  const handleCloseConfig = () => {
    closeConfigModal();
    // Reinitialize camera
    initializeCamera();
  };

  if (error) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-black text-white">
        <div className="text-center space-y-6">
          <h2 className="text-3xl font-bold text-red-400">DigiCamControl Error</h2>
          <p className="text-lg text-gray-300">{error}</p>
          <div className="space-x-4">
            <Button onClick={handleOpenConfig} variant="outline" size="lg">
              <Settings className="mr-2 h-5 w-5" />
              Configure
            </Button>
            <Button onClick={handleBack} variant="outline" size="lg">
              ← Back to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!hasConnection) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-black text-white">
        <div className="text-center space-y-6">
          <h2 className="text-3xl font-bold">Initializing DigiCamControl...</h2>
          <p className="text-lg text-gray-300">Connecting to DigiCamControl WebServer</p>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
          <div className="text-sm text-gray-400">
            <p>Please ensure DigiCamControl is running with:</p>
            <p>• WebServer plugin enabled (port 5513)</p>
            <p>• Camera connected and in manual mode</p>
            <p>• Live View enabled</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-screen w-full bg-black overflow-hidden">
      {/* Live Feed Image */}
      <img
        ref={imageRef}
        src={imageUrl}
        alt="Live feed"
        onLoad={handleImageLoad}
        onError={handleImageError}
        className="absolute inset-0 w-full h-full object-cover"
        style={{
          opacity: isImageLoading ? 0.5 : 1,
          transition: 'opacity 0.1s ease-in-out',
        }}
      />

      {/* Loading indicator */}
      {isImageLoading && (
        <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm rounded-lg px-3 py-2">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            <span className="text-white text-sm">Loading...</span>
          </div>
        </div>
      )}

      {/* DigiCamControl status */}
      <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm rounded-lg px-3 py-2">
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${hasConnection ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className="text-white text-sm">
            {hasConnection ? 'DigiCamControl Connected' : 'DigiCamControl Disconnected'}
          </span>
        </div>
      </div>

      {/* Gallery link */}
      <div className="absolute top-4 left-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.open(window.dccConfig?.galleryUrl, '_blank')}
          className="bg-black/50 backdrop-blur-sm border-gray-600 text-white hover:bg-gray-800"
        >
          View Gallery
        </Button>
      </div>

      {/* Settings button */}
      <div className="absolute top-4 right-20">
        <Button
          variant="outline"
          size="sm"
          onClick={handleOpenConfig}
          className="bg-black/50 backdrop-blur-sm border-gray-600 text-white hover:bg-gray-800"
        >
          <Settings className="h-4 w-4" />
        </Button>
      </div>

      {/* Camera Button */}
      <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2">
        <button
          onClick={handleCapture}
          disabled={isCapturing || !hasConnection}
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
