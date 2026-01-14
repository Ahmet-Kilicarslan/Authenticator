import type {RegisterDTO, User, LoginDTO} from '../types';
import type UserRepository from "../repositories/UserRepository.js";
import type SessionService from "./SessionService.js";
import type PasswordService from "./PasswordService.js";
import type PendingRegistrationService from './PendingRegistrationService.js';
import type EmailVerificationService from './EmailVerificationService.js';

class AuthenticationService {



    /**   will act as orchestrator for services */

    constructor(private UserRepository: UserRepository,
                private sessionService: SessionService,
                private passwordService: PasswordService,
                private emailVerificationService: EmailVerificationService,
                private pendingRegistrationService: PendingRegistrationService,) {

    }





    async initiateRegistration(registerDto: RegisterDTO): Promise<void> {

        //===================VALIDATION=========================================*

        const lowerCaseEmail = registerDto.email.toLowerCase();

        const emailExists = await this.UserRepository.emailExists(lowerCaseEmail);
        if (emailExists) {
            throw new Error("Email already exists");

        }
        const uniqueName = await this.UserRepository.usernameExists(registerDto.username);
        if (uniqueName) {
            throw new Error("Username already exists");
        }
        const isPassword = await this.passwordService.validateStrength(registerDto.password);

        if (!isPassword.strong) {
            throw new Error(`Weak password: ${isPassword.errors.join(', ')}`);
        }


        const hashedPassword = await this.passwordService.hashPassword(registerDto.password);

        //store pending registration data and wait for email verification
        await this.pendingRegistrationService.storePending({
            username: registerDto.username,
            email: lowerCaseEmail,
            hashedPassword: hashedPassword,
            createdAt: new Date().toISOString()
        });

        await this.emailVerificationService.sendVerificationEmail(lowerCaseEmail);

    }

    async resendVerificationEmail(email: string): Promise<void> {

        await this.emailVerificationService.sendVerificationEmail(email);

    }


    async completeRegistration(email: string, otp: string): Promise<{ token: string, user: User }> {

        const isValid = await this.emailVerificationService.verifyOTP(email, otp);

        if (!isValid) {
            throw new Error("Invalid or expired OTP");
        }


        // get pending registration data from redis
        const pendingData = await this.pendingRegistrationService.getPending(email);

        if (!pendingData) {

            throw new Error('Registration expired. Please register again.');
        }

        //  create user in database (is_verified = false by default!)
        const user = await this.UserRepository.create({
            username: pendingData.username,
            email: pendingData.email,
            password: pendingData.hashedPassword // Already hashed
        });

        // Mark as verified immediately
        await this.UserRepository.markAsVerified(email);

        // Create session token
        const token = await this.sessionService.createSession({
            userId: user.id,
            email: user.email,
            permissions: [],
            roles: []
        });

        // Clean up: Delete pending registration from Redis
        await this.pendingRegistrationService.deletePending(email);

        return {token, user};

    }

    async login(loginDto: LoginDTO): Promise<{ token: string, user: User }> {

        // Get user from database
        const user = await this.UserRepository.getByEmail(loginDto.email);

        if (!user) {
            throw new Error('Invalid credentials');
        }

        // Verify password
        const passwordValid = await this.passwordService.comparePassword(
            loginDto.password,
            user.password
        );

        if (!passwordValid) {
            throw new Error('Invalid credentials');
        }

        // Business rule: User must verify email before logging in
        if (!user.isVerified) {
            throw new Error('Please verify your email before logging in');
        }

        // Create session token
        const token = await this.sessionService.createSession({
            userId: user.id,
            email: user.email,
            permissions: [],
            roles: []
        });

        return {token, user};


    }

    async logout(token: string): Promise<void> {

        await this.sessionService.destroySession(token);
    }


    async requestPasswordReset(email: string): Promise<void> {

        try{

            const user = await this.UserRepository.getByEmail(email);

            if (!user) {
                 return;
            }

            const resetLink = await this.passwordService.generateResetLink(user.id);


            await this.emailVerificationService.sendPasswordResetEmail(email, resetLink);


        }catch(error){
            console.error('Failed to send password reset:', error);
            throw new Error('Failed to process password reset request');
        }




    }

    async resetPassword(token: string,newPassword:string): Promise<void> {
        try{
            const userId = await this.passwordService.validateResetToken(token);
            if (!userId) {
                throw new Error('Invalid  or expired token');
            }

            const validPassword = await this.passwordService.validateStrength(newPassword);

            if (!validPassword) {
                throw new Error('weak password');
            }

            const hashedPassword = await this.passwordService.hashPassword(newPassword);

            await this.UserRepository.resetPassword(hashedPassword,userId);

            await this.passwordService.invalidateResetToken(token);


        }catch(error){
            console.error('Failed to reset password:', error);
            throw error;
        }
    }


}


export default AuthenticationService;