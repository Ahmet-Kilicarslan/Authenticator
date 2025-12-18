import type IEmailProvider from './IEmailProvider';
export default class EmailProviderFactory {
    static create(): IEmailProvider;
    private static createResendProvider;
    private static createBrevoProvider;
}
export declare const emailProvider: IEmailProvider;
//# sourceMappingURL=EmailProviderFactory.d.ts.map