import redisClient from '../config/redis';
import crypto from 'crypto';
class sessionService {
    SESSION_PREFIX = 'session:';
    SESSION_EXPIRY = 60 * 60 * 24; //1 day
    generateToken() {
        return crypto.randomBytes(32).toString('hex');
    }
    ;
    async createSession(sessionData) {
        const token = this.generateToken();
        const fullSessionData = {
            ...sessionData,
            createdAt: new Date().toISOString(),
            lastActivity: new Date().toISOString()
        };
        await redisClient.setEx(//set with expiry time ---> setEx
        `${this.SESSION_PREFIX}${token}`, this.SESSION_EXPIRY, JSON.stringify(fullSessionData));
        return token;
    }
    async getSession(token) {
        const data = await redisClient.get(`${this.SESSION_PREFIX}${token}`);
        if (!data) {
            return null;
        }
        const sessionData = JSON.parse(data); //converts json string to js object
        sessionData.lastActivity = new Date().toISOString();
        await redisClient.setEx(`${this.SESSION_PREFIX}${token}`, this.SESSION_EXPIRY, JSON.stringify(sessionData));
        return sessionData;
    }
    async destroySession(token) {
        await redisClient.del(`${this.SESSION_PREFIX}${token}`);
    }
    async destroyUserSession(userId) {
        const keys = await redisClient.keys(`${this.SESSION_PREFIX}*`);
        for (const key of keys) {
            const data = await redisClient.get(key);
            if (data) {
                const sessionData = JSON.parse(data);
                if (sessionData.userId === userId) {
                    await redisClient.del(key);
                }
            }
        }
    }
}
export default sessionService;
//# sourceMappingURL=SessionService.js.map