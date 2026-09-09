/**
 * Modal Management Hook
 * Provides open/close state management for modals
 * Supports multiple modals with independent state
 */

import { useState, useCallback } from 'react';

export interface UseModalOptions {
  onOpen?: () => void;
  onClose?: () => void;
}

export function useModal(options: UseModalOptions = {}) {
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => {
    setIsOpen(true);
    options.onOpen?.();
  }, [options]);

  const close = useCallback(() => {
    setIsOpen(false);
    options.onClose?.();
  }, [options]);

  const toggle = useCallback(() => {
    if (isOpen) {
      close();
    } else {
      open();
    }
  }, [isOpen, open, close]);

  return {
    isOpen,
    open,
    close,
    toggle,
  };
}

/**
 * Multiple modals management
 * Useful for pages with multiple modal types
 */
export function useModals(
  initialModals: Record<string, boolean> = {}
) {
  const [modals, setModals] = useState(initialModals);

  const openModal = useCallback((key: string) => {
    setModals((prev) => ({ ...prev, [key]: true }));
  }, []);

  const closeModal = useCallback((key: string) => {
    setModals((prev) => ({ ...prev, [key]: false }));
  }, []);

  const toggleModal = useCallback((key: string) => {
    setModals((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const closeAll = useCallback(() => {
    setModals((prev) =>
      Object.keys(prev).reduce(
        (acc, key) => ({ ...acc, [key]: false }),
        {}
      )
    );
  }, []);

  return {
    modals,
    openModal,
    closeModal,
    toggleModal,
    closeAll,
    isOpen: (key: string) => modals[key] ?? false,
  };
}
