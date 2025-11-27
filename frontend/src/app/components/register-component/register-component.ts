import { Component } from '@angular/core';
import {ReactiveFormsModule} from '@angular/forms';
import {Router, RouterLink, RouterLinkActive} from '@angular/router';
import {FormsModule} from '@angular/forms';
import {RegisterDTO} from '../../types/UserTypes'


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

  registerData: RegisterDTO = {
    username : "",
    email: "",
    password: "",
};

  emailError: string = '';
  passwordError: string = '';
  usernameError: string = '';

  isLoading: boolean = false;
  showPassword: boolean = false;

  success: boolean = false;


  handleRegister(){

  }
  togglePassword(){}

}
