
import type UserRepository from '../repositories/UserRepository.js';
import type OTPService from '../services/OTPService.js';

class EmailVerificationService {

    private readonly OTP_PURPOSE = "email_verification";

    constructor(private  userRepository: UserRepository,
                private  OTPService: OTPService) {}

    async sendVerificationEmail(email: string): Promise<void> {

        const user = await this.userRepository.getByEmail(email);
        if (!user) {
            throw new Error('User not found');
        }
        if(user.isVerified){
            throw new Error('User already verified');
        }

        const otp = await this.OTPService.generateAndStoreOTP(email,this.OTP_PURPOSE);

        await this.OTPService.sendOTPEmail(email,otp);


    }
    async verifyOTP(email: string,otp: string): Promise<boolean> {

        const isValid = await this.OTPService.verifyOTP(email,otp,this.OTP_PURPOSE);

        if(!isValid){
            return isValid;
        }
        await this.userRepository.markAsVerified(email);

        await this.OTPService.invalidateOTP(email,this.OTP_PURPOSE);

        return isValid;


    }


}export default EmailVerificationService;