import UserRepository from "../repositories/UserRepository";
import AuthProviderRepository from "../repositories/AuthProviderRepository";
import type {AuthProviderDTO, RegisterDTO, User} from "../types";

class OauthService {

    constructor(private UserRepository: UserRepository,
                private AuthProviderRepository: AuthProviderRepository,) {
    }


    async handleOauthUser(providerUserId: string, providerName: string, username: string, email: string): Promise<User> {

        const lowerCaseEmail:string = email.toLowerCase();

        const exists = await this.AuthProviderRepository.findByProvider(providerUserId, providerName);

        if (exists) {
            const existingUser = await this.UserRepository.getById(exists.userId);
            if (!existingUser) {
                throw new Error('User not found');
            }
            return existingUser;
        }

        const existingUser = await this.UserRepository.getByEmail(lowerCaseEmail);

        if (existingUser) {

            const authProviderData:AuthProviderDTO = {
                userId: existingUser.id,
                providerName,
                providerUserId,
            }
            await this.AuthProviderRepository.create(authProviderData);

            return existingUser;
        }

         const userData :RegisterDTO = {
             username,
             email:lowerCaseEmail,
             password: '',
         }
        const newUser = await this.UserRepository.create(userData);

        await this.AuthProviderRepository.create({
            userId: newUser.id,
            providerName,
            providerUserId,
        });

        return newUser;
    }


}

export default OauthService;
