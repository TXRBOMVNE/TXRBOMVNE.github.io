import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { first, Observable } from 'rxjs';
import { AuthService, User } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  currentUser: User | null = this.authService.currentUser.value

  constructor(private router: Router, private authService: AuthService) { }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    if (!this.currentUser) {
      this.currentUser = JSON.parse(localStorage.getItem("userAuth")!)
      this.authService.currentUser.next(this.currentUser)
    }
    if (this.currentUser) {
      this.authService.currentUser.next({ ...this.currentUser, spotifyCode: route.queryParams["code"] })
      localStorage.setItem("userAuth", JSON.stringify(this.currentUser))
      return true
    }
    return this.router.createUrlTree(["auth"])
  }
}
