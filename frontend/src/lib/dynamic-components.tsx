/**
 * Dynamic Component Loader
 * Lazy load heavy components to reduce initial bundle size
 */

'use client';

import dynamic from 'next/dynamic';
import { ComponentType, ReactNode } from 'react';

// Loading fallback component
function LoadingFallback() {
  return (
    <div className="animate-pulse bg-neutral-200 rounded-lg h-64 w-full flex items-center justify-center">
      <p className="text-neutral-600">Loading chart...</p>
    </div>
  );
}

/**
 * Dynamically load EEGChart component
 * Recharts is large (~400KB) - only load when needed
 */
export const DynamicEEGChart = dynamic(
  () => import('@/components/EEGChart'),
  {
    loading: () => <LoadingFallback />,
    ssr: true,
  }
);

/**
 * Generic dynamic loader for heavy components
 * Use when components exceed 50KB
 */
export function createDynamicComponent<T extends Record<string, any>>(
  importFn: () => Promise<{ default: ComponentType<T> }>,
  options?: {
    showLoadingState?: boolean;
    timeout?: number;
  }
) {
  return dynamic(importFn, {
    loading: options?.showLoadingState !== false ? () => <LoadingFallback /> : undefined,
    ssr: true,
  });
}
