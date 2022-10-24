import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { map, Observable, take } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router, private authService: AuthService) { }
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> | UrlTree {
    const req = this.authService.loginWithRefreshToken()
    if (!req) {
      return this.router.createUrlTree(["/auth"])
    }
    return req.pipe(take(1), map(res => {
      if (!res) {
        return this.router.createUrlTree(["/auth"])
      }
      let expirationTime = +res.expires_in + new Date().getTime()
      if (route.queryParamMap.get("code")) {
        const code = route.queryParamMap.get("code")!
        this.authService.currentUser.next({
          ...this.authService.currentUser.value,
          accessToken: res.access_token,
          expirationTime,
          refreshToken: res.refresh_token,
          uid: res.user_id,
          spotify: { ...this.authService.currentUser.value?.spotify, code }
        })
        return true
      }
      this.authService.currentUser.next({
        ...this.authService.currentUser.value,
        accessToken: res.access_token,
        expirationTime,
        refreshToken: res.refresh_token,
        uid: res.user_id
      })
      return true
    }))

  }
}
