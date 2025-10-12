import React, { useEffect, useState } from 'react';
import { PhotoGrid } from '@/components/videotron/PhotoGrid';
import { closeWindow, maximizeWindow, minimizeWindow } from '@/helpers/window_helpers';
import TroubleshootingPanel from '@/components/TroubleshootingPanel';
import backgroundImage from '/background.png';

// Fallback sample photos for when database is empty
const generateSamplePhotos = (count: number): string[] => {
  const photos: string[] = [];
  for (let i = 1; i <= count; i++) {
    photos.push(`https://picsum.photos/400/400?random=${i}`);
  }
  return photos;
};

export default function GalleryPage() {
  const [photos, setPhotos] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showTroubleshooting, setShowTroubleshooting] = useState(false);

  // Load photos from database
  const loadPhotos = async () => {
    try {
      console.log('📥 Fetching photos from database...');

      // Check if photoDatabase is available
      if (!window.photoDatabase) {
        console.error('PhotoDatabase not available on window object');
        console.log('Using sample photos for demo...');
        const samplePhotos = generateSamplePhotos(15);
        setPhotos(samplePhotos);
        return;
      }

      // Test connection first
      console.log('🔌 Testing database connection...');
      const connectionTest = await window.photoDatabase.testConnection();
      console.log('Connection test result:', connectionTest);

      if (!connectionTest.success || !connectionTest.connected) {
        console.error('Database connection failed:', connectionTest.error);
        console.log('Using sample photos for demo...');
        const samplePhotos = generateSamplePhotos(15);
        setPhotos(samplePhotos);
        return;
      }

      const result = await window.photoDatabase.getPhotos(40);
      console.log('Get photos result:', result);

      if (result?.success && result.photos && result.photos.length > 0) {
        // Use gcs_url (for uploaded photos) or filename (for local photos) as fallback
        const photoUrls = result.photos.map(record =>
          record.gcs_url || record.thumbnail_url || record.filename
        ).filter(Boolean); // Remove any null/undefined values
        console.log(`📸 Loaded ${photoUrls.length} photos from database`);

        setPhotos(photoUrls);
      } else {
        console.warn('No photos found in database:', result?.error);
        // If no photos in database, use sample photos for demo
        console.log('Using sample photos for demo...');
        const samplePhotos = generateSamplePhotos(15);
        setPhotos(samplePhotos);
      }
    } catch (error) {
      console.error('Failed to load photos:', error);
      console.error('Error details:', error);
      console.log('Using sample photos for demo...');
      const samplePhotos = generateSamplePhotos(15);
      setPhotos(samplePhotos);
    }
  };

  // Initial load
  useEffect(() => {
    const initialLoad = async () => {
      await loadPhotos();
      setIsLoading(false);
    };

    initialLoad();
  }, []);

  // Set up real-time photo updates every 5 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      await loadPhotos();
    }, 5000); // Check for new photos every 5 seconds

    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-black">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-white border-t-transparent mb-4"></div>
          <p className="text-2xl text-white">Loading Gallery...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-black flex flex-col">
      {/* Custom title bar for gallery */}
      <div className="flex w-full items-stretch justify-between bg-black bg-opacity-50 backdrop-blur-sm">
        <div className="draglayer w-full">
          <div className="flex flex-1 p-2 text-xs whitespace-nowrap text-white select-none items-center justify-between">
            <span>Gallery</span>
            <button
              onClick={() => setShowTroubleshooting(true)}
              className="px-2 py-1 bg-blue-500 bg-opacity-80 rounded text-xs hover:bg-opacity-100 no-drag"
              title="Troubleshooting"
            >
              🔧
            </button>
          </div>
        </div>
        <div className="flex no-drag">
          <button
            title="Minimize"
            type="button"
            className="p-2 text-white hover:bg-white hover:bg-opacity-20 no-drag"
            onClick={minimizeWindow}
          >
            <svg width="12" height="12" viewBox="0 0 12 12">
              <rect fill="currentColor" width="10" height="1" x="1" y="6"></rect>
            </svg>
          </button>
          <button
            title="Maximize"
            type="button"
            className="p-2 text-white hover:bg-white hover:bg-opacity-20 no-drag"
            onClick={maximizeWindow}
          >
            <svg width="12" height="12" viewBox="0 0 12 12">
              <rect
                width="9"
                height="9"
                x="1.5"
                y="1.5"
                fill="none"
                stroke="currentColor"
              ></rect>
            </svg>
          </button>
          <button
            type="button"
            title="Close"
            className="p-2 text-white hover:bg-red-500 hover:bg-opacity-80 no-drag"
            onClick={closeWindow}
          >
            <svg width="12" height="12" viewBox="0 0 12 12">
              <polygon
                fill="currentColor"
                fillRule="evenodd"
                points="11 1.576 6.583 6 11 10.424 10.424 11 6 6.583 1.576 11 1 10.424 5.417 6 1 1.576 1.576 1 6 5.417 10.424 1"
              ></polygon>
            </svg>
          </button>
        </div>
      </div>
      <div className="flex-1 relative">
        <img src={backgroundImage} alt="bg" className="absolute top-0 left-0 w-full h-full object-cover" />
        <PhotoGrid
          photos={photos}
          maxPhotos={40}
          className="absolute inset-0 w-full h-full"
        />
      </div>

      {showTroubleshooting && (
        <TroubleshootingPanel onClose={() => setShowTroubleshooting(false)} />
      )}
    </div>
  );
}
