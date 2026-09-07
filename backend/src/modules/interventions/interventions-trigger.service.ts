import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { ProcessedEEG } from '../eeg/services/eeg-processing.service';
import { NotificationsService } from '../notifications/notifications.service';

/**
 * Automatic Intervention Triggering Service
 * 
 * Monitors EEG data in real-time and triggers appropriate interventions
 * when students cross defined thresholds for focus, stress, or engagement.
 * 
 * Intervention Types:
 * - AUTO_SUPPORT: Automatic system-generated support recommendation
 * - AUTO_ALERT: Alert to counselor/teacher about concerning patterns
 * - AUTO_BREAK: Recommendation to take a break
 * - AUTO_INTERVENTION: Triggered by teacher based on thresholds
 */

export interface InterventionTriggerConfig {
  lowFocusThreshold: number;        // Focus index < 30: trigger support
  highStressThreshold: number;      // Stress index > 70: alert counselor
  prolongedLowFocusSeconds: number; // >300s at low focus: trigger break
  attendanceCheckInterval: number;  // Check every 60s
}

@Injectable()
export class InterventionsTriggerService {
  private readonly logger = new Logger(InterventionsTriggerService.name);
  
  private config: InterventionTriggerConfig = {
    lowFocusThreshold: 30,
    highStressThreshold: 70,
    prolongedLowFocusSeconds: 300,
    attendanceCheckInterval: 60,
  };

  // Track session states for prolonged monitoring
  private sessionStates = new Map<string, {
    lowFocusStartTime?: Date;
    highStressCount: number;
    lastAlertTime?: Date;
  }>();

  private readonly ALERT_COOLDOWN_MS = 300000; // 5 minutes between alerts for same user

  constructor(
    private prisma: PrismaService,
    private notificationsService?: NotificationsService,
  ) {}

  /**
   * Set custom thresholds for intervention triggering
   */
  setConfig(config: Partial<InterventionTriggerConfig>) {
    this.config = { ...this.config, ...config };
  }

  /**
   * Main entry point: Process EEG data and trigger interventions as needed
   * Called from EEG service when new data arrives
   */
  async processEEGDataForInterventions(
    sessionId: string,
    userId: string,
    eegData: ProcessedEEG,
  ): Promise<void> {
    try {
      // Get or create session state
      let state = this.sessionStates.get(sessionId);
      if (!state) {
        state = {
          highStressCount: 0,
          lastAlertTime: undefined,
          lowFocusStartTime: undefined,
        };
        this.sessionStates.set(sessionId, state);
      }

      // Check for low focus
      if (eegData.focusIndex < this.config.lowFocusThreshold) {
        await this.handleLowFocus(sessionId, userId, eegData, state);
      } else {
        // Reset low focus timer if focus recovers
        state.lowFocusStartTime = undefined;
      }

      // Check for high stress
      if (eegData.stressIndex > this.config.highStressThreshold) {
        await this.handleHighStress(sessionId, userId, eegData, state);
      }

      // Check for attention drop (sudden change)
      if (eegData.attentionScore < 20) {
        await this.handleCriticalAttention(sessionId, userId, eegData, state);
      }
    } catch (error) {
      this.logger.error(`Error processing interventions for session ${sessionId}:`, error);
    }
  }

