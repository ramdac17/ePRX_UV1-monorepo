import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger('EPRX_MAIL_SERVICE');
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });
  }

  // 1. Verification Method
  async sendVerificationEmail(email: string, otp: string) {
    return this.dispatchMail(email, 'IDENTITY_VERIFICATION', otp, '#d4ff00');
  }

  // 2. 🆕 Missing Method: Password Reset
  async sendPasswordResetEmail(email: string, otp: string) {
    return this.dispatchMail(
      email,
      'PASSWORD_RECOVERY_PROTOCOL',
      otp,
      '#FF0055',
    );
  }

  // Private helper to keep code clean
  private async dispatchMail(
    email: string,
    subject: string,
    otp: string,
    color: string,
  ) {
    const mailOptions = {
      from: `"ePRX UV1" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: `[ePRX_UV1] ${subject}`,
      html: `
        <div style="background: #000; color: #fff; padding: 20px; font-family: monospace; border: 2px solid ${color};">
          <h2 style="color: ${color};">${subject}</h2>
          <p>Target Account: <strong>${email}</strong></p>
          <div style="font-size: 28px; padding: 15px; border: 1px dashed ${color}; display: inline-block; margin: 10px 0;">
            ${otp}
          </div>
          <p style="font-size: 10px; color: #444;">DISPATCH_ID: ${Math.random().toString(36).substring(7).toUpperCase()}</p>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
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
