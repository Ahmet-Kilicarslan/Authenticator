import express from "express";
import ProfileController from "../controllers/ProfileController.js";
import ProfileService from '../services/ProfileService.js'
import SessionService from '../services/SessionService.js'
import UserRepository from '../repositories/UserRepository.js'
import RoleRepository from '../repositories/RoleRepository.js'
import redisClient from '../config/redis.js';
import authMiddleware from "../middlewares/AuthMiddleware.js";
import requirePermission from "../middlewares/RoleMiddleware.js"
import PasswordService from "../services/PasswordService";
import OTPService from "../services/OTPService";
import EmailVerificationService from "../services/EmailVerificationService";
import {emailProvider} from "../providers/EmailProviderFactory";
import PendingRegistrationService from "../services/PendingRegistrationService";
import AuthenticationService from "../services/AuthenticationService";

const router = express.Router();


const userRepository = new UserRepository();
const roleRepository = new RoleRepository();

// 2. Create base services (no dependencies or simple ones)
const passwordService = new PasswordService(userRepository);
const otpService = new OTPService(redisClient);
const sessionService = new SessionService(roleRepository);

// 3. Create services that depend on other services
const emailVerificationService = new EmailVerificationService(otpService, emailProvider);
const pendingRegistrationService = new PendingRegistrationService(redisClient);
const profileService = new ProfileService(userRepository,redisClient)

// 4. Create the main service
const authenticationService = new AuthenticationService(
    userRepository,
    roleRepository,
    sessionService,
    passwordService,
    profileService,
    emailVerificationService,
    pendingRegistrationService
);

const profileController = new ProfileController(
    profileService,
    sessionService,
    passwordService,
    authenticationService
);

router.get("/getProfile", authMiddleware,requirePermission("profile:view_own"), async (req, res) => {
    return profileController.getUserProfile(req, res);
})

router.post("edit-password",authMiddleware,requirePermission("profile:edit_own"),async (req,res)=>{
    return profileController.resetPasswordWithOldPassword(req,res);
})

router.post("initiate-email-change",authMiddleware,requirePermission("profile:edit_own"),async (req,res)=>{
    return profileController.initiateEmailChange(req,res);
})

router.post("complete-email-change",authMiddleware,requirePermission("profile:edit_own"),async (req,res)=>{
    return profileController.completeEmailChange(req,res);
})


export default router;