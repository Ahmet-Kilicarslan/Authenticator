import {Component} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {RouterLink} from '@angular/router';
import AuthService from '../../services/AuthService';

@Component({
  selector: 'app-forgot-password-component',
  imports: [
    FormsModule,RouterLink
  ],
  templateUrl: './forgot-password-component.html',
  styleUrl: './forgot-password-component.css',
})
export default class ForgotPasswordComponent {


  email: string = '';
  emailError: string = '';
  isLoading: boolean = false;
  success: boolean = false;

  constructor(private authService: AuthService) {
  }

  handleSubmit() {
    this.emailError = '';

    if(!this.email){
      this.emailError = 'Email is required';
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.email)) {
      this.emailError = 'Please enter a valid email';
      return;
    }

    this.isLoading = true;

    this.authService.requestPasswordReset(this.email).subscribe({
      next: (response:any) => {

        this.isLoading = false;
        this.success = true;
        console.log("Reset email sent successfully:",response);

        },error:(error:any) => {
        this.isLoading = false;
        this.success = false;
        this.emailError = 'Failed to send reset email';
        console.error('Error:', error);

      }
    })

  }


}
