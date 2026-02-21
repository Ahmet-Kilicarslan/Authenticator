import type OTPService from '../services/OTPService.js';
import type IEmailProvider from '../providers/IEmailProvider.js';

class EmailVerificationService {


    constructor(private otpService:OTPService,
                private emailProvider:IEmailProvider) {
    }

    async sendVerificationEmail(email: string,purpose:string): Promise<void> {



        const otp = await this.otpService.generateAndStoreOTP(email, purpose);

        await this.emailProvider.sendOtpEmail(email, otp);


    }

    async verifyOTP(email: string, otp: string,purpose:string): Promise<boolean> {

        const isValid = await this.otpService.verifyOTP(email, otp, purpose);

        if (isValid) {
            await this.otpService.invalidateOTP(email, purpose);
        }

        return isValid;


    }

    async sendPasswordResetEmail(email: string,resetLink:string): Promise<void> {

        await this.emailProvider.sendPasswordResetEmail(email, resetLink);

    }


}

export default EmailVerificationService;