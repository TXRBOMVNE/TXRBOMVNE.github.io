import { animate, style, transition, trigger } from '@angular/animations';
import { Component, OnInit } from '@angular/core';
import { LoadingService } from './extras/loading-animation/loading-animation.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  animations: [
    trigger("appear", [
      transition(":enter", [
        style({ opacity: 0 }),
        animate("50ms ease-in-out", style({ opacity: 1 }))
      ]),
      transition(":leave", [
        animate("300ms ease-in-out", style({ opacity: 0 }))
      ])
    ])
  ]
})
export class AppComponent implements OnInit {
  constructor(private loadingService: LoadingService) { }

  isLoading: boolean = false

  ngOnInit(): void {
    this.loadingService.isLoading.subscribe(value => this.isLoading = value)
  }
}
