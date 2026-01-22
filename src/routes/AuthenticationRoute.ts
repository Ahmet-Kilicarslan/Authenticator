import express from "express";
import redisClient from '../config/redis.js';
import UserRepository from "../repositories/UserRepository.js";
import RoleRepository from "../repositories/RoleRepository.js";
import AuthenticationController from "../controllers/AuthenticationController.js";
import PasswordService from "../services/PasswordService";
import OTPService from "../services/OTPService";
import SessionService from "../services/SessionService";
import EmailVerificationService from "../services/EmailVerificationService";
import PendingRegistrationService from "../services/PendingRegistrationService";
import AuthenticationService from "../services/AuthenticationService";
import { emailProvider } from '../providers/EmailProviderFactory.js';

const userRepository = new UserRepository();
const roleRepository = new RoleRepository();

// 2. Create base services (no dependencies or simple ones)
const passwordService = new PasswordService();
const otpService = new OTPService(redisClient);
const sessionService = new SessionService(roleRepository);

// 3. Create services that depend on other services
const emailVerificationService = new EmailVerificationService(otpService, emailProvider);
const pendingRegistrationService = new PendingRegistrationService(redisClient);

// 4. Create the main service
const authenticationService = new AuthenticationService(
    userRepository,
    roleRepository,
    sessionService,
    passwordService,
    emailVerificationService,
    pendingRegistrationService
);

// 5. Create controller
const authController = new AuthenticationController(
    authenticationService,
    emailVerificationService,
    pendingRegistrationService
);

const router = express.Router();

router.post("/register", async (req, res) => {
    return authController.register(req, res)
});

router.post('/verify-email', async (req, res) => {
    return authController.verifyEmail(req, res);
});

router.post("/resend-otp", async (req, res) => {
    return authController.resendOTP(req, res);
})

router.post("/login", async (req, res) => {
    return authController.login(req, res)
});


router.post("/logout", async (req, res) => {
    return authController.logout(req, res)
});

router.post("/forgot-password", async (req, res) => {
    return authController.forgotPassword(req, res)
})

router.post("/reset-password", async (req, res) => {
    return authController.resetPassword(req, res)
})

export default router;