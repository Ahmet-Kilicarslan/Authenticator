import type { RedisClient } from "../config/redis";
declare class OTPService {
    private redisClient;
    private OTP_EXPIRY;
    private RATE_LIMIT_WINDOW;
    constructor(redisClient: RedisClient);
    private checkRateLimit;
    generateAndStoreOTP(email: string, purpose: string): Promise<string>;
    verifyOTP(email: string, otp: string, purpose: string): Promise<boolean>;
    invalidateOTP(email: string, purpose: string): Promise<void>;
}
export default OTPService;
//# sourceMappingURL=OTPService.d.ts.map