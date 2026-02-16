import {Component, OnInit} from '@angular/core';
import {UserData} from '../../types/UserTypes';
import {Router} from '@angular/router';
import {FormsModule} from '@angular/forms';
import ProfileService from '../../services/ProfileService';
import AuthService from '../../services/AuthService';

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
              private profileService : ProfileService,
              private authService:AuthService) {}

  ngOnInit() {
    this.loadUserData();
  }

  formatDate(isoString: string): string {
    if (!isoString) return 'Unknown';

    const date = new Date(isoString);

    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };

    return date.toLocaleDateString('en-US', options);
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

  handleSave(): void {


  }

  handleChangePhoto(): void {}

  handleCancel(): void {
    this.isEditing = false;
  }

  handleEnable2FA(): void {}

  handleChangePassword(): void {
  }

  handleLogout():void{

    this.authService.logout().subscribe({
      next:()=>{

        setTimeout(()=>{
          this.router.navigate(['/Login'])
        },1000);

      },error: (error:Error)=>{

        console.error("Failed to logout",error)
      }
    })

  }



}
