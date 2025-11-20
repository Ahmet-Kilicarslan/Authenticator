import express from "express";
import UserRepository from "../repositories/UserRepository.js";
import AuthenticationService from "../services/AuthenticationService.js";
import SessionService from "../services/SessionService.js";
import PasswordService from "../services/PasswordService.js";
const router = express.Router();
const sessionService = new SessionService();
const userRepository = new UserRepository();
const passwordService = new PasswordService();
const authService = new AuthenticationService(userRepository, sessionService, passwordService);
router.post("/register", async (req, res) => {
    try {
        const { username, email, password } = req.body;
        if (!username || !password || !email) {
            res.status(401).json({
                error: "missing fields"
            });
        }
        const registerData = req.body;
        const result = await authService.register(registerData);
        res.status(201).json({
            message: " User registered successfully",
            token: result.token,
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
        else
            res.status(500).json({
                error: 'Internal server error',
                message: error.message
            });
    }
});
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(401).json({
                error: 'Email and password is required',
            });
        }
        const loginData = { email, password };
        const result = await authService.login(loginData);
        res.status(200).json({
            message: " Logged in successfully",
            token: result.token,
            user: {
                id: result.user.id,
                email: result.user.email,
                username: result.user.username,
            }
        });
    }
    catch (error) {
        console.error('❌ Login error:', error);
        if (error instanceof Error) {
            res.status(401).json({
                error: 'Login failed',
                message: error.message,
            });
        }
        else
            res.status(500).json({
                error: 'Internal Server Error',
                message: error.message,
            });
    }
});
router.post("/logout", async (req, res) => {
    try {
        const authHeader = req.headers["authorization"];
        if (!authHeader) {
            res.status(401).json({
                error: 'No token provided'
            });
            return;
        }
        const token = authHeader.replace("Bearer", " ");
        if (!token) {
            res.status(401).json({
                error: 'Invalid token format'
            });
            return;
        }
        await authService.logout(token);
    }
    catch (error) {
        console.error('❌ Logout error:', error);
        if (error instanceof Error) {
            res.status(401).json({
                error: 'Logout failed',
                message: error.message,
            });
        }
        else
            res.status(500).json({
                error: 'Internal Server Error',
                message: error.message,
            });
    }
});
export default router;
//# sourceMappingURL=AuthenticationRoute.js.map