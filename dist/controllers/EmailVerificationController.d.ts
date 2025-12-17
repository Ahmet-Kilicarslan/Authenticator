import type { Request, Response } from "express";
declare class EmailVerificationController {
    private emailVerificationService;
    constructor();
    verifyEmail(req: Request, res: Response): Promise<void>;
    resendVerification(req: Request, res: Response): Promise<void>;
}
export default EmailVerificationController;
//# sourceMappingURL=EmailVerificationController.d.ts.map