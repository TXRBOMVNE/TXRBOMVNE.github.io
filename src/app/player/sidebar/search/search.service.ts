import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { map, switchMap, take } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import { TabGroup } from 'src/app/models/song.model';

@Injectable({
  providedIn: 'root'
})
export class SearchService {

  constructor(private http: HttpClient, private authService: AuthService, private firestore: AngularFirestore) { }

  currentUser = this.authService.currentUser.value

  getAccessToken() {
    this.currentUser = this.authService.currentUser.value
    const req = this.authService.getAccessToken()
    req.pipe(take(1)).subscribe(token => this.currentUser!.accessToken = token)
    return req
  }

  searchTracks(query: string) {
    return this.http.get(`https://api.spotify.com/v1/search?q=${query}&type=track`, {
      headers: new HttpHeaders({
        Authorization: `Bearer ${this.currentUser?.spotify?.access_token}`,
        "Content-Type": "application/json"
      })
    }).pipe(take(1))
  }

  searchTabs(trackId: string) {
    return this.firestore.collection("tracks").doc(trackId).collection("tabs").get().pipe(map(searchResult => {
      const tabGroupArray: TabGroup[] = []
      searchResult.docs.forEach(doc => tabGroupArray.push(doc.data() as TabGroup))
      tabGroupArray.forEach(tab => {
        const uid = tab.uid
        this.firestore.collection('users').doc(uid).get().pipe(take(1)).subscribe(userData => {
          if (!userData.data()) return
          const user: { tabs: TabGroup[], displayName: string, photoURL: string } = userData.data() as any
          if (tabGroupArray.findIndex(tabGroup => tabGroup.uid === uid) !== -1) {
            tabGroupArray[tabGroupArray.findIndex(tabGroup => tabGroup.uid === uid)].authorDisplayName = user.displayName
          }
        })
      })
      tabGroupArray.sort((a, b) => {
        return a.createdAt - b.createdAt
      })
      return tabGroupArray
    }))
  }
}
