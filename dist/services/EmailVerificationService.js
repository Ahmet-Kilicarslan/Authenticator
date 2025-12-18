class EmailVerificationService {
    userRepository;
    OTPService;
    OTP_PURPOSE = "email_verification";
    emailProvider;
    constructor(userRepository, OTPService, emailProvider) {
        this.userRepository = userRepository;
        this.OTPService = OTPService;
        this.emailProvider = emailProvider;
    }
    async sendVerificationEmail(email) {
        const user = await this.userRepository.getByEmail(email);
        if (!user) {
            throw new Error('User not found');
        }
        if (user.isVerified) {
            throw new Error('User already verified');
        }
        const otp = await this.OTPService.generateAndStoreOTP(email, this.OTP_PURPOSE);
        const result = await this.emailProvider.sendOtpEmail(email, otp);
        console.log(result);
    }
    async verifyOTP(email, otp) {
        const isValid = await this.OTPService.verifyOTP(email, otp, this.OTP_PURPOSE);
        if (!isValid) {
            return isValid;
        }
        await this.userRepository.markAsVerified(email);
        await this.OTPService.invalidateOTP(email, this.OTP_PURPOSE);
        return isValid;
    }
}
export default EmailVerificationService;
//# sourceMappingURL=EmailVerificationService.js.map