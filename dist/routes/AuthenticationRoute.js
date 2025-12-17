import express from "express";
import AuthenticationController from "../controllers/AuthenticationController.js";
const router = express.Router();
const authController = new AuthenticationController();
router.post("/register", async (req, res) => {
    return authController.register(req, res);
});
router.post("/login", async (req, res) => {
    return authController.login(req, res);
});
router.post("/logout", async (req, res) => {
    return authController.logout(req, res);
});
export default router;
//# sourceMappingURL=AuthenticationRoute.js.map