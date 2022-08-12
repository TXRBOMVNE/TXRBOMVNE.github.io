import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.css']
})
export class PlayerComponent implements OnInit {

  constructor() { }

  ngOnInit(): void { }

  isMenuActive: boolean = false
  instrument: string | undefined = "guitar"

  toggleMenu(menuStatus: boolean) {
    this.isMenuActive = menuStatus
    console.log(this.isMenuActive, menuStatus, "player")
  }

}
