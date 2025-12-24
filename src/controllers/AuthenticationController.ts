import type {Request, Response} from 'express';
import type {RegisterDTO, LoginDTO} from '../types';
import UserRepository from '../repositories/UserRepository.js';
import AuthenticationService from '../services/AuthenticationService.js';
import SessionService from '../services/SessionService.js';
import PasswordService from '../services/PasswordService.js';
import PendingRegistrationService from '../services/PendingRegistrationService.js';
import EmailVerificationService from '../services/EmailVerificationService.js';
import OTPService from '../services/OTPService.js';
import {emailProvider} from '../providers/EmailProviderFactory.js';
import redisClient from '../config/redis.js';
import {AUTH_COOKIE_CONFIG, AUTH_COOKIE_NAME} from '../config/cookie.js';

/***********************************************************
 * Authentication Controller
 *
 * Responsibilities:
 * - Extract data from HTTP requests
 * - Call appropriate service methods
 * - Format HTTP responses with correct status codes
 * - Set/clear cookies
 *
 * Does NOT:
 * - Validate business logic
 * - Access database directly
 * - Hash passwords
 * - Implement business rules
 ***********************************************************/
class AuthenticationController {

    private authService: AuthenticationService;
    private pendingRegistrationService: PendingRegistrationService;
    private emailVerificationService: EmailVerificationService;

    constructor() {

        // Initialize all dependencies
        const userRepository = new UserRepository();
        const sessionService = new SessionService();
        const passwordService = new PasswordService();



        this.pendingRegistrationService = new PendingRegistrationService(redisClient);

        const otpService = new OTPService(redisClient);

        this.emailVerificationService = new EmailVerificationService(
            otpService,
            emailProvider);

        /** Create authentication service with all dependencies.
             Services must be created to used !!  */

        this.authService = new AuthenticationService(
            userRepository,
            sessionService,
            passwordService,
            this.emailVerificationService,
            this.pendingRegistrationService
        );
    }

    /**
     * Helper: Set authentication cookie
     */
    private setAuthCookie(res: Response, token: string): void {
        res.cookie(AUTH_COOKIE_NAME, token, AUTH_COOKIE_CONFIG);
    }

    /**
     * PHASE 1: Register Endpoint
     * POST /api/auth/register
     *
     * Initiates registration by storing data in Redis and sending OTP.
     * Does NOT create user in database yet.
     */
    async register(req: Request, res: Response): Promise<void> {
        try {
            const {username, email, password} = req.body as RegisterDTO;

            // Basic input validation (field presence only)
            if (!username || !password || !email) {
                res.status(400).json({
                    error: 'Missing fields',
                    message: 'Username, email, and password are required'
                });
                return;
            }

            // Delegate all business logic to service
            await this.authService.initiateRegistration({username, email, password});

            // Format HTTP response (no token, no user object yet!)
            res.status(200).json({
                message: 'Verification email sent. Please check your inbox.',
                email: email,
                nextStep: 'verify-email'
            });

        } catch (error: any) {
            console.error('❌ Registration error:', error);

            // Map service errors to HTTP status codes
            if (error.message === 'Email already exists') {
                res.status(409).json({
                    error: 'Email already registered',
                    message: error.message
                });
            } else if (error.message === 'Username already exists') {
                res.status(409).json({
                    error: 'Username taken',
                    message: error.message
                });
            } else if (error.message.includes('Weak password')) {
                res.status(400).json({
                    error: 'Weak password',
                    message: error.message
                });
            } else if (error.message.includes('wait before requesting')) {
                res.status(429).json({
                    error: 'Rate limit exceeded',
                    message: error.message
                });
            } else {
                res.status(500).json({
                    error: 'Registration failed',
                    message: 'An error occurred during registration'
                });
            }
        }
    }

    /**
     * PHASE 2: Verify Email Endpoint
     * POST /api/auth/verify-email
     *
     * Verifies OTP and completes registration by creating user in database.
     */
    async verifyEmail(req: Request, res: Response): Promise<void> {
        try {
            const {email, otp} = req.body;

            // Basic input validation
            if (!email || !otp) {
                res.status(400).json({
                    error: 'Missing fields',
                    message: 'Email and OTP are required'
                });
                return;
            }

            // Complete registration (creates user in database)
            const result = await this.authService.completeRegistration(email, otp);

            // Set authentication cookie
            this.setAuthCookie(res, result.token);

            // Format HTTP response
            res.status(200).json({
                message: 'Email verified successfully! Registration complete.',
                user: {
                    id: result.user.id,
                    email: result.user.email,
                    username: result.user.username
                }
            });

        } catch (error: any) {
            console.error('❌ Email verification error:', error);

            if (error.message === 'Invalid or expired OTP') {
                res.status(400).json({
                    error: 'Invalid OTP',
                    message: 'The verification code is incorrect or has expired'
                });
            } else if (error.message.includes('Registration expired')) {
                res.status(404).json({
                    error: 'Registration expired',
                    message: 'Please register again'
                });
            } else {
                res.status(500).json({
                    error: 'Verification failed',
                    message: 'An error occurred during verification'
                });
            }
        }
    }


