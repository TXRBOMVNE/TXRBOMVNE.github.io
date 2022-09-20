import { tabLayout } from "../player/tab/tab.component"

export interface Tab {
  instrument: { name: string, strings: number }
  bars: Bar[],
  initialTempo: number,
  initialKey: number,
  mode: boolean,
  tuning?: string
}

export class Bar {
  constructor(
    public tempo: number,
    public timeSignature: {
      numerator: number,
      denominator: number
    },
    public segments: Segment[],
  ) { }

  // Gets ratio according to bar time signature to adjust bar width and to get how many beats should have the bar
  get timeSignatureRatio(): number {
    return this.timeSignature.numerator / this.timeSignature.denominator
  }

  // Gets the bar validation and completed according to segments duration
  get valid() {
    let count = 0
    for (let segment of this.segments) {
      count += segment.durationInverse ** -1
    }
    if (count === (this.timeSignatureRatio * (4 / this.timeSignature.denominator))) {
      return true
    } else {
      return false
    }
  }

  // Returns ratio based on segments total duration
  get totalDurationRatio() {
    let durationRatio = 0
    for (let segment of this.segments) {
      durationRatio += (segment.durationInverse ** -1)
    }
    return durationRatio
  }
}

export class Segment {
  constructor(
    public isRest: boolean,
    public initialDurationInverse: number,
    public notes: Note[],
    public effects?: {
      isDotted: boolean | null
    },
  ) { }

  get durationInverse() {
    let actualDurationInverse = this.initialDurationInverse
    if (this.effects && this.effects.isDotted) {
      actualDurationInverse = (actualDurationInverse ** -1) + ((actualDurationInverse ** -1) / 2)
      actualDurationInverse = actualDurationInverse ** -1
    }
    return actualDurationInverse
  }

  get separationSpace() {
    let barInnerWidth = tabLayout.initialBarInnerWidth
    let separationPx = barInnerWidth / this.durationInverse
    return separationPx
  }
}

export interface Note {
  fretValue?: number,
  string: number
  effects?: {
    slides?: {
      slideOut?: "slideUp" | "slideDown" | "slideToNote" | null
      slideIn?: "slideUp" | "slideDown" | null
    }
  }
}

