import type OTPService from '../services/OTPService.js';
import type IEmailProvider from '../providers/IEmailProvider.js';

class EmailVerificationService {

    private readonly OTP_PURPOSE = 'email_verification';

    constructor(private otpService:OTPService,
                private emailProvider:IEmailProvider) {
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

    async sendPasswordResetEmail(email: string,resetLink:string): Promise<void> {

        await this.emailProvider.sendPasswordResetEmail(email, resetLink);

    }


}

export default EmailVerificationService;