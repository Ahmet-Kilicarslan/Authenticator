import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders, HttpResponse, HttpErrorResponse} from '@angular/common/http';
import {Router} from '@angular/router';
import {tap, catchError} from 'rxjs/operators';
import {Observable, throwError, map, of} from 'rxjs';
import {
  UserData, ProfileResponse, EmailChangeRequest, EmailChangeInitiateResponse, EmailChangeCompleteResponse,
  EmailVerificationRequest, editPasswordRequest

} from '../types/UserTypes'
import {environment} from '../../environments/environment'

@Injectable({
  providedIn: 'root'
})

export default class ProfileService {

  private apiUrl = `${environment.apiUrl}/api/profile`

  constructor(private http: HttpClient,
              private router: Router) {
  }


  editPassword(request: editPasswordRequest): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/edit-password`, request, {withCredentials: true}).pipe(
      tap(response => {

        console.log(response.message);

      }), catchError((error: HttpErrorResponse) => {

        return throwError(() => this.handleError(error));
      })
    )

  }

  getProfile(): Observable<UserData> {

    return this.http.get<ProfileResponse>(
      `${this.apiUrl}/getProfile`,
      {withCredentials: true}
    ).pipe(
      map((response: ProfileResponse) => {
        return response.user;
      }), catchError(this.handleError.bind(this))
    )

  }

  initiateEmailChange(
    request: EmailChangeRequest
  ): Observable<EmailChangeInitiateResponse> {

    return this.http.post<EmailChangeInitiateResponse>(
      `${this.apiUrl}/initiate-email-change`,
      request,
      {withCredentials: true}
    ).pipe(
      tap(response => {
        console.log('Initiate success:', response);
      }),
      catchError((error: HttpErrorResponse) => {
        return throwError(() => this.handleError(error));
      })
    );
  }

  completeEmailChange(
    request: EmailVerificationRequest
  ): Observable<EmailChangeCompleteResponse> {

    return this.http.post<EmailChangeCompleteResponse>(
      `${this.apiUrl}/complete-email-change`,
      request,
      {withCredentials: true}
    ).pipe(
      tap(response => {
        console.log('Complete success:', response);
      }),
      catchError((error: HttpErrorResponse) => {
        return throwError(() => this.handleError(error));
      })
    );
  }


  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An error occurred';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Backend error
      switch (error.status) {
        case 401:
          errorMessage = 'Not authenticated. Please login.';
          this.router.navigate(['/Login']);
          break;
        case 404:
          errorMessage = 'Profile not found';
          break;
        case 500:
          errorMessage = 'Server error. Please try again later.';
          break;
        default:
          errorMessage = error.error?.message || error.message || 'Unknown error';
      }
    }

    console.error('Profile Service Error:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }


}