export let exampleSong: Tab = {
  instrument: { name: "guitar", strings: 6 },
  initialKey: 4,
  mode: true,
  initialTempo: 216,
  tuning: "Standard",
  bars: [
    new Bar(216, { numerator: 4, denominator: 4 },
      [
        new Segment(false, 4, [{ fretValue: 0, string: 5 }, { fretValue: 2, string: 4 }, { fretValue: 2, string: 3 }]),
        new Segment(true, 2, [{ fretValue: 0, string: 5 }], { isDotted: true })
      ]),
    new Bar(216, { numerator: 4, denominator: 4 },
      [
        new Segment(false, 4, [{ fretValue: 10, string: 5 }, { fretValue: 12, string: 4 }, { fretValue: 12, string: 3 }]),
        new Segment(false, 4, [{ fretValue: 9, string: 5 }, { fretValue: 11, string: 4 }, { fretValue: 11, string: 3 }]),
        new Segment(false, 2, [{ fretValue: 8, string: 5 }, { fretValue: 10, string: 4 }, { fretValue: 10, string: 3 }]),
      ]),
    new Bar(216, { numerator: 4, denominator: 4 },
      [
        new Segment(true, 1, [])
      ]),
    new Bar(216, { numerator: 4, denominator: 4 },
      [
        new Segment(false, 8, [{ fretValue: 0, string: 5 }]),
        new Segment(false, 8, [{ fretValue: 0, string: 5 }]),
        new Segment(false, 8, [{ fretValue: 12, string: 5 }]),
        new Segment(false, 8, [{ fretValue: 0, string: 5 }]),
        new Segment(false, 8, [{ fretValue: 0, string: 5 }]),
        new Segment(false, 8, [{ fretValue: 11, string: 5 }]),
        new Segment(false, 8, [{ fretValue: 0, string: 5 }]),
        new Segment(false, 8, [{ fretValue: 0, string: 5 }]),
      ]),
    new Bar(216, { numerator: 4, denominator: 4 },
      [
        new Segment(false, 4, [{ fretValue: 10, string: 5 }, { fretValue: 12, string: 4 }, { fretValue: 12, string: 3 }]),
        new Segment(false, 4, [{ fretValue: 9, string: 5 }, { fretValue: 11, string: 4 }, { fretValue: 11, string: 3 }]),
        new Segment(false, 2, [{ fretValue: 8, string: 5 }, { fretValue: 10, string: 4 }, { fretValue: 10, string: 3 }]),
      ]),
    new Bar(216, { numerator: 4, denominator: 4 },
      [
        new Segment(false, 8, [{ fretValue: 0, string: 5 }]),
        new Segment(false, 8, [{ fretValue: 0, string: 5 }]),
        new Segment(false, 8, [{ fretValue: 7, string: 5 }]),
        new Segment(false, 8, [{ fretValue: 0, string: 5 }]),
        new Segment(false, 8, [{ fretValue: 0, string: 5 }]),
        new Segment(false, 8, [{ fretValue: 6, string: 5 }]),
        new Segment(false, 8, [{ fretValue: 0, string: 5 }]),
        new Segment(false, 8, [{ fretValue: 0, string: 5 }]),
      ]),
    new Bar(216, { numerator: 4, denominator: 4 },
      [
        new Segment(false, 8, [{ fretValue: 5, string: 5 }]),
        new Segment(false, 8, [{ fretValue: 0, string: 5 }]),
        new Segment(false, 8, [{ fretValue: 4, string: 5 }]),
        new Segment(false, 8, [{ fretValue: 0, string: 5 }]),
        new Segment(false, 8, [{ fretValue: 3, string: 5 }]),
        new Segment(false, 8, [{ fretValue: 0, string: 5 }]),
        new Segment(false, 8, [{ fretValue: 2, string: 5 }]),
        new Segment(false, 8, [{ fretValue: 1, string: 5 }]),
      ]),
    new Bar(216, { numerator: 4, denominator: 4 },
      [
        new Segment(false, 8, [{ fretValue: 0, string: 5 }]),
        new Segment(false, 8, [{ fretValue: 0, string: 5 }]),
        new Segment(false, 8, [{ fretValue: 12, string: 5 }]),
        new Segment(false, 8, [{ fretValue: 0, string: 5 }]),
        new Segment(false, 8, [{ fretValue: 0, string: 5 }]),
        new Segment(false, 8, [{ fretValue: 11, string: 5 }]),
        new Segment(false, 8, [{ fretValue: 0, string: 5 }]),
        new Segment(false, 8, [{ fretValue: 0, string: 5 }]),
      ]),
    new Bar(216, { numerator: 4, denominator: 4 },
      [
        new Segment(false, 4, [{ fretValue: 10, string: 5 }, { fretValue: 12, string: 4 }, { fretValue: 12, string: 3 }]),
        new Segment(false, 4, [{ fretValue: 9, string: 5 }, { fretValue: 11, string: 4 }, { fretValue: 11, string: 3 }]),
        new Segment(false, 2, [{ fretValue: 8, string: 5 }, { fretValue: 10, string: 4 }, { fretValue: 10, string: 3 }]),
      ]),
    new Bar(216, { numerator: 4, denominator: 4 },
      [
        new Segment(false, 8, [{ fretValue: 0, string: 5 }]),
        new Segment(false, 8, [{ fretValue: 0, string: 5 }]),
        new Segment(false, 8, [{ fretValue: 7, string: 5 }]),
        new Segment(false, 8, [{ fretValue: 0, string: 5 }]),
        new Segment(false, 8, [{ fretValue: 0, string: 5 }]),
        new Segment(false, 8, [{ fretValue: 6, string: 5 }]),
        new Segment(false, 8, [{ fretValue: 0, string: 5 }]),
        new Segment(false, 8, [{ fretValue: 0, string: 5 }]),
      ]),
    new Bar(216, { numerator: 4, denominator: 4 },
      [
        new Segment(false, 8, [{ fretValue: 5, string: 5 }]),
        new Segment(false, 8, [{ fretValue: 0, string: 5 }]),
        new Segment(false, 8, [{ fretValue: 4, string: 5 }]),
        new Segment(false, 8, [{ fretValue: 0, string: 5 }]),
        new Segment(false, 8, [{ fretValue: 3, string: 5 }]),
        new Segment(false, 8, [{ fretValue: 0, string: 5 }]),
        new Segment(false, 8, [{ fretValue: 2, string: 5 }]),
        new Segment(false, 8, [{ fretValue: 1, string: 5 }]),
      ]),
  ]
}
