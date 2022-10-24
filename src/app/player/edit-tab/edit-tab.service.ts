import { Injectable, QueryList } from '@angular/core';
import { interval, Subject, Subscription, take } from 'rxjs';
import { Bar, Note, Segment, Tab } from 'src/app/models/song.model';
import { TabService } from '../tab/tab.service';

@Injectable({
  providedIn: 'root'
})
export class EditTabService {
  constructor(private tabService: TabService) { }
  currentTab: Tab = this.tabService.currentTab
  modifyTab = new Subject<null>()
  noteSelection?: { segment: Segment, bar: Bar, note?: Note }
  HTMLBars?: QueryList<any>
  HTMLSegments?: QueryList<any>
  notePropertiesInput = {
    initialDurationInverse: 4,
    isDotted: false,
    isRest: false,
    timeSignatureNumerator: 4,
    timeSignatureDenominator: 4,
    slideOutMode: null,
    slideInMode: null
  }

  addBar() {
    const addDefaultSegment = () => {
      let notesArray: Note[] = []
      for (let i = this.currentTab.instrument.strings - 1; i > -1; i--) {
        notesArray.push({ string: i })
      }
      let defaultSegment = new Segment(false, 4, notesArray)
      return [defaultSegment]
    }
    this.currentTab.bars.push(new Bar(
      this.currentTab.bars[this.currentTab.bars.length - 1].tempo,
      this.currentTab.bars[this.currentTab.bars.length - 1].timeSignature,
      addDefaultSegment()
    ))
    this.modifyTab.next(null)
  }

  private addSegment(barIndex: number) {
    this.currentTab.bars[barIndex].segments.push(new Segment(this.notePropertiesInput.isRest, this.notePropertiesInput.initialDurationInverse, []))
    this.fillSegmentsNotesSpaces()
    this.modifyTab.next(null)
  }

  updateNoteSelection(noteSelection: { segment: Segment, bar: Bar, note?: Note }) {
    this.noteSelection = noteSelection
  }

  changeFretValue(noteInput: number) {
    if (!this.noteSelection || !this.noteSelection.note || !this.noteSelection.segment.notes || (!noteInput && noteInput !== 0)) return
    let barIndex = this.currentTab.bars.indexOf(this.noteSelection.bar)
    let segmentIndex = this.currentTab.bars[barIndex].segments.indexOf(this.noteSelection.segment)
    let noteIndex = this.currentTab.bars[barIndex].segments[segmentIndex].notes!.indexOf(this.noteSelection.note)
    this.currentTab.bars[barIndex].segments[segmentIndex].notes![noteIndex].fretValue = noteInput
    this.modifyTab.next(null)
  }

  changeDuration(durationInput: number, isDotted?: boolean | null) {
    if (!this.noteSelection) return
    let barIndex = this.currentTab.bars.indexOf(this.noteSelection.bar)
    let segmentIndex = this.currentTab.bars[barIndex].segments.indexOf(this.noteSelection.segment)
    if (durationInput || durationInput === 0) {
      this.currentTab.bars[barIndex].segments[segmentIndex].initialDurationInverse = durationInput
    }
    if (isDotted === false || isDotted) {
      this.currentTab.bars[barIndex].segments[segmentIndex].effects = { isDotted: isDotted }
    }
    this.modifyTab.next(null)
  }

  changeTimeSignature(timeSignatureNumerator: number, timeSignatureDenominator: number) {
    if (!this.noteSelection) return
    let barIndex = this.currentTab.bars.indexOf(this.noteSelection.bar)
    this.currentTab.bars[barIndex].timeSignature = { numerator: timeSignatureNumerator, denominator: timeSignatureDenominator }
    this.modifyTab.next(null)
  }

  changeSlides(slidesInput: { slideOut?: "slideUp" | "slideDown" | "slideToNote", slideIn?: "slideUp" | "slideDown" }) {
    if (!this.noteSelection || !this.noteSelection.note) return
    let barIndex = this.currentTab.bars.indexOf(this.noteSelection.bar)
    let segmentIndex = this.currentTab.bars[barIndex].segments.indexOf(this.noteSelection.segment)
    let noteIndex = this.currentTab.bars[barIndex].segments[segmentIndex].notes!.indexOf(this.noteSelection.note!)
    if (!this.currentTab.bars[barIndex].segments[segmentIndex].notes[noteIndex].effects) {
      this.currentTab.bars[barIndex].segments[segmentIndex].notes[noteIndex].effects = {}
    }
    this.currentTab.bars[barIndex].segments[segmentIndex].notes[noteIndex].effects!.slides = slidesInput
    this.modifyTab.next(null)
  }

  toggleRest(isRest: boolean) {
    if (!this.noteSelection) return
    let barIndex = this.currentTab.bars.indexOf(this.noteSelection.bar)
    let segmentIndex = this.currentTab.bars[barIndex].segments.indexOf(this.noteSelection.segment)
    if (this.noteSelection.note) {
      let noteIndex = this.currentTab.bars[barIndex].segments[segmentIndex].notes!.indexOf(this.noteSelection.note)
    }
    this.currentTab.bars[barIndex].segments[segmentIndex].isRest = isRest
    this.modifyTab.next(null)
  }

