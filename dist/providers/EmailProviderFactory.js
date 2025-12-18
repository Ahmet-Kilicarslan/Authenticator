import dotenv from 'dotenv';
import ResendProvider from './ResendProvider.js';
import BrevoProvider from './BrevoProvider.js';
dotenv.config();
export default class EmailProviderFactory {
    static create() {
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
    static createResendProvider() {
        const apiKey = process.env.RESEND_API_KEY;
        if (!apiKey) {
            throw new Error('Resend api key not provided');
        }
        const fromEmail = process.env.RESEND_EMAIL_FROM;
        return new ResendProvider(apiKey, fromEmail);
    }
    static createBrevoProvider() {
        const apiKey = process.env.BREVO_API_KEY;
        const fromEmail = process.env.BREVO_EMAIL_FROM;
        const fromName = process.env.BREVO_NAME_FROM;
        if (!apiKey) {
            throw new Error('Brevo api key not provided');
        }
        if (!fromEmail) {
            throw new Error('Brevo fromEmail not provided');
        }
        if (!fromName) {
            throw new Error('Brevo fromName not provided');
        }
        return new BrevoProvider(apiKey, fromEmail, fromName);
    }
}
export const emailProvider = EmailProviderFactory.create();
//# sourceMappingURL=EmailProviderFactory.js.map