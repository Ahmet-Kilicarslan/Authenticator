import UserRepository from "../repositories/UserRepository";
import AuthProviderRepository from "../repositories/AuthProviderRepository";
import type {AuthProviderDTO, RegisterDTO, User} from "../types";

class OauthService {

    constructor(private UserRepository: UserRepository,
                private AuthProviderRepository: AuthProviderRepository,) {
    }


    async handleOauthUser(providerUserId: string, providerName: string, username: string, email: string): Promise<User> {

        const exists = await this.AuthProviderRepository.findByProvider(providerUserId, providerName);

        if (exists) {
            const existingUser = await this.UserRepository.getById(exists.userId);
            if (!existingUser) {
                throw new Error('User not found');
            }
            return existingUser;
        }

        const existsInUsers = await this.UserRepository.getByEmail(email);

        if (existsInUsers) {

            const authProviderData:AuthProviderDTO = {
                userId: existsInUsers.id,
                providerName,
                providerUserId,
            }
            await this.AuthProviderRepository.create(authProviderData);

            return existsInUsers;
        }

         const userData :RegisterDTO = {
             username,
             email,
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
