import redisClient from '../config/redis.js';
import crypto from 'crypto';
import type {SessionData} from '../types'
import type RoleRepository from '../repositories/RoleRepository.js'

class sessionService {

    private readonly SESSION_PREFIX = 'session:';
    private readonly SESSION_EXPIRY = 60 * 60 * 24;//1 day
    private readonly SET_PREFIX = 'user_sessions:';


    /*        key token : value userId   */


    constructor(
        private RoleRepository: RoleRepository
    ) {
    }


    private generateToken(): string {
        return crypto.randomBytes(32).toString('hex');
    };

    async createSession(sessionData: Omit<SessionData, 'roles' | 'permissions' | 'createdAt' | 'lastActivity'>): Promise<string> {
        const token = this.generateToken();

        const permissions = await this.RoleRepository.getUserPermissions(sessionData.userId);

        const roles = await this.RoleRepository.getUserRole(sessionData.userId);

        const fullSessionData: SessionData = {
            ...sessionData,
            permissions: permissions,
            roles: roles,
            createdAt: new Date().toISOString(),
            lastActivity: new Date().toISOString()
        };

        await redisClient.set(
            `${this.SESSION_PREFIX}${token}`,
            JSON.stringify(fullSessionData),
            {EX: this.SESSION_EXPIRY}
        );

        await redisClient.sAdd(`${this.SET_PREFIX}${sessionData.userId}`, token);

        return token;

    }

    async getSession(token: string): Promise<SessionData | null> {
        const data = await redisClient.get(`${this.SESSION_PREFIX}${token}`);

        if (!data) {
            return null;
        }

        const sessionData: SessionData = JSON.parse(data);//converts json string to js object

        sessionData.lastActivity = new Date().toISOString();

        //sliding => active user keeps session valid
        await redisClient.setEx(
            `${this.SESSION_PREFIX}${token}`,
            this.SESSION_EXPIRY,
            JSON.stringify(sessionData)
        );

        return sessionData;


    }

    async refreshSession(token: string): Promise<boolean> {
        const data = await redisClient.get(`${this.SESSION_PREFIX}${token}`);
        if (!data) {
            return false;
        }
        const sessionData: SessionData = JSON.parse(data);


        const permissions = await this.RoleRepository.getUserPermissions(sessionData.userId);

        const roles = await this.RoleRepository.getUserRole(sessionData.userId);

        sessionData.lastActivity = new Date().toISOString();

        const refreshedSessionData = {
            ...sessionData,
            permissions,
            roles

        }

        await redisClient.set(
            `${this.SESSION_PREFIX}${token}`,
            JSON.stringify(refreshedSessionData),
            {EX: this.SESSION_EXPIRY}
        );

        return true;

    }

    async destroySession(token: string): Promise<void> {
        await redisClient.del(`${this.SESSION_PREFIX}${token}`);

    }

    async destroyUserSessions(userId: number): Promise<void> {

        const tokens: string[] = await redisClient.sMembers(`${this.SET_PREFIX}${userId}`);

        for (const token of tokens) {
            const key: string = `${this.SESSION_PREFIX}${token}`;
            await redisClient.del(key);
        }

        await redisClient.del(`${this.SET_PREFIX}${userId}`);


    }

    async destroyOtherSession(userId: number, currentToken: string): Promise<void> {

        const tokens: string[] = await redisClient.sMembers(`${this.SET_PREFIX}${userId}`);
        const currentKey: string = `${this.SESSION_PREFIX}${currentToken}`;

        for (const token of tokens) {
            const key: string = `${this.SESSION_PREFIX}${token}`;
            if (key !== currentKey) {
                await redisClient.del(key);//delete session
                await redisClient.sRem(`${this.SET_PREFIX}${userId}`, token);//remove set item
            }
        }

    }

}


export default sessionService;