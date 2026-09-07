import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Email Service
 * Handles sending transactional emails via SMTP
 * Supports: notifications, alerts, recommendations, reports
 * 
 * Required environment variables:
 * - SMTP_HOST: SMTP server hostname (e.g., smtp.gmail.com)
 * - SMTP_PORT: SMTP port (e.g., 587 for TLS)
 * - SMTP_USER: SMTP username/email
 * - SMTP_PASS: SMTP password
 * - SMTP_FROM: From email address
 * - SMTP_FROM_NAME: From display name
 * - MAIL_SERVICE: Optional service name (e.g., 'gmail', 'sendgrid')
 */

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
  cc?: string[];
  bcc?: string[];
}

interface EmailTemplate {
  subject: string;
  html: string;
  text?: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private nodemailer: any;
  private transporter: any;
  private fromEmail: string;
  private fromName: string;

  constructor(private configService: ConfigService) {
    this.initializeNodemailer();
  }

  /**
   * Initialize Nodemailer with SMTP configuration
   * Lazy-loads nodemailer if available
   */
  private initializeNodemailer(): void {
    try {
      this.nodemailer = require('nodemailer');
      this.fromEmail = this.configService.get('SMTP_FROM') || 'noreply@headband.app';
      this.fromName = this.configService.get('SMTP_FROM_NAME') || 'Headband';

      const smtpHost = this.configService.get('SMTP_HOST');
      const smtpPort = this.configService.get('SMTP_PORT', 587);
      const smtpUser = this.configService.get('SMTP_USER');
      const smtpPass = this.configService.get('SMTP_PASS');

      if (!smtpHost || !smtpUser || !smtpPass) {
        this.logger.warn(
          'Email service not fully configured. Install nodemailer and set SMTP_HOST, SMTP_USER, SMTP_PASS environment variables.',
        );
        return;
      }

      this.transporter = this.nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });

