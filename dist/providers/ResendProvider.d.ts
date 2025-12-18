import type IEmailProvider from './IEmailProvider.js';
export default class ResendProvider implements IEmailProvider {
    private resend;
    private fromEmail;
    constructor(apiKey: string, fromEmail?: string);
    sendOtpEmail(email: string, otp: string): Promise<void>;
}
//# sourceMappingURL=ResendProvider.d.ts.map