import type {RegisterDTO, User, LoginDTO} from '../types';
import type UserRepository from "../repositories/UserRepository.js";
import type SessionService from "./SessionService.js";
import type PasswordService from "./PasswordService.js";


class AuthenticationService {


    constructor(private UserRepository: UserRepository,
                private sessionService: SessionService,
                private passwordService: PasswordService) {

    }


    async register(registerDto: RegisterDTO): Promise<{ token: string, user: User }> {

        const emailExists = await this.UserRepository.emailExists(registerDto.email);
        if (emailExists) {
            throw new Error("Email already exists");

        }
        const uniqueName = await this.UserRepository.usernameExists(registerDto.username);
        if (uniqueName) {
            throw new Error("Username already exists");
        }
        const isPassword = await this.passwordService.validateStrength(registerDto.password);

        if (!isPassword.strong) {
            throw new Error(`Weak password: ${isPassword.errors.join(', ')}`);
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


    }

    async login(loginDto: LoginDTO): Promise<{ token: string, user: User }> {
        try {
            const message:string = "Invalid Credentials";

            const user = await this.UserRepository.getByEmail(loginDto.email);

            if (!user) {
                new Error(message);
            }

            const notNullUser: User = user as User;

            const checkPassword = await this.passwordService.comparePassword(loginDto.password, notNullUser.password);

            if (checkPassword) {
                new Error(message);
            }

            const token = await this.sessionService.createSession({
                userId: notNullUser.id,
                email: notNullUser.email,
                permissions: [],
                roles: []

            });

            return {token, user: notNullUser};


        } catch (error) {
            throw error;
        }

    }

    async logout(token: string): Promise<void> {

        await this.sessionService.destroySession(token);
    }


}


export default AuthenticationService;