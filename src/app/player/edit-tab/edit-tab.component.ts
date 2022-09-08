import { AfterViewInit, Component, ElementRef, EventEmitter, HostListener, Output, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { Bar, Note, Segment } from 'src/app/models/song.model';
import { BarDirective } from '../directives/bar.directive';
import { SegmentDirective } from '../directives/segment.directive';
import { tabLayout } from '../tab/tab.component';
import { TabService } from './edit-tab.service';

@Component({
  selector: 'app-edit-tab',
  templateUrl: './edit-tab.component.html',
  styleUrls: ['./edit-tab.component.css']
})
export class EditTabComponent implements AfterViewInit {
  constructor(private tabService: TabService, private el: ElementRef<Document>) { }

  @ViewChildren(BarDirective) HTMLBars?: QueryList<any>
  @ViewChildren(SegmentDirective) HTMLSegments?: QueryList<any>
  @Output() noteSelectedOutput = new EventEmitter<{ segment: Segment, bar: Bar, note?: Note }>()

  tabLayout = tabLayout
  song = this.tabService.song!
  staffHeight = 42 * (this.song.instrument.strings - 1)
  selectedNote?: { segment: Segment, bar: Bar, note?: Note }

  ngAfterViewInit(): void {
    this.tabService.fillSegmentsNotesSpaces()
    this.tabService.HTMLBars = this.HTMLBars
    this.tabService.HTMLSegments = this.HTMLSegments
    this.HTMLBars?.changes.subscribe(newBars => {
      this.tabService.HTMLBars = newBars
    })
    this.HTMLSegments?.changes.subscribe(newSegments => {
      this.tabService.HTMLSegments = newSegments
    })
    setTimeout(() => {
      this.HTMLBars?.get(0).el.nativeElement.lastElementChild.children[0].lastElementChild.children[0].focus()
    });
  }

  detectNoteSelection(segment: Segment, bar: Bar, note?: Note) {
    this.noteSelectedOutput.emit({ segment, bar, note })
    this.tabService.updateNoteSelection({ segment, bar, note })
    this.selectedNote = { segment, bar, note }
  }

  styleBar(bar: Bar, index: number) {
    let style
    if (!bar.valid && bar.totalDurationRatio > bar.timeSignatureRatio) {
      style = { 'border': 'red 1px solid', 'transform': 'translateY(-1px)' }
      return style
    } else if (!bar.valid && bar.totalDurationRatio < bar.timeSignatureRatio) {
      style = { 'border': 'yellow 1px solid', 'transform': 'translateY(-1px)' }
      return style
    }
    if (this.hasTimeSignatureChanged(bar, index)) {
      style = {
        'width.px': tabLayout.barExtraWidth * bar.timeSignatureRatio,
        'height.px': this.staffHeight
      }
      return style
    }
    style = { 'width.px': tabLayout.initialBarWidth * bar.timeSignatureRatio, 'height.px': this.staffHeight }
    return style
  }

  styleTimeSignature(bar: Bar, index: number) {
    let style
    if (this.hasTimeSignatureChanged(bar, index)) {
      style = {
        'width.px': tabLayout.leftBarExtraPadding
      }
      return style
    }
    style = { 'width.px': tabLayout.leftBarPadding }
    return style
  }

  styleSegment(segment: Segment) {
    let style
    if (!segment.isRest && segment.notes?.every(value => !value.fretValue && value.fretValue !== 0)) {
      style = { 'width.px': segment.separationSpace, 'background-color': 'rgba(255, 255, 255, 0.05)' }
      return style
    }
    style = { 'width.px': segment.separationSpace }
    return style
  }

  styleNote(note: Note) {
    let style
    if (!note.fretValue && note.fretValue !== 0) {
      style = { 'top.px': (41.7 * note.string) - 11, 'background-color': 'transparent' }
      return style
    }
    style = { 'top.px': (41.7 * note.string) - 11 }
    return style
  }

  assignSlide(note: Note) {
    let src = "../../../assets/svgs/effects/to-apply/"
    if (note.effects && note.effects.slides && (note.effects.slides.slideOut === "slideUp" || note.effects.slides.slideIn === "slideUp")) {
      src += "slide-up.svg"
    }
    if (note.effects && note.effects.slides && (note.effects.slides.slideOut === "slideDown" || note.effects.slides.slideIn === "slideDown")) {
      src += "slide-down.svg"
    }
    if (note.effects && note.effects.slides && note.effects.slides.slideOut === "slideToNote") {
      src += "slide-down.svg"
    }
    return src
  }

  styleSlideOut(note: Note, segment: Segment, bar: Bar) {
    if (!note.effects || !note.effects.slides) return {}
    let style
    if (note.effects.slides.slideOut === "slideToNote") {
      let widthMultiplier: number
      let extraWidth = 0
      let extraTranslation = 0
      if (segment === bar.segments[bar.segments.length - 1]) {
        extraWidth = 46 / 40
        extraTranslation = 23
      }
      if (segment.durationInverse < 4) {
        widthMultiplier = .95
      } else if (segment.durationInverse === 4) {
        widthMultiplier = .9
      } else if (segment.durationInverse > 8) {
        widthMultiplier = .5
      } else {
        widthMultiplier = .7
      }
      style = {
        "width.px": 40,
        "transform": `translateX(${(segment.separationSpace / 2) + extraTranslation}px) scaleX(${(segment.separationSpace / 40 * widthMultiplier) + extraWidth}) rotate(20deg)`,
      }
    } else if (note.effects.slides.slideOut === "slideDown") {
      style = { "width.px": 30, "max-width.px": segment.separationSpace, "transform": "translateX(25px) rotate(20deg)" }
    } else if (note.effects.slides.slideOut === "slideUp") {
      style = { "width.px": 30, "max-width.px": segment.separationSpace, "transform": "translateX(25px) rotate(-20deg)" }
    } else {
      style = { "display": "none" }
    }
    return style
  }

  styleSlideIn(note: Note, segment: Segment) {
    if (!note.effects || !note.effects.slides) return {}
    let style
    if (note.effects.slides.slideIn === "slideDown") {
      style = { "width.px": 30, "max-width.px": segment.separationSpace, "transform": "translateX(-25px) rotate(20deg)" }
    } else if (note.effects.slides.slideIn === "slideUp") {
      style = { "width.px": 30, "max-width.px": segment.separationSpace, "transform": "translateX(-25px) rotate(-20deg)" }
    } else {
      style = { "display": "none" }
    }
    return style
  }

  hasTimeSignatureChanged(bar: Bar, index: number) {
    if (index === 0 || JSON.stringify(bar.timeSignature) !== JSON.stringify(this.song.bars[index - 1].timeSignature)) {
      return true
    }
    return false
  }

  assignRestImg(segment: Segment) {
    let restsFolder = "../../../assets/svgs/rests/"
    if (!segment.effects || !segment.effects?.isDotted) {
      switch (segment.initialDurationInverse) {
        case 1:
          return restsFolder + "1st_rest.svg"
        case 2:
          return restsFolder + "2nd_rest.svg"
        case 4:
          return restsFolder + "4th_rest.svg"
        case 8:
          return restsFolder + "8th_rest.svg"
        case 16:
          return restsFolder + "16th_rest.svg"
        case 32:
          return restsFolder + "32nd_rest.svg"
        case 64:
          return restsFolder + "64th_rest.svg"
        default:
          return restsFolder + "4th_rest.svg"
      }
    } else if (segment.effects.isDotted) {
      switch (segment.initialDurationInverse) {
        case 1:
          return restsFolder + "dotted_1st_rest.svg"
        case 2:
          return restsFolder + "dotted_2nd_rest.svg"
        case 4:
          return restsFolder + "dotted_4th_rest.svg"
        case 8:
          return restsFolder + "dotted_8th_rest.svg"
        case 16:
          return restsFolder + "dotted_16th_rest.svg"
        case 32:
          return restsFolder + "dotted_32nd_rest.svg"
        case 64:
          return restsFolder + "dotted_64th_rest.svg"
        default:
          return restsFolder + "dotted_4th_rest.svg"
      }
    } else {
      return restsFolder + "4th_rest.svg"
    }
  }

  addBar() {
    this.tabService.addBar()
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
      this.tabService.changeFretValue(newFretValue)
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
