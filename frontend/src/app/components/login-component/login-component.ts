import {Component} from '@angular/core';
import { RouterLink, RouterLinkActive,RouterModule} from '@angular/router';
import {LoginDTO} from '../../types/UserTypes';
import {FormsModule} from '@angular/forms';

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

  loginData: LoginDTO = {
    email: "",
    password: "",

  }

  emailError: string = '';
  passwordError: string = '';

  isLoading: boolean = false;
  showPassword: boolean = false;
  use2fa: boolean = false;
  success: boolean = false;

  handleLogin() {


  }

  handleSocialLogin(site: string) {

  }

  togglePassword() {

  }

}
