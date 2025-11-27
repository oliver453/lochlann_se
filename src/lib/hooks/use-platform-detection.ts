'use client';

import { useState, useEffect } from 'react';

export interface Platform {
  type: 'apple' | 'windows' | 'windows-arm';
  label: string;
  icon: 'apple' | 'windows';
}

const DEFAULT_PLATFORMS: Platform[] = [
  { type: 'apple', label: 'macOS', icon: 'apple' },
  { type: 'windows', label: 'Windows', icon: 'windows' },
  { type: 'windows-arm', label: 'Windows (arm64)', icon: 'windows' }
];

export default function usePlatformDetection() {
  const [platforms, setPlatforms] = useState<Platform[]>(DEFAULT_PLATFORMS);
  const [primaryPlatform, setPrimaryPlatform] = useState<Platform | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const detectPlatform = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      const platform = navigator.platform.toLowerCase();
      
      let detectedPlatform: Platform;
      
      // Detect macOS/iOS
      if (platform.includes('mac') || userAgent.includes('mac os')) {
        detectedPlatform = { type: 'apple', label: 'macOS', icon: 'apple' };
      }
      // Detect Windows ARM
      else if ((platform.includes('win') || userAgent.includes('windows')) && 
               (userAgent.includes('arm') || platform.includes('arm'))) {
        detectedPlatform = { type: 'windows-arm', label: 'Windows (arm64)', icon: 'windows' };
      }
      // Detect regular Windows
      else if (platform.includes('win') || userAgent.includes('windows')) {
        detectedPlatform = { type: 'windows', label: 'Windows', icon: 'windows' };
      }
      // Default to macOS if can't detect
      else {
        detectedPlatform = { type: 'apple', label: 'macOS', icon: 'apple' };
      }

      setPrimaryPlatform(detectedPlatform);

      // Reorder platforms with detected platform first
      const otherPlatforms = DEFAULT_PLATFORMS.filter(p => p.type !== detectedPlatform.type);
      setPlatforms([detectedPlatform, ...otherPlatforms]);
      setIsLoading(false);
    };

    detectPlatform();
  }, []);

  return {
    platforms,
    primaryPlatform,
    isLoading
  };
}