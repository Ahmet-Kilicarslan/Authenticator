import {Resend} from 'resend';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.RESEND_API_KEY;

const resend = new Resend(apiKey);

 class EmailService {


    async sendOTPEmail(email: string, otp: string): Promise<void> {
        try {
            await resend.emails.send({
                from: 'onboarding@resend.dev',  //Resend default mail
                to: email,
                subject: 'One Time Password',
                html: `<p>Your OTP is: <strong>${otp}</strong></p>
           <p>This code will expire in 5 minutes.</p>`
            });
        } catch (error) {

            if(error instanceof Error) {
                throw new Error(`Failed to send otp: ${ error.message }`);
            }
            throw new Error(`Failed to send otp: unknown error`);
        }

    }


} export default EmailService;