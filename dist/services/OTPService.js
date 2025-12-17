import { Resend } from 'resend';
import dotenv from 'dotenv';
import generateOTP from '../utils/otpGenerator.js';
dotenv.config();
const apiKey = process.env.RESEND_API_KEY;
const resend = new Resend(apiKey);
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