  selectNextSegmentNote() {
    if (!this.noteSelection) return
    let barIndex = this.currentTab.bars.indexOf(this.noteSelection.bar)
    let segmentIndex = this.currentTab.bars[barIndex].segments.indexOf(this.noteSelection.segment)
    let noteIndex: number | undefined
    if (this.noteSelection.note && !this.noteSelection.segment.isRest) {
      noteIndex = this.currentTab.bars[barIndex].segments[segmentIndex].notes!.indexOf(this.noteSelection.note!)
    }
    let barHTML = this.HTMLBars?.get(barIndex).el.nativeElement
    let nextSegmentHTML
    let nextNoteHTML: any
    if (this.noteSelection.bar.totalDurationRatio < this.noteSelection.bar.timeSignatureRatio) {
      this.addSegment(barIndex)
      this.modifyTab.next(null)
      this.HTMLSegments?.changes.pipe(take(1)).subscribe(() => {
        nextSegmentHTML = barHTML.lastElementChild.children[segmentIndex + 1]
        nextNoteHTML = nextSegmentHTML.lastElementChild.children[noteIndex!] || nextSegmentHTML.lastElementChild.children[0]
        nextNoteHTML.focus()
      })
      return
    }
    if (this.noteSelection.bar.segments[segmentIndex] === this.noteSelection.bar.segments[this.noteSelection.bar.segments.length - 1]) {
      if (this.noteSelection.bar.valid) {
        if (!this.currentTab.bars[barIndex + 1]) {
          this.addBar()
          this.modifyTab.next(null)
          this.HTMLBars?.changes.pipe(take(1)).subscribe(() => {
            barHTML = this.HTMLBars?.get(barIndex + 1).el.nativeElement
            nextSegmentHTML = barHTML.lastElementChild.children[0]
            nextNoteHTML = nextSegmentHTML.lastElementChild.children[noteIndex!] || nextSegmentHTML.lastElementChild.children[0]
            nextNoteHTML.focus()
          })
          return
        }
        barHTML = this.HTMLBars?.get(barIndex + 1).el.nativeElement
        nextSegmentHTML = barHTML.lastElementChild.children[0]
        nextNoteHTML = nextSegmentHTML.lastElementChild.children[noteIndex!] || nextSegmentHTML.lastElementChild.children[0]
        nextNoteHTML.focus()
        return
      }
    }
    barHTML = this.HTMLBars?.get(barIndex).el.nativeElement
    nextSegmentHTML = barHTML.lastElementChild.children[segmentIndex + 1]
    nextNoteHTML = nextSegmentHTML.lastElementChild.children[noteIndex!] || nextSegmentHTML.lastElementChild.children[0]
    nextNoteHTML.focus()
  }

  selectPreviousSegmentNote() {
    if (!this.noteSelection) return
    let barIndex = this.currentTab.bars.indexOf(this.noteSelection.bar)
    let segmentIndex = this.currentTab.bars[barIndex].segments.indexOf(this.noteSelection.segment)
    let noteIndex: number | undefined
    if (this.noteSelection.note) {
      noteIndex = this.currentTab.bars[barIndex].segments[segmentIndex].notes!.indexOf(this.noteSelection.note)
    }
    let barHTML
    let previousSegmentHTML
    let previousNoteHTML: any
    // If the current segment is the last one of the song and it's empty
    if ((this.currentTab.bars[barIndex] === this.currentTab.bars[this.currentTab.bars.length - 1] &&
      this.noteSelection.segment === this.noteSelection.bar.segments[this.noteSelection.bar.segments.length - 1]) &&
      !this.noteSelection.segment.isRest &&
      this.currentTab.bars[barIndex].segments[segmentIndex].notes.every(note => !note.fretValue && note.fretValue !== 0)
    ) {
      // If there is only one segment, removes last bar; removes only segment otherwise
      if (this.currentTab.bars[barIndex].segments.length <= 1) {
        this.currentTab.bars.pop()
        this.modifyTab.next(null)
      } else {
        this.currentTab.bars[barIndex].segments.pop()
        this.modifyTab.next(null)
      }
    }
    // If there is a previous segment
    if (this.noteSelection.bar.segments[segmentIndex - 1]) {
      barHTML = this.HTMLBars?.get(barIndex).el.nativeElement
      previousSegmentHTML = barHTML.lastElementChild.children[segmentIndex - 1]
      previousNoteHTML = previousSegmentHTML.lastElementChild.children[noteIndex!] || previousSegmentHTML.lastElementChild.children[0]
      previousNoteHTML.focus()
    } // If the current segment is the first one and there is a previous bar
    else if (!this.noteSelection.bar.segments[segmentIndex - 1] && barIndex !== 0) {
      barHTML = this.HTMLBars?.get(barIndex - 1).el.nativeElement
      previousSegmentHTML = barHTML.lastElementChild.children[this.currentTab.bars[barIndex - 1].segments.length - 1]
      if (this.noteSelection.note) {
        // If the previous segment isn't a rest, select a note;if it is a rest, select the rest
        previousNoteHTML = previousSegmentHTML.lastElementChild.children[noteIndex!] || previousSegmentHTML.lastElementChild.children[0]
        previousNoteHTML.focus()
      } // If the current segment is a rest
      else if (this.noteSelection.segment.isRest) {
        previousNoteHTML = previousSegmentHTML.lastElementChild.children[Math.floor(this.currentTab.instrument.strings / 2)]
        previousNoteHTML.focus()
      }
    }
  }

