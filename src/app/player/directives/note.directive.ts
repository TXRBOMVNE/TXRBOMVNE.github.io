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
      case "KeyW":
        event.preventDefault()
        this.editTabService.selectUpperNote()
        break;
      case "KeyA":
        event.preventDefault()
        this.editTabService.selectPreviousSegmentNote()
        break;
      case "KeyS":
        event.preventDefault()
        this.editTabService.selectLowerNote()
        break;
      case "KeyD":
        event.preventDefault()
        this.editTabService.selectNextSegmentNote()
        break;
      case "ArrowUp":
        event.preventDefault()
        this.editTabService.selectUpperNote()
        break;
      case "ArrowLeft":
        event.preventDefault()
        this.editTabService.selectPreviousSegmentNote()
        break;
      case "ArrowDown":
        event.preventDefault()
        this.editTabService.selectLowerNote()
        break;
      case "ArrowRight":
        event.preventDefault()
        this.editTabService.selectNextSegmentNote()
        break;
      case "Delete":
        event.preventDefault()
        this.editTabService.removeNote()
        break;
      case "Backspace":
        event.preventDefault()
        this.editTabService.removeNote()
    }
  }
}
