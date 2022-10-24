import { trigger, transition, style, animate } from '@angular/animations';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Subscription } from 'rxjs';
import { SpotifyTrack } from 'src/app/models/song.model';
import { AppStatus } from '../player.component';
import { PlayerService } from '../player.service';
import { TabService } from '../tab/tab.service';

@Component({
  selector: 'app-topbar',
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.css'],
  animations: [
    trigger("appear", [
      transition(":enter", [
        style({ opacity: 0 }),
        animate("300ms 500ms ease-in-out", style({ opacity: 1 }))
      ]),
      transition(":leave", [
        animate("300ms 500ms  ease-in-out", style({ opacity: 0 }))
      ])
    ])
  ]
})
export class TopbarComponent implements OnInit {

  constructor(private tabService: TabService, private playerService: PlayerService) { }

  @Output() appStatusOutput = new EventEmitter<AppStatus>()

  appStatus: AppStatus = {
    isPlaying: false,
    isMenuActive: false,
    isCountdownActive: false,
    isMetronomeActive: false,
    tempoMultiplier: 100
  }
  currentSpotifyTrack?: SpotifyTrack
  subs: Subscription[] = []

  ngOnInit(): void {
    this.appStatusOutput.emit(this.appStatus)
    const isPlayingSub = this.tabService.isPlaying.subscribe(isPlaying => {
      if (isPlaying) {
        this.appStatus.isPlaying = true
      } else {
        this.appStatus.isPlaying = false
      }
    })
    const currentSpotifyTrackSub = this.playerService.currentSpotifyTrack.subscribe(track => {
      if (!track) return
      this.currentSpotifyTrack = track!
    })
    this.subs.push(isPlayingSub, currentSpotifyTrackSub)
  }

  openMenu() {
    this.appStatus.isMenuActive = true
    this.appStatusOutput.emit(this.appStatus)
  }

  updateTempo() {
    this.appStatusOutput.emit(this.appStatus)
  }

  play() {
    this.tabService.play()
  }

  pause() {
    this.tabService.pause()
  }
}
