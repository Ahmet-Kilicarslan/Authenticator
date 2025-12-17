import express from 'express';
import EmailVerificationController from '../controllers/EmailVerificationController';
const router = express.Router();
const emailVerificationController = new EmailVerificationController();
router.post("/verify-email", async (req, res) => {
    return emailVerificationController.verifyEmail(req, res);
});
router.post("/resend-verification", async (req, res) => {
    return emailVerificationController.resendVerification(req, res);
});
export default router;
//# sourceMappingURL=EmailVerificationRoute.js.map