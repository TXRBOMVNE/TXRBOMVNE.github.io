import { trigger, transition, style, animate, query } from '@angular/animations';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { getAuth } from 'firebase/auth';
import { Subscription } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { LoadingService } from '../extras/loading-animation/loading-animation.service';
import { Note, Segment, Bar, Tab } from '../models/song.model';
import { EditTabService } from './edit-tab/edit-tab.service';
import { PlayerService } from './player.service';

export interface AppStatus {
  isPlaying: boolean
  isMenuActive: boolean,
  isMetronomeActive: boolean,
  isCountdownActive: boolean,
  tempoMultiplier: number
}

@Component({
  selector: 'app-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.css'],
  animations: [
    trigger('appear', [
      transition(":enter", [
        style({ opacity: 0 }),
        animate("100ms ease-in-out", style({ opacity: 1 }))
      ]),
      transition(":leave", [
        animate("100ms ease-in-out", style({ opacity: 0 }))
      ])
    ])
  ]
})
export class PlayerComponent implements OnInit, OnDestroy {

  constructor(
    private playerService: PlayerService,
    private route: ActivatedRoute,
    private authService: AuthService,
    private loadingService: LoadingService,
    private editTabService: EditTabService,
    private router: Router) { }

  editMode: boolean = false
  exists: boolean = false
  currentUser = this.authService.currentUser.value
  currentTab?: Tab
  currentTabIndex?: number
  trackId?: string
  showMenu: boolean = false
  subs: Subscription[] = []

  ngOnInit(): void {
    let tab = this.route.snapshot.data["tab"]
    if (tab) this.exists = true
    const changingTrackSub = this.playerService.changingTrack.subscribe(() => this.editMode ? this.saveTabGroup() : null)
    const currentUserSub = this.authService.currentUser.subscribe(user => this.currentUser = user)
    const currentTabSub = this.playerService.currentTab.subscribe(tab => this.currentTab = tab!)
    const currentSpotifyTrackSub = this.playerService.currentSpotifyTrack.subscribe(track => this.trackId = track?.id)
    const currentTabIndexSub = this.playerService.currentTabIndex.subscribe(index => this.currentTabIndex = index!)
    const editModeSub = this.playerService.editMode.subscribe(value => this.editMode = value)
    this.subs.push(currentUserSub, changingTrackSub, currentSpotifyTrackSub, currentTabSub, currentTabIndexSub, editModeSub)
  }

  ngOnDestroy(): void {
    this.subs.forEach(sub => sub.unsubscribe())
  }

  appStatus: AppStatus = {
    isPlaying: false,
    isMenuActive: false,
    isCountdownActive: false,
    isMetronomeActive: false,
    tempoMultiplier: 100
  }
  showSongInfo: boolean = false
  barProperties: { segment: Segment, bar: Bar, note?: Note } | undefined

  updateAppStatus(appStatus: AppStatus) {
    this.appStatus = appStatus
  }

  updateNoteSelection(barProperties: { segment: Segment, bar: Bar, note?: Note }) {
    this.barProperties = barProperties
  }

  toggleMenu(menuStatus: boolean) {
    this.appStatus.isMenuActive = menuStatus
  }

  editTabGroup() {
    this.loadingService.isLoading.next(true)
    this.playerService.saveTabToUser(this.route.snapshot.paramMap.get("id")!)?.then(() => {
      this.router.navigate([], { queryParams: { isCustom: true } }).then(() => {
        this.loadingService.isLoading.next(false)
        this.playerService.editMode.next(true)
      })
    })
  }

  saveTabGroup() {
    this.loadingService.isLoading.next(true)
    this.playerService.saveTabToUser(this.trackId!)?.then(() => {
      this.playerService.editMode.next(false)
      this.loadingService.isLoading.next(false)
    })
  }

  saveAndPostTabGroup() {
    this.loadingService.isLoading.next(true)
    this.playerService.postTab(this.trackId!)?.then(() => this.saveTabGroup())
  }

  deleteTab() {
    this.playerService.deleteTab()
  }
}
