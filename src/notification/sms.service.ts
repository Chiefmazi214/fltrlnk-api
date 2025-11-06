import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ISendSms } from './notification.types';
import { TwilioService } from 'nestjs-twilio';

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly twilioService: TwilioService,
  ) {}

  async sendSms(input: ISendSms): Promise<void> {
    try {
       await this.twilioService.client.messages.create({
      body: input.content,
      from: this.configService.get('TWILIO_PHONE_NUMBER'),
      to: input.to,
    });
    } catch (error) {
      this.logger.log('Error sending SMS', error);
    }
  }
}
