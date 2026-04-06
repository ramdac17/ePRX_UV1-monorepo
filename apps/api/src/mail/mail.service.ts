import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class MailService {
  private readonly logger = new Logger('EPRX_MAIL_SERVICE');
  private readonly BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';

  // 1. Verification Method (Keeping OTP for registration)
  async sendVerificationEmail(email: string, otp: string) {
    return this.dispatchMail(
      email,
      'IDENTITY VERIFICATION',
      otp,
      '#d4ff00',
      false,
    );
  }

  // 2. Password Reset Method (Updated for Link flow) 🆕
  async sendPasswordResetEmail(email: string, token: string) {
    // Generate the full frontend URL with the token
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

    return this.dispatchMail(
      email,
      'PASSWORD RECOVERY REQUEST',
      resetLink,
      '#FF0055',
      true, // isLink flag
    );
  }

  private async dispatchMail(
    email: string,
    subject: string,
    content: string, // Can be OTP or URL
    color: string,
    isLink: boolean,
  ) {
    const payload = {
      sender: { name: 'ePRX UV1', email: process.env.GMAIL_USER },
      to: [{ email: email }],
      subject: `[ePRX_UV1] ${subject}`,
      htmlContent: `
        <div style="background: #000; color: #fff; padding: 40px; font-family: 'Courier New', Courier, monospace; border: 1px solid #222; max-width: 600px; margin: auto;">
          <h2 style="color: ${color}; letter-spacing: 2px; border-bottom: 1px solid ${color}; padding-bottom: 10px;">${subject}</h2>
          
          <p style="color: #888; font-size: 12px; margin-top: 20px;">TARGET_ACCOUNT: <span style="color: #fff;">${email}</span></p>
          
          <p style="font-size: 14px; line-height: 1.6; color: #ccc;">
            ${
              isLink
                ? 'A secure authentication bridge has been established. Click the button below to initialize credential override.'
                : 'Enter the following bypass code to verify your identity.'
            }
          </p>

          <div style="margin: 30px 0;">
            ${
              isLink
                ? `
              <a href="${content}" style="background: ${color}; color: #000; padding: 15px 25px; text-decoration: none; font-weight: bold; font-size: 14px; letter-spacing: 2px; display: inline-block;">
                INITIALIZE_RESET →
              </a>
            `
                : `
              <div style="font-size: 32px; font-weight: bold; color: ${color}; letter-spacing: 5px; padding: 15px; border: 1px dashed ${color}; display: inline-block;">
                ${content}
              </div>
            `
            }
          </div>

          ${isLink ? `<p style="font-size: 11px; color: #444;">If the button doesn't work, copy-paste this uplink: <br/> ${content}</p>` : ''}

          <p style="font-size: 10px; color: #444; margin-top: 40px; border-top: 1px solid #111; pt-10px;">
            DISPATCH_ID: ${Math.random().toString(36).substring(7).toUpperCase()} // SYSTEM_AUTO_GEN
          </p>
        </div>
      `,
    };

    try {
      const response = await fetch(this.BREVO_API_URL, {
        method: 'POST',
        headers: {
          accept: 'application/json',
          'content-type': 'application/json',
          'api-key': String(process.env.BREVO_API_KEY).trim(),
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'BREVO_API_ERROR');
      }

      this.logger.log(`[ePRX_UV1] MAIL_DISPATCHED: ${subject} -> ${email}`);
    } catch (error: any) {
      this.logger.error(`[ePRX_UV1] MAIL_DISPATCH_FAILURE: ${error.message}`);
      throw error;
    }
  }
}
