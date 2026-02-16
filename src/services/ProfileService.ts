import type UserRepository from "../repositories/UserRepository.js";
import type {RedisClient} from "../config/redis.js"
import type {UserDTO} from '../types'


class ProfileService {

    constructor(private UserRepository: UserRepository,
                private redisClient: RedisClient) {
    }

    private readonly PENDING_PREFIX = 'pending:edit';
    private readonly EXPIRY = 900;


    async getUserProfile(id: number): Promise<UserDTO | null> {

        try {

            const user = await this.UserRepository.getUserWithProfilePicById(id);

            if (!user) {
                return null;
            }

            return user;

        } catch (error) {
            console.log(error);
            throw error;
        }


    }

    async editEmail(id:number,mail:string):Promise<void>{

        const exists = await this.UserRepository.emailExists(mail);

        if(exists){
            throw new Error('This Email already exists!');
        }

        await this.UserRepository.editEmail(id,mail);

    }
    async editPassword(id:number,password:string):Promise<void>{

        await this.UserRepository.resetPassword(password,id);

    }


    //Change later
    async editBasicUserInfo(id:number,username:string):Promise<void>{

        await this.UserRepository.editUserInfoWithoutEmailJustUsernameInThisCase(id,username);


    }




    async storePendingNewEmail(id: number, newEmail:string): Promise<void> {
        const key = `${this.PENDING_PREFIX}${id}`;

        await this.redisClient.set(key, JSON.stringify(newEmail), {EX: this.EXPIRY});


    }

    async getPendingNewEmail(id:number):Promise<string | null> {

        const key =`${this.PENDING_PREFIX}${id}`;
        const data = await this.redisClient.get(key);

        if(!data){
            return null
        }

        return JSON.parse(data) as string;
    }

    async deletePendingNewEmail(id:number) {

        const key = `${this.PENDING_PREFIX}${id}`;
        await this.redisClient.del(key);

    }


}

export default ProfileService;