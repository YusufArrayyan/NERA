/**
 * Performance Monitoring Utilities
 * Tracks and reports Core Web Vitals and custom metrics
 */

// Core Web Vitals types
export interface CoreWebVitals {
  CLS: number; // Cumulative Layout Shift
  FID: number; // First Input Delay
  FCP: number; // First Contentful Paint
  LCP: number; // Largest Contentful Paint
  TTFB: number; // Time to First Byte
}

export interface PerformanceMetrics {
  navigationTiming: {
    domContentLoaded: number;
    loadComplete: number;
    firstPaint: number;
  };
  resourceTiming: {
    scriptSize: number;
    cssSize: number;
    imageSize: number;
  };
  coreWebVitals: Partial<CoreWebVitals>;
}

/**
 * Collect performance metrics
 * Use in useEffect after component mounts
 */
export function collectPerformanceMetrics(): PerformanceMetrics {
  if (typeof window === 'undefined') {
    return {
      navigationTiming: { domContentLoaded: 0, loadComplete: 0, firstPaint: 0 },
      resourceTiming: { scriptSize: 0, cssSize: 0, imageSize: 0 },
      coreWebVitals: {},
    };
  }

  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
  const paints = performance.getEntriesByType('paint');
  const resources = performance.getEntriesByType('resource');

  const metrics: PerformanceMetrics = {
    navigationTiming: {
      domContentLoaded: navigation?.domContentLoadedEventEnd - navigation?.domContentLoadedEventStart || 0,
      loadComplete: navigation?.loadEventEnd - navigation?.loadEventStart || 0,
      firstPaint: paints.find((p) => p.name === 'first-paint')?.startTime || 0,
    },
    resourceTiming: {
      scriptSize: sumResourceSize(resources, 'script'),
      cssSize: sumResourceSize(resources, 'link', 'stylesheet'),
      imageSize: sumResourceSize(resources, 'image'),
    },
    coreWebVitals: {},
  };

  return metrics;
}

/**
 * Sum resource size by type
 */
function sumResourceSize(resources: PerformanceEntryList, ...types: string[]): number {
  return resources
    .filter((r): r is PerformanceResourceTiming => {
      return 'transferSize' in r && 'initiatorType' in r && types.includes((r as any).initiatorType);
    })
    .reduce((sum, r) => sum + (r.transferSize || 0), 0);
}

/**
 * Report metrics to analytics
 * Integrate with your analytics provider (GA, Posthog, etc)
 */
export function reportMetrics(metrics: PerformanceMetrics) {
  if (typeof window === 'undefined') return;

  const isProduction = process.env.NODE_ENV === 'production';

  if (isProduction) {
    // Send to your analytics service
    console.debug('[Analytics] Performance Metrics:', metrics);
  } else {
    console.log('[Dev] Performance Metrics:', metrics);
  }
}

/**
 * Hook to monitor component render performance
 * Helps identify slow components
 */
export function useRenderPerformance(componentName: string) {
  if (typeof window === 'undefined') return;

  const startTime = performance.now();

  return () => {
    const endTime = performance.now();
    const duration = endTime - startTime;

    if (duration > 16.67) {
      // Slower than 60fps (16.67ms per frame)
      console.warn(
        `[Performance] ${componentName} took ${duration.toFixed(2)}ms to render (>16.67ms threshold)`
      );
    }
  };
}

/**
 * Debounced metric reporting
 * Prevents excessive reporting during rapid updates
 */
let reportingScheduled = false;

export function scheduleMetricsReport() {
  if (reportingScheduled) return;

  reportingScheduled = true;
  requestIdleCallback(
    () => {
      const metrics = collectPerformanceMetrics();
      reportMetrics(metrics);
      reportingScheduled = false;
    },
    { timeout: 5000 }
  );
}

/**
 * Measure function execution time
 * Useful for profiling async operations
 */
export async function measureAsync<T>(
  name: string,
  fn: () => Promise<T>
): Promise<T> {
  const startTime = performance.now();
  try {
    return await fn();
  } finally {
    const endTime = performance.now();
    console.debug(`[Timing] ${name}: ${(endTime - startTime).toFixed(2)}ms`);
  }
}
