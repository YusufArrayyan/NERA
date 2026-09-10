'use client';

import React, { useEffect } from 'react';

/**
 * Service Worker Provider - DISABLED FOR DEVELOPMENT
 * Service worker disabled to prevent caching issues during development
 */
export function ServiceWorkerProvider({ children }: { children: React.ReactNode }) {
  // Service Worker disabled for development
  // Network status check disabled
  
  return <>{children}</>;
}
