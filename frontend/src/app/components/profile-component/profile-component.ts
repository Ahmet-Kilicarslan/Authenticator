import {Component, OnInit} from '@angular/core';
import {UserData} from '../../types/UserTypes';
import {Router} from '@angular/router';
import {FormsModule} from '@angular/forms';
import ProfileService from '../../services/ProfileService';

@Component({
  selector: 'app-profile-component',
  imports: [
    FormsModule
  ],
  templateUrl: './profile-component.html',
  styleUrl: './profile-component.css',
})
export default class ProfileComponent implements OnInit {



  isEditing = false;
  isSaving = false;
  isLoading = false;
  errorMessage: string = "";

  userData: UserData = {
    id:0,
    username:"",
    email:"",
    password:"",
    url:"",
    createdAt:"",
  };
  private originalUserData: UserData | null = null;

  constructor(private router:Router,
              private profileService : ProfileService) {}

  ngOnInit() {
    this.loadUserData();
  }

  loadUserData() {
     this.isLoading = true;
     this.errorMessage = "";

     this.profileService.getProfile().subscribe({
       next: (data : UserData)=>{
         this.userData = data;
         this.originalUserData = {...data};
         this.isLoading = false;
         console.log("Profile loaded",data);

       },error: (error: Error) => {

         this.errorMessage = error.message;
         this.isLoading = false;
         console.error('Failed to load profile:', error);
       }
     })

  }

  handleSave(): void {}

  handleChangePhoto(): void {}

  handleCancel(): void {}

  handleEnable2FA(): void {}
  handleChangePassword(): void {}



}
