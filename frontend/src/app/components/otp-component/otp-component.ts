import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {Router} from '@angular/router';
import {interval, Subscription} from 'rxjs';
import {EmailVerificationRequest} from '../../types/UserTypes';
import AuthService from '../../services/AuthService.js';

@Component({
  selector: 'app-otp-component',
  imports: [
    FormsModule
  ],
  templateUrl: './otp-component.html',
  styleUrl: './otp-component.css',
})
export default class OtpComponent implements OnInit, OnDestroy {

  request: EmailVerificationRequest = {
    email: '',
    otp: ''
  }

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
    private authService: AuthService,  // ✅ Only need authService
  ) {}

  ngOnInit(): void {
    // Get email from localStorage
    this.request.email = localStorage.getItem('pendingVerificationEmail') || '';

    if (!this.request.email) {
      // No email found, redirect back to register
      console.error('❌ No email found for verification');
      this.router.navigate(['/Register']);
      return;
    }

    console.log('📧 Verifying email:', this.request.email);

    // Start the expiration timer
    this.startExpirationTimer();

    // Start resend cooldown
    this.startResendCooldown();
  }

  ngOnDestroy(): void {
    // Clean up subscriptions
    this.timerSubscription?.unsubscribe();
    this.resendCooldownSubscription?.unsubscribe();
  }

  /**
   * Handle OTP verification
   */
  handleVerifyOTP(): void {
    // Validate input first
    if (!this.validateOtp()) {
      console.log('❌ Validation failed:', this.otpError);
      return;
    }

    this.isVerifying = true;
    this.otpError = '';

    console.log('🔧 Verifying OTP for:', this.request.email);

    // Call verification service
    this.authService.verifyEmail(this.request).subscribe({
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

  /**
   * Handle successful verification
   */
  private onVerificationSuccess(): void {
    this.isVerifying = false;
    this.verificationSuccess = true;

    // Stop timer
    this.timerSubscription?.unsubscribe();

    // Clear stored email
    localStorage.removeItem('pendingVerificationEmail');

    console.log('🎉 Email verified! Redirecting to login...');

    // Redirect to login after 2 seconds
    setTimeout(() => {
      this.router.navigate(['/Login'], {
        queryParams: { verified: 'true' }
      });
    }, 2000);
  }

  /**
   * Handle verification failure
   */
  private handleVerificationFailure(error: any): void {
    this.isVerifying = false;
    this.verificationSuccess = false;

    // Handle different error types from backend
    if (error.error?.error === 'Invalid OTP') {
      this.otpError = 'Invalid or expired code';
    } else if (error.error?.error === 'Registration expired') {
      this.otpError = 'Registration expired. Please register again.';
      // Auto-redirect to register after 3 seconds
      setTimeout(() => {
        this.router.navigate(['/Register']);
      }, 3000);
    } else if (error.status === 404) {
      this.otpError = 'Registration not found. Please register again.';
    } else if (error.status === 429) {
      this.otpError = 'Too many attempts. Please try again later.';
    } else {
      this.otpError = error.error?.message || 'Verification failed. Please try again.';
    }

    // Clear the input on error
    this.request.otp = "";
  }

  /**
   * Handle resend OTP
   */
  handleResendOTP(): void {
    if (!this.canResend || this.isResending) {
      console.log('⚠️ Cannot resend yet');
      return;
    }

    this.isResending = true;
    this.otpError = '';

    console.log('🔧 Resending verification email to:', this.request.email);

    // ✅ Call authService.resendOTP() instead of verificationService
    this.authService.resendOTP(this.request.email).subscribe({
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

  /**
   * Handle successful resend
   */
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
    this.request.otp = "";

    console.log('✅ New verification code sent');
  }

  /**
   * Handle failed resend
   */
  private onResendFailure(error: any): void {
    this.isResending = false;

    // Handle backend error responses
    if (error.status === 429 || error.error?.error === 'Rate limit exceeded') {

      this.otpError = 'Please wait 60 seconds before requesting another code';

    } else if (error.status === 404 || error.error?.error === 'Registration not found') {

      this.otpError = 'Registration expired. Please register again.';

      setTimeout(() => {
        this.router.navigate(['/Register']);

        }, 3000);

    } else {

      this.otpError = error.error?.message || 'Failed to resend code. Please try again.';

    }
  }

  /**
   * Start 5-minute expiration countdown
   */
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

  /**
   * Start 60-second resend cooldown
   */
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

  /**
   * Format time as MM:SS
   */
  get formattedTime(): string {
    const minutes = Math.floor(this.timeRemaining / 60);
    const seconds = this.timeRemaining % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  /**
   * Validate OTP input
   */
  private validateOtp(): boolean {
    this.otpError = '';

    if (!this.request.otp) {
      this.otpError = 'Please enter the verification code';
      return false;
    }

    // Remove any spaces or non-digits
    this.request.otp = this.request.otp.replace(/\D/g, '');

    if (this.request.otp.length !== 6) {
      this.otpError = 'Code must be 6 digits';
      return false;
    }

    if (this.timeRemaining <= 0) {
      this.otpError = 'Code has expired. Please request a new one.';
      return false;
    }

    return true;
  }

  /**
   * Navigate back to registration
   */
  goBack(): void {
    // Clean up before leaving
    localStorage.removeItem('pendingVerificationEmail');
    this.router.navigate(['/Register']);
  }
}
