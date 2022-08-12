import { trigger, transition, style, animate } from "@angular/animations";
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from "@angular/core";

@Component({
  selector: "app-sidebar",
  templateUrl: "./sidebar.component.html",
  styleUrls: ["./sidebar.component.css"],
  animations: [
    trigger("appear", [
      transition(":enter", [
        style({ opacity: 0 }),
        animate("150ms ease-in-out", style({ opacity: 1 }))
      ]),
      transition(":leave", [
        animate("150ms ease-in-out", style({ opacity: 0 }))
      ])
    ]),
    trigger("enterFromSide", [
      transition(":enter", [
        style({ transform: "translateX(-150%)" }),
        animate("150ms ease-in-out", style({ transform: "translateX(0)" }))
      ]),
      transition(":leave", [
        animate("150ms ease-in-out", style({ transform: "translateX(-150%)" }))
      ])
    ])
  ]
})

export class SidebarComponent implements OnChanges {

  @Input() menuStatus: boolean = false
  @Output() menuStatusOutput = new EventEmitter<boolean>()

  isMenuActive: boolean = false

  ngOnChanges(changes: SimpleChanges) {
    this.isMenuActive = changes["menuStatus"].currentValue
  }

  closeMenu() {
    this.isMenuActive = false
    this.menuStatusOutput.emit(this.isMenuActive)
  }
}
