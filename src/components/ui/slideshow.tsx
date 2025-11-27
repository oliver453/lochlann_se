"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { cn } from "@/lib/utils";

interface SlideImage {
  src: string;
  alt: string;
}

interface SlideshowProps {
  images: SlideImage[];
  autoPlay?: boolean;
  autoPlayInterval?: number;
  className?: string;
}

export default function Slideshow({
  images,
  autoPlay = true,
  autoPlayInterval = 5000,
  className,
}: SlideshowProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  
  const timerRef = useRef<NodeJS.Timeout>();
  const startXRef = useRef(0);
  const currentXRef = useRef(0);
  const isDraggingRef = useRef(false);

  // Optimerad navigation med transition batching
  const navigateToIndex = useCallback((newIndex: number) => {
    if (newIndex !== currentIndex && newIndex >= 0 && newIndex < images.length) {
      setCurrentIndex(newIndex);
      setIsPaused(true);
      
      // Clear existing timer and set new one
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setIsPaused(false), 2000);
    }
  }, [currentIndex, images.length]);

  const goToNext = useCallback(() => {
    navigateToIndex(currentIndex === images.length - 1 ? 0 : currentIndex + 1);
  }, [currentIndex, images.length, navigateToIndex]);

  const goToPrevious = useCallback(() => {
    navigateToIndex(currentIndex === 0 ? images.length - 1 : currentIndex - 1);
  }, [currentIndex, images.length, navigateToIndex]);

  // Förenklad touch handling med refs för bättre prestanda
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    startXRef.current = e.touches[0].clientX;
    currentXRef.current = e.touches[0].clientX;
    isDraggingRef.current = true;
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (!isDraggingRef.current) return;
    
    const deltaX = currentXRef.current - startXRef.current;
    const threshold = 50;

    if (Math.abs(deltaX) > threshold) {
      if (deltaX > 0) {
        goToPrevious();
      } else {
        goToNext();
      }
    }

    isDraggingRef.current = false;
  }, [goToNext, goToPrevious]);

  // Autoplay med cleanup
  useEffect(() => {
    if (!autoPlay || images.length <= 1 || isPaused) return;

    timerRef.current = setTimeout(goToNext, autoPlayInterval);
    
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [autoPlay, autoPlayInterval, images.length, isPaused, goToNext]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowLeft":
          goToPrevious();
          break;
        case "ArrowRight":
          goToNext();
          break;
        default:
          return;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goToPrevious, goToNext]);

  // Preload adjacent images
  useEffect(() => {
    if (images.length <= 1) return;

    const preloadIndexes = [
      (currentIndex + 1) % images.length,
      currentIndex === 0 ? images.length - 1 : currentIndex - 1,
    ];

    preloadIndexes.forEach(index => {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = images[index].src;
      document.head.appendChild(link);
      
      // Cleanup after short delay
      setTimeout(() => document.head.removeChild(link), 1000);
    });
  }, [currentIndex, images]);

  if (images.length === 0) return null;

  return (
    <div className={cn("relative w-full overflow-hidden", className)}>
      <div 
        className="relative aspect-[4/5] w-full select-none"
        onTouchStart={handleTouchStart}
        onTouchMove={(e) => {
          if (isDraggingRef.current) {
            currentXRef.current = e.touches[0].clientX;
          }
        }}
        onTouchEnd={handleTouchEnd}
        style={{ touchAction: 'pan-y' }}
      >
        {images.map((image, index) => (
          <Image
            key={`${index}-${image.src}`}
            src={image.src}
            alt={image.alt}
            fill
            className={cn(
              "absolute inset-0 object-cover transition-opacity duration-500 ease-in-out",
              index === currentIndex ? "opacity-100" : "opacity-0",
            )}
            priority={index === currentIndex}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vv"
            unoptimized={false}
          />
        ))}
      </div>

      {/* Navigation - endast om fler än en bild */}
      {images.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2"
            aria-label="Föregående bild"
          >
            <FaChevronLeft className="h-6 w-6 text-white/80" />
          </button>

          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2"
            aria-label="Nästa bild"
          >
            <FaChevronRight className="h-6 w-6 text-white/80" />
          </button>

          <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 gap-2">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => navigateToIndex(index)}
                className={cn(
                  "h-2 w-2 rounded-full transition-all duration-200",
                  index === currentIndex
                    ? "scale-110 bg-white shadow-lg"
                    : "bg-white/40 hover:scale-105 hover:bg-white/70",
                )}
                aria-label={`Gå till slide ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}