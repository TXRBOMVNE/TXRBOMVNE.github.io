import { Injectable } from "@angular/core";
import { Subject } from "rxjs";

@Injectable({
  providedIn: "root"
})

export class LoadingService {
  isLoading = new Subject<boolean>()
  message = new Subject<string>()

  startLoading(newMessage?: string) {
    this.message.next("XD")
    if (newMessage) { this.message.next(newMessage.toUpperCase()) }
    else { this.message.next("LOADING") }
    this.isLoading.next(true)
  }
}
