import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreDocument, DocumentData, QueryDocumentSnapshot } from '@angular/fire/compat/firestore';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, catchError, map, of, Subject, take } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { LoadingService } from '../extras/loading-animation/loading-animation.service';
import { Bar, initialSong, Instrument, Segment, SpotifyTrack, Tab, TabGroup } from '../models/song.model';

@Injectable({
  providedIn: 'root'
})
export class PlayerService {
  constructor(
    private firestore: AngularFirestore,
    private authService: AuthService,
    private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router,
    private loadingService: LoadingService) { }
  currentUser = this.authService.currentUser.value
  currentTab = new BehaviorSubject<Tab | null>(null)
  currentTabIndex = new BehaviorSubject<number | null>(null)
  currentTabGroup = new BehaviorSubject<TabGroup | null>(null)
  currentSpotifyTrack = new BehaviorSubject<SpotifyTrack | null>(null)
  changingTrack = new Subject<null>()
  editMode = new Subject<boolean>()

  saveTabToUser(trackId: string) {
    this.currentUser = this.authService.currentUser.value
    if (!this.currentUser || !this.currentTab.value) return
    this.removeFillerNotes()
    const tabArray: Tab[] = []
    this.currentTabGroup.value?.tabs.forEach(tab => tabArray.push(JSON.parse(JSON.stringify(tab))))
    return this.firestore.collection('users').doc(this.currentUser.uid).collection('tabs').doc(trackId).set(<TabGroup>{
      tabs: tabArray,
      uid: this.currentUser.uid,
      trackId,
    })
  }

  postTab(trackId: string) {
    this.currentUser = this.authService.currentUser.value
    if (!this.currentUser || !this.currentTab.value) return
    this.removeFillerNotes()
    const tabArray: Tab[] = []
    this.currentTabGroup.value?.tabs.forEach(tab => tabArray.push(JSON.parse(JSON.stringify(tab))))
    return this.firestore.collection('tracks').doc(trackId).collection('tabs').add(<TabGroup>{
      tabs: tabArray,
      uid: this.currentUser.uid,
      trackId,
      createdAt: new Date().getTime()
    })
  }

  loadTab(trackId: string, tabGroupIndex: number, isCustom?: boolean) {
    this.loadingService.isLoading.next(true)
    const { uid } = this.authService.currentUser.value!
    // Sets if the tab is public or private
    const isCustomParam = isCustom || this.route.snapshot.queryParamMap.get('isCustom') === 'true'
    // Emits value to let the app know if the song is changing
    this.currentSpotifyTrack.next(null)
    if (!uid) return
    // Gets track info from the Spotify API
    this.getCurrentSpotifyTrack(trackId)
    return this.getTabGroup(trackId, tabGroupIndex, isCustomParam)
  }

  private getTabGroup(trackId: string, tabGroupIndex: number, isCustomParam?: boolean) {
    let firestoreReq = this.firestore.collection('tracks').doc(trackId).collection('tabs') as unknown as AngularFirestoreDocument<DocumentData>
    // Changes request depending if the tab is public
    if (isCustomParam) {
      firestoreReq = this.firestore.collection('users').doc(this.currentUser!.uid).collection('tabs').doc(trackId)
    }
    // Emits value of new tab group and sets the first tab as current tab
    return firestoreReq.get().pipe(map((tabData: any): boolean => {
      this.loadingService.isLoading.next(false)
      // The actual type of 'tabData' is QuerySnapshot<TabGroup> or DocumentSnapshot<TabGroup>
      const tabExists: boolean = (tabData.exists) || (!tabData.empty && tabData.empty !== undefined)
      let tabArray: Tab[]
      if (!tabData || !tabExists) return false
      let tabGroup: TabGroup
      if (isCustomParam) {
        tabGroup = tabData.data()
        tabArray = tabGroup['tabs']
      } else if (tabData.docs[tabGroupIndex]) {
        let sortedTabGroups: TabGroup[] = []
        tabData.docs.forEach((doc: QueryDocumentSnapshot<TabGroup>) => {
          sortedTabGroups.push(doc.data())
        })
        sortedTabGroups.sort((a, b) => {
          return a.createdAt - b.createdAt
        })
        tabGroup = sortedTabGroups[tabGroupIndex]
        tabArray = tabGroup['tabs']
      } else return false
      if (!tabData || !tabArray || tabArray.length === 0) return false
      this.currentTabGroup.next(tabGroup)
      this.currentTabIndex.next(0)
      this.currentTab.next(this.parseTab(tabArray[0]))
      return tabExists
    }))
  }

