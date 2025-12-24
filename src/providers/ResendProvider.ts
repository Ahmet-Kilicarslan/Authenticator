import {Resend} from 'resend';
import type IEmailProvider from './IEmailProvider.js';


export default class ResendProvider implements IEmailProvider {

    private resend: Resend;
    private fromEmail: string;

    constructor(apiKey: string, fromEmail: string = 'onboarding@resend.dev') {
        this.resend = new Resend(apiKey);
        this.fromEmail = fromEmail;
    }

    async sendOtpEmail(email: string, otp: string): Promise<void> {

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

        } catch (error) {
            throw new Error(`Failed to send OTP via Resend: ${error instanceof Error ? error.message : 'Unknown error'}`);

        }


    }


    async sendPasswordResetEmail(email: string, resetLink: string): Promise<void> {
        try {
            await this.resend.emails.send({
                from: this.fromEmail,
                to: email,
                subject: 'Reset Your Password',
                html: `
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
            });

            console.log('✅ Password reset email sent via Resend to:', email);

        } catch (error) {
            console.error('❌ Failed to send password reset email via Resend:', error);
            throw new Error(`Failed to send password reset email via Resend: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
}