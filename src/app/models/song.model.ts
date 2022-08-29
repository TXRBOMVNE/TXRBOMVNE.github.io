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

  // Gets if the bar is valid and completed according to segments duration
  get valid() {
    let count = 0

    for (let segment of this.segments) {
      count += segment.durationInverse ** -1
    }

    if (count === (this.timeSignatureRatio)) {
      return true
    } else {
      return false
    }
  }
}

export class Segment {
  constructor(
    public isRest: boolean,
    public initialDurationInverse: number,
    public effects?: {
      isDotted: boolean | null
    },
    public notes?: Note[]
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
      slideToNote: "slideAndTie" | "slideToNote"
      slideOut: "slideUp" | "slideDown"
      slideIn: "slideUp" | "slideDown"
    }
  }
}

export let exampleSong: Tab = {
  instrument: { name: "guitar", strings: 6 },
  initialKey: 4,
  mode: true,
  initialTempo: 110,
  tuning: "Standard",
  bars: [
    new Bar(110, { numerator: 4, denominator: 4 },
      [
        new Segment(true, 1, undefined, [{ fretValue: 0, string: 5 }]),
      ]),
    new Bar(110, { numerator: 4, denominator: 4 },
      [
        new Segment(false, 8, undefined, [{ fretValue: 0, string: 5 }, { fretValue: 0, string: 0 }]),
        new Segment(false, 8, undefined, [{ fretValue: 3, string: 5 }, { fretValue: 5, string: 4 }]),
        new Segment(false, 8, undefined, [{ fretValue: 5, string: 5 }, { fretValue: 7, string: 4 }]),
        new Segment(false, 8, undefined, [{ fretValue: 0, string: 5 }]),
        new Segment(false, 8, undefined, [{ fretValue: 6, string: 5 }, { fretValue: 8, string: 4 }]),
        new Segment(false, 8, undefined, [{ fretValue: 5, string: 5 }, { fretValue: 7, string: 4 }]),
        new Segment(false, 8, undefined, [{ fretValue: 3, string: 5 }, { fretValue: 5, string: 4 }]),
        new Segment(false, 8, undefined, [{ fretValue: 5, string: 5 }, { fretValue: 7, string: 4 }]),
      ]),
    new Bar(110, { numerator: 4, denominator: 4 },
      [
        new Segment(false, 8, undefined, [{ fretValue: 0, string: 5 }]),
        new Segment(false, 8, undefined, [{ fretValue: 0, string: 5 }]),
        new Segment(false, 8, undefined, [{ fretValue: 0, string: 5 }]),
        new Segment(false, 8, undefined, [{ fretValue: 0, string: 5 }]),
        new Segment(false, 8, undefined, [{ fretValue: 0, string: 5 }]),
        new Segment(false, 8, undefined, [{ fretValue: 0, string: 5 }]),
        new Segment(false, 8, undefined, [{ fretValue: 0, string: 5 }]),
        new Segment(false, 8, undefined, [{ fretValue: 0, string: 5 }]),
      ]),
    new Bar(110, { numerator: 3, denominator: 4 },
      [
        new Segment(false, 8, undefined, [{ fretValue: 0, string: 5 }]),
        new Segment(false, 8, undefined, [{ fretValue: 3, string: 5 }, { fretValue: 5, string: 4 }]),
        new Segment(false, 8, undefined, [{ fretValue: 5, string: 5 }, { fretValue: 7, string: 4 }]),
        new Segment(true, 8, undefined),
        new Segment(false, 8, undefined, [{ fretValue: 3, string: 5 }, { fretValue: 5, string: 4 }]),
        new Segment(false, 8, undefined, [{ fretValue: 5, string: 5 }, { fretValue: 7, string: 4 }]),
      ]),
  ]
}
