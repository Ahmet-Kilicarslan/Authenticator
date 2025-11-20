import type { SessionData } from '../types';
declare class sessionService {
    private readonly SESSION_PREFIX;
    private readonly SESSION_EXPIRY;
    private generateToken;
    createSession(sessionData: Omit<SessionData, 'createdAt' | 'lastActivity'>): Promise<string>;
    getSession(token: string): Promise<SessionData | null>;
    destroySession(token: string): Promise<void>;
    destroyUserSession(userId: number): Promise<void>;
}
export default sessionService;
//# sourceMappingURL=SessionService.d.ts.map