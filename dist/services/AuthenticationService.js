class AuthenticationService {
    UserRepository;
    sessionService;
    passwordService;
    constructor(UserRepository, sessionService, passwordService) {
        this.UserRepository = UserRepository;
        this.sessionService = sessionService;
        this.passwordService = passwordService;
    }
    async register(registerDto) {
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
                new Error("weak password");
            }
            const hashedPassword = await this.passwordService.hashPassword(registerDto.password);
            const user = await this.UserRepository.create({
                username: registerDto.username,
                email: registerDto.email,
                password: hashedPassword
            });
            const token = await this.sessionService.createSession({
                userId: user.id,
                email: user.email,
                permissions: [],
                roles: []
            });
            return { token, user };
        }
        catch (error) {
            throw error;
        }
    }
    async login(loginDto) {
        try {
            const user = await this.UserRepository.getByEmail(loginDto.email);
            if (!user) {
                new Error("Invalid email");
            }
            const notNullUser = user;
            const checkPassword = await this.passwordService.comparePassword(loginDto.password, notNullUser.password);
            if (checkPassword) {
                new Error("Wrong password");
            }
            const token = await this.sessionService.createSession({
                userId: notNullUser.id,
                email: notNullUser.email,
                permissions: [],
                roles: []
            });
            return { token, user: notNullUser };
        }
        catch (error) {
            throw error;
        }
    }
    async logout(token) {
        await this.sessionService.destroySession(token);
    }
}
export default AuthenticationService;
//# sourceMappingURL=AuthenticationService.js.map