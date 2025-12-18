



export default interface IEmailProvider {


    sendOtpEmail(email:string ,otp:string):Promise<void>;


   // SendPasswordResetEmail(email:string,resetLink:string):Promise<void>;

}