  /**
   * Handle low focus state
   * Trigger AUTO_SUPPORT intervention after 30 seconds of low focus
   */
  private async handleLowFocus(
    sessionId: string,
    userId: string,
    eegData: ProcessedEEG,
    state: any,
  ): Promise<void> {
    if (!state.lowFocusStartTime) {
      state.lowFocusStartTime = new Date();
      this.logger.debug(`Low focus started for user ${userId}`);
      return;
    }

    const elapsedSeconds =
      (Date.now() - state.lowFocusStartTime.getTime()) / 1000;

    // Trigger AUTO_BREAK after prolonged low focus (5 minutes)
    if (elapsedSeconds >= this.config.prolongedLowFocusSeconds) {
      await this.createAutoIntervention(userId, {
        type: 'AUTO_BREAK',
        title: 'Take a Break',
        description: `Your focus level has been low for ${Math.round(elapsedSeconds / 60)} minutes. Taking a short break may help restore your concentration.`,
        eegMetrics: {
          focusIndex: eegData.focusIndex,
          sessionDuration: elapsedSeconds,
        },
        priority: 'MEDIUM',
      });

      // Reset timer
      state.lowFocusStartTime = new Date();
    } else if (elapsedSeconds >= 30) {
      // Trigger AUTO_SUPPORT after 30 seconds of low focus
      await this.createAutoIntervention(userId, {
        type: 'AUTO_SUPPORT',
        title: 'Try This to Improve Focus',
        description: this.getAdaptiveSupport(eegData),
        eegMetrics: {
          focusIndex: eegData.focusIndex,
          focusCategory: eegData.focusCategory,
          recommendedMode: eegData.recommendedMode,
        },
        priority: 'LOW',
      });
    }
  }

  /**
   * Handle high stress detection
   * Alert counselor/teacher after consistent high stress readings
   */
  private async handleHighStress(
    sessionId: string,
    userId: string,
    eegData: ProcessedEEG,
    state: any,
  ): Promise<void> {
    state.highStressCount++;

    // After 3 high stress readings (30 seconds), alert a counselor
    if (state.highStressCount >= 3) {
      // Check cooldown to avoid alert spam
      const now = new Date();
      if (
        !state.lastAlertTime ||
        now.getTime() - state.lastAlertTime.getTime() > this.ALERT_COOLDOWN_MS
      ) {
        await this.alertCounselor(userId, eegData, sessionId);
        state.lastAlertTime = now;
        state.highStressCount = 0; // Reset counter after alerting
      }
    }
  }

  /**
   * Handle critical attention drop
   * Immediate intervention for attention score < 20
   */
  private async handleCriticalAttention(
    sessionId: string,
    userId: string,
    eegData: ProcessedEEG,
    state: any,
  ): Promise<void> {
    // Check cooldown
    const now = new Date();
    if (
      !state.lastAlertTime ||
      now.getTime() - state.lastAlertTime.getTime() > this.ALERT_COOLDOWN_MS
    ) {
      await this.createAutoIntervention(userId, {
        type: 'AUTO_ALERT',
        title: 'Attention Alert',
        description:
          'Your attention level has dropped critically. Consider switching to a more engaging learning mode or taking a break.',
        eegMetrics: {
          attentionScore: eegData.attentionScore,
          focusIndex: eegData.focusIndex,
          stressIndex: eegData.stressIndex,
        },
        priority: 'HIGH',
      });

      state.lastAlertTime = now;
    }
  }

  /**
   * Create automatic intervention and notify the user
   */
  private async createAutoIntervention(
    userId: string,
    intervention: {
      type: string;
      title: string;
      description: string;
      eegMetrics: Record<string, any>;
      priority: string;
    },
  ): Promise<void> {
    try {
      // Get system user (if exists) or use user as both sender/receiver
      // In production, create a "System" user for auto-interventions
      const systemUserId = await this.getOrCreateSystemUser();

      // Create intervention record
      const created = await this.prisma.intervention.create({
        data: {
          fromUserId: systemUserId,
          toUserId: userId,
          type: intervention.type,
          title: intervention.title,
          notes: intervention.description,
          priority: intervention.priority as any,
          metadata: intervention.eegMetrics,
        },
      });

      this.logger.log(
        `Created ${intervention.type} intervention for user ${userId}`,
      );

      // Create notification if service available
      if (this.notificationsService) {
        await this.notificationsService.create(userId, {
          type: intervention.type,
          title: intervention.title,
          message: intervention.description,
          data: { interventionId: created.id },
        });
      }
    } catch (error) {
      this.logger.error('Error creating auto-intervention:', error);
    }
  }

