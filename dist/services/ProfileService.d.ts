import type UserRepository from "../repositories/UserRepository.js";
import type { UserDTO } from '../types';
declare class ProfileService {
    private UserRepository;
    constructor(UserRepository: UserRepository);
    getUserProfile(id: number): Promise<UserDTO | null>;
}
export default ProfileService;
//# sourceMappingURL=ProfileService.d.ts.map