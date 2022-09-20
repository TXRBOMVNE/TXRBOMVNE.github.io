import { AfterViewInit, Component, ElementRef, HostListener, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { first, Subject, Subscription } from 'rxjs';
import { Bar, Note, Segment, Tab } from 'src/app/models/song.model';
import { SegmentDirective } from '../directives/segment.directive';
import { PlayerService } from '../player.service';
import { TabService } from './tab.service';

const initialBarWidth = 360

export const tabLayout = {
  leftBarPadding: initialBarWidth / 10,
  leftBarExtraPadding: 80,
  initialBarWidth: initialBarWidth,
  initialBarInnerWidth: initialBarWidth * (9 / 10),
  barExtraWidth: initialBarWidth * (11 / 10),
  canvasHeight: 340,
}

@Component({
  selector: 'app-tab',
  templateUrl: './tab.component.html',
  styleUrls: ['./tab.component.css']
})
export class TabComponent implements AfterViewInit, OnInit {
  constructor(private tabService: TabService, private playerService: PlayerService, private route: ActivatedRoute) { }

  @ViewChildren(SegmentDirective) HTMLSegments?: QueryList<any>

  tabLayout = tabLayout
  song?: Tab = this.playerService.song
  staffHeight = 42 * (this.song!.instrument.strings - 1)
  segmentSelection?= new Subject<{ bar: Bar, segment: Segment }>()
  isPaused?: boolean

  private segmentsArray() {
    let array: Segment[] = []
    this.song!.bars.forEach(bar => {
      array = array.concat(bar.segments)
    })
    return array
  }

  ngOnInit(): void {
    this.tabService.isPlaying.subscribe(isPlaying => {
      if (isPlaying) {
        this.play()
      } else {
        this.isPaused = true
      }
    })
    this.subToPlay()
    this.segmentSelection?.subscribe(selection => {
      const { segment } = selection
      this.currentNoteIndex = this.segmentsArray().indexOf(segment)
    })
  }

  ngAfterViewInit(): void {
    this.tabService.HTMLSegments = this.HTMLSegments
  }

  sub?: Subscription
  // Sets whole note duration depending on the song BPM
  wholeNoteDurationMs = (60 / this.song!.initialTempo * 4) * 1000
  currentNoteIndex = 0
  currentNoteDuration = new Subject<number>()

  play() {
    this.isPaused = false
    this.currentNoteDuration.next(this.wholeNoteDurationMs / this.segmentsArray()[this.currentNoteIndex].durationInverse)
  }

  subToPlay() {
    this.sub = this.currentNoteDuration.subscribe(noteDuration => {
      this.HTMLSegments!.get(this.currentNoteIndex).el.nativeElement.focus()
      setTimeout(() => {
        if (this.isPaused) {
          return
        }
        this.currentNoteIndex++
        // Returns if there isn't a next note and resets index
        if (!this.HTMLSegments?.get(this.currentNoteIndex) || !this.segmentsArray()[this.currentNoteIndex]) {
          this.tabService.pause()
          this.currentNoteIndex = 0
          return
        }
        // Emits next note duration
        this.currentNoteDuration.next(this.wholeNoteDurationMs / this.segmentsArray()[this.currentNoteIndex].durationInverse)
      }, noteDuration);
    })
  }

  pause() {
    this.tabService.pause()
    this.isPaused = true
  }

  updateSelection(selection: { bar: Bar, segment: Segment }) {
    this.segmentSelection?.next(selection)
  }

  styleBar(bar: Bar, index: number) {
    return this.tabService.styleBar(bar, index)
  }

  styleTimeSignature(bar: Bar, index: number) {
    return this.tabService.styleTimeSignature(bar, index)
  }

  styleSegment(segment: Segment) {
    return this.tabService.styleSegment(segment)
  }

  styleNote(note: Note) {
    return this.tabService.styleNote(note)
  }

  styleSlideOut(note: Note, segment: Segment, bar: Bar) {
    return this.tabService.styleSlideOut(note, segment, bar)
  }

  styleSlideIn(note: Note, segment: Segment) {
    return this.tabService.styleSlideIn(note, segment)
  }

  assignRestImg(segment: Segment) {
    return this.tabService.assignRestImg(segment)
  }

  hasTimeSignatureChanged(bar: Bar, index: number) {
    return this.tabService.hasTimeSignatureChanged(bar, index)
  }

  // Sets horizontal scroll to mouse wheel without holding shift
  @ViewChild("canvasContainer", { static: false }) canvasContainer?: ElementRef<HTMLElement>
  @HostListener("document:wheel", ["$event"])
  changeToHorizontalScroll(event: WheelEvent) {
    if (!this.canvasContainer) return
    if (event.deltaY > 0) this.canvasContainer.nativeElement.scrollLeft += 100;
    else this.canvasContainer.nativeElement.scrollLeft -= 100;
  }

}


