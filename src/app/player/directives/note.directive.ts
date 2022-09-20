import { Directive, ElementRef, HostListener } from "@angular/core";
import { EditTabService } from "../edit-tab/edit-tab.service";


@Directive({
  selector: '[note]'
})

export class NoteDirective {
  constructor(private el: ElementRef<HTMLElement>, private editTabService: EditTabService) { }

  @HostListener('keydown', ['$event'])
  manageNote(event: KeyboardEvent) {
    switch (event.code) {
      case "ArrowRight":
        this.editTabService.selectNextSegmentNote()
        break;
      case "ArrowLeft":
        this.editTabService.selectPreviousSegmentNote()
        break;
      case "ArrowUp":
        this.editTabService.selectUpperNote()
        break;
      case "ArrowDown":
        this.editTabService.selectLowerNote()
        break;
      case "Delete":
        this.editTabService.removeNote()
    }
  }
}
