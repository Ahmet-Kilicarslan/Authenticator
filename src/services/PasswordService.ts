import bcrypt from 'bcrypt';
import crypto from 'crypto';
import redisClient from '../config/redis.js';
import dotenv from 'dotenv';

dotenv.config();

class PasswordService {

    private readonly RESET_PREFIX = "password_reset:";


    async generateResetLink(userId: number): Promise<string> {

        const token = crypto.randomBytes(32).toString('hex');

        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        await redisClient.set(
            `${this.RESET_PREFIX}${hashedToken}`,
            userId.toString(),
            {
                EX: 900
            }
        );

        const frontendUrl = process.env.FRONTEND_URL;

        const resetLink = `${frontendUrl}/reset-password?token=${token}`;

        return resetLink;

    }

    async validateResetToken(token:string): Promise<number|null> {

        const hashedToken = crypto
            .createHash("sha256")
            .update(token)
            .digest("hex");

        // 2. get userId from Redis
        const userId = await redisClient.get(
            `${this.RESET_PREFIX}${hashedToken}`
        );

        if (!userId) {
            return null;
        }

        return Number(userId);



    }

    async invalidateResetToken(token:string): Promise<void> {

        const hashedToken = crypto
            .createHash("sha256")
            .update(token)
            .digest("hex");

        await redisClient.del(
            `${this.RESET_PREFIX}${hashedToken}`
        );
    }


    async hashPassword(password: string): Promise<string> {
        const saltRounds: number = 10;
        return await bcrypt.hash(password, saltRounds);

    }

    async comparePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {

        return await bcrypt.compare(plainPassword, hashedPassword);


    }

    async validateStrength(password: string): Promise<{ strong: boolean, errors: string[] }> {
        const errors: string[] = [];

        if (password.length < 6) {
            errors.push('Password must be at least 6 characters');
        }

        if (!/[A-Z]/.test(password)) {
            errors.push('Password must contain an uppercase letter');
        }
        if (!/[a-z]/.test(password)) {
            errors.push('Password must  contain a lowercase letter');
        }

        if (!/[0-9]/.test(password)) {
            errors.push('Password must contain a number');
        }


        return {
            strong: errors.length === 0,
            errors
        };


    }


}

export default PasswordService;