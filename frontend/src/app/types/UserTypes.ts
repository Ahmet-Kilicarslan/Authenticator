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
token:string;
message?:string;

}

export interface UserData{
  id:number,
  username:string,
  email:string,
  password:string,
  profilePicture:string,
  createdAt:string,
}
