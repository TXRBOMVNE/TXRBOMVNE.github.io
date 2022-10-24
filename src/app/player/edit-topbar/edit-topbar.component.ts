import { animate, style, transition, trigger } from '@angular/animations';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Bar, Note, Segment, SpotifyTrack } from 'src/app/models/song.model';
import { AppStatus } from '../player.component';
import { EditTabService } from '../edit-tab/edit-tab.service';
import { Subscription } from 'rxjs';
import { TabService } from '../tab/tab.service';
import { PlayerService } from '../player.service';

@Component({
  selector: 'app-edit-topbar',
  templateUrl: './edit-topbar.component.html',
  styleUrls: ['./edit-topbar.component.css'],
  animations: [
    trigger('scale', [
      transition(":enter", [
        style({ opacity: 0 }),
        animate("100ms ease-in-out", style({ opacity: 1 }))
      ]),
      transition(":leave", [
        animate("100ms ease-in-out", style({ opacity: 0 }))
      ])
    ]),
    trigger("appear", [
      transition(":enter", [
        style({ opacity: 0 }),
        animate("300ms ease-in-out", style({ opacity: 1 }))
      ]),
      transition(":leave", [
        animate("300ms ease-in-out", style({ opacity: 0 }))
      ])
    ])
  ]
})
export class EditTopbarComponent implements OnInit, OnChanges {

  constructor(private editTabService: EditTabService, private tabService: TabService, private playerService: PlayerService) { }

  // Gets data related to the note selected in the tab component
  @Input() barPropertiesInput: { segment: Segment, bar: Bar, note?: Note } | undefined
  @Output() appStatusOutput = new EventEmitter<AppStatus>()

  subs: Subscription[] = []

  currentSpotifyTrack?: SpotifyTrack
  appStatus: AppStatus = {
    isPlaying: false,
    isMenuActive: false,
    isCountdownActive: false,
    isMetronomeActive: false,
    tempoMultiplier: 100
  }
  noteProperties = new FormGroup({
    initialDurationInverse: new FormControl(4, Validators.required),
    isDotted: new FormControl(false),
    isRest: new FormControl(false),
    timeSignatureNumerator: new FormControl(4, Validators.required),
    timeSignatureDenominator: new FormControl(4, Validators.required),
    slideOutMode: new FormControl(null),
    slideInMode: new FormControl(null)
  })

  selectionSub?: Subscription
  showSlideMenu: boolean = false

  ngOnInit(): void {
    this.appStatusOutput.emit(this.appStatus)
    const isPlayingSub = this.tabService.isPlaying.subscribe(isPlaying => {
      if (isPlaying) {
        this.appStatus.isPlaying = true
      } else {
        this.appStatus.isPlaying = false
      }
    })
    const currentSpotifyTrackSub = this.playerService.currentSpotifyTrack.subscribe(track => {
      this.currentSpotifyTrack = track!
    })
    this.subs.push(isPlayingSub, currentSpotifyTrackSub)
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.barPropertiesInput) return
    if (this.selectionSub) {
      // Unsubscribes from previous note subscription
      this.selectionSub?.unsubscribe()
    }
    this.noteProperties.reset()
    let currentValue = changes["barPropertiesInput"].currentValue
    this.noteProperties.patchValue({
      initialDurationInverse: currentValue.segment.initialDurationInverse,
      isRest: !!currentValue.segment.isRest,
      timeSignatureNumerator: currentValue.bar.timeSignature.numerator,
      timeSignatureDenominator: currentValue.bar.timeSignature.denominator,
    })
    if (currentValue.segment.effects) {
      this.noteProperties.patchValue({
        isDotted: !!currentValue.segment.effects.isDotted
      })
    }
    if (currentValue.note && currentValue.note.effects) {
      this.noteProperties.patchValue({
        slideOutMode: currentValue.note.effects.slides.slideOut,
        slideInMode: currentValue.note.effects.slides.slideIn
      })
    }
    // Subscribes to a note selection every time it changes
    this.selectionSub = this.noteProperties.valueChanges.subscribe(newValues => {
      // Skips the subscription every time all of the values are "null"
      let isEveryValueNull = Object.values(newValues).every(value => value === null);
      if (!!isEveryValueNull) return
      // Changes inputs depending to note selection properties
      this.editTabService.changeDuration(newValues.initialDurationInverse, newValues.isDotted)
      if (newValues.isRest !== null) {
        this.editTabService.toggleRest(newValues.isRest)
      }
      this.editTabService.notePropertiesInput = newValues
      if (this.noteProperties.valid) {
        this.editTabService.changeTimeSignature(newValues.timeSignatureNumerator, newValues.timeSignatureDenominator)
      }
      this.editTabService.changeSlides({ slideOut: newValues.slideOutMode, slideIn: newValues.slideInMode })
    })
  }

  openMenu() {
    this.appStatus.isMenuActive = true
    this.appStatusOutput.emit(this.appStatus)
  }

  updateTempo() {
    this.appStatusOutput.emit(this.appStatus)
  }

  play() {
    this.appStatus!.isPlaying = true
    this.tabService.play()
  }

  pause() {
    this.appStatus!.isPlaying = false
    this.tabService.pause()
  }
}
