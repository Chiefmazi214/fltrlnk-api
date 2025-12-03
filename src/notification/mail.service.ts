import { Injectable, Logger } from '@nestjs/common';
import * as sgMail from '@sendgrid/mail';
import { sanitizeEmailForDevelopment } from 'src/common/utils/email';
import { ConfigService } from '@nestjs/config';
import { ISendMail } from './notification.types';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get('SENDGRID_API_KEY');
    if (apiKey) {
      sgMail.setApiKey(apiKey);
    } else {
      this.logger.warn('SENDGRID_API_KEY not configured');
    }
  }

  async sendMail(input: ISendMail): Promise<void> {
    try {
      const msg = {
        to: sanitizeEmailForDevelopment(input.email),
        from: {
          email: this.configService.get('EMAIL_FROM'),
          name: 'FLTR Team',
        },
        subject: input.subject,
        html: input.html,
      };

      await sgMail.send(msg);
      this.logger.log(`Email sent successfully to ${input.email}`);
    } catch (error) {
      this.logger.error('Error sending email', error);
    }
  }

  async sendVerificationCode(email: string, otp: string) {
    try {
      await sgMail.send({
        templateId: this.configService.get('SEND_GRID_VERIFICATION_CODE_TEMPLATE_ID'),
        from: {
          email: this.configService.get('EMAIL_FROM'),
          name: 'FLTR Team',
        },
        to: email,
        dynamicTemplateData: {
          otp,
        },
      });
    } catch (error) {
      this.logger.error('Error sending verification code', error);
    }
  }

  async sendNotification(emails: string[], title: string, message: string) {
    try {
      await sgMail.send({
        templateId: this.configService.get('SEND_GRID_NOTIFICATION_TEMPLATE_ID'),
        from: {
          email: this.configService.get('EMAIL_FROM'),
          name: 'FLTR Team',
        },
        to: emails,
        dynamicTemplateData: {
          title,
          message,
        },
      });
    } catch (error) {
      this.logger.error('Error sending notification', error);
    }}
}
