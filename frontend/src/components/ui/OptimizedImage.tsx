'use client';

import React, { useState } from 'react';
import Image, { ImageProps } from 'next/image';

export interface OptimizedImageProps extends Omit<ImageProps, 'placeholder'> {
  /**
   * Blur hash for placeholder
   * Generate at: https://blurha.sh/
   */
  blurHash?: string;
  /**
   * Show skeleton loader while image loads
   */
  showSkeleton?: boolean;
  /**
   * Container className for responsive sizing
   */
  containerClassName?: string;
}

/**
 * Optimized Image Component
 * - Lazy loading by default
 * - Responsive sizes
 * - Blur placeholder while loading
 * - Handles errors gracefully
 */
export function OptimizedImage({
  blurHash,
  showSkeleton = true,
  containerClassName = '',
  alt,
  onLoad,
  onError,
  ...props
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleLoad = (result: any) => {
    setIsLoading(false);
    onLoad?.(result);
  };

  const handleError = (error: any) => {
    setIsLoading(false);
    setHasError(true);
    onError?.(error);
  };

  if (hasError) {
    return (
      <div
        className={`
          ${containerClassName}
          bg-neutral-200 rounded-lg flex items-center justify-center
          text-neutral-600 text-sm font-medium
        `}
      >
        Gambar tidak dapat dimuat
      </div>
    );
  }

  return (
    <div className={containerClassName}>
      {showSkeleton && isLoading && (
        <div className="absolute inset-0 bg-gradient-to-r from-neutral-200 via-neutral-100 to-neutral-200 animate-pulse rounded-lg" />
      )}

      <Image
        alt={alt}
        onLoadingComplete={handleLoad}
        onError={handleError}
        {...props}
        priority={false}
        loading="lazy"
        placeholder={blurHash ? 'blur' : 'empty'}
      />
    </div>
  );
}

/**
 * Responsive image sizes for common breakpoints
 * Use with Image component
 */
export const responsiveImageSizes = {
  // Mobile-first
  full: '(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 1000px',
  hero: '(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 1920px',
  thumbnail: '(max-width: 640px) 80px, 120px',
  card: '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px',
  avatar: '(max-width: 640px) 40px, 64px',
};

/**
 * Generate srcSet for images
 * Creates multiple sizes for responsive loading
 */
export function generateSrcSet(basePath: string): string {
  const sizes = [320, 640, 960, 1280, 1920];
  return sizes.map((size) => `${basePath}?w=${size} ${size}w`).join(', ');
}
