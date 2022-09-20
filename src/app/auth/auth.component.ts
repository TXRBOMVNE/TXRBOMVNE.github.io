import { trigger, transition, style, animate } from '@angular/animations';
import { HttpParams } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { environment } from 'src/environments/environment';
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
  constructor(private authService: AuthService) { }
  loginMode: boolean = true
  loginForm = new FormGroup({
    email: new FormControl(null, [Validators.email, Validators.required]),
    password: new FormControl(null, [Validators.required, Validators.minLength(6), Validators.pattern('^[a-zA-Z]+$')]),
  })
  errorMessage?: string

  // Logs in or signs up an user
  requestAuth() {
    if (this.loginMode) {
      this.authService.requestLogin(this.loginForm.value)
        .then(res => {
          this.authService.currentUser.next({ refreshToken: res.user?.refreshToken, uid: res.user?.uid })
          localStorage.setItem("userAuth", JSON.stringify({ refreshToken: res.user?.refreshToken, uid: res.user?.uid }))
          this.requestSpotifyAuth()
        })
        .catch(() => {
          this.errorMessage = "Invalid Credentials"
        })
    } else {
      this.authService.requestSignUp(this.loginForm.value)
        .then(res => {
          this.authService.currentUser.next({ refreshToken: res.user?.refreshToken, uid: res.user?.uid })
          localStorage.setItem("userAuth", JSON.stringify({ refreshToken: res.user?.refreshToken, uid: res.user?.uid }))
          this.authService.createUserData(this.loginForm.value.username, res.user!.uid)
          this.requestSpotifyAuth()
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
          redirect_uri: "http://localhost:4200/play",
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
