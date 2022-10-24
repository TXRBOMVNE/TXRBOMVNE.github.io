import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { Router } from '@angular/router';
import { getAuth, signOut, updateProfile } from 'firebase/auth';
import { BehaviorSubject, catchError, map, of, take, tap } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface User {
  refreshToken?: string,
  accessToken?: string,
  uid?: string,
  spotify?: {
    code?: string,
    access_token?: string,
    refresh_token?: string,
    expires_in?: number,
    expirationTime?: number,
    scope?: "streaming",
    token_type?: "Bearer"
  },
  expiresIn?: number,
  expirationTime?: number
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private fireAuth: AngularFireAuth, private firestore: AngularFirestore, private http: HttpClient, private storage: AngularFireStorage, private router: Router) { }

  currentUser = new BehaviorSubject<User | null>(null)

  requestLogin(user: { email: string, password: string }) {
    return this.fireAuth.signInWithEmailAndPassword(user.email, user.password)
  }

  requestSignUp(user: { email: string, password: string, username: string }) {
    return this.fireAuth.createUserWithEmailAndPassword(user.email, user.password)
  }

  setUserProfile(username: string, uid: string) {
    return this.storage.ref("default_profile.png").getDownloadURL().pipe(take(1), tap(async (url) => {
      this.firestore.collection("users").doc(uid).set({ displayName: username, photoURL: url })
      const user = await this.fireAuth.currentUser
      if (!user) return
      updateProfile(user, { displayName: username, photoURL: url })
    }))
  }

  loginWithRefreshToken() {
    let refreshToken: string = localStorage.getItem("auth") ? JSON.parse(localStorage.getItem("auth")!).refreshToken : null
    if (!refreshToken) return
    return this.http.post<{ expires_in: string, refresh_token: string, access_token: string, user_id: string }>(
      `https://securetoken.googleapis.com/v1/token?key=${environment.firebase.apiKey}`,
      {
        grant_type: "refresh_token",
        refresh_token: refreshToken
      }
    ).pipe(catchError(err => {
      console.log(err)
      return of(null)
    }))
  }

  logOut() {
    localStorage.clear()
    this.currentUser.next(null)
    signOut(getAuth()).then(() => {
      this.router.navigate(["/auth"])
    })
  }

  base64Secret = btoa((environment.spotify.id + ":" + environment.spotify.secret))

  getAccessToken() {
    const spotify: User["spotify"] = (
      localStorage.getItem("spotify") &&
      JSON.parse(localStorage.getItem("spotify")!).access_token &&
      JSON.parse(localStorage.getItem("spotify")!).refresh_token) ?
      JSON.parse(localStorage.getItem("spotify")!) : this.currentUser.value?.spotify
    this.currentUser.next({ ...this.currentUser.value, spotify })
    if (!spotify?.access_token) return this.getAccessTokenWithCode()
    if (spotify.access_token) {
      if (new Date().getTime() > spotify.expirationTime!) {
        return this.getAccessTokenWithRefreshToken()
      }
      return of(spotify.access_token)
    }
    this.logOut()
    return of(null)
  }

  private getAccessTokenWithRefreshToken() {
    const refreshToken = this.currentUser.value?.spotify?.refresh_token || JSON.parse(localStorage.getItem("spotify")!).refresh_token
    if (!refreshToken) {
      console.error("Please login again");
      this.logOut()
      return of(null)
    }
    return this.http.post("https://accounts.spotify.com/api/token",
      new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refreshToken
      }).toString(),
      {
        headers: new HttpHeaders({
          'Authorization': `Basic ${this.base64Secret} `,
          'Content-Type': 'application/x-www-form-urlencoded'
        })
      }
    ).pipe(take(1), map((res: any) => {
      const expirationTime = (+res.expires_in * 1000) + new Date().getTime()
      localStorage.setItem("spotify", JSON.stringify({ ...res, expirationTime, refresh_token: refreshToken }))
      const newUser: User = { ...this.currentUser.value, spotify: { ...res, expirationTime, code: this.currentUser?.value?.spotify?.code } }
      this.currentUser.next(newUser)
      return res.access_token
    }))
  }

  private getAccessTokenWithCode() {
    const code = this.currentUser.value?.spotify?.code
    if (!code) {
      this.logOut()
      return of(null)
    }
    return this.http.post("https://accounts.spotify.com/api/token",
      new URLSearchParams({
        grant_type: "authorization_code",
        code: code!,
        redirect_uri: "http://localhost:4200"
      }).toString(),
      {
        headers: new HttpHeaders({
          'Authorization': `Basic ${this.base64Secret} `,
          'Content-Type': 'application/x-www-form-urlencoded'
        })
      }
    ).pipe(take(1), map((res: any) => {
      const expirationTime = (+res.expires_in * 1000) + new Date().getTime()
      localStorage.setItem("spotify", JSON.stringify({ ...res, expirationTime }))
      const newUser: User = { ...this.currentUser.value, spotify: { ...res, expirationTime, code: this.currentUser?.value?.spotify?.code } }
      this.currentUser.next(newUser)
      return res.access_token
    }))
  }
}
