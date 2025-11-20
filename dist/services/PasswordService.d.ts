declare class PasswordService {
    hashPassword(password: string): Promise<string>;
    comparePassword(plainPassword: string, hashedPassword: string): Promise<boolean>;
    validateStrength(password: string): Promise<{
        strong: boolean;
        errors: string[];
    }>;
}
export default PasswordService;
//# sourceMappingURL=PasswordService.d.ts.map