  changeTab(tab: Tab) {
    const index = this.currentTabGroup.value?.tabs.indexOf(tab)!
    if (index === -1) {
      console.error('NO TAB WITH -1 INDEX')
      return
    } else if (index === this.currentTabIndex.value) {
      return
    }
    this.currentTabIndex.next(index)
    this.currentTab.next(this.parseTab(this.currentTabGroup.value?.tabs[index]!))
  }

  createTab(trackId: string) {
    if (!this.currentUser) return
    return this.firestore.collection('users').doc(this.currentUser.uid).collection('tabs').doc(trackId).set(<TabGroup>{
      tabs: [JSON.parse(JSON.stringify(<Tab>{ ...initialSong }))],
      uid: this.currentUser.uid,
      trackId,
      createdAt: new Date().getTime()
    })
  }
  addInstrument(instrument: Instrument) {
    this.currentUser = this.authService.currentUser.value
    const tabArray: Tab[] = []
    this.currentTabGroup.value?.tabs.forEach(tab => tabArray.push(JSON.parse(JSON.stringify(tab))))
    tabArray.push(JSON.parse(JSON.stringify(<Tab>{ ...initialSong, instrument, initialTempo: this.currentTab.value?.initialTempo })))
    return this.firestore.collection('users').doc(this.currentUser!.uid).collection('tabs').doc(this.currentSpotifyTrack.value?.id).update(
      <TabGroup>{
        tabs: tabArray,
        uid: this.currentUser!.uid,
        trackId: this.currentSpotifyTrack.value?.id,
      }
    ).catch(() => this.loadingService.isLoading.next(false)).then(() => {
      this.loadingService.startLoading(`Getting a new ${instrument.name.replace('-', ' ')}`)
      const tabRequest = this.getTabGroup(this.currentSpotifyTrack.value?.id!, 0, true)
      tabRequest.subscribe(
        {
          next: () => {
            this.loadingService.isLoading.next(false)
          }, error: err => {
            console.log(err)
            this.loadingService.isLoading.next(false)
          }
        }
      )
    })
  }

  deleteTab() {
    this.loadingService.startLoading('THROWING AWAY TAB')
    this.currentUser = this.authService.currentUser.value
    if (!this.currentTabIndex.value && this.currentTabIndex.value !== 0) {
      console.log('Try again')
      return of(null)
    }
    const { uid } = this.currentUser!
    const { id } = this.currentSpotifyTrack.value!
    const tabArray = this.currentTabGroup.value?.tabs.slice()!
    tabArray.splice(this.currentTabIndex.value!, 1)
    const newTabArray: Tab[] = []
    tabArray.forEach(tab => newTabArray.push(JSON.parse(JSON.stringify(tab))))
    return this.firestore.collection('users').doc(this.currentUser!.uid).collection('tabs').doc(id).set(<TabGroup>{
      tabs: newTabArray,
      uid: uid,
      trackId: id,
    }).then(() => {
      this.loadingService.isLoading.next(false)
      this.getTabGroup(id, 0, true).subscribe(
        {
          next: () => {
            this.loadingService.isLoading.next(false)
          }, error: err => {
            console.log(err)
            this.loadingService.isLoading.next(false)
          }
        }
      )
    }).catch(() => this.loadingService.isLoading.next(false))
  }

  removeFillerNotes() {
    console.log(this.currentTabGroup.value)
    let newTabGroup: TabGroup = this.currentTabGroup.value!
    newTabGroup.tabs.forEach(tab => {
      tab.bars.forEach(bar => {
        bar.segments.forEach(segment => {
          let notes = segment.notes.filter(note => note.fretValue || note.fretValue === 0)
          segment.notes = notes
        })
      })
    })
    this.currentTabGroup.next(newTabGroup)
  }

  private getCurrentSpotifyTrack(trackId: string) {
    if (!trackId) return
    this.authService.getAccessToken().pipe(take(1)).subscribe(token => {
      this.http.get(`https://api.spotify.com/v1/tracks/${trackId}`, {
        headers: new HttpHeaders({
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        })
      }).pipe(take(1), catchError(err => {
        console.log(err)
        this.router.navigateByUrl('not-found?noTrack=true')
        return of(undefined)
      })).subscribe((trackRes: any) => {
        this.currentSpotifyTrack.next(trackRes)
      })
    })
  }

  private parseTab(tab: Tab) {
    let newTab: Tab = { ...tab, instrument: { name: tab.instrument.name, strings: +tab.instrument.strings }, bars: <Bar[]>[] }
    tab.bars.forEach(bar => {
      let segments: Segment[] = []
      bar.segments.forEach(segment => {
        const newSegment = new Segment(segment.isRest, segment.initialDurationInverse, segment.notes, segment.effects)
        segments.push(newSegment)
      })
      let newBar = new Bar(bar.tempo, bar.timeSignature, segments)
      newTab.bars.push(newBar)
    })
    return newTab
  }
}
