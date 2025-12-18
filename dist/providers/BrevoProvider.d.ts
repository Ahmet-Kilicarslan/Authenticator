import type IEmailProvider from './IEmailProvider.js';
export default class BrevoProvider implements IEmailProvider {
    private brevoApi;
    private fromEmail;
    private fromName;
    constructor(apiKey: string, fromEmail: string, fromName: string);
    sendOtpEmail(email: string, otp: string): Promise<void>;
}
//# sourceMappingURL=BrevoProvider.d.ts.map