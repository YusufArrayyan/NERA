import { Injectable, Inject, Logger } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { IEEGProvider, EEG_PROVIDER, EEGDataPoint, StreamConfig } from '../interfaces/eeg-provider.interface';
import { EEGProcessingService, ProcessedEEG } from './eeg-processing.service';

@Injectable()
export class EEGService {
  private readonly logger = new Logger(EEGService.name);
  private activeSessions: Map<string, NodeJS.Timeout> = new Map();

  constructor(
    @Inject(EEG_PROVIDER) private readonly eegProvider: any,
    private readonly processingService: EEGProcessingService,
    private readonly prisma: PrismaService,
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
    // Create session in DB
    const session = await this.prisma.session.create({
      data: {
        userId,
        status: 'ACTIVE',
        learningMode: 'VISUAL',
      },
    });

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
        await this.prisma.eegLog.create({
          data: {
            sessionId: session.id,
            alpha: raw.alpha,
            beta: raw.beta,
            theta: raw.theta,
            gamma: raw.gamma || 0,
            attention: raw.attention,
            meditation: raw.meditation,
            signalQuality: raw.signalQuality,
          },
        });

        // Save processed data
        await this.prisma.eegProcessed.create({
          data: {
            sessionId: session.id,
            focusIndex: processed.focusIndex,
            stressIndex: processed.stressIndex,
            fRatio: processed.fRatio,
            focusCategory: processed.focusCategory,
            attentionScore: processed.attentionScore,
            qualityScore: processed.qualityScore,
            bandPowers: processed.bandPowers,
          },
        });

        // Update session learning mode based on recommendation
        await this.prisma.session.update({
          where: { id: session.id },
          data: {
            learningMode: processed.recommendedMode,
            focusCategory: processed.focusCategory,
          },
        });
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

    // Get all processed data for summary
    const processedData = await this.prisma.eegProcessed.findMany({
      where: { sessionId },
      orderBy: { timestamp: 'asc' },
    });

    const summary = this.processingService.getSessionSummary(
      processedData.map((d) => ({
        focusIndex: d.focusIndex,
        stressIndex: d.stressIndex,
        fRatio: d.fRatio,
        focusCategory: d.focusCategory as any,
        attentionScore: d.attentionScore,
        qualityScore: d.qualityScore,
        bandPowers: d.bandPowers as any,
        recommendedMode: 'VISUAL' as any,
        timestamp: d.timestamp,
      })),
    );

    // Update session with summary
    const session = await this.prisma.session.update({
      where: { id: sessionId },
      data: {
        status: 'COMPLETED',
        endTime: new Date(),
        duration: processedData.length, // each record = 1 second
        avgFocus: summary.avgFocus,
        avgStress: summary.avgStress,
        avgAttention: summary.avgAttention,
      },
    });

    return { session, summary };
  }

  /**
   * Get session history with EEG data
   */
  async getSessionData(sessionId: string) {
    const session = await this.prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        eegLogs: { orderBy: { timestamp: 'asc' } },
        eegProcessed: { orderBy: { timestamp: 'asc' } },
      },
    });

    return session;
  }

  /**
   * Get user's session history
   */
  async getUserSessions(userId: string, limit = 20) {
    return this.prisma.session.findMany({
      where: { userId, deletedAt: null },
      orderBy: { startTime: 'desc' },
      take: limit,
      include: {
        _count: { select: { eegLogs: true } },
      },
    });
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
