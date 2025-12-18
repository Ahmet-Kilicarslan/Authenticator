import { Resend } from 'resend';
export default class ResendProvider {
    resend;
    fromEmail;
    constructor(apiKey, fromEmail = 'onboarding@resend.dev') {
        this.resend = new Resend(apiKey);
        this.fromEmail = fromEmail;
    }
    async sendOtpEmail(email, otp) {
        try {
            await this.resend.emails.send({
                from: this.fromEmail,
                to: email,
                subject: 'Your Verification Code',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2>Email Verification</h2>
                        <p>Your verification code is:</p>
                        <h1 style="background: #000; color: #fff; padding: 20px; text-align: center; letter-spacing: 8px;">
                            ${otp}
                        </h1>
                        <p>This code will expire in 5 minutes.</p>
                        <p style="color: #666; font-size: 12px;">If you didn't request this code, please ignore this email.</p>
                    </div>
                `
            });
        }
        catch (error) {
            throw new Error(`Failed to send OTP via Resend: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
}
//# sourceMappingURL=ResendProvider.js.map