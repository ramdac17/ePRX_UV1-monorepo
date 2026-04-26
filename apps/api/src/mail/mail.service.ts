import { Injectable, Logger } from '@nestjs/common';
import nodemailer from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: Number(process.env.MAIL_PORT),
      secure: Number(process.env.MAIL_PORT) === 465,

      // Railway & IPv6 Connectivity Fixes
      family: 4,
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 15000,

      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
      // Debugging logs for non-production environments
      debug: process.env.NODE_ENV !== 'production',
      logger: process.env.NODE_ENV !== 'production',
    } as SMTPTransport.Options);
  }

  /**
   * CORE SENDER
   * Handles the actual delivery logic and logging
   */
  private async sendMail(to: string, subject: string, html: string) {
    try {
      const result = await this.transporter.sendMail({
        from: `"ePRX UV1" <${process.env.MAIL_USER}>`,
        to,
        subject,
        html,
      });

      this.logger.log(`Email sent successfully: ${result.messageId}`);
      return result;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to send email to ${to}: ${message}`);
      throw error;
    }
  }

  /**
   * 1. VERIFICATION EMAIL
   * Cyan (#00fff2) theme for registration
   */
  async sendVerificationEmail(to: string, token: string) {
    const url = `${process.env.FRONTEND_URL}/auth/verify-email?token=${token}`;
    const html = this.getHtmlWrapper(
      'Verify Your Email',
      'Welcome to ePRX UV1. Please click the button below to secure your account.',
      url,
      'Verify Email',
      '#00fff2',
      '#000',
    );

    return this.sendMail(to, 'Verify your email | ePRX UV1', html);
  }

  /**
   * 2. PASSWORD RESET EMAIL
   * Pink (#ff0055) theme for security alerts
   */
  async sendPasswordResetEmail(to: string, token: string) {
    const url = `${process.env.FRONTEND_URL}/auth/reset-password?token=${token}`;
    const html = this.getHtmlWrapper(
      'Password Reset',
      "A password reset was requested for your ePRX UV1 account. If this wasn't you, please ignore this email.",
      url,
      'Reset Password',
      '#ff0055',
      '#fff',
    );

    return this.sendMail(to, 'Reset your password | ePRX UV1', html);
  }

  /**
   * Private template wrapper to keep HTML consistent across methods
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
        <h2 style="color: ${color}; border-bottom: 1px solid ${color}; padding-bottom: 10px;">${title}</h2>
        <p style="font-size: 16px; line-height: 1.5;">${text}</p>
        <div style="margin: 30px 0; text-align: center;">
          <a href="${url}" style="padding: 12px 25px; background: ${color}; color: ${textColor}; text-decoration: none; font-weight: bold; border-radius: 4px; display: inline-block;">
            ${btnText}
          </a>
        </div>
        <p style="font-size: 12px; color: #666;">If the button doesn't work, copy and paste this link: <br/> ${url}</p>
      </div>
    `;
  }
}
