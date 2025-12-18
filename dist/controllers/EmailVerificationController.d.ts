import type { Request, Response } from 'express';
/**
 * Email Verification Controller
 * Handles email verification endpoints:
 * - POST /api/auth/send-verification - Send OTP to email
 * - POST /api/auth/verify-email - Verify OTP code
 */
declare class EmailVerificationController {
    private emailVerificationService;
    constructor();
    /**
     * Send verification email with OTP
     * POST /api/auth/send-verification
     * Body: { email: "user@example.com" }
     */
    sendVerificationEmail(req: Request, res: Response): Promise<void>;
    /**
     * Verify OTP code
     * POST /api/auth/verify-email
     * Body: { email: "user@example.com", otp: "123456" }
     */
    verifyEmail(req: Request, res: Response): Promise<void>;
}
export default EmailVerificationController;
//# sourceMappingURL=EmailVerificationController.d.ts.map