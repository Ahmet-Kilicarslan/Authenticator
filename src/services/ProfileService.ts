import type UserRepository from "../repositories/UserRepository.js";
import type {UserDTO} from '../types'


class ProfileService {

    constructor(private UserRepository: UserRepository) {
    }


    async getUserProfile(id: number): Promise<UserDTO | null> {

        try{

            const user = await this.UserRepository.getUserWithProfilePicById(id);

            if(!user){
                return null;
            }

            return user;

        }catch(error){
            console.log(error);
            throw error
        }


    }


}

export default ProfileService;