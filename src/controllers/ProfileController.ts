import ProfileService from '../services/ProfileService.js'
import SessionService from '../services/SessionService.js'
import PasswordService from '../services/PasswordService.js'
import AuthenticationService from '../services/AuthenticationService.js'
import type {Request, Response} from "express";
import {AUTH_COOKIE_NAME} from "../config/cookie.js"

class ProfileController {


    constructor(
        private ProfileService: ProfileService,
        private SessionService: SessionService,
        private PasswordService: PasswordService,
        private AuthenticationService: AuthenticationService
    ) {


    }


    async getUserProfile(req: Request, res: Response): Promise<void> {

        try {

            const token = req.cookies.authToken;

            if (!token) {
                res.status(401).json({
                    error: 'Not authenticated',
                    message: 'No token provided'
                });
                return;
            }

            const session = await this.SessionService.getSession(token);

            if (!session) {
                res.status(401).json({
                    error: 'Invalid session',
                    message: 'Session expired or invalid'
                });
                return;
            }


            const userId = session.userId;

            if (!userId) {
                res.status(401).json({
                    error: 'Not authenticated',
                    message: 'Please log in to view profile'
                });
                return;
            }

            const user = await this.ProfileService.getUserProfile(userId)

            if (!user) {
                res.status(404).json({
                    error: 'User not found',
                    message: 'Profile does not exist'
                });
                return;
            }

            res.status(200).json({
                message: 'Profile fetched successfully',
                user: user
            });


        } catch (error) {

            console.error('Error fetching profile:', error);

            res.status(500).json({
                error: 'Internal server error',
                message: 'Failed to fetch user profile'
            });
        }


    }

    async resetPasswordWithOldPassword(req: Request, res: Response): Promise<void> {
        try {
            const {id, newPassword, oldPassword} = req.body;


            await this.PasswordService.resetPasswordWithOldPassword(id, newPassword, oldPassword);

            res.status(200).json({
                message: 'Password Successfully changed'
            });


        } catch (error: any) {
            console.error("Error changing Password", error);
            res.status(500).json({
                error: 'Internal Server Error',
                message: error.message
            })

        }

    }

    async initiateEmailChange(req: Request, res: Response): Promise<void> {

        try {
            const newEmail = req.body;

            const token = req.cookies[AUTH_COOKIE_NAME];

            const sessionData = await this.SessionService.getSession(token);

            if(!sessionData){
                res.status(401).json({ message: 'Invalid or expired session' });
                return;
            }
            const id = sessionData.userId;

            await this.AuthenticationService.initiateEmailChange(id,newEmail);

            res.status(200).json({
                message: `Successfully initiated email change, ${newEmail}`
            });

        } catch (error: any) {
            console.error("Error initiating email change", error);
            res.status(500).json({
                error: 'Internal Server Error',
                message: error.message
            })
        }

    }

    async completeEmailChange(req: Request, res: Response): Promise<void> {

        try {
            const { pendingEmail, otp} = req.body;


            const token = req.cookies[AUTH_COOKIE_NAME];

            const sessionData = await this.SessionService.getSession(token);

            if(!sessionData){
                res.status(401).json({ message: 'Invalid or expired session' });
                return;
            }
            const id = sessionData.userId;

            if ( !pendingEmail || !otp) {
                res.status(400).json({
                    error: "Missing required fields"
                });
                return;
            }

           const userWithUpdatedEmail= await this.AuthenticationService.completeEmailChange(id, pendingEmail, otp);

           if(!userWithUpdatedEmail) {
               res.status(400).json({
                   error: `could not complete email change, ${userWithUpdatedEmail}`

               })           }
            res.status(200).json({
                message: `Successfully completed email change, ${pendingEmail}`,
                user: userWithUpdatedEmail
            });


        } catch (error: any) {
            console.error("Error completing email change:", error);

            //  Map known business errors
            if (error.message.includes("Invalid or expired OTP")) {
                res.status(400).json({ error: error.message });
                return;
            }

            if (error.message.includes("already exists")) {
                res.status(409).json({ error: error.message });
                return;
            }

            if (error.message.includes("User not found")) {
                res.status(404).json({ error: error.message });
                return;
            }

            //  Fallback
            res.status(500).json({
                error: "Internal Server Error"
            });
        }


    }


}


export default ProfileController;