import type {RedisClientType} from 'redis';

import generateOTP from '../utils/otpGenerator.js';

class OTPService {


    private redisClient: RedisClientType;

    private OTP_EXPIRY: number = 300;
    private RATE_LIMIT_WINDOW: number = 60;

    constructor(redisClient: RedisClientType) {
        this.redisClient = redisClient;

    }


    private async checkRateLimit(email: string, purpose: string): Promise<boolean> {

        const rateLimitKey = `otp:ratelimit:${purpose}:${email}`;

        const exists = await this.redisClient.exists(rateLimitKey);

        if (exists) {
            return false
        } else return true;


    }

    async generateAndStoreOTP(email: string, purpose: string): Promise<string> {

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

    async verifyOTP(email: string, otp: string, purpose: string): Promise<boolean> {

        const otpKey = `otp:${purpose}:${email}`;

        const storedOtp = await this.redisClient.get(otpKey)

        return storedOtp === otp;


    }


    async invalidateOTP(email: string, purpose: string): Promise<void> {

        const otpKey = `otp:${purpose}:${email}`;

        await this.redisClient.del(otpKey);



    }


}

export default OTPService;