import type {RegisterDTO, User, LoginDTO} from '../types';
import type UserRepository from "../repositories/UserRepository";
import type SessionService from "./SessionService";
import type PasswordService from "./PasswordService";


class AuthenticationService {


    constructor(private UserRepository: UserRepository,
                private sessionService: SessionService,
                private passwordService: PasswordService) {

    }


    async register(registerDto: RegisterDTO): Promise<{ token: string, user: User }> {
        try {

            const emailExists = await this.UserRepository.emailExists(registerDto.email);
            if (emailExists) {
                new Error("Email already exists");

            }
            const uniqueName = await this.UserRepository.usernameExists(registerDto.username);
            if (uniqueName) {
                new Error("Username already exists");
            }
            const strongPassword = await this.passwordService.validateStrength(registerDto.password);
            if (strongPassword) {
                new Error("weak password")
            }

            const hashedPassword = await this.passwordService.hashPassword(registerDto.password);

            const user = await this.UserRepository.create({
                    username: registerDto.username,
                    email: registerDto.email,
                    password: hashedPassword
                }
            );

            const token = await this.sessionService.createSession({
                userId: user.id,
                email: user.email,
                permissions: [],
                roles: []

            });

            return {token, user};


        } catch (error) {
            throw error;
        }

    }

    async login(loginDto: LoginDTO): Promise<{ token: string, user: User }> {
        try {
            const user = await this.UserRepository.getByEmail(loginDto.email);

            if (!user) {
                new Error("Invalid email");
            }

            const notNullUser :User = user as User;

                const checkPassword = await this.passwordService.comparePassword(loginDto.password, notNullUser.password);

            if(checkPassword){
                new Error("Wrong password");
            }

            const token = await this.sessionService.createSession({
                userId: notNullUser.id,
                email: notNullUser.email,
                permissions: [],
                roles: []

            });

            return{token, user : notNullUser};



        } catch (error) {
            throw error;
        }

    }

    async logout(token: string): Promise<void> {

        await this.sessionService.destroySession(token);
    }


}


export default AuthenticationService;