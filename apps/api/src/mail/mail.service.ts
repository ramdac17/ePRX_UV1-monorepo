import { Injectable, Logger } from '@nestjs/common';
// import * as nodemailer from 'nodemailer';
// import { SentMessageInfo } from 'nodemailer/lib/smtp-transport/index.js';

@Injectable()
export class MailService {
  private readonly logger = new Logger('EPRX_MAIL_SERVICE');
  private readonly RESEND_API_KEY = process.env.RESEND_API_KEY;
  private readonly RESEND_ENDPOINT = 'https://api.resend.com/emails';

  /**
   * 🛰️ DISPATCH_PROTOCOL: OTP_VERIFICATION
   */
  async sendVerificationEmail(email: string, otp: string) {
    const payload = {
      from: 'ePRX UV1 <onboarding@resend.dev>', // Free tier uses this domain
      to: [email],
      subject: 'IDENTITY VERIFICATION CODE || ACTION REQUIRED',
      html: `
        <div style="background-color: #000; padding: 40px; font-family: sans-serif; text-align: center; color: #fff;">
          <h1 style="color: #d4ff00; letter-spacing: 4px;">ePRX UV1</h1>
          <p style="color: #666;">[ SECURITY_PROTOCOL: OTP_VERIFICATION ]</p>
          <div style="margin: 40px auto; width: 200px; padding: 20px; border: 2px solid #d4ff00; background: #111;">
            <span style="font-size: 32px; font-weight: bold; color: #fff; letter-spacing: 5px;">${otp}</span>
          </div>
          <p style="font-size: 12px; color: #888;">Enter this code in your mobile interface to activate your session.</p>
        </div>
      `,
    };

    return this.executeApiRequest(payload, 'Verification');
  }

  /**
   * 🛰️ DISPATCH_PROTOCOL: PASSWORD_RECOVERY
   */
  async sendPasswordResetEmail(email: string, otp: string) {
    const payload = {
      from: 'ePRX UV1 <onboarding@resend.dev>',
      to: [email],
      subject: 'RECOVERY_PROTOCOL: PASSWORD_RESET_OTP',
      html: `
        <div style="background-color: #000; padding: 40px; font-family: monospace; text-align: center; color: #fff; border: 2px solid #FF0055;">
          <h1 style="color: #FF0055; letter-spacing: 2px;">IDENTITY RECOVERY</h1>
          <p style="color: #666;">[ SECURITY_TOKEN_ISSUED ]</p>
          <div style="margin: 30px auto; padding: 20px; border: 1px dashed #FF0055; display: inline-block;">
            <span style="font-size: 32px; font-weight: bold; color: #fff; letter-spacing: 10px;">${otp}</span>
          </div>
          <p style="font-size: 11px; color: #444;">THIS TOKEN EXPIRES IN 60 SECONDS.</p>
        </div>
      `,
    };

    return this.executeApiRequest(payload, 'Recovery');
  }

  private async executeApiRequest(body: any, type: string) {
    try {
      const response = await fetch(this.RESEND_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.RESEND_API_KEY}`,
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        // this.logger.error(`RESEND_API_ERROR (${type}):`, data);
        this.logger.warn(
          `--- [ePRX_UV1] MAIL_SANDBOX_LIMIT: Skipping email for ${body.to} ---`,
        );
        return { success: false, message: 'SANDBOX_LIMIT_REACHED' };
        // throw new Error(`MAIL_UPLINK_FAILURE: ${data.message}`);
      }

      this.logger.log(
        `--- [ePRX_UV1] ${type.toUpperCase()}_EMAIL_SENT_VIA_API ---`,
      );
      return data;
    } catch (error: any) {
      this.logger.error(
        `--- [ePRX_UV1] CRITICAL_MAIL_FAILURE: ${error.message} ---`,
      );
      return null;
    }
  }
}

/*  @Injectable()
export class MailService {
  private transporter: nodemailer.Transporter<SentMessageInfo>;
  private readonly logger = new Logger('EPRX_MAIL_SERVICE');

  constructor() {
    this.logger.log(`Initializing Hard-Coded IPv4 Mail Uplink...`);

    this.transporter = nodemailer.createTransport({
      // 1. Direct IPv4 for Google SMTP (bypasses IPv6 ENETUNREACH)
      host: '74.125.142.108', // smtp.gmail.com resolved to this IPv4 on 2024-06-01
      port: 465,
      secure: true,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
      tls: {
        // 2. This tells Gmail "I know I connected via IP, but I'm looking for smtp.gmail.com"
        servername: 'smtp.gmail.com',
        rejectUnauthorized: false,
      },
      // 3. Keep-alive settings
      connectionTimeout: 10000,
      greetingTimeout: 10000,
    });
  }

  async sendVerificationEmail(email: string, otp: string) {
    try {
      await this.transporter.sendMail({
        from: '"ePRX UV1 SECURITY" <noreply@eprx-v1.com>',
        to: email,
        subject: 'IDENTITY VERIFICATION CODE || ACTION REQUIRED',
        html: `
        <div style="background-color: #000; padding: 40px; font-family: sans-serif; text-align: center; color: #fff;">
          <h1 style="color: #d4ff00; letter-spacing: 4px;">ePRX UV1</h1>
          <p style="color: #666;">[ SECURITY_PROTOCOL: OTP_VERIFICATION ]</p>
          <div style="margin: 40px auto; width: 200px; padding: 20px; border: 2px solid #d4ff00; background: #111;">
            <span style="font-size: 32px; font-weight: bold; color: #fff; letter-spacing: 5px;">${otp}</span>
          </div>
          <p style="font-size: 12px; color: #888;">Enter this code in your mobile interface to activate your session.</p>
        </div>
      `,
      });
      this.logger.log(`Verification email dispatched to: ${email}`);
    } catch (error) {
      this.logger.error('MAIL_ERROR (Verification):', error);
      throw error;
    }
  }

  async sendPasswordResetEmail(email: string, otp: string) {
    try {
      await this.transporter.sendMail({
        from: '"ePRX SECURITY" <no-reply@eprx-v1.com>',
        to: email,
        subject: 'RECOVERY_PROTOCOL: PASSWORD_RESET_OTP',
        html: `
        <div style="background-color: #000; padding: 40px; font-family: monospace; text-align: center; color: #fff; border: 2px solid #FF0055;">
          <h1 style="color: #FF0055; letter-spacing: 2px;">IDENTITY RECOVERY</h1>
          <p style="color: #666;">[ SECURITY_TOKEN_ISSUED ]</p>
          <div style="margin: 30px auto; padding: 20px; border: 1px dashed #FF0055; display: inline-block;">
            <span style="font-size: 32px; font-weight: bold; color: #fff; letter-spacing: 10px;">${otp}</span>
          </div>
          <p style="font-size: 11px; color: #444;">THIS TOKEN EXPIRES IN 60 SECONDS. IF NOT REQUESTED, ALERT SECURITY.</p>
        </div>
      `,
      });
      this.logger.log(`Recovery email dispatched to: ${email}`);
    } catch (error) {
      this.logger.error('MAIL_ERROR (Recovery):', error);
      throw new Error('FAILED_TO_SEND_RECOVERY_EMAIL');
    }
  }
} */
