/**
 * NERA Worker Main Application
 * Edge-Cloud Hybrid Architecture for EEG Processing
 * 
 * This worker runs locally on user's machine to process EEG data
 * in real-time while syncing results to the cloud
 */

import { EEGProcessor, EEGData, ProcessedResult } from './modules/eeg-processor';
import { CloudSync, SyncConfig } from './modules/cloud-sync';

interface WorkerConfig {
  userId: string;
  sessionId: string;
  apiUrl: string;
  wsUrl: string;
  apiKey?: string;
}

class NERAWorker {
  private eegProcessor: EEGProcessor;
  private cloudSync: CloudSync;
  private config: WorkerConfig;
  private isRunning: boolean = false;

  constructor(config: WorkerConfig) {
    this.config = config;
    this.eegProcessor = new EEGProcessor(config.sessionId);

    const syncConfig: SyncConfig = {
      apiUrl: config.apiUrl,
      wsUrl: config.wsUrl,
      apiKey: config.apiKey,
      userId: config.userId,
      sessionId: config.sessionId,
    };

    this.cloudSync = new CloudSync(syncConfig);
  }

  /**
   * Initialize the worker
   */
  async initialize(): Promise<void> {
    console.log('🚀 Initializing NERA Worker...');
    await this.cloudSync.initialize();
    this.isRunning = true;
    console.log('✓ NERA Worker initialized successfully');
  }

  /**
   * Process EEG data from headband
   * This is called in real-time as data arrives
   */
  async processEEGData(eegData: EEGData): Promise<void> {
    if (!this.isRunning) {
      console.warn('Worker is not running');
      return;
    }

    try {
      // Process locally
      const result = this.eegProcessor.processEEGData(eegData);

      // Send to cloud immediately
      await this.cloudSync.sendEEGResult(result);

      // Generate local recommendations
      const recommendations = this.eegProcessor.generateRecommendations(result);

      // Log results
      console.log('📊 EEG Analysis:', {
        focus: `${result.focusScore}%`,
        relaxation: `${result.relaxationScore}%`,
        stress: result.stressLevel,
        recommendations: recommendations.slice(0, 2),
      });

      return result;
    } catch (error) {
      console.error('Failed to process EEG data:', error);
      throw error;
    }
  }

  /**
   * Get cloud sync status
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      cloudSync: this.cloudSync.getStatus(),
    };
  }

  /**
   * Cleanup and shutdown
   */
  async shutdown(): Promise<void> {
    console.log('🛑 Shutting down NERA Worker...');
    this.isRunning = false;
    await this.cloudSync.cleanup();
    console.log('✓ NERA Worker shut down successfully');
  }
}

// Export for use in Tauri or standalone
export { NERAWorker, WorkerConfig };

// CLI usage example
if (import.meta.url === `file://${process.argv[1]}`) {
  const worker = new NERAWorker({
    userId: process.env.USER_ID || 'demo-user',
    sessionId: process.env.SESSION_ID || 'demo-session',
    apiUrl: process.env.API_URL || 'http://localhost:3001',
    wsUrl: process.env.WS_URL || 'ws://localhost:3001',
    apiKey: process.env.API_KEY,
  });

  worker.initialize().catch((err) => {
    console.error('Failed to initialize worker:', err);
    process.exit(1);
  });

  // Graceful shutdown
  process.on('SIGINT', async () => {
    await worker.shutdown();
    process.exit(0);
  });
}
