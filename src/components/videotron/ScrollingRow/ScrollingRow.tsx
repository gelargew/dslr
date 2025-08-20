import React, { useEffect, useRef } from 'react';
import { cn } from '@/utils/tailwind';

interface ScrollingRowProps {
  photos: string[];
  direction: 'left' | 'right';
  className?: string;
  speed?: number; // pixels per second
}

export default function ScrollingRow({
  photos,
  direction = 'left',
  className,
  speed = 50
}: ScrollingRowProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const content = contentRef.current;

    if (!container || !content || photos.length === 0) return;

    // Reset position
    content.style.transform = 'translateX(0px)';

    let animationId: number;
    let position = 0;

    // Calculate the width of one set of photos (including gaps)
    const photoWidth = 160 + 16; // 160px (w-40) + 16px margin-right
    const oneSetWidth = photos.length * photoWidth;

    const animate = () => {
      // Move position based on direction and speed
      const movement = speed / 60; // Convert to pixels per frame (assuming 60fps)
      position += direction === 'left' ? -movement : movement;

      // Reset position when we've scrolled one full set for seamless loop
      if (direction === 'left' && position <= -oneSetWidth) {
        position = 0;
      } else if (direction === 'right' && position >= oneSetWidth) {
        position = 0;
      }

      content.style.transform = `translateX(${position}px)`;
      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [photos, direction, speed]);

  if (photos.length === 0) {
    return null;
  }

  // Duplicate the photos array to create seamless looping
  const duplicatedPhotos = [...photos, ...photos];

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative overflow-hidden w-full h-40", // Fixed height for each row
        className
      )}
    >
      <div
        ref={contentRef}
        className="flex h-full whitespace-nowrap"
        style={{ width: 'fit-content' }}
      >
        {duplicatedPhotos.map((photo, index) => (
          <div
            key={`${photo}-${index}`}
            className="inline-block h-full w-40 flex-shrink-0 mr-4"
          >
            <img
              src={photo}
              alt={`Gallery photo ${index + 1}`}
              className="h-full w-full object-cover rounded-lg shadow-md"
              draggable={false}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
