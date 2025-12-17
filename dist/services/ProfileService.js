class ProfileService {
    UserRepository;
    constructor(UserRepository) {
        this.UserRepository = UserRepository;
    }
    async getUserProfile(id) {
        try {
            const user = await this.UserRepository.getUserWithProfilePicById(id);
            if (!user) {
                return null;
            }
            return user;
        }
        catch (error) {
            console.log(error);
            throw error;
        }
    }
}
export default ProfileService;
//# sourceMappingURL=ProfileService.js.map