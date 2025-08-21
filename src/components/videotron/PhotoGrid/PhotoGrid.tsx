import React, { useEffect, useState } from 'react';
import { cn } from '@/utils/tailwind';

interface PhotoGridProps {
  photos: string[];
  className?: string;
  maxPhotos?: number;
}

export default function PhotoGrid({
  photos = [],
  className,
  maxPhotos = 40
}: PhotoGridProps) {
  const [gridPhotos, setGridPhotos] = useState<(string | null)[]>([]);

  useEffect(() => {
    // Create a grid of exactly 40 slots
    const grid: (string | null)[] = new Array(maxPhotos).fill(null);

    // Fill with available photos (most recent first)
    photos.slice(0, maxPhotos).forEach((photo, index) => {
      grid[index] = photo;
    });

    setGridPhotos(grid);
  }, [photos, maxPhotos]);

  // Get photos for a specific row (10 photos per row)
  const getPhotosForRow = (rowIndex: number, photosPerRow: number = 10): (string | null)[] => {
    const startIndex = rowIndex * photosPerRow;
    return gridPhotos.slice(startIndex, startIndex + photosPerRow);
  };

  const PhotoSlot = ({ photo }: { photo: string | null }) => (
    <div className="aspect-square w-full h-full">
      {photo ? (
        <img
          src={photo}
          alt="Photo"
          className="w-full h-full object-cover"
          onError={(e) => {
            console.error(`Failed to load image: ${photo}`);
            e.currentTarget.style.display = 'none';
          }}
        />
      ) : (
        <div className="w-full h-full"></div>
      )}
    </div>
  );

  const PhotoRow = ({ photos, rowIndex }: { photos: (string | null)[]; rowIndex: number }) => (
    <div className="flex-1 flex gap-1">
      {photos.map((photo, index) => (
        <div key={`row-${rowIndex}-slot-${index}`} className="flex-1">
          <PhotoSlot photo={photo} />
        </div>
      ))}
    </div>
  );

  return (
    <div className={cn(
      "h-screen w-full flex flex-col relative z-10 p-4 gap-1",
      className
    )}>
      {/* 4 rows of 10 photos each */}
      <PhotoRow photos={getPhotosForRow(0)} rowIndex={0} />
      <PhotoRow photos={getPhotosForRow(1)} rowIndex={1} />
      <PhotoRow photos={getPhotosForRow(2)} rowIndex={2} />
      <PhotoRow photos={getPhotosForRow(3)} rowIndex={3} />
    </div>
  );
}
