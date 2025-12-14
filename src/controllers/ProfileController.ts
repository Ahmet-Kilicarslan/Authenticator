
import ProfileService from '../services/ProfileService.js'
import SessionService from '../services/SessionService.js'
import UserRepository from "../repositories/UserRepository.js";

import type {Request, Response} from "express";


class ProfileController {

   private ProfileService: ProfileService;
   private SessionService: SessionService;

   constructor(){
       const userRepository = new UserRepository();

       this.ProfileService = new ProfileService(
           userRepository
       )
       this.SessionService = new SessionService()


   }


    async getUserProfile(req:Request,res:Response): Promise<void> {

        try{

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




        }catch(error){

            console.error('Error fetching profile:', error);

            res.status(500).json({
                error: 'Internal server error',
                message: 'Failed to fetch user profile'
            });
        }


    }


}

export default ProfileController;