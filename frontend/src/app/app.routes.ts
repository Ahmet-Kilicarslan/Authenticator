import {Routes} from '@angular/router';
import registerComponent from './components/register-component/register-component'
import otpComponent from './components/otp-component/otp-component'
import loginComponent from './components/login-component/login-component'
import profileComponent from './components/profile-component/profile-component'

export const routes: Routes = [

  //=============Routes==================

  {path: 'Login', component: loginComponent},
  {path: 'Register', component: registerComponent},
  {path: 'Otp', component: otpComponent},
  {path: 'Profile', component: profileComponent},


  {path: '**', redirectTo: '/Login'}
];
