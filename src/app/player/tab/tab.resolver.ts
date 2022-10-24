import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { map, Observable, take, tap } from 'rxjs';
import { LoadingService } from 'src/app/extras/loading-animation/loading-animation.service';
import { PlayerService } from '../player.service';

@Injectable({
  providedIn: 'root'
})
export class TabResolver implements Resolve<Observable<boolean> | undefined> {

  constructor(private playerService: PlayerService, private loadingService: LoadingService, private router: Router) { }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | undefined {
    let trackId = route.paramMap.get("id")
    let tabId = +route.paramMap.get("tabId")!
    let isCustom = route.queryParamMap.get("isCustom") === "true"
    let tabReq = this.playerService.loadTab(trackId!, tabId)
    if (isCustom) {
      tabReq = this.playerService.loadTab(trackId!, tabId, true)
    }
    return tabReq?.pipe(tap((tabExists: boolean) => {
      this.loadingService.isLoading.next(false)
      if (!tabExists) {
        this.router.navigate(["not-found"])
        return false
      }
      return tabExists
    }))
  }
}
