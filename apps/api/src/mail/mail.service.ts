import { Injectable, Logger } from '@nestjs/common';
import { Resend } from 'resend';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly resend = new Resend(process.env.RESEND_API_KEY);

  /**
   * CORE SENDER
   * Uses HTTPS instead of SMTP to avoid Railway port blocking
   */
  private async sendMail(to: string, subject: string, html: string) {
    try {
      const { data, error } = await this.resend.emails.send({
        from: 'ePRX UV1 <onboarding@resend.dev>', // Update to your domain later
        to: [to],
        subject,
        html,
      });

      if (error) throw error;

      this.logger.log(`Email sent via Resend: ${data?.id}`);
      return data;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Resend failed to send email: ${message}`);
      throw error;
    }
  }

  async sendVerificationEmail(to: string, token: string) {
    const url = `${process.env.FRONTEND_URL}/auth/verify-email?token=${token}`;
    const html = this.getHtmlWrapper(
      'Verify Your Email',
      'Welcome to ePRX UV1. Please secure your account by clicking below.',
      url,
      'Verify Email',
      '#00fff2',
      '#000',
    );
    return this.sendMail(to, 'Verify your email | ePRX UV1', html);
  }

  async sendPasswordResetEmail(to: string, token: string) {
    const url = `${process.env.FRONTEND_URL}/auth/reset-password?token=${token}`;
    const html = this.getHtmlWrapper(
      'Password Reset',
      "A password reset was requested. If this wasn't you, ignore this message.",
      url,
      'Reset Password',
      '#ff0055',
      '#fff',
    );
    return this.sendMail(to, 'Reset your password | ePRX UV1', html);
  }

  private getHtmlWrapper(
    title: string,
    text: string,
    url: string,
    btnText: string,
    color: string,
    textColor: string,
  ) {
    return `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; background-color: #000; color: #fff; border: 1px solid ${color};">
        <h2 style="color: ${color};">${title}</h2>
        <p>${text}</p>
        <div style="margin: 30px 0; text-align: center;">
          <a href="${url}" style="padding: 12px 25px; background: ${color}; color: ${textColor}; text-decoration: none; font-weight: bold; display: inline-block;">
            ${btnText}
          </a>
        </div>
      </div>
    `;
  }
}
