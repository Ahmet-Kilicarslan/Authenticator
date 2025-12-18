import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders,HttpResponse,HttpErrorResponse} from '@angular/common/http';
import {Router} from '@angular/router';
import {tap, catchError} from 'rxjs/operators';
import {Observable,throwError,map} from 'rxjs';
import {UserData,ProfileResponse} from '../types/UserTypes'

@Injectable({
  providedIn: 'root'
})

export default class ProfileService {

  private apiUrl = 'http://localhost:3000/api/profile'

  constructor(private http: HttpClient,
              private router: Router) { }



  getProfile():Observable<UserData>{

    return this.http.get<ProfileResponse>(
      `${this.apiUrl}/getProfile`,
      {withCredentials:true}
    ).pipe(
      map((response:ProfileResponse) => {
        return response.user;
      }),catchError(this.handleError.bind(this))
    )

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
