/**
 * Alert Manager
 * Alerting rules, notifications, and escalation
 */

export type AlertSeverity = 'info' | 'warning' | 'critical';
export type AlertStatus = 'firing' | 'resolved' | 'acknowledged';

export interface Alert {
  id: string;
  name: string;
  severity: AlertSeverity;
  status: AlertStatus;
  message: string;
  description: string;
  firedAt: number;
  resolvedAt: number | null;
  acknowledgedAt: number | null;
  acknowledgedBy?: string;
  metadata: Record<string, any>;
  tags: string[];
}

export interface AlertRule {
  id: string;
  name: string;
  description: string;
  condition: (context: Record<string, any>) => boolean | Promise<boolean>;
  severity: AlertSeverity;
  threshold: number; // how many times condition must be true
  duration: number; // ms
  enabled: boolean;
  tags: string[];
  notificationChannels: string[];
}

export interface AlertNotification {
  alertId: string;
  alertName: string;
  severity: AlertSeverity;
  message: string;
  channel: string;
  sentAt: number;
  status: 'sent' | 'failed' | 'pending';
}

export interface NotificationChannel {
  id: string;
  type: 'email' | 'sms' | 'slack' | 'webhook';
  config: Record<string, any>;
  enabled: boolean;
}

/**
 * Alert Manager
 */
export class AlertManager {
  private rules: Map<string, AlertRule> = new Map();
  private alerts: Map<string, Alert> = new Map();
  private notifications: AlertNotification[] = [];
  private channels: Map<string, NotificationChannel> = new Map();
  private ruleHistory: Map<string, { count: number; timestamp: number }> = new Map();

  /**
   * Register alert rule
   */
  registerRule(rule: AlertRule): void {
    this.rules.set(rule.id, rule);
  }

  /**
   * Register notification channel
   */
  registerChannel(channel: NotificationChannel): void {
    this.channels.set(channel.id, channel);
  }

  /**
   * Check alert condition
   */
  async checkCondition(ruleId: string, context: Record<string, any>): Promise<boolean> {
    const rule = this.rules.get(ruleId);
    if (!rule || !rule.enabled) return false;

    const historyKey = `${ruleId}_count`;
    const history = this.ruleHistory.get(historyKey) || { count: 0, timestamp: Date.now() };

    try {
      const conditionMet = await rule.condition(context);

      if (conditionMet) {
        history.count++;
      } else {
        history.count = 0;
      }

      this.ruleHistory.set(historyKey, history);

      // Check if threshold is met
      if (history.count >= rule.threshold) {
        // Check if duration has passed
        if (Date.now() - history.timestamp >= rule.duration) {
          return true;
        }
      }

      return false;
    } catch (error) {
      console.error(`Error checking rule ${ruleId}:`, error);
      return false;
    }
  }

  /**
   * Fire alert
   */
  async fireAlert(
    ruleId: string,
    message: string,
    description: string = '',
    metadata: Record<string, any> = {}
  ): Promise<Alert> {
    const rule = this.rules.get(ruleId);
    if (!rule) throw new Error(`Rule not found: ${ruleId}`);

    const alert: Alert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: rule.name,
      severity: rule.severity,
      status: 'firing',
      message,
      description,
      firedAt: Date.now(),
      resolvedAt: null,
      acknowledgedAt: null,
      metadata,
      tags: rule.tags,
    };

    this.alerts.set(alert.id, alert);

    // Send notifications
    await this.sendNotifications(alert, rule);

