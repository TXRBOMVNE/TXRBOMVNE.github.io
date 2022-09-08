import { Directive, ElementRef, HostListener } from "@angular/core";
import { EditTopbarComponent } from "../edit-topbar/edit-topbar.component";

@Directive({
  selector: '[uncheck]'
})

export class UncheckDirective {
  constructor(private el: ElementRef<any>, private editTopbar: EditTopbarComponent) { }

  @HostListener('mousedown', ['$event'])
  uncheck(event: any) {
    if (this.el.nativeElement.checked) {
      setTimeout(() => {
        this.editTopbar.noteProperties.controls[event.target.name].reset()
      }, 100);
    }
  }
}
