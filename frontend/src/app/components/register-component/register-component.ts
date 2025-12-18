import {Component} from '@angular/core';
import {ReactiveFormsModule} from '@angular/forms';
import {Router, RouterLink, RouterLinkActive} from '@angular/router';
import {FormsModule} from '@angular/forms';
import {RegisterRequest, LoginResponse} from '../../types/UserTypes'
import AuthService from '../../services/AuthService';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';


@Component({
  selector: 'app-register-component',
  imports: [
    ReactiveFormsModule,
    FormsModule,
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './register-component.html',
  styleUrl: './register-component.css',
})
export default class RegisterComponent {

  registerData: RegisterRequest = {
    username: "",
    email: "",
    password: "",
  };

  emailError: string = '';
  passwordError: string = '';
  usernameError: string = '';

  isRegisterLoading: boolean = false;
  showPassword: boolean = false;

  success: boolean = false;

  constructor(private authService: AuthService,
              private http: HttpClient,
              private router: Router) {
  }


  handleRegister() {
    this.isRegisterLoading = true;

    if (!this.validateRegister()) {
      return;

    }
    this.authService.register(this.registerData).subscribe({

      next: (data: LoginResponse) => {
        this.isRegisterLoading = false;

        if (data.user) {
          console.log("Registration successful user:", data.user);
        }
        this.success = true;
        localStorage.setItem('pendingVerificationEmail', this.registerData.email);

        setTimeout(() => {
          this.router.navigate(['/Otp']);
        }, 1000);


      },
      error: (error: any) => {

        this.isRegisterLoading = false;
        console.error(error);
      }
    })

  }

  private validateRegister(): boolean {
    if (!this.registerData.username) {
      this.usernameError = 'Username is required';
      return false;
    }
    if (!this.registerData.email) {
      this.emailError = 'Email is required';
      return false;
    }
    if (!this.registerData.password) {
      this.passwordError = 'Password is required';
      return false;
    }

    return true;

  };

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

}
