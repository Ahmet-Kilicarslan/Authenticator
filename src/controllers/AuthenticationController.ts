import UserRepository from "../repositories/UserRepository.js";
import AuthenticationService from "../services/AuthenticationService.js";
import SessionService from "../services/SessionService.js";
import PasswordService from "../services/PasswordService.js";
import type {RegisterDTO, LoginDTO} from "../types";
import type {Request, Response} from "express";


class AuthenticationController {

    private authService: AuthenticationService;

    constructor() {
        // Initialize services
        const userRepository = new UserRepository();
        const sessionService = new SessionService();
        const passwordService = new PasswordService();

        this.authService = new AuthenticationService(
            userRepository,
            sessionService,
            passwordService
        );
    }


    async register(req: Request, res: Response): Promise<void> {

        try {
            const {username, email, password} = req.body as RegisterDTO;

            if (!username || !password || !email) {
                res.status(400).json({
                    error: "missing fields"
                })
                return;
            }

            const registerData: RegisterDTO = {username, email, password};
            const result = await this.authService.register(registerData);



            // Cookie creation here
            res.cookie('authToken', result.token, {
                httpOnly: true,
                secure: false,
                sameSite: 'lax',
                maxAge: 24 * 60 * 60 * 1000 //24 hours
            });

            res.status(200).json({
                message: " User registered successfully",

                user: {
                    id: result.user.id,
                    email: result.user.email,
                    username: result.user.username,

                },
            })


        } catch (error: any) {

            console.error('❌ Registration error:', error);


            if (error instanceof Error) {
                res.status(401).json({
                    error: 'Registration failed',
                    message: error.message
                })
            } else res.status(500).json({
                error: 'Internal server error',
                message: error.message
            })
        }


    }

    async login(req: Request, res: Response): Promise<void> {


        try {
            const {email, password} = req.body as LoginDTO;


            if (!email || !password) {
                res.status(400).json({
                    error: "missing fields"
                })
                return;
            }

            const loginData: LoginDTO = {email, password};
            const result = await this.authService.login(loginData);

            res.cookie('authToken', result.token, {
                httpOnly: true,
                secure: false,
                sameSite: 'lax',
                maxAge: 24 * 60 * 60 * 1000
            });


            res.status(200).json({
                message: " User logged in successfully",
                user: {
                    id: result.user.id,
                    email: result.user.email,
                    username: result.user.username,

                },
            })

        } catch (error: any) {
            console.error('❌ Login error:', error);


            if (error instanceof Error) {
                res.status(401).json({
                    error: 'login failed',
                    message: error.message
                })
            } else res.status(500).json({
                error: 'Internal server error',
                message: error.message
            })
        }


    }

    async logout(req: Request, res: Response): Promise<void> {
        try {

            const token = req.cookies.authToken;

            if (!token) {
                res.status(401).json({error: 'token not found'});
                return;
            }

            await this.authService.logout(token);

            res.clearCookie('authToken');

            res.status(200).json({
                message: 'Logged out successfully'
            });

        } catch (error: any) {

            console.error('❌ Logout error:', error);

            if (error instanceof Error) {
                res.status(401).json({
                    error: 'Logout failed',
                    message: error.message,
                })
            } else res.status(500).json({
                error: 'Internal Server Error',
                message: error.message,
            })


        }

    }


}

export default AuthenticationController;