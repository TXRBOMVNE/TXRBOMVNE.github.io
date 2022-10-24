import { animate, style, transition, trigger } from '@angular/animations';
import { HttpParams } from '@angular/common/http';
import { Component } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { catchError, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { LoadingService } from '../extras/loading-animation/loading-animation.service';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css'],
  animations: [
    trigger('appear', [
      transition(":enter", [
        style({ transform: "scaleY(0)", "transform-origin": "top", opacity: 0 }),
        animate("300ms ease-in-out", style({ transform: "scaleY(1)", opacity: 1 }))
      ]),
      transition(":leave", [
        style({ "transform-origin": "top" }),
        animate("300ms ease-in-out", style({ transform: "scaleY(0)", opacity: 0 }))
      ])
    ])
  ]
})
export class AuthComponent {
  constructor(private authService: AuthService, private loadingService: LoadingService, private fireAuth: AngularFireAuth, private router: Router) { }
  loginMode: boolean = true
  loginForm = new FormGroup({
    email: new FormControl(null, [Validators.email, Validators.required]),
    password: new FormControl(null, [Validators.required, Validators.minLength(6), Validators.pattern('^[a-zA-Z]+$')]),
  })
  errorMessage?: string

  // Logs in or signs up an user
  requestAuth() {
    this.loadingService.isLoading.next(true)
    if (this.loginMode) {
      this.authService.requestLogin(this.loginForm.value)
        .then((res: any) => {
          const user = res.user.auth.currentUser
          if (!user) return
          localStorage.setItem("auth", JSON.stringify({ refreshToken: user.refreshToken }))
          this.loadingService.isLoading.next(false)
          this.requestSpotifyAuth()
        })
        .catch(() => {
          this.errorMessage = "Invalid Credentials"
          this.loadingService.isLoading.next(false)
        })
    } else {
      this.authService.requestSignUp(this.loginForm.value)
        .then((res: any) => {
          const user = res.user.auth.currentUser
          if (!user) return
          localStorage.setItem("auth", JSON.stringify({ refreshToken: user.refreshToken }))
          this.authService.setUserProfile(this.loginForm.value.username, res.user.uid).pipe(catchError(() => {
            this.loadingService.isLoading.next(false)
            return of(null)
          })).subscribe(() => {
            this.loadingService.isLoading.next(false)
            this.requestSpotifyAuth()
          })
        })
        .catch(error => {
          switch (error.code) {
            case "auth/email-already-in-use":
              this.errorMessage = "This email is already in use"
              break;
            default:
              this.errorMessage = error.code
              break;
          }
          this.loadingService.isLoading.next(false)
        })
    }

  }

  toggleLoginMode(value: boolean) {
    this.loginMode = value
    if (!value) {
      this.loginForm.addControl("confirmPassword", new FormControl(null, [Validators.required, this.matchPasswordValidator()]))
      this.loginForm.addControl("username", new FormControl(null, Validators.required))
    } else {
      this.loginForm.removeControl("confirmPassword")
      this.loginForm.removeControl("username")
    }
  }

  private requestSpotifyAuth() {
    let authLink = `https://accounts.spotify.com/authorize?` + new HttpParams(
      {
        fromObject: {
          client_id: environment.spotify.id,
          response_type: "code",
          scope: "streaming",
          redirect_uri: "http://localhost:4200",
        }
      }
    )
    window.open(authLink, "_self")
  }

  private matchPasswordValidator(): ValidatorFn {
    return (): ValidationErrors | null => {
      const password = this.loginForm.get("password")?.value
      const confirmPassword = this.loginForm.get("confirmPassword")?.value
      if (password === confirmPassword) {
        this.errorMessage = undefined
        return null
      } else {
        if (this.loginForm.get("confirmPassword")?.dirty) {
          this.errorMessage = "Passwords don't match"
        }
        return { passwordMatches: false }
      }
    }
  }
}
