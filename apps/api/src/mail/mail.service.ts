import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class MailService {
  private readonly logger = new Logger('EPRX_MAIL_SERVICE');
  private readonly BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';

  // 1. Verification Method // 🆕 Added for registration flow
  async sendVerificationEmail(email: string, otp: string) {
    return this.dispatchMail(email, 'IDENTITY_VERIFICATION', otp, '#d4ff00');
  }

  // 2. Password Reset Method // 🆕 Added for password recovery flow
  async sendPasswordResetEmail(email: string, otp: string) {
    return this.dispatchMail(
      email,
      'PASSWORD_RECOVERY_PROTOCOL',
      otp,
      '#FF0055',
    );
  }

  private async dispatchMail(
    email: string,
    subject: string,
    otp: string,
    color: string,
  ) {
    const payload = {
      // 🛡️ Use your Gmail here. Brevo allows this for testing.
      sender: { name: 'ePRX UV1', email: process.env.GMAIL_USER },
      to: [{ email: email }],
      subject: `[ePRX_UV1] ${subject}`,
      htmlContent: `
        <div style="background: #000; color: #fff; padding: 20px; font-family: monospace; border: 2px solid ${color};">
          <h2 style="color: ${color};">${subject}</h2>
          <p>Target Account: <strong>${email}</strong></p>
          <div style="font-size: 28px; padding: 15px; border: 1px dashed ${color}; display: inline-block; margin: 10px 0;">
            ${otp}
          </div>
          <p style="font-size: 10px; color: #444; margin-top: 20px;">
            DISPATCH_ID: ${Math.random().toString(36).substring(7).toUpperCase()}
          </p>
        </div>
      `,
    };

    try {
      const response = await fetch(this.BREVO_API_URL, {
        method: 'POST',
        headers: {
          accept: 'application/json',
          'api-key': process.env.BREVO_API_KEY!,
          'content-type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'BREVO_API_ERROR');
      }

      this.logger.log(
        `--- [ePRX_UV1] MAIL_DISPATCH_SUCCESS: ${subject} -> ${email} ---`,
      );
    } catch (error: any) {
      this.logger.error(
        `--- [ePRX_UV1] MAIL_DISPATCH_FAILURE: ${error.message} ---`,
      );
      throw error;
    }
  }
}