    return alert;
  }

  /**
   * Resolve alert
   */
  resolveAlert(alertId: string): boolean {
    const alert = this.alerts.get(alertId);
    if (!alert) return false;

    alert.status = 'resolved';
    alert.resolvedAt = Date.now();

    return true;
  }

  /**
   * Acknowledge alert
   */
  acknowledgeAlert(alertId: string, acknowledgedBy: string): boolean {
    const alert = this.alerts.get(alertId);
    if (!alert) return false;

    alert.status = 'acknowledged';
    alert.acknowledgedAt = Date.now();
    alert.acknowledgedBy = acknowledgedBy;

    return true;
  }

  /**
   * Get active alerts
   */
  getActiveAlerts(): Alert[] {
    return Array.from(this.alerts.values()).filter(a => a.status === 'firing');
  }

  /**
   * Get alerts by severity
   */
  getAlertsBySeverity(severity: AlertSeverity): Alert[] {
    return Array.from(this.alerts.values()).filter(a => a.severity === severity);
  }

  /**
   * Get alerts by tag
   */
  getAlertsByTag(tag: string): Alert[] {
    return Array.from(this.alerts.values()).filter(a => a.tags.includes(tag));
  }

  /**
   * Get alert history
   */
  getAlertHistory(limit: number = 100): Alert[] {
    return Array.from(this.alerts.values())
      .sort((a, b) => b.firedAt - a.firedAt)
      .slice(0, limit);
  }

  /**
   * Send notifications
   */
  private async sendNotifications(alert: Alert, rule: AlertRule): Promise<void> {
    for (const channelId of rule.notificationChannels) {
      const channel = this.channels.get(channelId);
      if (!channel || !channel.enabled) continue;

      const notification: AlertNotification = {
        alertId: alert.id,
        alertName: alert.name,
        severity: alert.severity,
        message: alert.message,
        channel: channel.type,
        sentAt: Date.now(),
        status: 'pending',
      };

      try {
        // Send notification (would call actual service in production)
        notification.status = 'sent';
      } catch (error) {
        notification.status = 'failed';
      }

      this.notifications.push(notification);
    }
  }

  /**
   * Get notifications
   */
  getNotifications(limit: number = 100): AlertNotification[] {
    return this.notifications.slice(-limit);
  }

  /**
   * Get notification history for alert
   */
  getNotificationHistory(alertId: string, limit: number = 50): AlertNotification[] {
    return this.notifications
      .filter(n => n.alertId === alertId)
      .slice(-limit);
  }

  /**
   * Get alert stats
   */
  getAlertStats(): {
    totalAlerts: number;
    activeAlerts: number;
    criticalAlerts: number;
    warningAlerts: number;
    infoAlerts: number;
    acknowledgedAlerts: number;
  } {
    const allAlerts = Array.from(this.alerts.values());

    return {
      totalAlerts: allAlerts.length,
      activeAlerts: allAlerts.filter(a => a.status === 'firing').length,
      criticalAlerts: allAlerts.filter(a => a.severity === 'critical').length,
      warningAlerts: allAlerts.filter(a => a.severity === 'warning').length,
      infoAlerts: allAlerts.filter(a => a.severity === 'info').length,
      acknowledgedAlerts: allAlerts.filter(a => a.status === 'acknowledged').length,
    };
  }

  /**
   * Get rule status
   */
  getRuleStatus(ruleId: string): {
    rule: AlertRule | null;
    triggered: number;
    averageFrequency: number;
  } {
    const rule = this.rules.get(ruleId);
    const alerts = Array.from(this.alerts.values()).filter(a => a.name === rule?.name);

    const averageFrequency = alerts.length > 0
      ? (Date.now() - alerts[0].firedAt) / alerts.length
      : 0;

    return {
      rule: rule || null,
      triggered: alerts.length,
      averageFrequency,
    };
  }

  /**
   * Disable rule
   */
  disableRule(ruleId: string): boolean {
    const rule = this.rules.get(ruleId);
    if (!rule) return false;

    rule.enabled = false;
    return true;
  }

  /**
   * Enable rule
   */
  enableRule(ruleId: string): boolean {
    const rule = this.rules.get(ruleId);
    if (!rule) return false;

    rule.enabled = true;
    return true;
  }

  /**
   * Clear resolved alerts
   */
  clearResolvedAlerts(): number {
    let count = 0;

    for (const [id, alert] of this.alerts) {
      if (alert.status === 'resolved' && Date.now() - alert.resolvedAt! > 24 * 60 * 60 * 1000) {
        this.alerts.delete(id);
        count++;
      }
    }

    return count;
  }

  /**
   * Get alert dashboard data
   */
  getDashboard(): {
    stats: ReturnType<AlertManager['getAlertStats']>;
    activeAlerts: Alert[];
    recentAlerts: Alert[];
    ruleStatuses: Array<ReturnType<AlertManager['getRuleStatus']>>;
  } {
    const stats = this.getAlertStats();
    const activeAlerts = this.getActiveAlerts();
    const recentAlerts = this.getAlertHistory(10);
    const ruleStatuses = Array.from(this.rules.keys()).map(ruleId => this.getRuleStatus(ruleId));

    return {
      stats,
      activeAlerts,
      recentAlerts,
      ruleStatuses,
    };
  }
}

/**
 * Create alert manager
 */
export function createAlertManager(): AlertManager {
  return new AlertManager();
}
