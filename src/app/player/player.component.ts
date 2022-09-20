import { trigger, transition, style, animate } from '@angular/animations';
import { Component, OnInit } from '@angular/core';
import { Note, Segment, Bar } from '../models/song.model';
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
export class PlayerComponent implements OnInit {

  constructor(private playerService: PlayerService) { }

  editMode: boolean = false

  ngOnInit(): void { }

  appStatus: AppStatus = {
    isPlaying: false,
    isMenuActive: false,
    isCountdownActive: false,
    isMetronomeActive: false,
    tempoMultiplier: 100
  }
  showSongInfo: boolean = false
  barProperties: { segment: Segment, bar: Bar, note?: Note } | undefined

  instrument?: string = "guitar"

  updateAppStatus(appStatus: AppStatus) {
    this.appStatus = appStatus
  }

  updateNoteSelection(barProperties: { segment: Segment, bar: Bar, note?: Note }) {
    this.barProperties = barProperties
  }

  toggleMenu(menuStatus: boolean) {
    this.appStatus.isMenuActive = menuStatus
  }

  editTab() {
    this.playerService.saveTabToUser()?.then(() => this.editMode = true)
  }

  saveTab() {
    this.playerService.saveTabToUser()?.then(() => this.editMode = false)
  }
}
