import { Injectable, Logger } from '@nestjs/common';
import nodemailer from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST || 'smtp-relay.brevo.com',
      port: Number(process.env.MAIL_PORT) || 587,
      secure: false, // Port 587 uses STARTTLS

      // 🛡️ RAILWAY ARMOR: Force IPv4 to bypass ENETUNREACH errors
      family: 4,
      connectionTimeout: 20000,
      greetingTimeout: 20000,
      socketTimeout: 20000,

      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    } as SMTPTransport.Options);
  }

  /**
   * CORE SENDER
   * Handles the actual delivery and logging for the ePRX UV1 mission
   */
  private async sendMail(to: string, subject: string, html: string) {
    try {
      const result = await this.transporter.sendMail({
        from: `"ePRX UV1" <${process.env.MAIL_USER}>`,
        to,
        subject,
        html,
      });

      this.logger.log(
        `Uplink Successful: Email sent to ${to} [${result.messageId}]`,
      );
      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Uplink Failed for ${to}: ${message}`);
      throw error;
    }
  }

  /**
   * 1. VERIFICATION EMAIL
   * Triggered on user registration
   */
  async sendVerificationEmail(to: string, token: string) {
    const url = `${process.env.FRONTEND_URL}/auth/verify-email?token=${token}`;
    const html = this.getHtmlWrapper(
      'Verify Your Email',
      'Welcome to the ePRX UV1 ecosystem. Please click below to verify your account and begin your first sequence.',
      url,
      'Verify Email',
      '#00fff2', // Cyan theme
      '#000',
    );
    return this.sendMail(to, 'Verify your email | ePRX UV1', html);
  }

  /**
   * 2. PASSWORD RESET EMAIL
   * RESTORED: Prevents TS2339 error in AuthService
   */
  async sendPasswordResetEmail(to: string, token: string) {
    const url = `${process.env.FRONTEND_URL}/auth/reset-password?token=${token}`;
    const html = this.getHtmlWrapper(
      'Password Reset',
      'A password reset was requested for your ePRX UV1 account. If you did not request this, please ignore this email.',
      url,
      'Reset Password',
      '#ff0055', // Pink theme
      '#fff',
    );
    return this.sendMail(to, 'Reset your password | ePRX UV1', html);
  }

  /**
   * Private template wrapper for consistent "Cyber" branding
   */
  private getHtmlWrapper(
    title: string,
    text: string,
    url: string,
    btnText: string,
    color: string,
    textColor: string,
  ) {
    return `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; padding: 20px; background-color: #000; color: #fff; border: 1px solid ${color};">
        <h2 style="color: ${color}; border-bottom: 1px solid ${color}; padding-bottom: 10px; margin-top: 0;">${title}</h2>
        <p style="font-size: 16px; line-height: 1.5; margin: 20px 0;">${text}</p>
        <div style="margin: 35px 0; text-align: center;">
          <a href="${url}" style="padding: 14px 30px; background: ${color}; color: ${textColor}; text-decoration: none; font-weight: bold; border-radius: 4px; display: inline-block; text-transform: uppercase; letter-spacing: 1px;">
            ${btnText}
          </a>
        </div>
        <p style="font-size: 12px; color: #555; margin-top: 30px;">
          If the button above does not work, copy and paste this link into your browser:<br/>
          <span style="color: ${color};">${url}</span>
        </p>
      </div>
    `;
  }
}
