import {Component, OnInit} from '@angular/core';
import {UserData, EmailChangeRequest, EmailChangeInitiateResponse,editPasswordRequest} from '../../types/UserTypes';
import {Router} from '@angular/router';
import {FormsModule} from '@angular/forms';
import ProfileService from '../../services/ProfileService';
import AuthService from '../../services/AuthService';
import EditPasswordModal from '../../components/edit-password-modal/edit-password-modal'

@Component({
  selector: 'app-profile-component',
  imports: [
    FormsModule,
    EditPasswordModal
  ],
  templateUrl: './profile-component.html',
  styleUrl: './profile-component.css',
})
export default class ProfileComponent implements OnInit {


  isEditing = false;
  isSaving = false;
  isLoading = false;
  errorMessage: string = "";
  showPasswordModal:boolean =false;


  userData: UserData = {
    id: 0,
    username: "",
    email: "",
    password: "",
    url: "",
    createdAt: "",
  };
  private originalUserData: UserData | null = null;

  constructor(private router: Router,
              private profileService: ProfileService,
              private authService: AuthService) {
  }

  ngOnInit() {
    this.loadUserData();
  }

  openPasswordModal() {
    this.showPasswordModal = true;
  }

  closePasswordModal() {
    this.showPasswordModal = false;
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
      next: (data: UserData) => {
        this.userData = data;
        this.originalUserData = {...data};
        this.isLoading = false;
        console.log("Profile loaded", data);

      }, error: (error: Error) => {

        this.errorMessage = error.message;
        this.isLoading = false;
        console.error('Failed to load profile:', error);
      }
    })

  }

  handleSaveEmailChange(): void {

    const emailChangeRequest: EmailChangeRequest = {
      email: this.userData.email
    }
    if (this.isEditing) {
      this.profileService.initiateEmailChange(emailChangeRequest).subscribe({
        next: (response: EmailChangeInitiateResponse) => {

          console.log(response.message);

          setTimeout(() => {
            this.router.navigate(['/Otp'], {
              queryParams: {
                email: this.userData.email,
                purpose: 'email_change'
              }

            });
          }, 1000);


        }, error: (error: Error) => {
          this.errorMessage = error.message;
          this.isLoading = false;
          console.log("Failed to initiate email change");
        }
      })

    }


  }

  handleChangePhoto(): void {
  }

  handleCancel(): void {
    this.isEditing = false;
  }

  handleChangePassword(request:editPasswordRequest): void {
    this.profileService.editPassword(request).subscribe({
      next:(response:any)=>{
        console.log(response.message);
      },error:(error:Error)=>{

        console.log("Failed to change Password",error.message);
      }
    })

  }



  handleLogout(): void {

    this.authService.logout().subscribe({
      next: () => {

        setTimeout(() => {
          this.router.navigate(['/Login'])
        }, 1000);

      }, error: (error: Error) => {

        console.error("Failed to logout", error)
      }
    })

  }


}
