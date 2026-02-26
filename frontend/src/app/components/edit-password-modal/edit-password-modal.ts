import {Component, EventEmitter, Output} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {editPasswordRequest} from '../../types/UserTypes.js';

@Component({
  selector: 'app-edit-password-modal',
  imports: [
    FormsModule
  ],
  templateUrl: './edit-password-modal.html',
  styleUrl: './edit-password-modal.css',
})
export default class EditPasswordModal  {

  @Output() OnSave = new EventEmitter<any>;
  @Output() Oncancel = new EventEmitter<void>;


  isLoading: boolean = false;


  editPasswordData: editPasswordRequest = {
    oldPassword: "",
    newPassword: ""
  }


  confirmNewPassword: string = "";

  showOldPassword: boolean = false;
  showNewPassword: boolean = false;
  showConfirmNewPassword: boolean = false;

  oldPasswordError: string = "";
  newPasswordError: string = "";
  confirmNewPasswordError: string = "";




  resetForm(): void {
    this.editPasswordData.newPassword = "";
    this.editPasswordData.oldPassword = "";
    this.confirmNewPassword = "";
  }

  handleSubmit() {
    if (!this.validateMissingFields()) {
      return;
    }
    if (!this.newPasswordsNotMatch()) {
      return;
    }
      this.OnSave.emit(this.editPasswordData);

  }

  newPasswordsNotMatch():boolean {
    if (this.editPasswordData.newPassword !== this.confirmNewPassword) {
      this.confirmNewPasswordError = "Passwords don't match";
      return false;
    }
    return true;
  }


  toggleOldPassword(): void {
    this.showOldPassword = !this.showOldPassword;
  }

  toggleNewPassword(): void {
    this.showNewPassword = !this.showNewPassword;
  }

  toggleConfirmNewPassword(): void {
    this.showConfirmNewPassword = !this.showConfirmNewPassword;
  }

  onCancelClick() {
    this.resetForm();
    this.Oncancel.emit();
  }

  validateMissingFields(): boolean {

    let allValid:boolean =true;

    if (!this.editPasswordData.newPassword) {
      this.newPasswordError = "New password required";
      allValid= false;
    }
    if (!this.editPasswordData.oldPassword) {
      this.oldPasswordError = "Old password required";
      allValid= false;
    }
    if (!this.confirmNewPassword) {
      this.confirmNewPasswordError = "confirm new password";

      allValid= false;
    }

    if(!allValid){
      return false;
    }
    return true;
  }

}
