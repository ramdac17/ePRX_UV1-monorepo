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
      secure: true, // Use SSL/TLS
      // 🛡️ THE FIX: Force IPv4 & Add Timeout
      // This prevents the "ENETUNREACH" error on IPv6-only cloud routes
      connectionTimeout: 10000, // 10 seconds
      greetingTimeout: 10000,
      socketTimeout: 10000,
      dnsV4Fallback: true, // Force fallback to IPv4 if IPv6 fails
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    } as any); // Type cast used to allow specific engine-level options if needed
  }

  // 1. Verification Method
  async sendVerificationEmail(email: string, otp: string) {
    return this.dispatchMail(email, 'IDENTITY_VERIFICATION', otp, '#d4ff00');
  }

  // 2. Password Reset Method
  async sendPasswordResetEmail(email: string, otp: string) {
    return this.dispatchMail(
      email,
      'PASSWORD_RECOVERY_PROTOCOL',
      otp,
      '#FF0055',
    );
  }

  // Private helper to keep code clean and maintain consistent branding
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
          <br />
          <p style="color: #888;">This code is valid for 10 minutes.</p>
          <p style="font-size: 10px; color: #444; margin-top: 20px;">
            DISPATCH_ID: ${Math.random().toString(36).substring(7).toUpperCase()} | PROTOCOL_V1
          </p>
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
      // Log specific error codes to help with further debugging if network stays blocked
      if (error.code === 'ENETUNREACH') {
        this.logger.error(
          '📡 CRITICAL: Network unreachable. IPv6/IPv4 Routing Issue.',
        );
      }
      throw error;
    }
  }
}
