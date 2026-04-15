import { Injectable, Logger } from '@nestjs/common';
import nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  private transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: Number(process.env.MAIL_PORT),

    secure: Number(process.env.MAIL_PORT) === 465, // true for 465, false for 587

    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });

  // ===============================
  // CORE SENDER
  // ===============================
  private async sendMail(to: string, subject: string, html: string) {
    try {
      const result = await this.transporter.sendMail({
        from: `"ePRX UV1" <${process.env.MAIL_USER}>`,
        to,
        subject,
        html,
      });

      this.logger.log(`Email sent: ${result.messageId}`);
      return result;
    } catch (error) {
      this.logger.error('Email sending failed', error);
      throw error;
    }
  }

  // ===============================
  // 1. VERIFICATION EMAIL
  // ===============================
  async sendVerificationEmail(to: string, token: string) {
    const url = `${process.env.FRONTEND_URL}/auth/verify-email?token=${token}`;

    const html = `
      <div style="font-family: Arial;">
        <h2>Verify Your Email</h2>
        <p>Welcome to ePRX UV1</p>
        <p>Click below to verify:</p>
        <a href="${url}" style="padding:10px 20px;background:#00fff2;color:#000;text-decoration:none;">
          Verify Email
        </a>
      </div>
    `;

    return this.sendMail(to, 'Verify your email', html);
  }

  // ===============================
  // 2. PASSWORD RESET EMAIL
  // ===============================
  async sendPasswordResetEmail(to: string, token: string) {
    const url = `${process.env.FRONTEND_URL}/auth/reset-password?token=${token}`;

    const html = `
      <div style="font-family: Arial;">
        <h2>Password Reset</h2>
        <p>You requested a password reset.</p>
        <a href="${url}" style="padding:10px 20px;background:#ff0055;color:#fff;text-decoration:none;">
          Reset Password
        </a>
      </div>
    `;

    return this.sendMail(to, 'Reset your password', html);
  }
}
