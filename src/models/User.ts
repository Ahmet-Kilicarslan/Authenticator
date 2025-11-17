

export default class User{
    id:number | null;
    username:string;
    email:string;
    password:string;
    isVerified:boolean;
    createdAt:Date;
    updatedAt:Date;

    constructor(
        id:number | null,
        username:string,
        email:string,
        password:string,
        isVerified:boolean,
        createdAt:Date,
        updatedAt:Date

    ){
        this.id = id;
        this.username = username;
        this.email = email;
        this.password = password;
        this.isVerified = isVerified;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

}