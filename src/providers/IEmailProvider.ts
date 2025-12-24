



export default interface IEmailProvider {


    sendOtpEmail(email:string ,otp:string):Promise<void>;


    sendPasswordResetEmail(email:string,resetLink:string):Promise<void>;

}