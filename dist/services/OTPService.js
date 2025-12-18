import dotenv from 'dotenv';
import generateOTP from '../utils/otpGenerator.js';
dotenv.config();
class OTPService {
    redisClient;
    OTP_EXPIRY = 300;
    RATE_LIMIT_WINDOW = 60;
    constructor(redisClient) {
        this.redisClient = redisClient;
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