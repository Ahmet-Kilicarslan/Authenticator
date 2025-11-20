import type { RegisterDTO, User, LoginDTO } from '../types';
import type UserRepository from "../repositories/UserRepository.js";
import type SessionService from "./SessionService.js";
import type PasswordService from "./PasswordService.js";
declare class AuthenticationService {
    private UserRepository;
    private sessionService;
    private passwordService;
    constructor(UserRepository: UserRepository, sessionService: SessionService, passwordService: PasswordService);
    register(registerDto: RegisterDTO): Promise<{
        token: string;
        user: User;
    }>;
    login(loginDto: LoginDTO): Promise<{
        token: string;
        user: User;
    }>;
    logout(token: string): Promise<void>;
}
export default AuthenticationService;
//# sourceMappingURL=AuthenticationService.d.ts.map