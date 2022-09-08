import { Directive, ElementRef } from '@angular/core';

@Directive({
  selector: '[segment]'
})
export class SegmentDirective {
  constructor(private el: ElementRef) { }
}
