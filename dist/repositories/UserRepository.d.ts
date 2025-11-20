import type { User, RegisterDTO } from '../types';
declare class UserRepository {
    create(userData: RegisterDTO): Promise<User>;
    getById(id: number): Promise<User | null>;
    getByEmail(email: string): Promise<User | null>;
    emailExists(email: string): Promise<boolean>;
    usernameExists(username: string): Promise<boolean>;
}
export default UserRepository;
//# sourceMappingURL=UserRepository.d.ts.map