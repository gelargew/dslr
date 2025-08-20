import React, { useEffect, useState } from 'react';
import { PhotoGrid } from '@/components/videotron/PhotoGrid';
import { NewPhotoAnimation } from '@/components/videotron/NewPhotoAnimation';

// Mock data for development - replace with actual database calls
const generateMockPhotos = (count: number): string[] => {
  const photos: string[] = [];
  for (let i = 1; i <= count; i++) {
    // For now, using placeholder images - these will be replaced with actual captured photos
    photos.push(`https://picsum.photos/400/400?random=${i}`);
  }
  return photos;
};

export default function GalleryPage() {
  const [photos, setPhotos] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newPhoto, setNewPhoto] = useState<string | null>(null);
  const [showNewPhotoAnimation, setShowNewPhotoAnimation] = useState(false);

  useEffect(() => {
    // TODO: Replace with actual database call
    // const loadPhotos = async () => {
    //   try {
    //     const photoRecords = await window.database?.getRecentPhotos(40);
    //     const photoUrls = photoRecords?.map(record => record.file_path) || [];
    //     setPhotos(photoUrls);
    //   } catch (error) {
    //     console.error('Failed to load photos:', error);
    //   } finally {
    //     setIsLoading(false);
    //   }
    // };

    // For development, use mock data
    const loadMockPhotos = () => {
      setTimeout(() => {
        const mockPhotos = generateMockPhotos(25); // Generate 25 sample photos
        setPhotos(mockPhotos);
        setIsLoading(false);
      }, 1000); // Simulate loading time
    };

    loadMockPhotos();
  }, []);

  useEffect(() => {
    // TODO: Set up real-time photo updates
    // const interval = setInterval(async () => {
    //   try {
    //     const newPhotos = await window.database?.getRecentPhotos(40);
    //     const photoUrls = newPhotos?.map(record => record.file_path) || [];
    //
    //     // Check if there's a new photo
    //     if (photoUrls.length > photos.length && photoUrls.length > 0) {
    //       const latestPhoto = photoUrls[0];
    //       setNewPhoto(latestPhoto);
    //       setShowNewPhotoAnimation(true);
    //     }
    //
    //     setPhotos(photoUrls);
    //   } catch (error) {
    //     console.error('Failed to refresh photos:', error);
    //   }
    // }, 5000); // Check for new photos every 5 seconds

    // For development, simulate a new photo every 15 seconds
    const interval = setInterval(() => {
      if (photos.length > 0) {
        const randomIndex = Math.floor(Math.random() * 1000) + 100;
        const newPhotoUrl = `https://picsum.photos/400/400?random=${randomIndex}`;
        setNewPhoto(newPhotoUrl);
        setShowNewPhotoAnimation(true);

        // Add the new photo to the beginning of the array
        setPhotos(prev => [newPhotoUrl, ...prev.slice(0, 39)]);
      }
    }, 15000);

    return () => clearInterval(interval);
  }, [photos.length]);

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

  const handleNewPhotoAnimationComplete = () => {
    setShowNewPhotoAnimation(false);
    setNewPhoto(null);
  };

  return (
    <div className="h-screen w-full bg-black relative">
      <PhotoGrid
        photos={photos}
        maxPhotos={40}
        className="h-full w-full"
      />

      {/* New Photo Animation Overlay */}
      {showNewPhotoAnimation && newPhoto && (
        <NewPhotoAnimation
          photoUrl={newPhoto}
          onAnimationComplete={handleNewPhotoAnimationComplete}
          duration={5000}
        />
      )}
    </div>
  );
}
