import { Directive, ElementRef, HostListener, OnInit } from "@angular/core";
import { TabService } from "../edit-tab/edit-tab.service";


@Directive({
  selector: '[note]'
})

export class NoteDirective {
  constructor(private el: ElementRef<HTMLElement>, private tabService: TabService) { }

  @HostListener('keydown', ['$event'])
  manageNote(event: KeyboardEvent) {
    switch (event.code) {
      case "ArrowRight":
        this.tabService.selectNextSegmentNote()
        break;
      case "ArrowLeft":
        this.tabService.selectPreviousSegmentNote()
        break;
      case "ArrowUp":
        this.tabService.selectUpperNote()
        break;
      case "ArrowDown":
        this.tabService.selectLowerNote()
        break;
      case "Delete":
        this.tabService.removeNote()
    }
  }
}
