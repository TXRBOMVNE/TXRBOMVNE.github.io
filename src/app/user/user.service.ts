import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { getAuth, updateEmail, updatePassword, updateProfile } from "firebase/auth";
import { forkJoin, map, take } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { SpotifyTrack } from '../models/song.model';


@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private authService: AuthService, private firestore: AngularFirestore, private http: HttpClient) { }

  currentUser = this.authService.currentUser.value

  requestUpdateProfile(email: string, username: string) {
    this.currentUser = this.authService.currentUser.value
    let emailChangePromise = updateEmail(getAuth().currentUser!, email)
    let profileChangePromise = updateProfile(getAuth().currentUser!, { displayName: username })
    return forkJoin([emailChangePromise, profileChangePromise])
  }

  requestUpdatePassword(newPassword: string) {
    return updatePassword(getAuth().currentUser!, newPassword)
  }

  getUserTabIds(uid: string) {
    return this.firestore.collection("users").doc(uid).collection("tabs").get().pipe(take(1), map(res => {
      let tabArray: string[] = []
      res.docs.forEach(tab => {
        tabArray.push(tab.ref.id)
      })
      return tabArray
    }))
  }

  getUserTabSpotifyTracks(idArray: string[], token: string) {
    let ids = idArray.join(",")
    return this.http.get<{ tracks: SpotifyTrack[] }>(`https://api.spotify.com/v1/tracks?ids=${ids}`, {
      headers: new HttpHeaders({
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      })
    }).pipe(map(res => res.tracks))
  }
}
