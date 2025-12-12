import {Component, OnInit} from '@angular/core';
import {UserData} from '../../types/UserTypes';
import {Router} from '@angular/router';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-profile-component',
  imports: [
    FormsModule
  ],
  templateUrl: './profile-component.html',
  styleUrl: './profile-component.css',
})
export default class ProfileComponent implements OnInit {

  defaultPP:string ="" ;

  isEditing = false;
  isSaving = false;

  userData: UserData = {
    id:0,
    username:"",
    email:"",
    password:"",
    profilePicture:this.defaultPP,
    createdAt:"",
  };


  constructor(private router:Router) {}

  ngOnInit() {
    this.loadUserData();
  }

  loadUserData() {}

  handleSave(): void {}

  handleChangePhoto(): void {}

  handleCancel(): void {}

  handleEnable2FA(): void {}
  handleChangePassword(): void {}



}
