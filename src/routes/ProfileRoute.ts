import express from "express";
import ProfileController from "../controllers/ProfileController.js";
import ProfileService from '../services/ProfileService.js'
import SessionService from '../services/SessionService.js'
import UserRepository from '../repositories/UserRepository.js'
import RoleRepository from '../repositories/RoleRepository.js'
import authMiddleware from "../middlewares/AuthMiddleware.js";
import requirePermission from "../middlewares/RoleMiddleware.js"

const router = express.Router();

const profileController: ProfileController = new ProfileController(new ProfileService(new UserRepository()), new SessionService(new RoleRepository()));

router.get("/getProfile", authMiddleware,requirePermission("profile:view_own"), async (req, res) => {
    return profileController.getUserProfile(req, res);
})

export default router;