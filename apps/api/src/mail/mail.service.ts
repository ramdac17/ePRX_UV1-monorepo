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

  async sendVerificationEmail(to: string, otp: string): Promise<any> {
    const html = `
    <div style="background:#000;color:#fff;padding:40px;border:1px solid #00fff2;font-family:sans-serif;max-width:500px;margin:auto;text-align:center;">
      <h2 style="color:#00fff2;text-transform:uppercase;letter-spacing:2px;">Verification Required</h2>
      <p style="margin:20px 0;color:#ccc;">Use the following code to activate your ePRX UV1 account. This code is valid for 10 minutes.</p>
      
      <div style="background:#111;border:1px dashed #00fff2;padding:20px;margin:30px 0;">
        <span style="font-size:32px;font-weight:bold;letter-spacing:10px;color:#00fff2;">${otp}</span>
      </div>
      
      <p style="font-size:12px;color:#555;">If you did not request this, please ignore this email.</p>
    </div>`;

    return this.sendMail(to, `${otp} is your ePRX verification code`, html);
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
