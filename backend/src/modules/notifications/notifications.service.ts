// @ts-nocheck
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { EmailService } from './email.service';

interface CreateNotificationDto {
  type: string;
  title: string;
  message: string;
  channel?: 'IN_APP' | 'EMAIL' | 'BOTH';
  data?: Record<string, any>;
  sendEmail?: boolean;
  userEmail?: string;
  userName?: string;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
  ) {}

  async getUserNotifications(userId: string, unreadOnly = false) {
    return this.prisma.notification.findMany({
      where: { userId, ...(unreadOnly ? { isRead: false } : {}) },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async markAsRead(id: string) {
    return this.prisma.notification.update({
      where: { id },
      data: { isRead: true, readAt: new Date() },
    });
  }

  async markAllAsRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });
  }

  /**
   * Create notification with optional email sending
   */
  async create(userId: string, dto: CreateNotificationDto): Promise<any> {
    // Create in-app notification
    const notification = await this.prisma.notification.create({
      data: {
        userId,
        type: dto.type as any,
        title: dto.title,
        message: dto.message,
        channel: (dto.channel || 'IN_APP') as any,
        data: dto.data,
      },
    });

    // Send email if requested
    if (
      (dto.sendEmail || dto.channel === 'EMAIL' || dto.channel === 'BOTH') &&
      dto.userEmail &&
      dto.userName
    ) {
      this.sendNotificationEmail(dto);
    }

    return notification;
  }

  /**
   * Send notification email asynchronously
   */
  private async sendNotificationEmail(dto: CreateNotificationDto): Promise<void> {
    try {
      // Dispatch email sending (non-blocking)
      setImmediate(async () => {
        const sent = await this.emailService.send({
          to: dto.userEmail || '',
          subject: dto.title,
          html: this.generateNotificationHtml(dto),
          text: dto.message,
        });

        if (sent) {
          this.logger.log(
            `Notification email sent to ${dto.userEmail} (type: ${dto.type})`,
          );
        }
      });
    } catch (error) {
      this.logger.error('Error sending notification email:', error);
    }
  }

  private generateNotificationHtml(dto: CreateNotificationDto): string {
    const colorMap: Record<string, string> = {
      AUTO_SUPPORT: '#3b82f6',
      AUTO_BREAK: '#f59e0b',
      AUTO_ALERT: '#dc2626',
      INTERVENTION: '#667eea',
      ACHIEVEMENT: '#10b981',
    };

    const color = colorMap[dto.type] || '#6b7280';

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1f2937; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }
            .notification { border-left: 4px solid ${color}; background: white; padding: 15px; border-radius: 4px; }
            .button { display: inline-block; padding: 10px 20px; background: #667eea; color: white; text-decoration: none; border-radius: 4px; margin-top: 15px; }
            .footer { font-size: 12px; color: #6b7280; margin-top: 20px; border-top: 1px solid #e5e7eb; padding-top: 15px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2 style="margin: 0;">Headband Learning</h2>
            </div>
            <div class="content">
              <p>Halo ${dto.userName || 'User'},</p>
              <div class="notification">
                <h3 style="margin-top: 0; color: ${color};">${dto.title}</h3>
                <p>${dto.message}</p>
              </div>
              <a href="${process.env.APP_URL || 'https://app.headband.local'}/dashboard" class="button">Buka Dashboard</a>
              <div class="footer">
                <p>&copy; 2026 Headband Learning. Semua hak dilindungi.</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  async getUnreadCount(userId: string) {
    return this.prisma.notification.count({ where: { userId, isRead: false } });
  }

  async delete(id: string) {
    return this.prisma.notification.delete({ where: { id } });
  }
}
