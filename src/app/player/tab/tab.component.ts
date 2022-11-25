import { AfterViewInit, Component, ElementRef, HostListener, OnDestroy, OnInit, QueryList, ViewChild, ViewChildren, ɵNG_DIR_DEF } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { Bar, Note, Segment, Tab } from 'src/app/models/song.model';
import { SegmentDirective } from '../directives/segment.directive';
import { PlayerService } from '../player.service';
import { TabService } from './tab.service';

const initialBarWidth = 340

export const tabLayout = {
  leftBarPadding: initialBarWidth / 10,
  leftBarExtraPadding: 80,
  initialBarWidth: initialBarWidth,
  initialBarInnerWidth: initialBarWidth * (9 / 10),
  barExtraWidth: initialBarWidth * (11 / 10),
}



@Component({
  selector: 'app-tab',
  templateUrl: './tab.component.html',
  styleUrls: ['./tab.component.css']
})
export class TabComponent implements AfterViewInit, OnInit, OnDestroy {
  constructor(private tabService: TabService, private playerService: PlayerService) { }

  @ViewChildren(SegmentDirective) HTMLSegments?: QueryList<{ el: ElementRef<HTMLDivElement> }>
  @ViewChild('line') line!: ElementRef<HTMLDivElement>
  @ViewChild('tab') tab?: ElementRef<HTMLDivElement>

  tabLayout = tabLayout
  currentTab: Tab = this.playerService.currentTab.value!
  stringSeparationPx = (.073 * window.innerHeight) >= 42 ? 39.7 : ((.07304 * window.innerHeight) - 2.3)
  staffHeight = (this.stringSeparationPx + 2.3) * (this.currentTab.instrument.strings - 1)
  segmentSelection = new Subject<Segment>()
  isPaused: boolean = true
  subs: Subscription[] = []
  totalDistanceMoved: number = 0
  segmentStartTime?: number

  private get segmentsArray() {
    let array: Segment[] = []
    this.currentTab.bars.forEach(bar => {
      array = array.concat(bar.segments)
    })
    return array
  }

  ngOnInit(): void {
    const isPlayingSub = this.tabService.isPlaying.subscribe(isPlaying => {
      if (isPlaying) {
        this.play()
      } else {
        this.isPaused = true
      }
    })
    this.segmentSelectionSub = this.segmentSelection?.subscribe(segment => {
      this.currentSegmentIndex = this.segmentsArray.indexOf(segment)!
      let totalDurationMs: number
      if (this.currentSegmentIndex === 0) {
        totalDurationMs = 0
      } else {
        totalDurationMs = this.wholeNoteDurationMs / this.segmentsArray[this.currentSegmentIndex - 1].durationInverse
      }
      const segmentPosition = this.HTMLSegments?.get(this.currentSegmentIndex)?.el.nativeElement.getBoundingClientRect()
      const parentPosition = this.tab?.nativeElement.getBoundingClientRect()
      const relativePosition = segmentPosition!.x - parentPosition!.x
      if (this.isPaused) {
        const newPosition = relativePosition + 'px'
        this.line.nativeElement.style.transform = `translate3d(${newPosition},-50%,0)`
        this.totalDistanceMoved = relativePosition
        this.segmentStartTime = undefined
        return
      }
      const startTime = this.segmentStartTime || performance.now()
      const totalDistanceToMove = relativePosition - this.totalDistanceMoved
      const animate = () => {
        if (this.isPaused) return
        const currentTime = performance.now()
        const elapsedTime = currentTime - startTime
        const elapsedTimeRatio = elapsedTime / totalDurationMs
        const currentDistanceToMove = (elapsedTimeRatio * totalDistanceToMove) + this.totalDistanceMoved
        if (elapsedTimeRatio >= 1) {
          this.segmentStartTime = startTime + totalDurationMs
          this.totalDistanceMoved += totalDistanceToMove
          this.segmentSelection.next(this.segmentsArray[this.currentSegmentIndex + 1])
          return
        }
        this.line.nativeElement.style.transform = `translate3d(${currentDistanceToMove}px,-50%,0)`
        requestAnimationFrame(animate)
      }
      requestAnimationFrame(animate)
    })
    const currentTabSub = this.playerService.currentTab.subscribe(tab => {
      this.currentTab = tab!
      this.wholeNoteDurationMs = (60 / this.currentTab.initialTempo * 4) * 1000
    })
    this.tabService.subToTab().unsubscribe()
    this.tabService.subToTab()
    this.subs.push(isPlayingSub, this.segmentSelectionSub, currentTabSub)
  }

  ngAfterViewInit(): void {
    this.tabService.HTMLSegments = this.HTMLSegments
    const initialX = this.HTMLSegments!.get(0)!.el.nativeElement.getBoundingClientRect().left - this.tab!.nativeElement.getBoundingClientRect().left
    this.line.nativeElement.style.transform = `translate3d(${initialX}px,-50%,0)`
    this.totalDistanceMoved = initialX
  }

  ngOnDestroy(): void {
    this.subs.forEach(sub => sub.unsubscribe())
  }

  @HostListener('window:resize', ['$event'])
  updateStringSeparationPx() {
    this.staffHeight = (this.stringSeparationPx + 2.3) * (this.currentTab.instrument.strings - 1)
    this.tabService.staffHeight = (this.stringSeparationPx + 2.3) * (this.currentTab.instrument.strings - 1)
    this.tabService.stringSeparationPx = (.073 * window.innerHeight) >= 42 ? 39.7 : ((.073 * window.innerHeight) - 2.3)
    this.stringSeparationPx = (.073 * window.innerHeight) >= 42 ? 39.7 : ((.073 * window.innerHeight) - 2.3)
  }

  // Sets whole note duration depending on the song BPM
  wholeNoteDurationMs = (60 / this.currentTab.initialTempo * 4) * 1000
  currentSegmentIndex = 0
  segmentSelectionSub?: Subscription

  play() {
    this.isPaused = false
    if (!this.segmentsArray[this.currentSegmentIndex + 1]) return this.pause()
    this.segmentSelection.next(this.segmentsArray[this.currentSegmentIndex + 1])
  }

  pause() {
    this.tabService.pause();
  }

  updateSelection(segment: Segment) {
    this.pause()
    this.segmentSelection?.next(segment)
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
  @HostListener("wheel", ["$event"])
  changeToHorizontalScroll(event: WheelEvent) {
    if (!this.canvasContainer) return
    if (event.deltaY > 0) this.canvasContainer.nativeElement.scrollLeft += 100;
    else this.canvasContainer.nativeElement.scrollLeft -= 100;
  }
}
