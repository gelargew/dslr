import React, { useEffect, useState } from 'react';
import { PhotoGrid } from '@/components/videotron/PhotoGrid';
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

  // Load photos from database
  const loadPhotos = async () => {
    try {
      console.log('📥 Fetching photos from database...');

      // Check if photoDatabase is available
      if (!window.photoDatabase) {
        console.error('PhotoDatabase not available on window object');
        return;
      }

      const result = await window.photoDatabase.getPhotos(40);

      if (result?.success && result.photos) {
        // Use gcs_url (for uploaded photos) or filename (for local photos) as fallback
        const photoUrls = result.photos.map(record =>
          record.gcs_url || record.thumbnail_url || record.filename
        ).filter(Boolean); // Remove any null/undefined values
        console.log(`📸 Loaded ${photoUrls.length} photos`);

        setPhotos(photoUrls);
      } else {
        console.warn('No photos found or database error:', result?.error);
        // If no photos in database, use sample photos for demo
        console.log('Using sample photos for demo...');
        const samplePhotos = generateSamplePhotos(15);
        setPhotos(samplePhotos);
      }
    } catch (error) {
      console.error('Failed to load photos:', error);
      console.error('Error details:', error);
      setPhotos([]);
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
    <div className="h-screen w-full bg-black">
      <img src={backgroundImage} alt="bg" className="absolute top-0 left-0 w-full h-full object-cover" />
      <PhotoGrid
        photos={photos}
        maxPhotos={40}
        className="h-full w-full"
      />
    </div>
  );
}
