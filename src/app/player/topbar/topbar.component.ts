import { animate, style, transition, trigger } from '@angular/animations';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { AppStatus } from '../player.component';

@Component({
  selector: 'app-topbar',
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.css'],
  animations: [
    trigger("appearFromTop", [
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
export class TopbarComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

  @Output() appStatusOutput = new EventEmitter<AppStatus>()

  isPlaying = false

  appStatus: AppStatus = {
    isMenuActive: false,
    isCountdownActive: false,
    isMetronomeActive: false,
    tempoMultiplier: 100
  }

  openMenu() {
    this.appStatus.isMenuActive = true
    this.appStatusOutput.emit(this.appStatus)
  }

  updateTempo() {
    this.appStatusOutput.emit(this.appStatus)
  }
}
