import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { map, take } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import { TabGroup } from 'src/app/models/song.model';

@Injectable({
  providedIn: 'root'
})
export class SearchService {

  constructor(private http: HttpClient, private authService: AuthService, private firestore: AngularFirestore) { }

  currentUser = this.authService.currentUser.value

  searchTracks(query: string) {
    this.currentUser = this.authService.currentUser.value
    return this.http.get(`https://api.spotify.com/v1/search?q=${query}&type=track`, {
      headers: new HttpHeaders({
        Authorization: `Bearer ${this.currentUser?.spotify?.access_token}`,
        "Content-Type": "application/json"
      })
    }).pipe(take(1))
  }

  searchTabs(trackId: string) {
    return this.firestore.collection("tracks").doc(trackId).collection("tabs").get().pipe(map(searchResult => {
      const tabGroupArray = searchResult.docs
      const usernameArray: string[] = []
      tabGroupArray.forEach(tab => {
        this.firestore.collection('users').doc(tab.data()!['uid']).get().pipe(take(1)).subscribe(userData => {
          if (!userData.data()) return
          const user: { tabs: TabGroup[], displayName: string, photoURL: string } = userData.data() as any
          usernameArray.push(user.displayName)
        })
      })
      return { tabGroupArray, usernameArray }
    }))
  }
}
