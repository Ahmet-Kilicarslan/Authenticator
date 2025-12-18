import type { Request, Response } from 'express';
import UserRepository from '../repositories/UserRepository.js';
import OTPService from '../services/OTPService.js';
import EmailVerificationService from '../services/EmailVerificationService.js';
import { emailProvider } from '../providers/EmailProviderFactory.js';
import redisClient from '../config/redis.js';

/**
 * Email Verification Controller
 * Handles email verification endpoints:
 * - POST /api/auth/send-verification - Send OTP to email
 * - POST /api/auth/verify-email - Verify OTP code
 */
class EmailVerificationController {
    private emailVerificationService: EmailVerificationService;

    constructor() {
        // Initialize dependencies
        const userRepository = new UserRepository();
        const otpService = new OTPService(redisClient);

        // Create the email verification service
        this.emailVerificationService = new EmailVerificationService(
            userRepository,
            otpService,
            emailProvider  // ← Using the factory singleton
        );
    }

    /**
     * Send verification email with OTP
     * POST /api/auth/send-verification
     * Body: { email: "user@example.com" }
     */
    async sendVerificationEmail(req: Request, res: Response): Promise<void> {
        try {
            const { email } = req.body;

            // Validate input
            if (!email) {
                res.status(400).json({
                    error: 'Email is required'
                });
                return;
            }

            // Send verification email
            await this.emailVerificationService.sendVerificationEmail(email);

            res.status(200).json({
                message: 'Verification email sent successfully',
                email: email
            });

        } catch (error: any) {
            console.error('❌ Send verification error:', error);

            // Handle specific errors
            if (error.message === 'User not found') {
                res.status(404).json({
                    error: 'User not found',
                    message: 'No account found with this email'
                });
                return;
            }

            if (error.message === 'User already verified') {
                res.status(400).json({
                    error: 'Already verified',
                    message: 'This account is already verified'
                });
                return;
            }

            if (error.message.includes('wait before requesting')) {
                res.status(429).json({
                    error: 'Rate limit exceeded',
                    message: 'Please wait before requesting another verification code'
                });
                return;
            }

            // Generic error
            res.status(500).json({
                error: 'Failed to send verification email',
                message: error.message
            });
        }
    }

    /**
     * Verify OTP code
     * POST /api/auth/verify-email
     * Body: { email: "user@example.com", otp: "123456" }
     */
    async verifyEmail(req: Request, res: Response): Promise<void> {
        try {
            const { email, otp } = req.body;

            // Validate input
            if (!email || !otp) {
                res.status(400).json({
                    error: 'Email and OTP are required'
                });
                return;
            }

            // Verify the OTP
            const isValid = await this.emailVerificationService.verifyOTP(email, otp);

            if (!isValid) {
                res.status(400).json({
                    error: 'Invalid or expired OTP',
                    message: 'The verification code is incorrect or has expired'
                });
                return;
            }

            res.status(200).json({
                message: 'Email verified successfully',
                verified: true
            });

        } catch (error: any) {
            console.error('❌ Verify email error:', error);

            res.status(500).json({
                error: 'Email verification failed',
                message: error.message
            });
        }
    }
}

export default EmailVerificationController;