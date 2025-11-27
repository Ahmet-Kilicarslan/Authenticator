import {Component} from '@angular/core';
import {Router, RouterLink, RouterLinkActive, RouterModule} from '@angular/router';
import {LoginRequest,LoginResponse} from '../../types/UserTypes';
import {FormsModule} from '@angular/forms';
import AuthService from '../../services/AuthService';

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
export default class LoginComponent {

  loginData: LoginRequest = {
    email: "",
    password: "",

  }

  emailError: string = '';
  passwordError: string = '';

  isLoginLoading: boolean = false;
  showPassword: boolean = false;
  use2fa: boolean = false;
  success: boolean = false;


  constructor(private authService: AuthService, private router: Router) {
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
      },
      error: (error:any) => {
        this.isLoginLoading = false;
        console.error(error);
      }
    })

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


  handleSocialLogin(site: string) {

  }

  togglePassword() {

  }


}
