import { Injectable, Logger } from '@nestjs/common';
import nodemailer from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: 'smtp-relay.brevo.com',
      port: 587,
      secure: false, // Port 587 uses STARTTLS

      // 🛡️ RAILWAY ARMOR: Force IPv4 to bypass ENETUNREACH
      family: 4,
      connectionTimeout: 20000,
      greetingTimeout: 20000,
      socketTimeout: 20000,

      auth: {
        user: process.env.MAIL_USER, // Your Brevo login email
        pass: process.env.MAIL_PASS, // Your Brevo SMTP Key
      },
    } as SMTPTransport.Options);
  }

  private async sendMail(to: string, subject: string, html: string) {
    try {
      const result = await this.transporter.sendMail({
        from: `"ePRX UV1" <${process.env.MAIL_USER}>`,
        to,
        subject,
        html,
      });

      this.logger.log(`Uplink Successful: Email sent to ${to}`);
      return result;
    } catch (error) {
      this.logger.error(
        `Uplink Failed: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  // Verification & Reset methods remain the same as before...
  async sendVerificationEmail(to: string, token: string) {
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
          <a href="${url}" style="padding: 12px 25px; background: ${color}; color: ${textColor}; text-decoration: none; font-weight: bold; display: inline-block; border-radius: 4px;">
            ${btnText}
          </a>
        </div>
      </div>
    `;
  }
}
