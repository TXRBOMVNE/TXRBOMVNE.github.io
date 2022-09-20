import { AfterViewInit, Component, ElementRef, EventEmitter, HostListener, OnInit, Output, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { interval, Subscription } from 'rxjs';
import { Bar, Note, Segment } from 'src/app/models/song.model';
import { BarDirective } from '../directives/bar.directive';
import { SegmentDirective } from '../directives/segment.directive';
import { PlayerService } from '../player.service';
import { tabLayout } from '../tab/tab.component';
import { TabService } from '../tab/tab.service';
import { EditTabService } from './edit-tab.service';

@Component({
  selector: 'app-edit-tab',
  templateUrl: './edit-tab.component.html',
  styleUrls: ['./edit-tab.component.css']
})
export class EditTabComponent implements AfterViewInit, OnInit {
  constructor(private editTabService: EditTabService, private tabService: TabService, private playerService: PlayerService) { }

  @ViewChildren(BarDirective) HTMLBars?: QueryList<any>
  @ViewChildren(SegmentDirective) HTMLSegments?: QueryList<any>
  @Output() noteSelectedOutput = new EventEmitter<{ segment: Segment, bar: Bar, note?: Note }>()

  tabLayout = tabLayout
  song = this.playerService.song!
  staffHeight = 42 * (this.song.instrument.strings - 1)
  selectedNote?: { segment: Segment, bar: Bar, note?: Note }

  playInterval = interval(500)
  sub?: Subscription
  index = 0

  ngAfterViewInit(): void {
    this.editTabService.fillSegmentsNotesSpaces()
    this.editTabService.HTMLBars = this.HTMLBars
    this.editTabService.HTMLSegments = this.HTMLSegments
    this.HTMLBars?.changes.subscribe(newBars => {
      this.editTabService.HTMLBars = newBars
    })
    this.HTMLSegments?.changes.subscribe(newSegments => {
      this.editTabService.HTMLSegments = newSegments
    })
    setTimeout(() => {
      this.HTMLBars?.get(0).el.nativeElement.lastElementChild.children[0].lastElementChild.children[0].focus()
    });
  }

  ngOnInit(): void {
    this.tabService.isPlaying.subscribe(isPlaying => {
      if (isPlaying) {
        this.play()
      } else {
        this.pause()
      }
    })
  }

  play() {
    this.sub = this.playInterval.subscribe(() => {
      if (!this.HTMLSegments?.get(this.index)) {
        this.tabService.pause()
        this.index = 0
        return
      }
      this.HTMLSegments?.get(this.index).el.nativeElement.focus()
      this.index++
    })
  }

  pause() {
    this.sub?.unsubscribe()
  }



  detectNoteSelection(segment: Segment, bar: Bar, note?: Note) {
    this.noteSelectedOutput.emit({ segment, bar, note })
    this.editTabService.updateNoteSelection({ segment, bar, note })
    this.selectedNote = { segment, bar, note }
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


  addBar() {
    this.editTabService.addBar()
  }
  // Array for storing temporarily pressed keys values
  keyInput?: string[] = []
  // Listens for keypress and adds it to the previous array
  @HostListener("document:keypress", ["$event"])
  addKeypress(event: KeyboardEvent) {
    this.keyInput?.push(event.key)
    this.changeFretValue()
  }

  // Joins and parses the pressed keys array to change the selected note fret value; also sets a timeout to listen for a multiple digits number
  private changeFretValue() {
    if (!this.keyInput) return
    let newFretValue = parseInt(this.keyInput.join(""), 10)
    if (this.selectedNote) {
      this.editTabService.changeFretValue(newFretValue)
    }
    setTimeout(() => {
      this.keyInput = []
    }, 500)
  }

  // Sets horizontal scroll to mouse wheel without holding shift
  @ViewChild("canvasContainer", { static: false }) canvasContainer?: ElementRef<HTMLElement>
  @HostListener("document:wheel", ["$event"])
  changeToHorizontalScroll(event: WheelEvent) {
    if (!this.canvasContainer) return
    if (event.deltaY > 0) this.canvasContainer.nativeElement.scrollLeft += 100;
    else this.canvasContainer.nativeElement.scrollLeft -= 100;
  }

  // Prevents scrolling with horizontal arrow keys
  @HostListener("document:keydown", ["$event"])
  preventDefault(event: KeyboardEvent) {
    if (event.code === "ArrowRight" || event.code === "ArrowLeft") {
      event.preventDefault()
    }
  }
}
