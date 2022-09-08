import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { AppStatus } from '../player.component';

@Component({
  selector: 'app-topbar',
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.css'],
})
export class TopbarComponent implements OnInit {

  constructor() { }

  @Output() appStatusOutput = new EventEmitter<AppStatus>()

  appStatus: AppStatus = {
    isPlaying: false,
    isMenuActive: false,
    isCountdownActive: false,
    isMetronomeActive: false,
    tempoMultiplier: 100
  }

  ngOnInit(): void {
    this.appStatusOutput.emit(this.appStatus)
  }

  openMenu() {
    this.appStatus.isMenuActive = true
    this.appStatusOutput.emit(this.appStatus)
  }

  updateTempo() {
    this.appStatusOutput.emit(this.appStatus)
  }
}
