import dotenv from 'dotenv';
import type IEmailProvider from './IEmailProvider';
import ResendProvider from './ResendProvider.js'
import BrevoProvider from './BrevoProvider.js'

dotenv.config();


export default class EmailProviderFactory {


    static create(): IEmailProvider {
        const provider = process.env.EMAIL_PROVIDER || 'brevo';

        switch (provider.toLowerCase()) {
            case 'resend':
                return EmailProviderFactory.createResendProvider();
            case 'brevo':
                return EmailProviderFactory.createBrevoProvider();

            default:
                console.warn(`⚠️  Unknown email provider: ${provider}. Falling back to Brevo.`);
                return EmailProviderFactory.createBrevoProvider();

        }

    }


    private static createResendProvider(): IEmailProvider {
        const apiKey = process.env.RESEND_API_KEY;

        if (!apiKey) {
            throw new Error('Resend api key not provided');

        }
        const fromEmail = process.env.RESEND_EMAIL_FROM;

        return new ResendProvider(apiKey, fromEmail);


    }


    private static createBrevoProvider(): IEmailProvider {

        const apiKey = process.env.BREVO_API_KEY;
        const fromEmail = process.env.BREVO_EMAIL_FROM;
        const fromName = process.env.BREVO_NAME_FROM;

        if (!apiKey) {
            throw new Error('Brevo api key not provided');

        }
        if (!fromEmail) {
            throw new Error('Brevo from email not provided');
        }
        if (!fromName) {
            throw new Error('Brevo from name not provided');
        }

        return new BrevoProvider(apiKey, fromEmail, fromName);

    }


}

export const emailProvider = EmailProviderFactory.create();






