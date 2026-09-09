/**
 * Service Worker Registration Hook
 * Registers SW for offline support and caching
 */

import { useEffect, useState } from 'react';

export interface ServiceWorkerStatus {
  isSupported: boolean;
  isRegistered: boolean;
  isUpdating: boolean;
  error?: Error;
}

/**
 * Hook to register and manage service worker
 */
export function useServiceWorker(): ServiceWorkerStatus {
  const [status, setStatus] = useState<ServiceWorkerStatus>({
    isSupported: typeof navigator !== 'undefined' && 'serviceWorker' in navigator,
    isRegistered: false,
    isUpdating: false,
  });

  useEffect(() => {
    if (!status.isSupported || status.isRegistered) return;

    const registerServiceWorker = async () => {
      try {
        setStatus((prev) => ({ ...prev, isUpdating: true }));

        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
          // Update check interval
          updateViaCache: 'none',
        });

        setStatus((prev) => ({
          ...prev,
          isRegistered: true,
          isUpdating: false,
        }));

        // Check for updates periodically
        const checkForUpdates = setInterval(() => {
          registration.update().catch(() => {
            // Ignore errors
          });
        }, 60000); // Check every minute

        // Listen for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (!newWorker) return;

          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'activated') {
              // New service worker activated
              console.log('[SW] Updated');
              // Optionally: Show "update available" notification
            }
          });
        });

        // Cleanup
        return () => clearInterval(checkForUpdates);
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        console.warn('[SW] Registration failed:', err.message);
        setStatus((prev) => ({
          ...prev,
          error: err,
          isUpdating: false,
        }));
      }
    };

    registerServiceWorker();
  }, [status.isSupported, status.isRegistered]);

  return status;
}

/**
 * Hook to request background sync
 * Queues data to sync when connection is restored
 */
export function useBackgroundSync() {
  const isSupported =
    typeof navigator !== 'undefined' &&
    'serviceWorker' in navigator &&
    'SyncManager' in window;

  const requestSync = async (tag: string) => {
    if (!isSupported) {
      console.warn('[Sync] Background Sync API not supported');
      return false;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      const syncManager = (registration as any).sync;
      
      if (!syncManager) {
        console.warn('[Sync] SyncManager not available');
        return false;
      }

      await syncManager.register(tag);
      console.debug('[Sync] Registered:', tag);
      return true;
    } catch (error) {
      console.warn('[Sync] Registration failed:', error);
      return false;
    }
  };

  return { isSupported, requestSync };
}

/**
 * Hook to detect network status
 */
export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}
