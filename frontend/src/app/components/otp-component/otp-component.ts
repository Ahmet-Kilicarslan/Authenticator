import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {Router, ActivatedRoute} from '@angular/router';
import {interval, Subscription} from 'rxjs';
import {EmailVerificationRequest, ResendData, OtpPurpose} from '../../types/UserTypes';
import AuthService from '../../services/AuthService.js';
import ProfileService from '../../services/ProfileService.js';

@Component({
  selector: 'app-otp-component',
  imports: [
    FormsModule
  ],
  templateUrl: './otp-component.html',
  styleUrl: './otp-component.css',
})
export default class OtpComponent implements OnInit, OnDestroy {

  emailVerificationRequest: EmailVerificationRequest = {
    email: '',
    otp: ''
  }


  purpose: string = "";


  otpError: string = "";
  isVerifying: boolean = false;
  isResending: boolean = false;

  // Timer
  timeRemaining: number = 300; // 5 minutes in seconds
  timerSubscription?: Subscription;

  // Resend cooldown
  canResend: boolean = false;
  resendCooldown: number = 60; // 60 seconds before can resend
  resendCooldownSubscription?: Subscription;

  // Success state
  verificationSuccess: boolean = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private profileService: ProfileService
  ) {
  }

  ngOnInit(): void {

    this.route.queryParams.subscribe(params => {
      this.emailVerificationRequest.email = params['email'];
      this.purpose = params['purpose'];

      if (!this.emailVerificationRequest.email) {
        console.error('No email found for verification');
        this.goBack();
        return;

      }

    })

    console.log('📧 Verifying email:', this.emailVerificationRequest.email);

    this.startExpirationTimer();

    this.startResendCooldown();
  }

  ngOnDestroy(): void {

    this.timerSubscription?.unsubscribe();
    this.resendCooldownSubscription?.unsubscribe();
  }


  handleVerifyOTP(): void {

    if (!
      this.validateOtp()
    ) {
      console.log('❌ Validation failed:', this.otpError);
      return;
    }

    this.isVerifying = true;
    this.otpError = '';

    console.log(' Verifying OTP for:', this.emailVerificationRequest.email);

    // Call verification service
    if (this.purpose === OtpPurpose.REGISTER) {
      this.authService.completeRegister(this.emailVerificationRequest).subscribe({
        next: (response: any) => {
          console.log('✅ Verification successful:', response);
          this.onVerificationSuccess();
        },
        error: (error: any) => {
          console.error('❌ Verification failed:', error);
          this.handleVerificationFailure(error);
        }
      });
    } else if (this.purpose === OtpPurpose.EMAIL_CHANGE) {
      this.profileService.completeEmailChange(this.emailVerificationRequest).subscribe({
        next: (response: any) => {
          console.log('✅ Verification successful:', response);
          this.onVerificationSuccess();
        },
        error: (error: any) => {
          console.error('❌ Verification failed:', error);
          this.handleVerificationFailure(error);
        }
      });
    }

  }


  private onVerificationSuccess(): void {
    this.isVerifying = false;
    this.verificationSuccess = true;

    // Stop timer
    this.timerSubscription?.unsubscribe();


    console.log('Email verified! Redirecting to login...');

    if (this.purpose === OtpPurpose.REGISTER) {

      setTimeout(() => {
        this.router.navigate(['/Login'], {
          queryParams: {verified: 'true'}
        });
      }, 2000);

    } else if (this.purpose === OtpPurpose.EMAIL_CHANGE) {

      setTimeout(() => {
        this.router.navigate(['/Profile'], {
          queryParams: {verified: 'true'}
        });
      }, 2000);
    }
  }


  private handleVerificationFailure(error: any): void {

    this.isVerifying = false;
    this.verificationSuccess = false;

    // Handle different error types from backend
    if (error.error?.error === 'Invalid OTP'
    ) {
      this.otpError = 'Invalid or expired code';
    } else if (error.error?.error === 'Pending data expired') {
      this.otpError = 'Pending data expired. Please register again.';

      this.goBack();

    } else if (error.status === 404) {

      this.otpError = 'Pending data not found. Please register again.';
    } else if (error.status === 429) {

      this.otpError = 'Too many attempts. Please try again later.';
    } else {
      this.otpError = error.error?.message || 'Verification failed. Please try again.';
    }

    // Clear the input on error
    this.emailVerificationRequest.otp = "";
  }


  handleResendOTP(): void {
    if (!this.canResend || this.isResending) {
      console.log('⚠️ Cannot resend yet');
      return;
    }

    this.isResending = true;
    this.otpError = '';

    const resendData: ResendData = {
      email: this.emailVerificationRequest.email,
      purpose: this.purpose
    };

    console.log('🔧 Resending verification email to:', this.emailVerificationRequest.email);

    // ✅ Call authService.resendOTP() instead of verificationService
    this.authService.resendOTP(resendData).subscribe({
      next: (response: any) => {
        console.log('✅ Verification email resent:', response);
        this.onResendSuccess();
      },
      error: (error: any) => {
        console.error('❌ Resend failed:', error);
        this.onResendFailure(error);
      }
    });
  }


  private onResendSuccess(): void {
    this.isResending = false;

    // Reset timer
    this.timerSubscription?.unsubscribe();
    this.timeRemaining = 300;  // Reset to 5 minutes
    this.startExpirationTimer();

    // Reset resend cooldown
    this.resendCooldownSubscription?.unsubscribe();
    this.resendCooldown = 60;
    this.canResend = false;
    this.startResendCooldown();

    // Clear input
    this.emailVerificationRequest.otp = "";

    console.log('✅ New verification code sent');
  }

  private onResendFailure(error: any): void {
    this.isResending = false;

    // Handle backend error responses
    if (error.status === 429 || error.error?.error === 'Rate limit exceeded'
    ) {

      this.otpError = 'Please wait 60 seconds before requesting another code';

    } else if (error.status === 404 || error.error?.error === 'Pending data not found') {

      this.otpError = 'Pending data  expired. Please register again.';

      this.goBack();

    } else {

      this.otpError = error.error?.message || 'Failed to resend code. Please try again.';

    }
  }

  private startExpirationTimer(): void {
    this.timeRemaining = 300; // Reset to 5 minutes

    this.timerSubscription = interval(1000).subscribe(() => {
      this.timeRemaining--;

      if (this.timeRemaining <= 0) {
        this.timerSubscription?.unsubscribe();
        this.otpError = 'Code expired. Please request a new one.';
        this.canResend = true;
      }
    });
  }

  private startResendCooldown(): void {
    this.resendCooldown = 60;
    this.canResend = false;

    this.resendCooldownSubscription = interval(1000).subscribe(() => {
      this.resendCooldown--;

      if (this.resendCooldown <= 0) {
        this.resendCooldownSubscription?.unsubscribe();
        this.canResend = true;
      }
    });
  }


  get formattedTime()
    :
    string {
    const minutes = Math.floor(this.timeRemaining / 60);
    const seconds = this.timeRemaining % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }


  private validateOtp(): boolean {

    this.otpError = '';

    if (!this.emailVerificationRequest.otp) {
      this.otpError = 'Please enter the verification code';
      return false;
    }


    this.emailVerificationRequest.otp = this.emailVerificationRequest.otp.replace(/\D/g, '');

    if (this.emailVerificationRequest.otp.length !== 6) {
      this.otpError = 'Code must be 6 digits';
      return false;
    }

    if (this.timeRemaining <= 0) {
      this.otpError = 'Code has expired. Please request a new one.';
      return false;
    }

    return true;
  }


  goBack(): void {

    if (this.purpose === OtpPurpose.REGISTER) {

      setTimeout(() => {
        this.router.navigate(['/Register'], {
          queryParams: {verified: 'true'}
        });
      }, 2000);

    } else if (this.purpose === OtpPurpose.EMAIL_CHANGE) {

      setTimeout(() => {
        this.router.navigate(['/Profile'], {
          queryParams: {verified: 'true'}
        });
      }, 2000);
    }
  }
}