  /**
   * Alert a counselor about concerning EEG patterns
   */
  private async alertCounselor(
    studentId: string,
    eegData: ProcessedEEG,
    sessionId: string,
  ): Promise<void> {
    try {
      // Find assigned counselor for this student
      const student = await this.prisma.user.findUnique({
        where: { id: studentId },
        select: { id: true, name: true },
      });

      if (!student) return;

      // Get system user for alert origin
      const systemUserId = await this.getOrCreateSystemUser();

      const alertMessage = `High stress detected for ${student.name} during session. Stress index: ${eegData.stressIndex}. Consider reaching out.`;

      // Create alert as intervention
      await this.prisma.intervention.create({
        data: {
          fromUserId: systemUserId,
          toUserId: studentId,
          type: 'AUTO_ALERT',
          title: 'Student Stress Alert',
          notes: alertMessage,
          priority: 'HIGH',
          metadata: {
            sessionId,
            stressIndex: eegData.stressIndex,
            fRatio: eegData.fRatio,
            focusIndex: eegData.focusIndex,
            timestamp: new Date().toISOString(),
          },
        },
      });

      this.logger.warn(`Counselor alert created for student ${studentId}`);
    } catch (error) {
      this.logger.error('Error alerting counselor:', error);
    }
  }

  /**
   * Generate adaptive support message based on EEG state
   */
  private getAdaptiveSupport(eegData: ProcessedEEG): string {
    const { focusCategory, stressIndex, recommendedMode } = eegData;

    let support = '';

    // Base message
    if (focusCategory === 'LOW') {
      support += 'Your focus is lower than usual. ';
    }

    if (stressIndex > 60) {
      support += 'You seem stressed. Try deep breathing: 4-count inhale, 6-count exhale. ';
    }

    // Mode-specific advice
    switch (recommendedMode) {
      case 'VISUAL':
        support += 'Try switching to visual learning materials like diagrams or videos to boost engagement.';
        break;
      case 'AUDITORY':
        support += 'Consider listening to an educational podcast or narrated content.';
        break;
      case 'INTERACTIVE':
        support +=
          'Try interactive problem-solving or group discussion to increase engagement.';
        break;
    }

    return support || 'Take a moment to refocus and continue learning.';
  }

  /**
   * Get or create a system user for automated interventions
   */
  private async getOrCreateSystemUser(): Promise<string> {
    // Look for existing system user
    let systemUser = await this.prisma.user.findFirst({
      where: { email: 'system@headband.app' },
      select: { id: true },
    });

    if (systemUser) {
      return systemUser.id;
    }

    // Create system user
    systemUser = await this.prisma.user.create({
      data: {
        email: 'system@headband.app',
        name: 'Headband System',
        passwordHash: '', // System user has no password
        role: 'ADMIN',
        locale: 'id',
      },
      select: { id: true },
    });

    return systemUser.id;
  }

  /**
   * Clean up session state (call when session ends)
   */
  endSession(sessionId: string): void {
    this.sessionStates.delete(sessionId);
  }

  /**
   * Get intervention statistics for a user
   */
  async getUserInterventionStats(userId: string): Promise<{
    totalInterventions: number;
    autoInterventions: number;
    resolvedCount: number;
    pendingCount: number;
    byType: Record<string, number>;
  }> {
    const interventions = await this.prisma.intervention.findMany({
      where: { toUserId: userId },
    });

    const stats = {
      totalInterventions: interventions.length,
      autoInterventions: interventions.filter(
        (i) => i.type.startsWith('AUTO_'),
      ).length,
      resolvedCount: interventions.filter((i) => i.status === 'RESOLVED')
        .length,
      pendingCount: interventions.filter((i) => i.status === 'PENDING').length,
      byType: {} as Record<string, number>,
    };

    // Count by type
    interventions.forEach((i) => {
      stats.byType[i.type] = (stats.byType[i.type] || 0) + 1;
    });

    return stats;
  }
}
