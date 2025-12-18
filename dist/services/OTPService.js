import { Resend } from 'resend';
import dotenv from 'dotenv';
import generateOTP from '../utils/otpGenerator.js';
import * as brevo from '@getbrevo/brevo';
dotenv.config();
const resendApiKey = process.env.RESEND_API_KEY;
const resend = new Resend(resendApiKey);
const brevoApiKey = process.env.BREVO_API_KEY;
const brevoApi = new brevo.TransactionalEmailsApi();
brevoApi.setApiKey(brevo.TransactionalEmailsApiApiKeys.apiKey, brevoApiKey || '');
class OTPService {
    redisClient;
    OTP_EXPIRY = 300;
    RATE_LIMIT_WINDOW = 60;
    constructor(redisClient) {
        this.redisClient = redisClient;
    }
    async sendOTPEmail(email, otp) {
        try {
            await resend.emails.send({
                from: 'onboarding@resend.dev', //Resend default mail
                to: email,
                subject: 'One Time Password',
                html: `<p>Your OTP is: <strong>${otp}</strong></p>
           <p>This code will expire in 5 minutes.</p>`
            });
        }
        catch (error) {
            if (error instanceof Error) {
                throw new Error(`Failed to send otp: ${error.message}`);
            }
            throw new Error(`Failed to send otp: unknown error`);
        }
    }
    async sendOTPEmailViaBrevo(email, otp) {
        console.log('📧 [BREVO] Sending email to:', email);
        try {
            const sendSmtpEmail = new brevo.SendSmtpEmail();
            //Smtp = Simple mail transfer protocol
            sendSmtpEmail.subject = "Verify Your Email - OTP Code";
            sendSmtpEmail.to = [{ email: email }];
            sendSmtpEmail.htmlContent = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: #000; color: #fff; padding: 20px; text-align: center;">
                        <h1 style="margin: 0; font-size: 24px; letter-spacing: 2px;">EMAIL VERIFICATION</h1>
                    </div>
                    <div style="padding: 40px 20px; background: #fff; border: 3px solid #000;">
                        <p style="font-size: 16px; color: #000; margin-bottom: 20px;">
                            Your verification code is:
                        </p>
                        <div style="background: #000; color: #fff; padding: 30px; text-align: center; margin: 20px 0;">
                            <h1 style="margin: 0; font-size: 48px; letter-spacing: 12px; font-weight: 900;">
                                ${otp}
                            </h1>
                        </div>
                        <p style="font-size: 14px; color: #666; margin-top: 20px;">
                            This code will expire in <strong>5 minutes</strong>.
                        </p>
                        <p style="font-size: 14px; color: #666;">
                            If you didn't request this code, please ignore this email.
                        </p>
                        <p style="font-size: 12px; color: #999; margin-top: 30px; font-style: italic;">
                            Powered by Brevo
                        </p>
                    </div>
                </div>
            `;
            sendSmtpEmail.sender = {
                name: "Authenticator App",
                email: "noreply@ahmet.com"
            };
            await brevoApi.sendTransacEmail(sendSmtpEmail);
        }
        catch (error) {
            console.error('❌ [BREVO] Failed:', error);
            if (error instanceof Error) {
                throw new Error(`Failed to send OTP via Brevo: ${error.message}`);
            }
            throw new Error('Failed to send OTP via Brevo: unknown error');
        }
    }
    async checkRateLimit(email, purpose) {
        const rateLimitKey = `otp:ratelimit:${purpose}:${email}`;
        const exists = await this.redisClient.exists(rateLimitKey);
        if (exists) {
            return false;
        }
        else
            return true;
    }
    async generateAndStoreOTP(email, purpose) {
        const canProceed = await this.checkRateLimit(email, purpose);
        if (!canProceed) {
            throw new Error('PLease wait before requesting another OTP');
        }
        const otp = generateOTP();
        const otpKey = `otp:${purpose}:${email}`;
        await this.redisClient.setEx(otpKey, this.OTP_EXPIRY, otp);
        const rateLimitKey = `otp:ratelimit:${purpose}:${email}`;
        await this.redisClient.setEx(rateLimitKey, this.RATE_LIMIT_WINDOW, '1');
        return otp;
    }
    async verifyOTP(email, otp, purpose) {
        const otpKey = `otp:${purpose}:${email}`;
        const storedOtp = await this.redisClient.get(otpKey);
        return storedOtp === otp;
    }
    async invalidateOTP(email, purpose) {
        const otpKey = `otp:${purpose}:${email}`;
        await this.redisClient.del(otpKey);
    }
}
export default OTPService;
//# sourceMappingURL=OTPService.js.map