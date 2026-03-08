import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger('EPRX_MAIL_SERVICE');
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465, // 🔒 Secure Port (Important for Railway)
      secure: true, // Use SSL
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });
  }

  async sendVerificationEmail(email: string, otp: string) {
    const mailOptions = {
      from: `"ePRX UV1" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: 'IDENTITY_VERIFICATION_PROTOCOL',
      html: `
        <div style="background: #000; color: #fff; padding: 20px; font-family: monospace; border: 1px solid #d4ff00;">
          <h2 style="color: #d4ff00;">ePRX UV1 || ACCESS CONTROL</h2>
          <p>Uplink requested for: <strong>${email}</strong></p>
          <div style="font-size: 24px; padding: 10px; border: 1px dashed #d4ff00; display: inline-block;">
            ${otp}
          </div>
          <p style="font-size: 10px; color: #555; margin-top: 20px;">SECURITY_TOKEN_V1</p>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      this.logger.log(`--- [ePRX_UV1] GMAIL_BRIDGE_SUCCESS: ${email} ---`);
    } catch (error: any) {
      this.logger.error(
        `--- [ePRX_UV1] GMAIL_BRIDGE_FAILURE: ${error.message} ---`,
      );
      throw error;
    }
  }
}
