import express from 'express';
import OAuthController from '../controllers/OAuthController.js';
import SessionService from "../services/SessionService";
import OauthService from "../services/OauthService";
import UserRepository from "../repositories/UserRepository";
import AuthProviderRepository from "../repositories/AuthProviderRepository";

const router = express.Router();

const oauthController :OAuthController = new OAuthController(new SessionService(),new OauthService(new UserRepository(),new AuthProviderRepository()));

router.get("/google" ,async (req,res)=>{
    return oauthController.initiateGoggleLogin(req,res);
})

router.get("/google/callback", async (req,res)=>{
    return oauthController.handleGoogleCallback(req,res);
})

router.get("/github", async (req,res)=>{
    return oauthController.initiateGithubLogin(req,res);
})

router.get("/github/callback", async (req,res)=>{
    return oauthController.handleGithubCallback(req,res);
})
export default router;