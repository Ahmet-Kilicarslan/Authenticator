import express from 'express';
import OAuthController from '../controllers/OAuthController.js';
import SessionService from "../services/SessionService";
import UserRepository from "../repositories/UserRepository";


const router = express.Router();

const oauthController :OAuthController = new OAuthController(new SessionService(),new UserRepository());

router.get("/google" ,async (req,res)=>{
    return oauthController.initiateGoggleLogin(req,res);
})

router.get("/google/callback", async (req,res)=>{
    return oauthController.handleGoogleCallback(req,res);
})

export default router;