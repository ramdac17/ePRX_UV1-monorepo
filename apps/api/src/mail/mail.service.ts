import { Injectable, Logger } from '@nestjs/common';
import { BrevoClient } from '@getbrevo/brevo';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly brevo: BrevoClient;

  constructor() {
    const apiKey = process.env.MAIL_PASS;

    if (!apiKey) {
      this.logger.error(
        'CRITICAL: MAIL_PASS is missing from environment variables!',
      );
    } else {
      this.logger.log(`Brevo initialized with key length: ${apiKey.length}`);
    }

    this.brevo = new BrevoClient({
      apiKey: apiKey || '',
    });
  }

  /**
   * CORE SENDER
   * Using Promise<any> to bypass TS2742 monorepo portability errors.
   */
  private async sendMail(
    to: string,
    subject: string,
    htmlContent: string,
  ): Promise<any> {
    try {
      const result = await this.brevo.transactionalEmails.sendTransacEmail({
        subject,
        htmlContent,
        sender: {
          name: 'ePRX UV1',
          email: process.env.MAIL_USER || '',
        },
        to: [{ email: to }],
      });

      this.logger.log(`Uplink Successful: Email sent to ${to}`);
      return result;
    } catch (error: any) {
      const errorMsg = error.message || 'Unknown Brevo Error';
      this.logger.error(`Uplink Failed via API: ${errorMsg}`);
      throw error;
    }
  }

  async sendVerificationEmail(to: string, token: string): Promise<any> {
    const url = `${process.env.FRONTEND_URL}/auth/verify-email?token=${token}`;
    const html = this.getHtmlWrapper(
      'Verify Your Email',
      'Join the ePRX UV1 mission.',
      url,
      'Verify Email',
      '#00fff2',
      '#000',
    );
    return this.sendMail(to, 'Verify your email | ePRX UV1', html);
  }

  async sendPasswordResetEmail(to: string, token: string): Promise<any> {
    const url = `${process.env.FRONTEND_URL}/auth/reset-password?token=${token}`;
    const html = this.getHtmlWrapper(
      'Password Reset',
      'Secure your access.',
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
  ): string {
    return `
      <div style="background:#000;color:#fff;padding:20px;border:1px solid ${color};font-family:sans-serif;max-width:500px;margin:auto;">
        <h2 style="color:${color};text-transform:uppercase;">${title}</h2>
        <p style="margin:20px 0;line-height:1.6;">${text}</p>
        <div style="text-align:center;margin:30px 0;">
          <a href="${url}" style="background:${color};color:${textColor};padding:12px 24px;text-decoration:none;display:inline-block;font-weight:bold;border-radius:4px;">${btnText}</a>
        </div>
      </div>`;
  }
}
