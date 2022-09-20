import { Injectable } from '@angular/core';
import { AngularFirestore, DocumentData, QuerySnapshot } from '@angular/fire/compat/firestore';
import {
  Resolve,
  RouterStateSnapshot,
  ActivatedRouteSnapshot
} from '@angular/router';
import { first, Observable, of } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import { PlayerService } from '../player.service';
import { TabComponent } from './tab.component';

@Injectable({
  providedIn: 'root'
})
export class TabResolver implements Resolve<QuerySnapshot<DocumentData> | undefined> {
  constructor(private authService: AuthService, private playerService: PlayerService) { }

  currentUser = this.authService.currentUser.value

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<QuerySnapshot<DocumentData>> | undefined | Promise<undefined> {
    let trackId = route.paramMap.get("id")
    if (!this.currentUser || !trackId) return undefined
    return new Promise<QuerySnapshot<DocumentData>>(resolver => {
      this.playerService.loadTab(trackId!)?.pipe(first()).subscribe((data: any) => {
        resolver(data.data())
      })
    })
  }
}