    async resendOTP(req: Request, res: Response): Promise<void> {

        try {
            const {email} = req.body;

            if (!email) {
                res.status(400).json({
                    error: 'Missing fields',
                    message: 'Email is required'
                })
            }

            const checkPending = await this.pendingRegistrationService.exists(email);

            if (!checkPending) {
                res.status(400).json({
                    error: 'Missing registration process',
                    message: 'No pending registration '
                })
            }

            await this.emailVerificationService.sendVerificationEmail(email);

            res.status(200).json({
                message: 'Verification email resent successfully',
                email: email
            });


        } catch (error: any) {


            console.error('❌ Resend OTP error:', error);

            if (error.message.includes('wait before requesting')) {
                res.status(429).json({
                    error: 'Rate limit exceeded',
                    message: 'Please wait 60 seconds before requesting another code'
                });
            } else {
                res.status(500).json({
                    error: 'Failed to resend code',
                    message: 'An error occurred while resending verification code'
                });
            }
        }


    }

    /**
     * Login Endpoint
     * POST /api/auth/login
     */
    async login(req: Request, res: Response): Promise<void> {
        try {
            const {email, password} = req.body as LoginDTO;

            // Basic input validation
            if (!email || !password) {
                res.status(400).json({
                    error: 'Missing fields',
                    message: 'Email and password are required'
                });
                return;
            }

            // Delegate to service
            const result = await this.authService.login({email, password});

            // Set authentication cookie
            this.setAuthCookie(res, result.token);

            // Format HTTP response
            res.status(200).json({
                message: 'Logged in successfully',
                user: {
                    id: result.user.id,
                    email: result.user.email,
                    username: result.user.username
                }
            });

        } catch (error: any) {
            console.error('❌ Login error:', error);

            if (error.message === 'Invalid credentials') {
                res.status(401).json({
                    error: 'Invalid credentials',
                    message: 'Email or password is incorrect'
                });
            } else if (error.message === 'Please verify your email before logging in') {
                res.status(403).json({
                    error: 'Email not verified',
                    message: error.message
                });
            } else {
                res.status(500).json({
                    error: 'Login failed',
                    message: 'An error occurred during login'
                });
            }
        }
    }

    /**
     * Logout Endpoint
     * POST /api/auth/logout
     */
    async logout(req: Request, res: Response): Promise<void> {
        try {
            const token = req.cookies[AUTH_COOKIE_NAME];

            if (!token) {
                res.status(401).json({
                    error: 'Not authenticated',
                    message: 'No token found'
                });
                return;
            }

            // Delegate to service
            await this.authService.logout(token);

            // Clear authentication cookie
            res.clearCookie(AUTH_COOKIE_NAME);

            // Format HTTP response
            res.status(200).json({
                message: 'Logged out successfully'
            });

        } catch (error: any) {
            console.error('❌ Logout error:', error);

            res.status(500).json({
                error: 'Logout failed',
                message: 'An error occurred during logout'
            });
        }
    }

    //  Request password reset
    async forgotPassword(req: Request, res: Response): Promise<void> {
        try {
            const { email } = req.body;

            if (!email) {
                res.status(400).json({
                    error: 'Email is required'
                });
                return;
            }

            await this.authService.requestPasswordReset(email);

            // Always return success (security)
            res.status(200).json({
                message: 'If that email exists, a reset link has been sent'
            });

        } catch (error) {
            console.error('❌ Forgot password error:', error);

            res.status(500).json({
                error: 'Failed to process request'
            });
        }
    }

// Reset password
    async resetPassword(req: Request, res: Response): Promise<void> {
        try {
            const { token, newPassword } = req.body;

            if (!token || !newPassword) {
                res.status(400).json({
                    error: 'Token and new password are required'
                });
                return;
            }

            await this.authService.resetPassword(token, newPassword);

            res.status(200).json({
                message: 'Password reset successful. Please login with your new password.'
            });

        } catch (error) {
            console.error('❌ Reset password error:', error);

            if (error instanceof Error) {
                res.status(400).json({
                    error: 'Password reset failed',
                    message: error.message
                });
            } else {
                res.status(500).json({
                    error: 'Internal server error'
                });
            }
        }
    }
}

export default AuthenticationController;