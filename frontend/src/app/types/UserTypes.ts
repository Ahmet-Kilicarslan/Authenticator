export interface RegisterRequest {
  username:string;
  email:string;
  password:string;
}

export interface LoginRequest {
  email:string;
  password:string;
}



export interface LoginResponse {

user:{
  id:number,
  username:string;
  email:string;

}
message?:string;

}

export interface UserData{
  id:number,
  username:string,
  email:string,
  password:string,
  url:string,
  createdAt:string,
}

export interface ProfileResponse {
  message: string;
  user: UserData;
}

export interface EmailVerificationRequest {
  email:string;
  otp:string;
}

export interface EmailChangeRequest{
  email:string;
}

export interface EmailChangeCompleteResponse {
  message: string;
  email: string;
}

export interface EmailChangeInitiateResponse {
  message: string;
  expiresIn: number;
}
