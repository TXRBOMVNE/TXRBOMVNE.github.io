import { animate, style, transition, trigger } from '@angular/animations';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { LoadingService } from '../extras/loading-animation/loading-animation.service';
import { Bar, Instrument, Note, Segment, Tab } from '../models/song.model';
import { EditTabService } from './edit-tab/edit-tab.service';
import { PlayerService } from './player.service';
// import { Spotify } from 'Spotify'


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
    ]),
    trigger('scale', [
      transition(":enter", [
        style({ 'max-height': 0 }),
        animate("100ms ease-in-out", style({ 'max-height': '200px' }))
      ]),
      transition(":leave", [
        style({ 'max-height': '200px' }),
        animate("100ms ease-in-out", style({ 'max-height': 0 }))
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
    private title: Title,
    private router: Router) { }

  editMode: boolean = false
  exists: boolean = false
  currentUser = this.authService.currentUser.value
  currentTab?: Tab
  currentTabIndex?: number
  trackId?: string
  showMenu: boolean = false
  subs: Subscription[] = []
  showSelectionModal: boolean = false

  instrumentForm = new FormGroup({
    name: new FormControl('guitar', Validators.required),
    strings: new FormControl(6, Validators.required)
  })

  ngOnInit(): void {
    let tab = this.route.snapshot.data["tab"]
    if (tab) this.exists = true
    const changingTrackSub = this.playerService.changingTrack.subscribe(() => this.editMode ? this.saveTabGroup() : null)
    const currentUserSub = this.authService.currentUser.subscribe(user => this.currentUser = user)
    const currentTabSub = this.playerService.currentTab.subscribe(tab => this.currentTab = tab!)
    const currentSpotifyTrackSub = this.playerService.currentSpotifyTrack.subscribe(track => {
      if (track?.name) {
        let artists = ''
        track.artists.forEach((artist, i) => {
          if (i === 0) {
            artists += artist.name
            return
          }
          artists += `, ${artist.name}`
        })
        this.title.setTitle(`${track?.name} ${String.fromCharCode(183)} ${artists}`)
      }
      this.trackId = track?.id
    })
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
    this.editTabService.modifyTab.next(null)
    this.loadingService.isLoading.next(true)
    this.playerService.saveTabToUser(this.trackId!)?.then(() => {
      this.playerService.editMode.next(false)
      this.loadingService.isLoading.next(false)
      this.router.navigate([], { queryParams: { isCustom: true } })
    })
  }

  saveAndPostTabGroup() {
    this.editTabService.modifyTab.next(null)
    this.loadingService.isLoading.next(true)
    this.playerService.postTab(this.trackId!)?.then(() => this.saveTabGroup())
  }

  deleteTab() {
    this.playerService.deleteTab()
  }

  changeInstrument(event: MouseEvent) {
    event.preventDefault()
    this.showSelectionModal = false
    if (!this.instrumentForm.valid) return
    this.playerService.changeInstrument(<Instrument>this.instrumentForm.value)
  }
}
