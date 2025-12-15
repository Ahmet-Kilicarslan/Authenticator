import {Resend} from 'resend';
import dotenv from 'dotenv';
import generateOTP from '../utils/otpGenerator.js';
import type {RedisClient} from "../config/redis";


dotenv.config();

const apiKey = process.env.RESEND_API_KEY;

const resend = new Resend(apiKey);

class OTPService {



    private redisClient: RedisClient;

    private OTP_EXPIRY: number = 300;
    private RATE_LIMIT_WINDOW: number = 60;

    constructor(redisClient: RedisClient) {
        this.redisClient = redisClient;

    }

    async sendOTPEmail(email: string, otp: string): Promise<void> {
        try {
            await resend.emails.send({
                from: 'onboarding@resend.dev',  //Resend default mail
                to: email,
                subject: 'One Time Password',
                html: `<p>Your OTP is: <strong>${otp}</strong></p>
           <p>This code will expire in 5 minutes.</p>`
            });
        } catch (error) {

            if(error instanceof Error) {
                throw new Error(`Failed to send otp: ${ error.message }`);
            }
            throw new Error(`Failed to send otp: unknown error`);
        }

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