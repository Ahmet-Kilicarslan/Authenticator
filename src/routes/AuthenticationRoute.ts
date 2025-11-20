import express from "express";
import UserRepository from "../repositories/UserRepository";
import AuthenticationService from "../services/AuthenticationService";
import SessionService from "../services/SessionService";
import PasswordService from "../services/PasswordService";
import type {RegisterDTO,LoginDTO} from "../types";


const router = express.Router();

const sessionService = new SessionService();
const userRepository = new UserRepository();
const passwordService = new PasswordService();

const authService = new AuthenticationService(userRepository, sessionService, passwordService);

router.post("/register", async (req, res) => {
    try {
        const {username,email,password} = req.body as RegisterDTO;

        if(!username || !password ||!email){
        res.status(401).json({
            error:"missing fields"
        })
        }

        const registerData = req.body as RegisterDTO;
        const result = await authService.register(registerData);

        res.status(201).json({
            message: " User registered successfully",
            token: result.token,
            user: {
                id: result.user.id,
                email:result.user.email,
                username: result.user.username,

            },
        })

    } catch (error : any) {

        console.error('❌ Registration error:', error);

        res.status(401).json({
            error: 'Registration failed',
            message: error.message,
        })

    }

})

router.post("/login", async (req, res) => {
    try {

        const {email, password} = req.body as LoginDTO;

        if(!email || !password){
            res.status(401).json({
                error: 'Email and password is required',
            })
        }

        const loginData :LoginDTO = {email, password};

       const result =  await authService.login(loginData);
        res.status(200).json({
            message: " Logged in successfully",
            token:result.token,
            user:{
                id: result.user.id,
                email:result.user.email,
                username: result.user.username,
            }

        })


    } catch (error : any) {

        console.error('❌ Login error:', error);

        res.status(401).json({
            error: 'Login failed',
            message: error.message,
        })
    }
})


router.post("/logout", async (req, res) => {
    try{




    }catch(error : any){}
})