import type UserRepository from '../repositories/UserRepository.js';
import type OTPService from '../services/OTPService.js';
declare class EmailVerificationService {
    private userRepository;
    private OTPService;
    private readonly OTP_PURPOSE;
    constructor(userRepository: UserRepository, OTPService: OTPService);
    sendVerificationEmail(email: string): Promise<void>;
    verifyOTP(email: string, otp: string): Promise<boolean>;
}
export default EmailVerificationService;
//# sourceMappingURL=EmailVerificationService.d.ts.map