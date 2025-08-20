import React, { useEffect, useState } from 'react';
import { ScrollingRow } from '../ScrollingRow';
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
  const [gridPhotos, setGridPhotos] = useState<string[]>([]);

  useEffect(() => {
    // Limit to max photos and ensure we have recent photos first
    const limitedPhotos = photos.slice(0, maxPhotos);
    setGridPhotos(limitedPhotos);
  }, [photos, maxPhotos]);

  // If we don't have enough photos, we can duplicate some to fill the grid
  const getPhotosForRow = (rowIndex: number, photosPerRow: number = 10): string[] => {
    if (gridPhotos.length === 0) return [];

    const startIndex = rowIndex * photosPerRow;
    const rowPhotos: string[] = [];

    // Fill the row, cycling through available photos if needed
    for (let i = 0; i < photosPerRow; i++) {
      const photoIndex = (startIndex + i) % gridPhotos.length;
      rowPhotos.push(gridPhotos[photoIndex]);
    }

    return rowPhotos;
  };

  if (gridPhotos.length === 0) {
    return (
      <div className={cn(
        "flex h-screen w-full items-center justify-center bg-gray-100",
        className
      )}>
        <div className="text-center">
          <div className="text-4xl font-bold text-gray-400 mb-4">📸</div>
          <p className="text-2xl text-gray-500">No photos to display</p>
          <p className="text-lg text-gray-400 mt-2">Photos will appear here as they are captured</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "h-screen w-full bg-black overflow-hidden flex flex-col justify-center",
      className
    )}>
      {/* Row 1 - Move Left */}
      <div className="flex-1">
        <ScrollingRow
          photos={getPhotosForRow(0)}
          direction="left"
          speed={40}
          className="h-full"
        />
      </div>

      {/* Row 2 - Move Right */}
      <div className="flex-1">
        <ScrollingRow
          photos={getPhotosForRow(1)}
          direction="right"
          speed={40}
          className="h-full"
        />
      </div>

      {/* Row 3 - Move Left */}
      <div className="flex-1">
        <ScrollingRow
          photos={getPhotosForRow(2)}
          direction="left"
          speed={40}
          className="h-full"
        />
      </div>

      {/* Row 4 - Move Right */}
      <div className="flex-1">
        <ScrollingRow
          photos={getPhotosForRow(3)}
          direction="right"
          speed={40}
          className="h-full"
        />
      </div>
    </div>
  );
}
