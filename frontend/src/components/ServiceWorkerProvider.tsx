'use client';

import React, { useEffect } from 'react';
import { useServiceWorker, useNetworkStatus } from '@/lib/use-service-worker';

/**
 * Service Worker Provider
 * Registers SW and monitors network status
 * Wrap your app with this to enable offline support
 */
export function ServiceWorkerProvider({ children }: { children: React.ReactNode }) {
  const swStatus = useServiceWorker();
  const isOnline = useNetworkStatus();

  useEffect(() => {
    if (!isOnline) {
      console.debug('[App] Offline mode activated');
    }
  }, [isOnline]);

  // Show offline indicator if needed
  if (typeof window !== 'undefined' && !isOnline) {
    return (
      <div className="relative">
        <div className="fixed top-0 left-0 right-0 z-[9999] bg-yellow-500 text-yellow-900 px-4 py-2 text-center text-sm font-semibold">
          Anda sedang offline. Beberapa fitur mungkin tidak tersedia.
        </div>
        <div className="pt-12">{children}</div>
      </div>
    );
  }

  return <>{children}</>;
}
