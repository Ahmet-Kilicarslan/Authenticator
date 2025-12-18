import EmailVerificationService from "../services/EmailVerificationService.js";
import UserRepository from "../repositories/UserRepository.js";
import OTPService from "../services/OTPService.js";
import redisClient from "../config/redis.js";
class EmailVerificationController {
    emailVerificationService;
    constructor() {
        const userRepository = new UserRepository();
        const otpService = new OTPService(redisClient);
        this.emailVerificationService = new EmailVerificationService(userRepository, otpService);
    }
    async verifyEmail(req, res) {
        try {
            const { email, otp } = req.body;
            if (!email || !otp) {
                res.status(400).json({
                    error: "Email verification failed",
                    message: "Email or otp required"
                });
            }
            const isValid = await this.emailVerificationService.verifyOTP(email, otp);
            if (!isValid) {
                res.status(400).json({
                    error: "OTP invalid",
                    message: "Otp is incorrect or expired"
                });
            }
            res.status(200).json({
                message: "Email verified successfully",
            });
        }
        catch (error) {
            console.error('❌ Email verification error:', error);
            res.status(500).json({
                error: 'Verification failed',
                message: error.message
            });
        }
    }
    async resendVerification(req, res) {
        try {
            const { email } = req.body;
            if (!email) {
                res.status(400).json({
                    error: "Missing valid email",
                    message: "Email is required",
                });
                return;
            }
            await this.emailVerificationService.sendVerificationEmail(email);
            res.status(200).json({
                message: `Otp sent to : ${email}`,
            });
        }
        catch (error) {
            console.error('❌ Email verification error:', error);
            res.status(500).json({
                error: 'Resend failed',
                message: error.message
            });
        }
    }
}
export default EmailVerificationController;
//# sourceMappingURL=EmailVerificationController.js.map