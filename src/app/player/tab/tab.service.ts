import { Injectable } from '@angular/core';
import { Bar, exampleSong, Note, Segment, Tab } from 'src/app/models/song.model';

@Injectable({
  providedIn: 'root'
})
export class TabService {

  constructor() { }

  song: Tab = exampleSong
  noteSelection?: { segment: Segment, bar: Bar, note?: Note }

  addBar() {
    const addDefaultSegment = () => {
      let notesArray: Note[] = []
      for (let i = 0; i < exampleSong.instrument.strings; i++) {
        notesArray.push({ string: i })
      }
      let defaultSegment = new Segment(false, 4, undefined, notesArray)
      return [defaultSegment]
    }

    exampleSong.bars.push(new Bar(
      exampleSong.bars[exampleSong.bars.length - 1].tempo,
      exampleSong.bars[exampleSong.bars.length - 1].timeSignature,
      addDefaultSegment()
    ))
  }

  updateNoteSelection(noteSelection: { segment: Segment, bar: Bar, note?: Note }) {
    this.noteSelection = noteSelection
  }

  changeFretValue(noteInput: number) {
    if (!this.noteSelection || !this.noteSelection.note || !this.noteSelection.segment.notes || (!noteInput && noteInput !== 0)) return

    let barIndex = this.song.bars.indexOf(this.noteSelection.bar)
    let segmentIndex = this.song.bars[barIndex].segments.indexOf(this.noteSelection.segment)
    let noteIndex = this.song.bars[barIndex].segments[segmentIndex].notes!.indexOf(this.noteSelection.note)

    this.song.bars[barIndex].segments[segmentIndex].notes![noteIndex].fretValue = noteInput
  }

  changeDuration(durationInput: number, isDotted?: boolean | null) {
    if (!this.noteSelection) return

    let barIndex = this.song.bars.indexOf(this.noteSelection.bar)
    let segmentIndex = this.song.bars[barIndex].segments.indexOf(this.noteSelection.segment)
    if (this.noteSelection.note) {
      let noteIndex = this.song.bars[barIndex].segments[segmentIndex].notes!.indexOf(this.noteSelection.note)
    }

    if (durationInput || durationInput === 0) {
      this.song.bars[barIndex].segments[segmentIndex].initialDurationInverse = durationInput
    }

    if (isDotted === false || isDotted) {
      this.song.bars[barIndex].segments[segmentIndex].effects = { isDotted: isDotted }
    }
  }
}
