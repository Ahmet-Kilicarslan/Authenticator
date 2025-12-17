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
        });
        const token = await this.sessionService.createSession({
            userId: user.id,
            email: user.email,
            permissions: [],
            roles: []
        });
        return { token, user };
    }
    async login(loginDto) {
        try {
            const message = "Invalid Credentials";
            const user = await this.UserRepository.getByEmail(loginDto.email);
            if (!user) {
                new Error(message);
            }
            const notNullUser = user;
            const checkPassword = await this.passwordService.comparePassword(loginDto.password, notNullUser.password);
            if (!checkPassword) {
                new Error(message);
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