import {Component, OnInit} from '@angular/core';
import {Router, RouterLink, RouterLinkActive, RouterModule} from '@angular/router';
import {LoginRequest,LoginResponse} from '../../types/UserTypes';
import {FormsModule} from '@angular/forms';
import AuthService from '../../services/AuthService';
import oauthService from '../../services/OAuthService'
import OAuthService from '../../services/OAuthService';

@Component({
  selector: 'app-login-component',
  imports: [
    RouterModule,
    FormsModule,
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './login-component.html',
  styleUrl: './login-component.css',
})
export default class LoginComponent implements OnInit {

  loginData: LoginRequest = {
    email: "",
    password: "",

  }

  emailError: string = '';
  passwordError: string = '';
  loginError: string = '';

  isLoginLoading: boolean = false;
  showPassword: boolean = false;
  use2fa: boolean = false;
  success: boolean = false;


  constructor(private authService: AuthService,
              private router: Router,
              private oauthService: OAuthService) {
  }
ngOnInit() {

    const error = this.oauthService.checkForOAuthError();
    if (error) {

      console.error('❌ OAuth error:', error);
      this.passwordError = this.oauthService.getErrorMessage(error);

    }
}


  handleLogin() {

    this.isLoginLoading = true;

    if(!this.validateLogin()){
      return;
    }


    this.authService.login(this.loginData).subscribe({
      next: (data:LoginResponse) => {
        console.log("login Successful, user: ",data.user);
        this.success = true;
        setTimeout(() => {
          this.router.navigate(['/Profile']);
        }, 1500);
      },
      error: (error:any) => {
        this.isLoginLoading = false;

        this.handleLoginError(error);

        console.error(error);
      }
    })

  }
  clearLoginError() {
    this.loginError = '';
  }
  
//create error handling service later !!!!!!!!!!!!!!!!!!
  handleLoginError(error:any): void {

    this.clearLoginError();

    if (error.error?.error === 'Invalid credentials') {
      this.loginError = 'Invalid email or password. Please try again.';
    } else if (error.error?.error === 'Email not verified') {
      this.loginError = 'Please verify your email before logging in. Check your inbox for the verification code.';
    } else if (error.status === 401) {
      this.loginError = 'Invalid email or password. Please try again.';
    } else if (error.status === 403) {
      this.loginError = error.error?.message || 'Access denied. Please verify your email.';
    } else {
      this.loginError = 'Login failed. Please try again later.';
    }

  }

  private validateLogin(): boolean {

    if (!this.loginData.email) {
      this.emailError = 'Email is required';
      return false;
    }

    if (!this.loginData.password) {
      this.passwordError = 'Password is required';
      return false;
    }

    return true;
  }


  handleSocialLogin(provider: string) {
    if(provider === 'Google') {
      this.oauthService.loginWithGoogle();
    }
  }


  togglePassword() {
    this.showPassword = !this.showPassword;

  }


}
