/**
 * Cloud Sync Module
 * Handles communication between local worker and cloud backend
 * Manages data synchronization and real-time updates
 */

import axios, { AxiosInstance } from 'axios';
import { io, Socket } from 'socket.io-client';
import { ProcessedResult } from './eeg-processor';

export interface SyncConfig {
  apiUrl: string;
  wsUrl: string;
  apiKey?: string;
  userId: string;
  sessionId: string;
}

export interface SyncStatus {
  isOnline: boolean;
  lastSync: number;
  pendingUpdates: number;
  syncErrors: string[];
}

export class CloudSync {
  private api: AxiosInstance;
  private socket: Socket | null = null;
  private config: SyncConfig;
  private status: SyncStatus = {
    isOnline: false,
    lastSync: 0,
    pendingUpdates: 0,
    syncErrors: [],
  };
  private pendingQueue: ProcessedResult[] = [];
  private syncInterval: NodeJS.Timeout | null = null;

  constructor(config: SyncConfig) {
    this.config = config;
    this.api = axios.create({
      baseURL: config.apiUrl,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        ...(config.apiKey && { Authorization: `Bearer ${config.apiKey}` }),
      },
    });

    this.setupInterceptors();
  }

  /**
   * Initialize connection to cloud backend
   */
  async initialize(): Promise<void> {
    try {
      // Test API connection
      await this.api.get('/health');
      this.status.isOnline = true;

      // Setup WebSocket for real-time updates
      this.setupWebSocket();

      // Start periodic sync
      this.startSync();

      console.log('✓ Cloud sync initialized successfully');
    } catch (error) {
      console.error('✗ Failed to initialize cloud sync:', error);
      this.status.isOnline = false;
    }
  }

  /**
   * Setup WebSocket connection for real-time communication
   */
  private setupWebSocket(): void {
    try {
      this.socket = io(this.config.wsUrl, {
        auth: {
          token: this.config.apiKey,
        },
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5,
      });

      this.socket.on('connect', () => {
        console.log('✓ WebSocket connected');
        this.status.isOnline = true;
        this.socket?.emit('join-session', {
          userId: this.config.userId,
          sessionId: this.config.sessionId,
        });
      });

      this.socket.on('disconnect', () => {
        console.log('✗ WebSocket disconnected');
        this.status.isOnline = false;
      });

      this.socket.on('recommendation', (data: any) => {
        console.log('📨 Received recommendation:', data);
        // Handle incoming recommendations from cloud
      });

      this.socket.on('error', (error: any) => {
        console.error('WebSocket error:', error);
        this.addSyncError(error.message);
      });
    } catch (error) {
      console.error('Failed to setup WebSocket:', error);
    }
  }

  /**
   * Send processed EEG result to cloud
   */
  async sendEEGResult(result: ProcessedResult): Promise<void> {
    try {
      if (!this.status.isOnline) {
        // Queue for later sync if offline
        this.pendingQueue.push(result);
        this.status.pendingUpdates = this.pendingQueue.length;
        return;
      }

      // Send via both REST and WebSocket for reliability
      await Promise.all([
        this.api.post('/api/v1/eeg/results', result),
        this.socket?.emit('eeg-result', result),
      ]);

      this.status.lastSync = Date.now();
    } catch (error) {
      console.error('Failed to send EEG result:', error);
      this.pendingQueue.push(result);
      this.status.pendingUpdates = this.pendingQueue.length;
      this.addSyncError(`Failed to send result: ${error}`);
    }
  }

  /**
   * Get AI recommendations from cloud
   */
  async getRecommendations(sessionId: string): Promise<string[]> {
    try {
      const response = await this.api.get(
        `/api/v1/ai/recommendations/session/${sessionId}`
      );
      return response.data.recommendations || [];
    } catch (error) {
      console.error('Failed to fetch recommendations:', error);
      this.addSyncError(`Failed to fetch recommendations: ${error}`);
      return [];
    }
  }

  /**
   * Start periodic sync of queued updates
   */
  private startSync(): void {
    this.syncInterval = setInterval(async () => {
      if (this.status.isOnline && this.pendingQueue.length > 0) {
        await this.flushQueue();
      }
    }, 5000); // Sync every 5 seconds
  }

  /**
   * Flush pending queue to cloud
   */
  private async flushQueue(): Promise<void> {
    if (this.pendingQueue.length === 0) return;

    try {
      const batch = this.pendingQueue.splice(0, 10); // Send 10 at a time
      await Promise.all(batch.map((result) => this.api.post('/api/v1/eeg/results', result)));

      this.status.lastSync = Date.now();
      this.status.pendingUpdates = this.pendingQueue.length;
      console.log(`✓ Synced ${batch.length} results`);
    } catch (error) {
      console.error('Failed to flush queue:', error);
      this.addSyncError(`Queue flush failed: ${error}`);
    }
  }

  /**
   * Setup API interceptors for error handling
   */
  private setupInterceptors(): void {
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          console.error('Authentication failed - token may be expired');
          this.addSyncError('Authentication failed');
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * Add sync error to tracking
   */
  private addSyncError(error: string): void {
    this.status.syncErrors.push(error);
    // Keep only last 10 errors
    if (this.status.syncErrors.length > 10) {
      this.status.syncErrors.shift();
    }
  }

  /**
   * Get current sync status
   */
  getStatus(): SyncStatus {
    return { ...this.status };
  }

  /**
   * Cleanup and disconnect
   */
  async cleanup(): Promise<void> {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }

    if (this.socket) {
      this.socket.disconnect();
    }

    // Try to flush any remaining queue
    if (this.pendingQueue.length > 0) {
      await this.flushQueue();
    }

    console.log('✓ Cloud sync cleaned up');
  }
}
