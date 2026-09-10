/**
 * WebSocket hook for real-time EEG data streaming
 * Connects to backend WebSocket server for live brainwave data
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3001';

interface EEGData {
  raw: {
    alpha: number;
    beta: number;
    theta: number;
    gamma: number;
    attention: number;
    meditation: number;
    signalQuality: number;
    timestamp: string;
  };
  processed: {
    focusIndex: number;
    stressIndex: number;
    fRatio: number;
    focusCategory: string;
    attentionScore: number;
    qualityScore: number;
    recommendedMode: string;
    bandPowers: any;
    timestamp: string;
  };
}

interface UseEEGWebSocketOptions {
  autoConnect?: boolean;
  onData?: (data: EEGData) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Error) => void;
}

export function useEEGWebSocket(options: UseEEGWebSocketOptions = {}) {
  const {
    autoConnect = true,
    onData,
    onConnect,
    onDisconnect,
    onError,
  } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [latestData, setLatestData] = useState<EEGData | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const socketRef = useRef<Socket | null>(null);

  const connect = useCallback(() => {
    if (socketRef.current?.connected) {
      console.log('WebSocket already connected');
      return;
    }

    try {
      const socket = io(`${WS_URL}/eeg`, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      socket.on('connect', () => {
        console.log('WebSocket connected to /eeg namespace');
        setIsConnected(true);
        setError(null);
        onConnect?.();
      });

      socket.on('disconnect', () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
        onDisconnect?.();
      });

      socket.on('eegData', (data: EEGData) => {
        setLatestData(data);
        onData?.(data);
      });

      socket.on('connect_error', (err: Error) => {
        console.error('WebSocket connection error:', err);
        setError(err);
        setIsConnected(false);
        onError?.(err);
      });

      socket.on('error', (err: Error) => {
        console.error('WebSocket error:', err);
        setError(err);
        onError?.(err);
      });

      socketRef.current = socket;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('WebSocket connection failed');
      setError(error);
      onError?.(error);
    }
  }, [onConnect, onDisconnect, onData, onError]);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setIsConnected(false);
      setLatestData(null);
    }
  }, []);

  const startStreaming = useCallback((sessionId?: string, pattern?: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('startStream', { 
        sessionId, 
        pattern: pattern || 'MODERATE_FOCUS'
      });
    } else {
      console.warn('Cannot start streaming: WebSocket not connected');
    }
  }, []);

  const stopStreaming = useCallback(() => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('stopStream');
    }
  }, []);

  const changePattern = useCallback((pattern: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('changePattern', { pattern });
    }
  }, []);

  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [autoConnect, connect, disconnect]);

  return {
    isConnected,
    latestData,
    error,
    connect,
    disconnect,
    startStreaming,
    stopStreaming,
    changePattern,
  };
}

