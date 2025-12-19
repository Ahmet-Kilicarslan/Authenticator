import express from "express";

import AuthenticationController from "../controllers/AuthenticationController.js";

const router = express.Router();
const authController: AuthenticationController = new AuthenticationController();

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

export default router;