import * as brevo from '@getbrevo/brevo';
import type IEmailProvider from './IEmailProvider.js';


export default class BrevoProvider implements IEmailProvider {

    private brevoApi: brevo.TransactionalEmailsApi;
    private fromEmail: string;
    private fromName: string;

    /**
     * @param apiKey - Your Brevo API key (starts with xkeysib-)
     * @param fromEmail - Verified sender email (must be verified in Brevo dashboard)
     * @param fromName - Display name for the sender (e.g., "YourApp Team")
     */

    constructor(apiKey: string, fromEmail: string, fromName: string ) {
        // Initialize the API instance
        this.brevoApi = new brevo.TransactionalEmailsApi();

        // Set the API key directly on the instance
        // This is the modern way - much simpler than the old SDK!
        this.brevoApi.setApiKey(0, apiKey);  // 0 is the authentication method index

        this.fromEmail = fromEmail;
        this.fromName = fromName;
    }

    async sendOtpEmail(email: string,otp:string): Promise<void> {

        try{
            const sendSmtpEmail: brevo.SendSmtpEmail = {
                subject: 'Verify Your Email - OTP Code',
                to: [{ email: email }],
                sender: {
                    name: this.fromName,
                    email: this.fromEmail,
                },
                htmlContent: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <div style="background: #000; color: #fff; padding: 20px; text-align: center;">
                            <h1 style="margin: 0; font-size: 24px; letter-spacing: 2px;">EMAIL VERIFICATION</h1>
                        </div>
                        <div style="padding: 40px 20px; background: #fff; border: 3px solid #000;">
                            <p style="font-size: 16px; color: #000; margin-bottom: 20px;">
                                Your verification code is:
                            </p>
                            <div style="background: #000; color: #fff; padding: 30px; text-align: center; margin: 20px 0;">
                                <h1 style="margin: 0; font-size: 48px; letter-spacing: 12px; font-weight: 900;">
                                    ${otp}
                                </h1>
                            </div>
                            <p style="font-size: 14px; color: #666; margin-top: 20px;">
                                This code will expire in <strong>5 minutes</strong>.
                            </p>
                            <p style="font-size: 14px; color: #666;">
                                If you didn't request this code, please ignore this email.
                            </p>
                            <p style="font-size: 12px; color: #999; margin-top: 30px; font-style: italic;">
                                Powered by Brevo
                            </p>
                        </div>
                    </div>
                `
            };
            await this.brevoApi.sendTransacEmail(sendSmtpEmail);

        }catch(error:any){

            const errorMessage = error?.response?.data?.message || error?.message || 'Unknown error';
            throw new Error(`Failed to send OTP via Brevo: ${errorMessage}`);
        }

    }




}