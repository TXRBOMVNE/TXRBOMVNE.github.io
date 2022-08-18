import { Component, OnInit } from '@angular/core';

export interface AppStatus {
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

  ngOnInit(): void { }

  appStatus: AppStatus = {
    isMenuActive: false,
    isCountdownActive: false,
    isMetronomeActive: false,
    tempoMultiplier: 100
  }

  instrument: string | undefined = "guitar"

  updateAppStatus(appStatus: AppStatus) {
    this.appStatus = appStatus
  }

  toggleMenu(menuStatus: boolean) {
    this.appStatus.isMenuActive = menuStatus
  }

}
