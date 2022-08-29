import { Component, OnInit } from '@angular/core';
import { Note, Segment, Bar } from '../models/song.model';

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
  styleUrls: ['./player.component.css']
})
export class PlayerComponent implements OnInit {

  constructor() { }

  editMode: boolean = true

  ngOnInit(): void { }

  appStatus: AppStatus = {
    isPlaying: false,
    isMenuActive: false,
    isCountdownActive: false,
    isMetronomeActive: false,
    tempoMultiplier: 100
  }

  barProperties: { segment: Segment, bar: Bar, note?: Note } | undefined

  instrument: string | undefined = "guitar"

  updateAppStatus(appStatus: AppStatus) {
    this.appStatus = appStatus
  }

  updateNoteSelection(barProperties: { segment: Segment, bar: Bar, note?: Note }) {
    this.barProperties = barProperties
  }

  toggleMenu(menuStatus: boolean) {
    this.appStatus.isMenuActive = menuStatus
  }

}
