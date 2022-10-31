import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { getAuth, updateEmail, updatePassword, updateProfile } from 'firebase/auth';
import { forkJoin, map, take, tap } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { LoadingService } from '../extras/loading-animation/loading-animation.service';
import { SpotifyTrack } from '../models/song.model';


@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(
    private authService: AuthService,
    private firestore: AngularFirestore,
    private http: HttpClient,
    private loadingService: LoadingService) { }

  currentUser = this.authService.currentUser.value

  requestUpdateProfile(email: string, username: string) {
    this.loadingService.startLoading('UPDATING PROFILE')
    this.currentUser = this.authService.currentUser.value
    const updateFirestoreProfilePromise = this.firestore.collection('users').doc(this.currentUser?.uid).update({ displayName: username }).catch(err => {
      if (err.code === 'not-found') {
        this.firestore.collection('users').doc(this.currentUser?.uid).set({ displayName: username })
      }
    })
    const emailChangePromise = updateEmail(getAuth().currentUser!, email)
    const profileChangePromise = updateProfile(getAuth().currentUser!, { displayName: username })
    return forkJoin([emailChangePromise, profileChangePromise, updateFirestoreProfilePromise]).pipe(tap(() => this.loadingService.isLoading.next(false)))
  }

  requestUpdatePassword(newPassword: string) {
    return updatePassword(getAuth().currentUser!, newPassword)
  }

  getUserTabIds(uid: string) {
    return this.firestore.collection('users').doc(uid).collection('tabs').get().pipe(take(1), map(res => {
      let tabArray: string[] = []
      res.docs.forEach(tab => {
        tabArray.push(tab.ref.id)
      })
      return tabArray
    }))
  }

  getUserTabSpotifyTracks(idArray: string[], token: string) {
    let ids = idArray.join(',')
    return this.http.get<{ tracks: SpotifyTrack[] }>(`https://api.spotify.com/v1/tracks?ids=${ids}`, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      })
    }).pipe(map(res => res.tracks))
  }
}
