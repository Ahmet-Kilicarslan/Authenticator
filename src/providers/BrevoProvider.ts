import * as brevo from '@getbrevo/brevo';
import type IEmailProvider from './IEmailProvider.js';


export default class BrevoProvider implements IEmailProvider {

    private brevoApi: brevo.TransactionalEmailsApi;
    private fromEmail: string;
    private fromName: string;



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
                subject: 'Verify Your Email ',
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
                                <h1 style="margin: 0; font-size: 42px; letter-spacing: 12px; font-weight: 900;">
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

    async sendPasswordResetEmail(email: string, resetLink: string): Promise<void> {
        try {
            const sendSmtpEmail: brevo.SendSmtpEmail = {
                subject: 'Reset Your Password',
                to: [{ email: email }],
                sender: {
                    name: this.fromName,
                    email: this.fromEmail,
                },
                htmlContent: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            line-height: 1.6;
                            color: #333;
                        }
                        .container {
                            max-width: 600px;
                            margin: 0 auto;
                            padding: 20px;
                        }
                        .header {
                            background-color: #000;
                            color: #fff;
                            padding: 20px;
                            text-align: center;
                        }
                        .content {
                            background-color: #f9f9f9;
                            padding: 30px;
                            border: 3px solid #000;
                        }
                        .button {
                            display: inline-block;
                            padding: 12px 24px;
                            background-color: #000;
                            color: #fff !important;
                            text-decoration: none;
                            font-weight: bold;
                            text-transform: uppercase;
                            border: 2px solid #000;
                            margin: 20px 0;
                        }
                        .footer {
                            text-align: center;
                            padding: 20px;
                            color: #666;
                            font-size: 12px;
                        }
                        .warning {
                            background-color: #fff;
                            border: 2px solid #000;
                            padding: 15px;
                            margin-top: 20px;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>PASSWORD RESET REQUEST</h1>
                        </div>
                        <div class="content">
                            <h2>Reset Your Password</h2>
                            <p>We received a request to reset your password. Click the button below to create a new password:</p>
                            
                            <a href="${resetLink}" class="button">RESET PASSWORD</a>
                            
                            <p>Or copy and paste this link into your browser:</p>
                            <p style="word-break: break-all; background: #fff; padding: 10px; border: 1px solid #ddd;">
                                ${resetLink}
                            </p>
                            
                            <div class="warning">
                                <p><strong>⚠️ IMPORTANT:</strong></p>
                                <ul>
                                    <li>This link will expire in <strong>15 minutes</strong></li>
                                    <li>If you didn't request this reset, please ignore this email</li>
                                    <li>Your password will remain unchanged until you create a new one</li>
                                </ul>
                            </div>
                        </div>
                        <div class="footer">
                            <p>This is an automated message, please do not reply.</p>
                            <p>&copy; ${new Date().getFullYear()} Your App Name. All rights reserved.</p>
                        </div>
                    </div>
                </body>
                </html>
            `
            };

            await this.brevoApi.sendTransacEmail(sendSmtpEmail);

            console.log('✅ Password reset email sent via Brevo to:', email);

        } catch (error: any) {
            console.error('❌ Failed to send password reset email via Brevo:', error);

            const errorMessage = error?.response?.data?.message || error?.message || 'Unknown error';
            throw new Error(`Failed to send password reset email via Brevo: ${errorMessage}`);
        }
    }



}