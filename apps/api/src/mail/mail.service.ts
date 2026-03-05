import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import {
  SentMessageInfo,
  Options,
} from 'nodemailer/lib/smtp-transport/index.js';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter<SentMessageInfo, Options>;

  constructor() {
    console.log('MAIL_HOST:', process.env.MAIL_HOST);

    this.transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: Number(process.env.MAIL_PORT),
      secure: false,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
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
    } catch (error) {
      console.error('MAIL_ERROR:', error);
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
    } catch (error) {
      throw new Error('FAILED_TO_SEND_RECOVERY_EMAIL');
    }
  }
}
