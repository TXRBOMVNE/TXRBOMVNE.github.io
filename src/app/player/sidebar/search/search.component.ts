import { animate, style, transition, trigger } from '@angular/animations';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { DocumentData, QueryDocumentSnapshot, QuerySnapshot } from '@angular/fire/compat/firestore';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { take } from 'rxjs';
import { LoadingService } from 'src/app/extras/loading-animation/loading-animation.service';
import { PlayerService } from '../../player.service';
import { SearchService } from './search.service';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css'],
  animations: [
    trigger('slideIn', [
      transition(":enter", [
        style({ transform: "translateX(-100%)" }),
        animate("150ms ease-in-out", style({ transform: "translateX(0)" }))
      ]),
      transition(":leave", [
        animate("150ms ease-in-out", style({ transform: "translateX(-100%)" }))
      ])
    ]),
    trigger("appear", [
      transition(":enter", [
        style({ opacity: 0 }),
        animate("150ms 300ms ease-in-out", style({ opacity: 1 }))
      ]),
      transition(":leave", [
        animate("150ms ease-in-out", style({ opacity: 0 }))
      ])
    ])
  ]
})
export class SearchComponent implements OnInit {

  constructor(private searchService: SearchService, private playerService: PlayerService, private loadingService: LoadingService, private router: Router) { }

  ngOnInit(): void { }

  @Output() searchMenuStatus = new EventEmitter<never>()

  queryForm = new FormGroup({
    query: new FormControl(null, Validators.required)
  })
  searchTracksResult: any[] = []
  noTrackMatches: boolean = false
  timeout: any

  selectedTrackName?: string
  selectedTrackId?: string

  searchTabsResult: QueryDocumentSnapshot<DocumentData>[] = []
  usernameArray: string[] = []
  noTabMatches: boolean = false

  searchTracks() {
    this.searchTabsResult = []
    this.noTabMatches = false
    this.selectedTrackId = undefined
    this.selectedTrackName = undefined
    if (this.timeout) {
      clearTimeout(this.timeout)
    }
    if (!this.queryForm.value.query) {
      this.searchTracksResult = []
      this.noTrackMatches = false
      return
    }
    this.timeout = setTimeout(() => {
      this.searchService.searchTracks(this.queryForm.value.query).pipe(take(1)).subscribe((searchResult: any) => {
        this.searchTracksResult = searchResult.tracks.items
        if (this.searchTracksResult.length === 0) {
          this.noTrackMatches = true
        } else {
          this.noTrackMatches = false
        }
      })
    }, 500);
  }

  searchTabs(trackId: string, trackName: any) {
    this.searchService.searchTabs(trackId).pipe(take(1)).subscribe(searchResult => {
      const tabGroups = searchResult.tabGroupArray
      this.usernameArray = searchResult.usernameArray
      this.selectedTrackName = trackName
      this.selectedTrackId = trackId
      this.searchTabsResult = tabGroups as QueryDocumentSnapshot<DocumentData>[]
      if (tabGroups.length === 0) {
        this.noTabMatches = true
      } else {
        this.noTabMatches = false
      }
    })
  }

  emitNewTrack() {
    this.playerService.changingTrack.next(null)
    this.loadingService.isLoading.next(true)
    this.searchMenuStatus.emit()
  }

  loadTab(tabIndex: number, isCustom?: boolean) {
    this.playerService.changingTrack.next(null)
    this.loadingService.isLoading.next(true)
    if (!this.selectedTrackId) return
    this.playerService.loadTab(this.selectedTrackId, tabIndex, isCustom)?.pipe(take(1)).subscribe(() => {
      this.loadingService.isLoading.next(false)
      if (isCustom) {
        this.router.navigate(["play", this.selectedTrackId, "0"], { queryParams: { isCustom: true } })
      }
      this.searchMenuStatus.emit()
    })
  }

  createTabGroup() {
    this.playerService.createTab(this.selectedTrackId!)?.then(() =>
      this.loadTab(0, true)
    )
  }
}
