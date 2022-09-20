import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { first } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { Bar, Tab, Segment } from '../models/song.model';

@Injectable({
  providedIn: 'root'
})
export class PlayerService {

  constructor(private firestore: AngularFirestore, private authService: AuthService) { }

  currentUser = this.authService.currentUser.value
  song?: Tab

  saveTabToUser() {
    if (!this.currentUser || !this.song) return
    return this.firestore.collection("users").doc(this.currentUser.uid).collection("tabs").doc("Master Of Puppets").set({ [this.song.instrument.name]: JSON.parse(JSON.stringify(this.song)) })
  }

  loadTab(trackId: string, isACustomTab?: boolean) {
    if (!this.currentUser) return
    this.firestore.collection("users").doc(this.currentUser.uid).collection("tabs").doc(trackId).get().pipe(first()).subscribe(tab => {
      if (!tab.data()) return
      this.song = this.parseTab(tab.data()!["guitar"])
    })
    return this.firestore.collection("users").doc(this.currentUser.uid).collection("tabs").doc(trackId).get()
  }

  private parseTab(tab: Tab) {
    let newTab: Tab = { ...tab, bars: <Bar[]>[] }
    tab.bars.forEach(bar => {
      let segments: Segment[] = []
      bar.segments.forEach(segment => {
        const newSegment = new Segment(segment.isRest, segment.initialDurationInverse, segment.notes, segment.effects)
        segments.push(newSegment)
      })
      let newBar = new Bar(bar.tempo, bar.timeSignature, segments)
      newTab.bars.push(newBar)
    })
    return newTab
  }
}
