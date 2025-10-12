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

    // Generate center-out filling order for a 4x10 grid
  const generateCenterOutOrder = () => {
    // For 4x10 grid, center positions are around [1][4] and [1][5], [2][4] and [2][5]
    // Index 5 should be in the absolute center, so let's put it at position 15 (row 1, col 5)
    const centerOrder = [
      15, // row 1, col 5 - this will be index 5 (the 6th photo)
      14, // row 1, col 4
      25, // row 2, col 5
      24, // row 2, col 4
      16, // row 1, col 6
      13, // row 1, col 3
      26, // row 2, col 6
      23, // row 2, col 3
      5,  // row 0, col 5
      4,  // row 0, col 4
      35, // row 3, col 5
      34, // row 3, col 4
      6,  // row 0, col 6
      3,  // row 0, col 3
      36, // row 3, col 6
      33, // row 3, col 3
      17, // row 1, col 7
      12, // row 1, col 2
      27, // row 2, col 7
      22, // row 2, col 2
      7,  // row 0, col 7
      2,  // row 0, col 2
      37, // row 3, col 7
      32, // row 3, col 2
      18, // row 1, col 8
      11, // row 1, col 1
      28, // row 2, col 8
      21, // row 2, col 1
      8,  // row 0, col 8
      1,  // row 0, col 1
      38, // row 3, col 8
      31, // row 3, col 1
      19, // row 1, col 9
      10, // row 1, col 0
      29, // row 2, col 9
      20, // row 2, col 0
      9,  // row 0, col 9
      0,  // row 0, col 0
      39, // row 3, col 9
      30  // row 3, col 0
    ];

    return centerOrder;
  };

  useEffect(() => {
    // Create a grid of exactly 40 slots
    const grid: (string | null)[] = new Array(maxPhotos).fill(null);

    // Get center-out filling order
    const fillOrder = generateCenterOutOrder();

    // Fill with available photos using center-out order
    photos.slice(0, maxPhotos).forEach((photo, index) => {
      if (index < fillOrder.length) {
        grid[fillOrder[index]] = photo;
      }
    });

    setGridPhotos(grid);
  }, [photos, maxPhotos]);

  // Get photos for a specific row (10 photos per row)
  const getPhotosForRow = (rowIndex: number, photosPerRow: number = 10): (string | null)[] => {
    const startIndex = rowIndex * photosPerRow;
    return gridPhotos.slice(startIndex, startIndex + photosPerRow);
  };

  const PhotoSlot = ({ photo }: { photo: string | null; index: number }) => (
    <div className="w-full h-full relative">
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
        <div className="w-full h-full bg-gray-800 bg-opacity-20"></div>
      )}
    </div>
  );

  const PhotoRow = ({ photos, rowIndex }: { photos: (string | null)[]; rowIndex: number }) => {
    return (
      <div className="flex gap-2 justify-center" style={{ height: '22vh' }}>
        {photos.map((photo, index) => {
          const globalIndex = rowIndex * 10 + index;
          return (
            <div key={`row-${rowIndex}-slot-${index}`} className="flex-shrink-0" style={{ width: '22vh', height: '22vh' }}>
              <PhotoSlot photo={photo} index={globalIndex} />
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className={cn(
      "w-full h-full flex flex-col justify-center gap-2 p-2",
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
