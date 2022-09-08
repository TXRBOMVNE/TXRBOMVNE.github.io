import { Directive, ElementRef } from "@angular/core";


@Directive({
  selector: '[bar]'
})

export class BarDirective {
  constructor(private el: ElementRef<HTMLElement>) { }
}
