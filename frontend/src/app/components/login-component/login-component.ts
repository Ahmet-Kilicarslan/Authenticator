import {Component} from '@angular/core';
import {Router} from '@angular/router';
import {LoginDTO} from '../../types/UserTypes';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-login-component',
  imports: [
    FormsModule
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
  rememberMe: boolean = false;

  handleLogin() {


  }

  handleSocialLogin(site: string) {

  }

  togglePassword() {

  }

}
