import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders, HttpResponse, HttpErrorResponse} from '@angular/common/http';
import {Router} from '@angular/router';
import {tap, catchError} from 'rxjs/operators';
import {Observable, throwError, map} from 'rxjs';
import {EmailVerificationRequest} from '../types/UserTypes';


@Injectable({
  providedIn: 'root'
})


export default class VerificationService {

  private apiUrl = 'http://localhost:3000/api/verify';

  constructor(private http: HttpClient,
              private router: Router) {
  }


  sendEmailVerification(email: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/send-verification`, {email}).pipe(
      tap((response: any) => {
        console.log(response);
      }),
      catchError((error: any) => {
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

}
