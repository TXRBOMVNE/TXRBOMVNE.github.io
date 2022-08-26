import { Component, OnInit } from '@angular/core';
import { Bar, exampleSong, Segment } from 'src/app/models/song.model';

export const tabLayout = {
  leftBarPadding: 48,
  leftBarExtraPadding: 80,
  initialBarWidth: 480,
  initialBarInnerWidth: 432,
  barExtraWidth: 528,
  canvasHeight: 340,
}

@Component({
  selector: 'app-tab',
  templateUrl: './tab.component.html',
  styleUrls: ['./tab.component.css']
})
export class TabComponent implements OnInit {
  constructor() { }

  tabLayout = tabLayout
  song = exampleSong
  staffHeight = 42 * (this.song.instrument.strings - 1)

  ngOnInit(): void { }

  styleBar(bar: Bar, index: number) {
    let style
    if (!bar.valid) {
      style = { 'border': 'red 1px solid' }
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
    style = { 'width.px': segment.separationSpace }
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
}
