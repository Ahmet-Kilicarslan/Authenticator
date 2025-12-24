import {RegisterRequest, LoginRequest, LoginResponse, EmailVerificationRequest} from '../types/UserTypes';
import {Injectable} from '@angular/core';
import {HttpClient, HttpResponse} from '@angular/common/http';
import {Router} from '@angular/router';
import {tap, catchError} from 'rxjs/operators';
import {Observable, throwError} from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export default class AuthService {

  private apiUrl: string = "http://localhost:3000/api/auth";

  constructor(private http: HttpClient,
              private router: Router) {
  }



  requestPasswordReset(email:string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/forgot-password`, {email},{withCredentials:true}).pipe(
      tap((response:any)=>{
        console.log('✅ Reset email request sent:', response.message);
      }),catchError((error:any)=>{

        return throwError(() => error.message);})
    )

  }

  resetPassword(token:string,newPassword:string):Observable<any> {

    return this.http.post<any>(`${this.apiUrl}/reset-password`,{token,newPassword},{withCredentials:true}).pipe(
      tap((response:any)=>{

        console.log('✅ Password reset successful:', response.message);

      }),catchError((error:any)=>{

        return throwError(() => error.message);
      })
    )


  }


  login(credentials: LoginRequest): Observable<LoginResponse> {

    return this.http.post<LoginResponse>(
      `${this.apiUrl}/login`,
      credentials,
      {withCredentials: true}).pipe(
      tap((response: LoginResponse) => {

        console.log('Login successful', response);

      }), catchError((error: any) => {
        return throwError(() => error.message);

      })
    );

  }

  register(credentials: RegisterRequest): Observable<LoginResponse> {

    return this.http.post<LoginResponse>(
      `${this.apiUrl}/register`,
      credentials,
      {withCredentials: true}
    ).pipe(
      tap((response: LoginResponse) => {

        console.log('Registration initiated', response);


      }), catchError((error: any) => {
        return throwError(() => error.message);
      })
    )
  }

  verifyEmail(request: EmailVerificationRequest): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/verify-email`, request).pipe(
      tap((response: any) => {
        console.log("Email verified",response);
      }),
      catchError((error: any) => {
        return throwError(() => error.message);
      })
    )


  }

  resendOTP(email:string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/resend-otp`, email).pipe(
      tap((response: any) => {
        console.log("Email resend",response);
      }),catchError((error:any)=>{
        return throwError(() => error.message);
      })
    )


  }


  logout(): Observable<any> {

    return this.http.post<void>(`${this.apiUrl}/logout`, {withCredentials: true}).pipe(
      tap((response: any) => {
        console.log('Logged out');
      }),
      catchError((error: any) => {
        return throwError(() => error.message);
      })
    )

  }

  getToken(): string | null {
    return localStorage.getItem('authToken');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }


}

