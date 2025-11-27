import {RegisterRequest,LoginRequest,LoginResponse} from '../types/UserTypes';
import {Injectable} from '@angular/core';
import {HttpClient, HttpResponse} from '@angular/common/http';
import {Router} from '@angular/router';
import {tap, catchError} from 'rxjs/operators';
import {Observable,throwError} from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export default class AuthService {

  private apiUrl: string ="http://localhost:3000/api/auth";

  constructor(private http: HttpClient,
              private router: Router) { }


login(credentials: LoginRequest):Observable<LoginResponse>{

    return this.http.post<LoginRequest>(
      `${this.apiUrl}/login`,
      credentials,
      {withCredentials: true}).pipe(
        tap((response: any) => {


        }),catchError((error:any)=>{
        return throwError(() => error.message);

      })
    );

}

register(credentials:RegisterRequest):Observable<any>{

    return this.http.post<RegisterRequest>(
      `${this.apiUrl}/register`,
      credentials,
      {withCredentials: true}
    ).pipe(
      tap((response: any) => {



      }),catchError((error:any)=>{
        return throwError(() => error.message);
      })
    )
}


logout():Observable<any>{

    return this.http.post<void>(`${this.apiUrl}/logout`, {withCredentials: true}).pipe(
      tap((response: any) => {

      }),
      catchError((error:any)=>{
        return throwError(()=>error.message);
      })
    )

}




}

