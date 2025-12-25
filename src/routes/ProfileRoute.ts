import express from "express";
import ProfileController from "../controllers/ProfileController.js";
import authMiddleware from "../middlewares/AuthMiddleware";

const router = express.Router();

const profileController : ProfileController = new ProfileController();

router.get("/getProfile",authMiddleware, async (req, res) => {
    return profileController.getUserProfile(req, res);
})

export default router;