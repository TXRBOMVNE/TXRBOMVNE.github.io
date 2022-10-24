import { Component, OnDestroy, OnInit } from "@angular/core";
import { Subscription } from "rxjs";
import { LoadingService } from "./loading-animation.service";

@Component({
  selector: "app-loading",
  template: '<div id="container"><div class="lds-dual-ring"></div><h3 *ngIf="message" class="text-white">{{message}}</h3></div> ',
  styleUrls: ["./loading-animation.component.css"],
  providers: [LoadingComponent]
})

export class LoadingComponent implements OnInit, OnDestroy {
  constructor(private loadingService: LoadingService) { }

  message = "LOADING"
  private sub?: Subscription

  ngOnInit(): void {
    this.loadingService.message.subscribe(newMessage => {
      this.message = newMessage
    })
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe()
  }
}
