import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { sanitizeEmailForDevelopment } from 'src/common/utils/email';
import { ConfigService } from '@nestjs/config';
import { ISendMail } from './notification.types';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {}

  async sendMail(input: ISendMail): Promise<void> {
    try {
      await this.mailerService.sendMail({
        from: this.configService.get('EMAIL_DEFAULT_FROM'),
        to: sanitizeEmailForDevelopment(input.email),
        subject: input.subject,
        html: input.html,
      });
    } catch (error) {
      this.logger.log('Error sending subscription renewal email', error);
    }
  }
}
