import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { SentMessageInfo } from 'nodemailer/lib/smtp-transport/index.js';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter<SentMessageInfo>;
  private readonly logger = new Logger('EPRX_MAIL_SERVICE');

  constructor() {
    this.logger.log(
      `Initializing Mail Uplink: ${process.env.MAIL_HOST}:${process.env.MAIL_PORT}`,
    );

    this.transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      // Change Port to 465 in your Railway Env Variables for this to work perfectly
      port: Number(process.env.MAIL_PORT) || 465,
      // secure: true is required for port 465
      secure: true,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
      tls: {
        // Forces IPv4 and prevents the ENETUNREACH error seen in Railway logs
        servername: 'smtp.gmail.com',
        rejectUnauthorized: false,
      },
      // Increase timeout to prevent the ETIMEDOUT error
      connectionTimeout: 10000, // 10 seconds
      greetingTimeout: 10000,
    });
  }

  async sendVerificationEmail(email: string, otp: string) {
    try {
      await this.transporter.sendMail({
        from: '"ePRX UV1 SECURITY" <noreply@eprx-v1.com>',
        to: email,
        subject: 'IDENTITY VERIFICATION CODE || ACTION REQUIRED',
        html: `
        <div style="background-color: #000; padding: 40px; font-family: sans-serif; text-align: center; color: #fff;">
          <h1 style="color: #d4ff00; letter-spacing: 4px;">ePRX UV1</h1>
          <p style="color: #666;">[ SECURITY_PROTOCOL: OTP_VERIFICATION ]</p>
          <div style="margin: 40px auto; width: 200px; padding: 20px; border: 2px solid #d4ff00; background: #111;">
            <span style="font-size: 32px; font-weight: bold; color: #fff; letter-spacing: 5px;">${otp}</span>
          </div>
          <p style="font-size: 12px; color: #888;">Enter this code in your mobile interface to activate your session.</p>
        </div>
      `,
      });
      this.logger.log(`Verification email dispatched to: ${email}`);
    } catch (error) {
      this.logger.error('MAIL_ERROR (Verification):', error);
      throw error;
    }
  }

  async sendPasswordResetEmail(email: string, otp: string) {
    try {
      await this.transporter.sendMail({
        from: '"ePRX SECURITY" <no-reply@eprx-v1.com>',
        to: email,
        subject: 'RECOVERY_PROTOCOL: PASSWORD_RESET_OTP',
        html: `
        <div style="background-color: #000; padding: 40px; font-family: monospace; text-align: center; color: #fff; border: 2px solid #FF0055;">
          <h1 style="color: #FF0055; letter-spacing: 2px;">IDENTITY RECOVERY</h1>
          <p style="color: #666;">[ SECURITY_TOKEN_ISSUED ]</p>
          <div style="margin: 30px auto; padding: 20px; border: 1px dashed #FF0055; display: inline-block;">
            <span style="font-size: 32px; font-weight: bold; color: #fff; letter-spacing: 10px;">${otp}</span>
          </div>
          <p style="font-size: 11px; color: #444;">THIS TOKEN EXPIRES IN 60 SECONDS. IF NOT REQUESTED, ALERT SECURITY.</p>
        </div>
      `,
      });
      this.logger.log(`Recovery email dispatched to: ${email}`);
    } catch (error) {
      this.logger.error('MAIL_ERROR (Recovery):', error);
      throw new Error('FAILED_TO_SEND_RECOVERY_EMAIL');
    }
  }
}
