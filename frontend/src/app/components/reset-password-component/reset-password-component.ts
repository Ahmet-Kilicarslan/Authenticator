import { Component } from '@angular/core';
import {FormsModule} from '@angular/forms';
import {Router, RouterLink} from '@angular/router';
import AuthService from '../../services/AuthService';

@Component({
  selector: 'app-reset-password-component',
  imports: [FormsModule,RouterLink],
  templateUrl: './reset-password-component.html',
  styleUrl: './reset-password-component.css',
})
export default class ResetPasswordComponent {

  success : boolean = false;
  token: string = '';
  newPassword : string = '';
  confirmPassword : string = '';

  showConfirmPassword: boolean = false;
  showPassword : boolean = false;

  passwordError: string = '' ;
  confirmError: string = '';

  isLoading :boolean = false;

  constructor(private authService: AuthService,
              private router: Router,){}


  ngOnInit(){}

  handleSubmit(){
    this.validatePassword()

    this.isLoading = true;

    this.authService.resetPassword(this.token, this.newPassword).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        this.success = true;
        console.log('Password reset successful:', response);

        // Redirect to login after 2 seconds
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (error: any) => {
        this.isLoading = false;
        this.passwordError =  'Failed to reset password';
        console.error('Reset error:', error);
      }
    });


  }


  validatePassword(){

    this.passwordError = '';
    this.confirmError = '';

    // Validate
    if (!this.newPassword) {
      this.passwordError = 'Password is required';
      return;
    }

    if (this.newPassword.length < 6) {
      this.passwordError = 'Password must be at least 6 characters';
      return;
    }

    if (!this.confirmPassword) {
      this.confirmError = 'Please confirm your password';
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.confirmError = 'Passwords do not match';
      return;
    }


  }


  togglePassword(){
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPassword(){
    this.showConfirmPassword = !this.showConfirmPassword;
  }

}
