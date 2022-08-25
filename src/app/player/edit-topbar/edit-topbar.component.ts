import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { AppStatus } from '../player.component';

@Component({
  selector: 'app-edit-topbar',
  templateUrl: './edit-topbar.component.html',
  styleUrls: ['./edit-topbar.component.css']
})
export class EditTopbarComponent implements OnInit {

  constructor() { }

  @Output() appStatusOutput = new EventEmitter<AppStatus>()

  appStatus: AppStatus = {
    isPlaying: false,
    isMenuActive: false,
    isCountdownActive: false,
    isMetronomeActive: false,
    tempoMultiplier: 100
  }

  showSlideMenu: boolean = false

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
