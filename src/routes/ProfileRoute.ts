import express from "express";
import ProfileController from "../controllers/ProfileController.js";

const router = express.Router();

const profileController : ProfileController = new ProfileController();

router.get("/getProfile", async (req, res) => {
    return profileController.getUserProfile(req, res);
})

export default router;