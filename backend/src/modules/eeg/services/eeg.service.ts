import { Injectable, Inject, Logger } from '@nestjs/common';
import { IEEGProvider, EEG_PROVIDER, EEGDataPoint, StreamConfig } from '../interfaces/eeg-provider.interface';
import { EEGProcessingService, ProcessedEEG } from './eeg-processing.service';
import { InterventionsTriggerService } from '../../interventions/interventions-trigger.service';
import { RawQueryService } from '../../../database/raw-query.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class EEGService {
  private readonly logger = new Logger(EEGService.name);
  private activeSessions: Map<string, NodeJS.Timeout> = new Map();

  constructor(
    @Inject(EEG_PROVIDER) private readonly eegProvider: any,
    private readonly processingService: EEGProcessingService,
    private readonly db: RawQueryService,
    private readonly interventionsTrigger: InterventionsTriggerService,
  ) {}

  async connect() {
    await this.eegProvider.connect();
    return this.eegProvider.getStatus();
  }

  async disconnect() {
    await this.eegProvider.disconnect();
    return { message: 'Disconnected' };
  }

  getStatus() {
    return this.eegProvider.getStatus();
  }

  /**
   * Get a single processed data point (REST endpoint)
   */
  getDataPoint(pattern?: string): { raw: EEGDataPoint; processed: ProcessedEEG } {
    const raw = this.eegProvider.getDataPoint(pattern);
    const processed = this.processingService.processDataPoint(raw);
    return { raw, processed };
  }

  /**
   * Start a streaming session — data is saved to DB
   */
  async startSession(userId: string, pattern: string = 'MODERATE_FOCUS') {
    try {
      // Create session in DB using direct query
      const sessionId = uuidv4();
      await this.db.execute(
        `INSERT INTO sessions (id, "userId", status, "learningMode", "startTime", "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, NOW(), NOW(), NOW())`,
        [sessionId, userId, 'ACTIVE', 'VISUAL'],
      );

      const session = {
        id: sessionId,
        userId,
        status: 'ACTIVE',
        learningMode: 'VISUAL',
        startTime: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      console.log('✅ Session created:', session);

      const config: StreamConfig = {
        samplingRate: 256,
        pattern,
        noiseLevel: 0.1,
        sessionId: session.id,
      };

      // Start periodic data collection and storage (every 1 second for DB storage)
      const intervalId = setInterval(async () => {
        try {
          const raw = this.eegProvider.getDataPoint(pattern);
          raw.sessionId = session.id;
          const processed = this.processingService.processDataPoint(raw);

          // Save raw EEG log
          await this.db.execute(
            `INSERT INTO eeg_logs ("sessionId", alpha, beta, theta, gamma, attention, meditation, "signalQuality", timestamp)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())`,
            [
              session.id,
              raw.alpha,
              raw.beta,
              raw.theta,
              raw.gamma || 0,
              raw.attention,
              raw.meditation,
              raw.signalQuality,
            ],
          );

          // Save processed data
          await this.db.execute(
            `INSERT INTO eeg_processed ("sessionId", "focusIndex", "stressIndex", "fRatio", "focusCategory", "attentionScore", "qualityScore", "bandPowers", timestamp)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())`,
            [
              session.id,
              processed.focusIndex,
              processed.stressIndex,
              processed.fRatio,
              processed.focusCategory,
              processed.attentionScore,
              processed.qualityScore,
              JSON.stringify(processed.bandPowers),
            ],
          );

          // Trigger interventions based on EEG thresholds
          await this.interventionsTrigger.processEEGDataForInterventions(
            session.id,
            userId,
            processed,
          );

          // Update session learning mode based on recommendation
          await this.db.execute(
            `UPDATE sessions SET "learningMode" = $1, "focusCategory" = $2, "updatedAt" = NOW() WHERE id = $3`,
            [processed.recommendedMode, processed.focusCategory, session.id],
          );
        } catch (error) {
          this.logger.error(`Error processing EEG data: ${error.message}`);
        }
      }, 1000); // Store every second

      this.activeSessions.set(session.id, intervalId);

      return {
        session,
        config,
        message: 'EEG session started',
      };
    } catch (error) {
      this.logger.error(`Error starting session: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Stop a streaming session
   */
  async stopSession(sessionId: string) {
    const intervalId = this.activeSessions.get(sessionId);
    if (intervalId) {
      clearInterval(intervalId);
      this.activeSessions.delete(sessionId);
    }

    // Clean up intervention tracking
    this.interventionsTrigger.endSession(sessionId);

    // Get all processed data for summary
    const processedData = await this.db.query(
      `SELECT "focusIndex", "stressIndex", "fRatio", "focusCategory", "attentionScore", "qualityScore", "bandPowers", timestamp
       FROM eeg_processed WHERE "sessionId" = $1 ORDER BY timestamp ASC`,
      [sessionId],
    );

    const summary = this.processingService.getSessionSummary(
      processedData.map((d: any) => ({
        focusIndex: d.focusIndex,
        stressIndex: d.stressIndex,
        fRatio: d.fRatio,
        focusCategory: d.focusCategory as any,
        attentionScore: d.attentionScore,
        qualityScore: d.qualityScore,
        bandPowers: typeof d.bandPowers === 'string' ? JSON.parse(d.bandPowers) : d.bandPowers,
        recommendedMode: 'VISUAL' as any,
        timestamp: d.timestamp,
      })),
    );

    // Update session with summary
    await this.db.execute(
      `UPDATE sessions SET status = $1, "endTime" = NOW(), duration = $2, "avgFocus" = $3, "avgStress" = $4, "avgAttention" = $5, "updatedAt" = NOW()
       WHERE id = $6`,
      [
        'COMPLETED',
        processedData.length,
        summary.avgFocus,
        summary.avgStress,
        summary.avgAttention,
        sessionId,
      ],
    );

    const session = await this.db.queryOne(
      'SELECT * FROM sessions WHERE id = $1',
      [sessionId],
    );

    return { session, summary };
  }

  /**
   * Get session history with EEG data
   */
  async getSessionData(sessionId: string) {
    const session = await this.db.queryOne(
      'SELECT * FROM sessions WHERE id = $1',
      [sessionId],
    );

    const eegLogs = await this.db.query(
      'SELECT * FROM eeg_logs WHERE "sessionId" = $1 ORDER BY timestamp ASC',
      [sessionId],
    );

    const eegProcessed = await this.db.query(
      'SELECT * FROM eeg_processed WHERE "sessionId" = $1 ORDER BY timestamp ASC',
      [sessionId],
    );

    return {
      ...session,
      eegLogs,
      eegProcessed,
    };
  }

  /**
   * Get user's session history
   */
  async getUserSessions(userId: string, limit = 20) {
    return this.db.query(
      `SELECT s.*, COUNT(el.id) as eeg_logs_count FROM sessions s
       LEFT JOIN eeg_logs el ON s.id = el."sessionId"
       WHERE s."userId" = $1 AND s."deletedAt" IS NULL
       GROUP BY s.id
       ORDER BY s."startTime" DESC
       LIMIT $2`,
      [userId, limit],
    );
  }

  /**
   * Get available simulator patterns
   */
  getPatterns() {
    return [
      { id: 'HIGH_FOCUS', name: 'High Focus', description: 'Deep concentration state' },
      { id: 'MODERATE_FOCUS', name: 'Moderate Focus', description: 'Normal learning state' },
      { id: 'LOW_FOCUS', name: 'Low Focus', description: 'Distracted state' },
      { id: 'STRESS', name: 'Stress', description: 'Anxiety/pressure state' },
      { id: 'FATIGUE', name: 'Fatigue', description: 'Mental exhaustion' },
      { id: 'RELAX', name: 'Relax', description: 'Resting state' },
      { id: 'CUSTOM', name: 'Custom', description: 'Custom pattern' },
    ];
  }
}
