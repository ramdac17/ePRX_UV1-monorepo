var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
let MailService = (() => {
    let _classDecorators = [Injectable()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var MailService = _classThis = class {
        constructor() {
            console.log('MAIL_HOST:', process.env.MAIL_HOST);
            this.transporter = nodemailer.createTransport({
                host: process.env.MAIL_HOST,
                port: Number(process.env.MAIL_PORT),
                secure: false,
                auth: {
                    user: process.env.MAIL_USER,
                    pass: process.env.MAIL_PASS,
                },
            });
        }
        async sendVerificationEmail(email, token) {
            const url = `${process.env.BACKEND_URL}/api/auth/verify-email?token=${token}`;
            // const url = "${process.env.BACKEND_URL}/auth/verify-email?token=${token}";
            try {
                // Logic: One single, protected call with real data
                const info = await this.transporter.sendMail({
                    from: '"ePRX EXTREME" <noreply@eprx-v1.com>',
                    to: email,
                    subject: 'ACTIVATE YOUR ACCCOUNT || ACTION REQUIRED',
                    html: `
  <div style="background-color: #0a0a0a; padding: 40px 20px; font-family: 'Helvetica', 'Arial', sans-serif; text-align: center; color: #ffffff;">
    <div style="max-width: 600px; margin: 0 auto; border: 1px solid #333; background-color: #000000; padding: 40px; border-top: 4px solid #d4ff00;">
      
      <h1 style="color: #d4ff00; font-size: 28px; letter-spacing: 5px; margin-bottom: 20px; font-weight: 800; text-transform: uppercase;">
        ePRX UV1
      </h1>
      
      <div style="height: 1px; background-color: #333; margin: 20px 0;"></div>
      
      <p style="font-size: 14px; line-height: 1.6; color: #cccccc; letter-spacing: 1px; margin-bottom: 30px; text-transform: uppercase;">
        [ SECURITY PROTOCOL INITIATED ]
      </p>
      
      <p style="font-size: 16px; color: #ffffff; margin-bottom: 40px; line-height: 1.5;">
        A new operative registration has been detected for this email address. 
        You must confirm your identity to synchronize with the <strong>PINOY RUNNER EXTREME</strong> network.
      </p>
      
      <a href="${url}" style="display: inline-block; background-color: #d4ff00; color: #000000; padding: 18px 35px; font-size: 14px; font-weight: bold; text-decoration: none; border-radius: 0px; letter-spacing: 3px; text-transform: uppercase;">
        ACTIVATE SESSION →
      </a>
      
      <p style="font-size: 11px; color: #666666; margin-top: 50px; line-height: 1.4;">
        ID: ${token.substring(0, 8)}...<br>
        If you did not initiate this request, please ignore this email. 
        The link will expire shortly for security reasons.
      </p>
      
      <div style="height: 1px; background-color: #333; margin: 20px 0;"></div>
      
      <p style="font-size: 10px; color: #444444; letter-spacing: 2px;">
        © 2026 ePRX || CORE_SYSTEM_UV1
      </p>
    </div>
  </div>
`,
                });
                console.log('EMAIL_SENT_SUCCESS:', info.messageId);
                return info;
            }
            catch (error) {
                // This will now catch actual SMTP errors (wrong password, blocked port, etc.)
                console.error('EMAIL_TRANSMISSION_FAILED:', error);
                throw error; // Re-throw so AuthService knows it failed
            }
        }
        async sendPasswordResetEmail(email, resetUrl) {
            try {
                await this.transporter.sendMail({
                    from: '"ePRX SECURITY" <no-reply@eprx.uv1>', // Match your brand
                    to: email,
                    subject: 'RECOVERY_PROTOCOL: PASSWORD_RESET_REQUEST',
                    html: `
        <div style="font-family: 'Courier New', Courier, monospace; background-color: #0a0a0a; color: #d4ff00; padding: 40px; border: 1px solid #d4ff00;">
          <h2 style="text-transform: uppercase; letter-spacing: 2px;">Identity Recovery Initiated</h2>
          <hr style="border: 0; border-top: 1px solid #d4ff00;" />
          <p style="color: #ffffff;">A request has been made to reset the credentials for <strong>${email}</strong>.</p>
          <p style="color: #ffffff;">If this was you, click the link below to regenerate your uplink access. This link will expire in 60 minutes.</p>
          
          <div style="margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background-color: #d4ff00; color: #000; padding: 12px 24px; text-decoration: none; font-weight: bold; text-transform: uppercase;">
               RESET_CREDENTIALS
            </a>
          </div>
          
          <p style="font-size: 12px; color: #888;">If you did not request this, please ignore this email or contact the ePRX UV1 security team.</p>
        </div>
      `,
                });
                console.log('✅ RESET_EMAIL_SENT_TO:', email);
            }
            catch (error) {
                console.error('❌ MAIL_SERVICE_ERROR:', error);
                throw new Error('FAILED_TO_SEND_RECOVERY_EMAIL');
            }
        }
    };
    __setFunctionName(_classThis, "MailService");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        MailService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return MailService = _classThis;
})();
export { MailService };
