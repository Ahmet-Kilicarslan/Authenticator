import redisClient from '../config/redis';
import crypto from 'crypto';
import type {SessionData} from '../types'


class sessionService {

    private readonly SESSION_PREFIX = 'session:';
    private readonly SESSION_EXPIRY = 60 * 60 * 24;//1 day


    private generateToken(): string {
        return crypto.randomBytes(32).toString('hex');
    };

    async createSession(sessionData: Omit<SessionData, 'createdAt' | 'lastActivity'>): Promise<string> {
        const token = this.generateToken();
        const fullSessionData: SessionData = {
            ...sessionData,
            createdAt: new Date().toISOString(),
            lastActivity: new Date().toISOString()
        };

        await redisClient.setEx(//set with expiry time ---> setEx
            `${this.SESSION_PREFIX}${token}`,
            this.SESSION_EXPIRY,
            JSON.stringify(fullSessionData)
        );
        return token;

    }

    async getSession(token: string): Promise<SessionData | null> {
        const data = await redisClient.get(`${this.SESSION_PREFIX}${token}`);

        if (!data) {
            return null;
        }

        const sessionData: SessionData = JSON.parse(data);//converts json string to js object

        sessionData.lastActivity = new Date().toISOString();

        await redisClient.setEx(
            `${this.SESSION_PREFIX}${token}`,
            this.SESSION_EXPIRY,
            JSON.stringify(sessionData)
        );

        return sessionData;


    }

    async destroySession(token: string): Promise<void> {
        await redisClient.del(`${this.SESSION_PREFIX}${token}`);

    }

    async destroyUserSession(userId: number): Promise<void> {

        const keys = await redisClient.keys(`${this.SESSION_PREFIX}*`);

        for (const key of keys) {
            const data = await redisClient.get(key);
            if (data) {
                const sessionData: SessionData = JSON.parse(data);
                if (sessionData.userId === userId) {
                    await redisClient.del(key);
                }
            }
        }


    }

}


export default  sessionService;