  selectUpperNote() {
    // If the current segment is a rest or there isn't a note selected, do nothing
    if (!this.noteSelection || this.noteSelection.segment.isRest || !this.noteSelection.note) return
    let barIndex = this.currentTab.bars.indexOf(this.noteSelection.bar)
    let segmentIndex = this.currentTab.bars[barIndex].segments.indexOf(this.noteSelection.segment)
    let noteIndex = this.currentTab.bars[barIndex].segments[segmentIndex].notes!.indexOf(this.noteSelection.note)
    let barHTML = this.HTMLBars?.get(barIndex).el.nativeElement
    let segmentHTML = barHTML.lastElementChild.children[segmentIndex]
    let upperNoteHTML: any

    // If there is an upper note
    if (this.noteSelection.segment.notes[noteIndex + 1]) {
      upperNoteHTML = segmentHTML.lastElementChild.children[noteIndex + 1]
      upperNoteHTML.focus()
    }
  }

  selectLowerNote() {
    // If the current segment is a rest or there isn't a note selected, do nothing
    if (!this.noteSelection || this.noteSelection.segment.isRest || !this.noteSelection.note) return
    let barIndex = this.currentTab.bars.indexOf(this.noteSelection.bar)
    let segmentIndex = this.currentTab.bars[barIndex].segments.indexOf(this.noteSelection.segment)
    let noteIndex = this.currentTab.bars[barIndex].segments[segmentIndex].notes!.indexOf(this.noteSelection.note)
    let barHTML = this.HTMLBars?.get(barIndex).el.nativeElement
    let segmentHTML = barHTML.lastElementChild.children[segmentIndex]
    let lowerNoteHTML: any

    // If there is an lower note
    if (this.noteSelection.segment.notes[noteIndex - 1]) {
      lowerNoteHTML = segmentHTML.lastElementChild.children[noteIndex - 1]
      lowerNoteHTML.focus()
    }
  }

  // Removes selected note fret value if the segment selected isn't a rest; if it's a rest, do nothing.
  removeNote() {
    if (!this.noteSelection) return
    let barIndex = this.currentTab.bars.indexOf(this.noteSelection.bar)
    let segmentIndex = this.currentTab.bars[barIndex].segments.indexOf(this.noteSelection.segment)
    if (this.noteSelection.note) {
      let noteIndex = this.currentTab.bars[barIndex].segments[segmentIndex].notes!.indexOf(this.noteSelection.note)
      if (this.noteSelection.segment.notes.every(note => !note.fretValue && note.fretValue !== 0)) {
        if (this.noteSelection.bar.segments.length === 1 && this.currentTab.bars.length !== 1) {
          this.currentTab.bars.splice(barIndex, 1)
        } else {
          this.currentTab.bars[barIndex].segments.splice(segmentIndex, 1)
        }
        this.noteSelection = undefined
        return
      }
      this.currentTab.bars[barIndex].segments[segmentIndex].notes[noteIndex].fretValue = undefined
    } else if (this.noteSelection.segment.isRest) {
      if (this.noteSelection.bar.segments.length === 1 && this.currentTab.bars.length !== 1) {
        this.currentTab.bars.splice(barIndex, 1)
      } else {
        this.currentTab.bars[barIndex].segments.splice(segmentIndex, 1)
      }
      this.noteSelection = undefined
    }
    this.modifyTab.next(null)
  }

  // Fills segmentes with blank notes to make note selection work with blank spaces
  fillSegmentsNotesSpaces() {
    this.currentTab.bars.forEach(bar => {
      bar.segments.forEach(segment => {
        if (!segment.notes) {
          segment.notes = []
        }
        for (let i = 0; i < this.currentTab.instrument.strings; i++) {
          if (!segment.notes?.find(note => note.string === i)) {
            segment.notes!.push({ string: i })
          }
        }
        segment.notes.sort((a, b) => b.string - a.string)
      })
    })
  }

  // Indexes notes sorting them by the number of the instrument string
  sortNotes() {
    this.currentTab.bars.forEach(bar => {
      bar.segments.forEach(segment => {
        if (segment.isRest) return
        segment.notes?.sort((a, b) => {
          return b.string - a.string
        })
      })
    })
    this.modifyTab.next(null)
  }

  playInterval = interval(500)
  sub?: Subscription

  play() {
    let index = 0
    this.sub = this.playInterval.subscribe(() => {
      if (!this.HTMLSegments?.get(index)) {
        this.sub!.unsubscribe()
        return
      }
      this.HTMLSegments?.get(index).el.nativeElement.focus()
      index++
    })
  }

  pause() {
    this.sub?.unsubscribe()
  }
}
