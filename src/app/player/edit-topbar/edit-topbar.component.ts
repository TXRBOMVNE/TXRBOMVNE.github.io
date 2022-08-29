import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Bar, Note, Segment } from 'src/app/models/song.model';
import { AppStatus } from '../player.component';
import { TabService } from '../tab/tab.service';

@Component({
  selector: 'app-edit-topbar',
  templateUrl: './edit-topbar.component.html',
  styleUrls: ['./edit-topbar.component.css']
})
export class EditTopbarComponent implements OnInit, OnChanges {

  constructor(private tabService: TabService) { }

  // Gets data related to the note selected in the tab component
  @Input() barPropertiesInput: { segment: Segment, bar: Bar, note?: Note } | undefined
  @Output() appStatusOutput = new EventEmitter<AppStatus>()

  appStatus: AppStatus = {
    isPlaying: false,
    isMenuActive: false,
    isCountdownActive: false,
    isMetronomeActive: false,
    tempoMultiplier: 100
  }

  noteProperties = new FormGroup({
    initialDurationInverse: new FormControl(4, Validators.required),
    isDotted: new FormControl(null),
    slideToNoteMode: new FormControl(null),
    slideOutMode: new FormControl(null),
    slideInMode: new FormControl(null)
  })

  showSlideMenu: boolean = false

  ngOnInit(): void {
    this.appStatusOutput.emit(this.appStatus)
    this.noteProperties.valueChanges.subscribe(newValues => {
      this.tabService.changeDuration(newValues.initialDurationInverse, newValues.isDotted)
    })
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.barPropertiesInput) return

    this.noteProperties.reset()
    let currentValue = changes["barPropertiesInput"].currentValue

    this.noteProperties.patchValue({
      initialDurationInverse: currentValue.segment.initialDurationInverse
    })

    if (!currentValue.segment.effects) return

    this.noteProperties.patchValue({
      isDotted: currentValue.segment.effects.isDotted
    })

  }

  openMenu() {
    this.appStatus.isMenuActive = true
    this.appStatusOutput.emit(this.appStatus)
  }

  updateTempo() {
    this.appStatusOutput.emit(this.appStatus)
  }
}
