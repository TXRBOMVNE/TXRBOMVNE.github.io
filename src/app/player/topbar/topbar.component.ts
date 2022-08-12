import { animate, style, transition, trigger } from '@angular/animations';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';

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

  @Output() menuStatus = new EventEmitter<boolean>()

  isPlaying: boolean = false
  isCountActive: boolean = false
  isMetronomeActive: boolean = false

  tempoMultiplier: number = 100

  openMenu() {
    this.menuStatus.emit(true)
  }
}
