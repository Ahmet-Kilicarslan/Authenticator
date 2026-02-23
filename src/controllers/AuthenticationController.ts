import type {Request, Response} from 'express';
import type {RegisterDTO, LoginDTO,} from '../types';
import {OTP_PURPOSES} from '../utils/constants.js'
import AuthenticationService from '../services/AuthenticationService.js';
import PendingRegistrationService from '../services/PendingRegistrationService.js';
import EmailVerificationService from '../services/EmailVerificationService.js';
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


    constructor(
        private AuthenticationService: AuthenticationService,
        private EmailVerificationService: EmailVerificationService,
        private PendingRegistrationService: PendingRegistrationService,
    ) {


    }


    private setAuthCookie(res: Response, token: string): void {
        res.cookie(AUTH_COOKIE_NAME, token, AUTH_COOKIE_CONFIG);
    }


    async initiateRegister(req: Request, res: Response): Promise<void> {
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
            await this.AuthenticationService.initiateRegistration({username, email, password});

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


    async completeRegistration(req: Request, res: Response): Promise<void> {
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
            const result = await this.AuthenticationService.completeRegistration(email, otp);

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
            const {email, purpose} = req.body;

            if (!email || !purpose) {
                res.status(400).json({
                    error: 'Missing fields',
                    message: 'Email is required'
                })
                return;
            }


            if (purpose === OTP_PURPOSES.REGISTER) {
                const checkPending = await this.PendingRegistrationService.exists(email);

                if (!checkPending) {
                    res.status(400).json({
                        error: 'Missing registration process',
                        message: 'No pending registration '
                    })
                    return;
                }
            }

            await this.EmailVerificationService.sendVerificationEmail(email, purpose);

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
            const result = await this.AuthenticationService.login({email, password});

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
            await this.AuthenticationService.logout(token);

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
            const {email} = req.body;

            if (!email) {
                res.status(400).json({
                    error: 'Email is required'
                });
                return;
            }

            await this.AuthenticationService.requestPasswordReset(email);

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
            const {token, newPassword} = req.body;

            if (!token || !newPassword) {
                res.status(400).json({
                    error: 'Token and new password are required'
                });
                return;
            }

            await this.AuthenticationService.resetPassword(token, newPassword);

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