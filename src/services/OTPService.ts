import dotenv from 'dotenv';
import generateOTP from '../utils/otpGenerator.js';

import type {RedisClient} from '../config/redis.js';


dotenv.config();

class OTPService {


    private OTP_EXPIRY: number = 300;
    private RATE_LIMIT_WINDOW: number = 60;//seconds window to ask new otp
    private MAX_ATTEMPTS = 5;

    constructor(private redisClient: RedisClient) {
    }


    private async checkRateLimit(email: string, purpose: string): Promise<boolean> {

        const rateLimitKey = `otp:ratelimit:${purpose}:${email}`;

        const exists = await this.redisClient.exists(rateLimitKey);

        return exists === 0;//can proceed if not


    }

    async generateAndStoreOTP(email: string, purpose: string): Promise<string> {

        const canProceed = await this.checkRateLimit(email, purpose);

        if (!canProceed) {
            throw new Error('PLease wait before requesting another OTP');
        }

        const otp = generateOTP();

        const otpKey = `otp:${purpose}:${email}`;

        await this.redisClient.set(otpKey, otp, {EX: this.OTP_EXPIRY});

        const attemptsKey = `otp:attempts:${purpose}:${email}`;

        await this.redisClient.set(attemptsKey, '0', {EX: this.OTP_EXPIRY});

        const rateLimitKey = `otp:ratelimit:${purpose}:${email}`;

        await this.redisClient.set(rateLimitKey, '1', {EX: this.RATE_LIMIT_WINDOW});

        return otp;


    }

    async verifyOTP(email: string, otp: string, purpose: string): Promise<boolean> {

        const otpKey = `otp:${purpose}:${email}`;
        const attemptsKey = `otp:attempts:${purpose}:${email}`;


        const storedOtp = await this.redisClient.get(otpKey)

        if (!storedOtp) {
            return false; // expired or never existed
        }

        const attempts = Number(await this.redisClient.get(attemptsKey) || 0);

        if (attempts >= this.MAX_ATTEMPTS) {
            throw new Error("Too many incorrect attempts. OTP blocked.");
        }

        if (storedOtp !== otp) {
            await this.redisClient.incr(attemptsKey);
            return false;
        }

        await this.redisClient.del(otpKey);
        await this.redisClient.del(attemptsKey);


        return storedOtp === otp;




    }


    async invalidateOTP(email: string, purpose: string): Promise<void> {

        const otpKey = `otp:${purpose}:${email}`;
        const attemptsKey = `otp:attempts:${purpose}:${email}`;

        await this.redisClient.del(otpKey);
        await this.redisClient.del(attemptsKey);



    }


}

export default OTPService;