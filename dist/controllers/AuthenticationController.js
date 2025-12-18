import UserRepository from "../repositories/UserRepository.js";
import AuthenticationService from "../services/AuthenticationService.js";
import SessionService from "../services/SessionService.js";
import PasswordService from "../services/PasswordService.js";
import EmailVerificationService from "../services/EmailVerificationService.js";
import OTPService from "../services/OTPService.js";
import { emailProvider } from "../providers/EmailProviderFactory.js";
import redisClient from "../config/redis.js";
class AuthenticationController {
    authService;
    emailVerificationService;
    constructor() {
        // Initialize authentication services
        const userRepository = new UserRepository();
        const sessionService = new SessionService();
        const passwordService = new PasswordService();
        this.authService = new AuthenticationService(userRepository, sessionService, passwordService);
        // ✅ Initialize email verification service
        const otpService = new OTPService(redisClient);
        this.emailVerificationService = new EmailVerificationService(userRepository, otpService, emailProvider);
    }
    async register(req, res) {
        try {
            const { username, email, password } = req.body;
            if (!username || !password || !email) {
                res.status(400).json({
                    error: "missing fields"
                });
                return;
            }
            const registerData = { username, email, password };
            const result = await this.authService.register(registerData);
            let emailSent = true;
            try {
                await this.emailVerificationService.sendVerificationEmail(email);
                console.log(`✅ Verification email sent to ${email}`);
            }
            catch (emailError) {
                emailSent = false;
                console.error('❌ Failed to send verification email:', emailError);
            }
            // Cookie creation
            res.cookie('authToken', result.token, {
                httpOnly: true,
                secure: false,
                sameSite: 'lax',
                maxAge: 24 * 60 * 60 * 1000 //24 hours
            });
            // ✅ Return response with emailSent flag
            res.status(200).json({
                message: emailSent
                    ? "User registered successfully"
                    : "User registered but verification email failed to send",
                emailSent: emailSent, // ← Frontend checks this!
                user: {
                    id: result.user.id,
                    email: result.user.email,
                    username: result.user.username,
                },
            });
        }
        catch (error) {
            console.error('❌ Registration error:', error);
            if (error instanceof Error) {
                res.status(401).json({
                    error: 'Registration failed',
                    message: error.message
                });
            }
            else {
                res.status(500).json({
                    error: 'Internal server error',
                    message: error.message
                });
            }
        }
    }
    async login(req, res) {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                res.status(400).json({
                    error: "missing fields"
                });
                return;
            }
            const loginData = { email, password };
            const result = await this.authService.login(loginData);
            res.cookie('authToken', result.token, {
                httpOnly: true,
                secure: false,
                sameSite: 'lax',
                maxAge: 24 * 60 * 60 * 1000
            });
            res.status(200).json({
                message: "User logged in successfully",
                user: {
                    id: result.user.id,
                    email: result.user.email,
                    username: result.user.username,
                },
            });
        }
        catch (error) {
            console.error('❌ Login error:', error);
            if (error instanceof Error) {
                res.status(401).json({
                    error: 'login failed',
                    message: error.message
                });
            }
            else {
                res.status(500).json({
                    error: 'Internal server error',
                    message: error.message
                });
            }
        }
    }
    async logout(req, res) {
        try {
            const token = req.cookies.authToken;
            if (!token) {
                res.status(401).json({ error: 'token not found' });
                return;
            }
            await this.authService.logout(token);
            res.clearCookie('authToken');
            res.status(200).json({
                message: 'Logged out successfully'
            });
        }
        catch (error) {
            console.error('❌ Logout error:', error);
            if (error instanceof Error) {
                res.status(401).json({
                    error: 'Logout failed',
                    message: error.message,
                });
            }
            else {
                res.status(500).json({
                    error: 'Internal Server Error',
                    message: error.message,
                });
            }
        }
    }
}
export default AuthenticationController;
//# sourceMappingURL=AuthenticationController.js.map