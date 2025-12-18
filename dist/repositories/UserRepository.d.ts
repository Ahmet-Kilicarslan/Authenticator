import type { User, RegisterDTO, UserDTO } from '../types';
declare class UserRepository {
    create(userData: RegisterDTO): Promise<User>;
    getById(id: number): Promise<User | null>;
    getByEmail(email: string): Promise<User | null>;
    emailExists(email: string): Promise<boolean>;
    usernameExists(username: string): Promise<boolean>;
    getUserWithProfilePicById(id: number): Promise<UserDTO | null>;
    markAsVerified(email: string): Promise<boolean>;
    resetPassword(password: string, email: string): Promise<void>;
}
export default UserRepository;
//# sourceMappingURL=UserRepository.d.ts.map