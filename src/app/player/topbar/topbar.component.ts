import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { AppStatus } from '../player.component';
import { TabService } from '../tab/tab.service';

@Component({
  selector: 'app-topbar',
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.css'],
})
export class TopbarComponent implements OnInit {

  constructor(private tabService: TabService) { }

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
    this.tabService.isPlaying.subscribe(isPlaying => {
      if (isPlaying) {
        this.appStatus.isPlaying = true
      } else {
        this.appStatus.isPlaying = false
      }
    })
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
