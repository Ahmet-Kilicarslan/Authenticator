import {Injectable} from '@angular/core';
import {HttpClient, HttpResponse} from '@angular/common/http';
import {Router} from '@angular/router';
import {tap, catchError, map} from 'rxjs/operators';
import {Observable, of, throwError} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export  default class OAuthService {

  private apiUrl = 'http://localhost:3000/api/oauth'
  private readonly tokenKey = 'session_token';


  constructor(private http: HttpClient,
              private router: Router) {
  }

loginWithGoogle():void {
  window.location.href = `${this.apiUrl}/google`
}



  checkForOAuthError(): string | null {
    const params = new URLSearchParams(window.location.search);
    return params.get('error');
  }




  getErrorMessage(errorCode: string): string {
    const errorMessages: Record<string, string> = {
      'google_auth_failed': 'Google login failed. Please try again.',
      'github_auth_failed': 'GitHub login failed. Please try again.',
      'google_init_failed': 'Failed to start Google login. Please try again.',
      'github_init_failed': 'Failed to start GitHub login. Please try again.',
      'invalid_state': 'Security validation failed. Please try again.',
      'no_email': 'Could not retrieve your email from the provider.',
      'no_user': 'Failed to create user account.',
      'session_failed': 'Failed to create session. Please try again.'
    };

    return errorMessages[errorCode] || 'Social login failed. Please try again.';
  }


}