      this.logger.log(`Email service initialized with ${smtpHost}:${smtpPort}`);
    } catch (error) {
      this.logger.error(
        'Nodemailer not installed. Install with: npm install nodemailer',
      );
      this.transporter = null;
    }
  }

  /**
   * Send a single email
   */
  async send(options: EmailOptions): Promise<boolean> {
    if (!this.transporter) {
      this.logger.warn(
        `Email service not configured. Would send to ${options.to}: ${options.subject}`,
      );
      return false;
    }

    try {
      const result = await this.transporter.sendMail({
        from: `${this.fromName} <${this.fromEmail}>`,
        ...options,
      });

      this.logger.log(`Email sent to ${options.to}: ${options.subject}`);
      return !!result.messageId;
    } catch (error) {
      this.logger.error(`Failed to send email to ${options.to}:`, error);
      return false;
    }
  }

  /**
   * Send intervention notification email
   */
  async sendInterventionNotification(
    userEmail: string,
    userName: string,
    intervention: {
      title: string;
      description: string;
      type: string;
      priority: string;
    },
  ): Promise<boolean> {
    const template = this.getInterventionTemplate(userName, intervention);

    return this.send({
      to: userEmail,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
  }

  /**
   * Send focus alert email to student
   */
  async sendFocusAlert(
    userEmail: string,
    userName: string,
    metrics: {
      focusIndex: number;
      stressIndex: number;
      focusCategory: string;
    },
  ): Promise<boolean> {
    const template = this.getFocusAlertTemplate(userName, metrics);

    return this.send({
      to: userEmail,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
  }

  /**
   * Send daily summary email
   */
  async sendDailySummary(
    userEmail: string,
    userName: string,
    summary: {
      sessionCount: number;
      totalDuration: number;
      avgFocus: number;
      avgStress: number;
      topMode: string;
      streak: number;
    },
  ): Promise<boolean> {
    const template = this.getDailySummaryTemplate(userName, summary);

    return this.send({
      to: userEmail,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
  }

  /**
   * Send teacher/counselor alert about student
   */
  async sendStudentAlertToTeacher(
    teacherEmail: string,
    teacherName: string,
    studentName: string,
    alert: {
      reason: string;
      metrics: Record<string, any>;
      recommendedAction: string;
    },
  ): Promise<boolean> {
    const template = this.getTeacherAlertTemplate(
      teacherName,
      studentName,
      alert,
    );

    return this.send({
      to: teacherEmail,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
  }

  /**
   * Send recommendation email
   */
  async sendRecommendation(
    userEmail: string,
    userName: string,
    recommendation: {
      title: string;
      content: string;
      reason: string;
      actionUrl?: string;
    },
  ): Promise<boolean> {
    const template = this.getRecommendationTemplate(
      userName,
      recommendation,
    );

    return this.send({
      to: userEmail,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
  }

  /**
   * Send test email
   */
  async sendTest(email: string): Promise<boolean> {
    return this.send({
      to: email,
      subject: 'Headband Email Test',
      html: '<p>This is a test email from Headband learning system.</p>',
    });
  }

  // ─── EMAIL TEMPLATES ─────────────────────────

  private getInterventionTemplate(
    userName: string,
    intervention: {
      title: string;
      description: string;
      type: string;
      priority: string;
    },
  ): EmailTemplate {
    const priorityColor = {
      HIGH: '#dc2626',
      MEDIUM: '#f59e0b',
      LOW: '#10b981',
    }[intervention.priority] || '#6b7280';

    return {
      subject: `${intervention.title} - Headband Learning`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1f2937; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
              .content { background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }
              .alert { border-left: 4px solid ${priorityColor}; padding: 15px; background: white; margin: 15px 0; border-radius: 4px; }
              .button { display: inline-block; padding: 10px 20px; background: #667eea; color: white; text-decoration: none; border-radius: 4px; margin-top: 15px; }
              .footer { font-size: 12px; color: #6b7280; margin-top: 20px; border-top: 1px solid #e5e7eb; padding-top: 15px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h2 style="margin: 0;">Headband Learning</h2>
                <p style="margin: 5px 0 0 0; opacity: 0.9;">Your AI-Powered Learning Companion</p>
              </div>
              <div class="content">
                <p>Halo ${userName},</p>
                <div class="alert">
                  <h3 style="margin-top: 0;">${intervention.title}</h3>
                  <p>${intervention.description}</p>
                  <p style="margin-bottom: 0; font-size: 12px; color: #6b7280;">
                    Priority: <strong style="color: ${priorityColor};">${intervention.priority}</strong>
                  </p>
                </div>
                <p>Silahkan login ke dashboard Anda untuk melihat detail lebih lanjut dan mengambil tindakan.</p>
                <a href="${this.configService.get('APP_URL') || 'https://app.headband.local'}/dashboard" class="button">Buka Dashboard</a>
                <div class="footer">
                  <p>Email ini dikirim karena ada aktivitas pada akun Headband Anda. Jika Anda tidak mengharapkan email ini, abaikan saja.</p>
                  <p>&copy; 2026 Headband Learning. Semua hak dilindungi.</p>
                </div>
              </div>
            </div>
          </body>
        </html>
      `,
      text: `${intervention.title}\n\n${intervention.description}\n\nPriority: ${intervention.priority}`,
    };
  }

  private getFocusAlertTemplate(
    userName: string,
    metrics: {
      focusIndex: number;
      stressIndex: number;
      focusCategory: string;
    },
  ): EmailTemplate {
    const advice = this.getFocusAdvice(metrics.focusCategory);

    return {
      subject: '⚠️ Focus Alert - Take a Break',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1f2937; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
              .content { background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }
              .metrics { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0; }
              .metric { background: white; padding: 15px; border-radius: 4px; }
              .metric-label { font-size: 12px; color: #6b7280; }
              .metric-value { font-size: 24px; font-weight: bold; margin-top: 5px; }
              .advice { background: #dbeafe; border-left: 4px solid #3b82f6; padding: 15px; border-radius: 4px; margin: 15px 0; }
              .button { display: inline-block; padding: 10px 20px; background: #667eea; color: white; text-decoration: none; border-radius: 4px; margin-top: 15px; }
              .footer { font-size: 12px; color: #6b7280; margin-top: 20px; border-top: 1px solid #e5e7eb; padding-top: 15px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h2 style="margin: 0;">⚠️ Focus Alert</h2>
              </div>
              <div class="content">
                <p>Halo ${userName},</p>
                <p>Kami mendeteksi bahwa fokus Anda menurun selama sesi belajar Anda. Berikut adalah metrik terkini:</p>
                
                <div class="metrics">
                  <div class="metric">
                    <div class="metric-label">Focus Index</div>
                    <div class="metric-value" style="color: ${metrics.focusIndex < 30 ? '#dc2626' : metrics.focusIndex < 60 ? '#f59e0b' : '#10b981'};">${metrics.focusIndex}%</div>
                  </div>
                  <div class="metric">
                    <div class="metric-label">Stress Level</div>
                    <div class="metric-value" style="color: ${metrics.stressIndex > 70 ? '#dc2626' : metrics.stressIndex > 40 ? '#f59e0b' : '#10b981'};">${metrics.stressIndex}%</div>
                  </div>
                </div>

                <div class="advice">
                  <strong>💡 Saran:</strong>
                  <p>${advice}</p>
                </div>

                <p>Ingatlah bahwa istirahat yang singkat dan teratur dapat meningkatkan produktivitas belajar Anda secara keseluruhan.</p>
                <a href="${this.configService.get('APP_URL') || 'https://app.headband.local'}/dashboard" class="button">Lihat Detail Lengkap</a>
                
                <div class="footer">
                  <p>&copy; 2026 Headband Learning. Semua hak dilindungi.</p>
                </div>
              </div>
            </div>
          </body>
        </html>
      `,
    };
  }

  private getDailySummaryTemplate(
    userName: string,
    summary: {
      sessionCount: number;
      totalDuration: number;
      avgFocus: number;
      avgStress: number;
      topMode: string;
      streak: number;
    },
  ): EmailTemplate {
    const durationHours = Math.floor(summary.totalDuration / 3600);
    const durationMins = Math.floor((summary.totalDuration % 3600) / 60);

    return {
      subject: `📊 Ringkasan Harian Belajar - ${new Date().toLocaleDateString('id-ID')}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1f2937; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
              .content { background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }
              .summary-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0; }
              .summary-card { background: white; padding: 15px; border-radius: 4px; border-left: 4px solid #667eea; }
              .summary-card.success { border-left-color: #10b981; }
              .summary-card.warning { border-left-color: #f59e0b; }
              .summary-label { font-size: 12px; color: #6b7280; text-transform: uppercase; }
              .summary-value { font-size: 20px; font-weight: bold; margin-top: 5px; }
              .achievement { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; border-radius: 4px; margin: 15px 0; }
              .button { display: inline-block; padding: 10px 20px; background: #667eea; color: white; text-decoration: none; border-radius: 4px; margin-top: 15px; }
              .footer { font-size: 12px; color: #6b7280; margin-top: 20px; border-top: 1px solid #e5e7eb; padding-top: 15px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h2 style="margin: 0;">📊 Ringkasan Harian Belajar</h2>
                <p style="margin: 5px 0 0 0; opacity: 0.9;">${new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>
              <div class="content">
                <p>Halo ${userName},</p>
                <p>Berikut adalah ringkasan aktivitas belajar Anda hari ini:</p>
                
                <div class="summary-grid">
                  <div class="summary-card">
                    <div class="summary-label">📚 Sesi Belajar</div>
                    <div class="summary-value">${summary.sessionCount}</div>
                  </div>
                  <div class="summary-card">
                    <div class="summary-label">⏱️ Total Waktu</div>
                    <div class="summary-value">${durationHours}h ${durationMins}m</div>
                  </div>
                  <div class="summary-card success">
                    <div class="summary-label">🎯 Fokus Rata-rata</div>
                    <div class="summary-value">${summary.avgFocus}%</div>
                  </div>
                  <div class="summary-card warning">
                    <div class="summary-label">😰 Stres Rata-rata</div>
                    <div class="summary-value">${summary.avgStress}%</div>
                  </div>
                </div>

                <div class="achievement">
                  🔥 <strong>Streak: ${summary.streak} hari!</strong>
                  <p style="margin-bottom: 0;">Pertahankan konsistensi Anda dan capai level berikutnya!</p>
                </div>

                <p>Mode belajar yang paling Anda gunakan hari ini adalah <strong>${summary.topMode}</strong>.</p>
                <a href="${this.configService.get('APP_URL') || 'https://app.headband.local'}/dashboard" class="button">Lihat Analitik Lengkap</a>
                
                <div class="footer">
                  <p>&copy; 2026 Headband Learning. Semua hak dilindungi.</p>
                </div>
              </div>
            </div>
          </body>
        </html>
      `,
    };
  }

  private getTeacherAlertTemplate(
    teacherName: string,
    studentName: string,
    alert: {
      reason: string;
      metrics: Record<string, any>;
      recommendedAction: string;
    },
  ): EmailTemplate {
    return {
      subject: `⚠️ Student Alert: ${studentName} - Headband`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1f2937; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
              .content { background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }
              .alert { border-left: 4px solid #dc2626; background: #fee2e2; padding: 15px; border-radius: 4px; margin: 15px 0; }
              .metrics { background: white; padding: 15px; border-radius: 4px; margin: 15px 0; }
              .metric-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
              .button { display: inline-block; padding: 10px 20px; background: #667eea; color: white; text-decoration: none; border-radius: 4px; margin-top: 15px; }
              .footer { font-size: 12px; color: #6b7280; margin-top: 20px; border-top: 1px solid #e5e7eb; padding-top: 15px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h2 style="margin: 0;">⚠️ Student Alert</h2>
              </div>
              <div class="content">
                <p>Halo ${teacherName},</p>
                <p>Sistem Headband mendeteksi potensi masalah dengan siswa <strong>${studentName}</strong>.</p>
                
                <div class="alert">
                  <strong>Alasan:</strong> ${alert.reason}
                </div>

                <div class="metrics">
                  <strong>Metrik Terkini:</strong>
                  ${Object.entries(alert.metrics)
                    .map(
                      ([key, value]) =>
                        `<div class="metric-row"><span>${key}:</span><strong>${value}</strong></div>`,
                    )
                    .join('')}
                </div>

                <p><strong>Tindakan yang Disarankan:</strong><br/>${alert.recommendedAction}</p>
                <a href="${this.configService.get('APP_URL') || 'https://app.headband.local'}/dashboard" class="button">Lihat Detail Siswa</a>
                
                <div class="footer">
                  <p>&copy; 2026 Headband Learning. Semua hak dilindungi.</p>
                </div>
              </div>
            </div>
          </body>
        </html>
      `,
    };
  }

  private getRecommendationTemplate(
    userName: string,
    recommendation: {
      title: string;
      content: string;
      reason: string;
      actionUrl?: string;
    },
  ): EmailTemplate {
    return {
      subject: `💡 ${recommendation.title} - Headband`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1f2937; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
              .content { background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }
              .recommendation { background: white; border-left: 4px solid #10b981; padding: 15px; border-radius: 4px; margin: 15px 0; }
              .reason { background: #dbeafe; border-left: 4px solid #3b82f6; padding: 15px; border-radius: 4px; margin: 15px 0; font-size: 14px; }
              .button { display: inline-block; padding: 10px 20px; background: #667eea; color: white; text-decoration: none; border-radius: 4px; margin-top: 15px; }
              .footer { font-size: 12px; color: #6b7280; margin-top: 20px; border-top: 1px solid #e5e7eb; padding-top: 15px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h2 style="margin: 0;">💡 ${recommendation.title}</h2>
              </div>
              <div class="content">
                <p>Halo ${userName},</p>
                
                <div class="recommendation">
                  <h3 style="margin-top: 0;">${recommendation.title}</h3>
                  <p>${recommendation.content}</p>
                </div>

                <div class="reason">
                  <strong>Mengapa?</strong> ${recommendation.reason}
                </div>

                ${recommendation.actionUrl ? `<a href="${recommendation.actionUrl}" class="button">Mulai Sekarang</a>` : ''}
                
                <div class="footer">
                  <p>&copy; 2026 Headband Learning. Semua hak dilindungi.</p>
                </div>
              </div>
            </div>
          </body>
        </html>
      `,
    };
  }

  private getFocusAdvice(focusCategory: string): string {
    const advice: Record<string, string> = {
      LOW: 'Cobalah beralih ke materi visual yang lebih menarik atau ambil istirahat singkat 5 menit. Coba teknik Pomodoro: 25 menit fokus, 5 menit istirahat.',
      MODERATE:
        'Fokus Anda stabil. Pertimbangkan untuk mencoba materi interaktif atau diskusi untuk meningkatkan engagement.',
      HIGH: 'Sempurna! Lanjutkan momentum Anda. Cobalah tantangan yang lebih sulit atau konten tingkat lanjut.',
    };

    return advice[focusCategory] || 'Tetaplah konsisten dengan rutinitas belajar Anda.';
  }
}
