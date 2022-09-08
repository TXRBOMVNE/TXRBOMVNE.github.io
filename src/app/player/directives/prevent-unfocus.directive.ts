import { Directive, ElementRef, HostListener } from "@angular/core";

@Directive({
  selector: "[preventUnfocus]"
})

export class PreventUnfocusDirective {
  constructor(private el: ElementRef) { }

  @HostListener("mousedown", ["$event"])

  preventDefault(event: MouseEvent) {
    event.preventDefault()
  }
}
