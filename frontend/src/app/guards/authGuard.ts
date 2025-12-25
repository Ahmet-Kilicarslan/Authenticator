import {inject} from '@angular/core';
import {Router, CanActivateFn} from '@angular/router';
import {HttpClient} from '@angular/common/http';
import {catchError, map, of} from 'rxjs';


/*
CanActivateFn => typescript type that defines a guard

authGuard will be called before activating  route
                       */

export const authGuard: CanActivateFn = (route, state) => {

  const http = inject(HttpClient);
  const router = inject(Router);
  const apiUrl: string = 'http://localhost:3000/api/profile';


  return http.get(`${apiUrl}/getProfile`, {withCredentials: true}).pipe(
    map(() => true),

    catchError(() => {

      router.navigate(['/Login']);
      return of(false);

    })
  )


}
