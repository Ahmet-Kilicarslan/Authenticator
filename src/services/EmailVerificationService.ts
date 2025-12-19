import type OTPService from '../services/OTPService.js';
import type IEmailProvider from '../providers/IEmailProvider.js';

class EmailVerificationService {

    private readonly OTP_PURPOSE = 'email_verification';
    private otpService: OTPService;
    private emailProvider: IEmailProvider;

    constructor(otpService: OTPService, emailProvider: IEmailProvider) {
        this.otpService = otpService;
        this.emailProvider = emailProvider;
    }

    async sendVerificationEmail(email: string): Promise<void> {



        const otp = await this.otpService.generateAndStoreOTP(email, this.OTP_PURPOSE);

        await this.emailProvider.sendOtpEmail(email, otp);


    }

    async verifyOTP(email: string, otp: string): Promise<boolean> {

        const isValid = await this.otpService.verifyOTP(email, otp, this.OTP_PURPOSE);

        if (isValid) {
            await this.otpService.invalidateOTP(email, this.OTP_PURPOSE);
        }

        return isValid;


    }


}

export default EmailVerificationService;