import { HostListener, Injectable, QueryList } from '@angular/core';
import { Subject } from 'rxjs';
import { Bar, Note, Segment } from 'src/app/models/song.model';
import { PlayerService } from '../player.service';
import { tabLayout } from './tab.component';

@Injectable({
  providedIn: 'root'
})
export class TabService {

  constructor(private playerService: PlayerService) { }

  tabLayout = tabLayout
  currentTab = this.playerService.currentTab.value!
  stringSeparationPx = (.073 * window.innerHeight) >= 42 ? 39.7 : ((.073 * window.innerHeight) - 2.3)
  staffHeight = (this.stringSeparationPx + 2.3) * (this.currentTab.instrument.strings - 1)
  HTMLSegments?: QueryList<any>
  isPlaying = new Subject<boolean>()

  subToTab() {
    return this.playerService.currentTab.subscribe(tab => {
      this.currentTab = tab!
      this.staffHeight = (this.stringSeparationPx + 2.3) * (this.currentTab.instrument.strings - 1)
    })
  }

  styleBar(bar: Bar, index: number) {
    let style: any = {}
    style['height.px'] = this.staffHeight
    if (!bar.valid && bar.totalDurationRatio > bar.timeSignatureRatio) {
      style['border'] = 'red 1px solid'
      style['transform'] = 'translateY(-1px)'
      return style
    } else if (!bar.valid && bar.totalDurationRatio < bar.timeSignatureRatio) {
      style['border'] = 'yellow 1px solid'
      style['transform'] = 'translateY(-1px)'
      return style
    }
    if (this.hasTimeSignatureChanged(bar, index)) {
      style['width.px'] = tabLayout.barExtraWidth * bar.timeSignatureRatio
      return style
    }
    style['width.px'] = tabLayout.initialBarWidth * bar.timeSignatureRatio
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
      style = { 'width.px': segment.separationSpacePx, 'background-color': 'rgba(255, 255, 255, 0.05)' }
      return style
    }
    style = { 'width.px': segment.separationSpacePx }
    return style
  }

  styleNote(note: Note) {
    let style
    if (!note.fretValue && note.fretValue !== 0) {
      style = { 'top.px': ((this.stringSeparationPx + 2) * note.string) - 11, 'background-color': 'transparent' }
      return style
    }
    style = { 'top.px': ((this.stringSeparationPx + 2) * note.string) - 11 }
    return style
  }

  assignSlide(note: Note) {
    let src = 'https://firebasestorage.googleapis.com/v0/b/tab-player.appspot.com/o/assets%2Fsvgs%2Fto-apply%2F'
    if (note.effects && note.effects.slides && (note.effects.slides.slideOut === 'slideUp' || note.effects.slides.slideIn === 'slideUp')) {
      src += 'slide-up.svg'
    }
    if (note.effects && note.effects.slides && (note.effects.slides.slideOut === 'slideDown' || note.effects.slides.slideIn === 'slideDown')) {
      src += 'slide-down.svg'
    }
    if (note.effects && note.effects.slides && note.effects.slides.slideOut === 'slideToNote') {
      src += 'slide-down.svg'
    }
    src += '?alt=media'
    return src
  }

  styleSlideOut(note: Note, segment: Segment, bar: Bar) {
    if (!note.effects || !note.effects.slides) return {}
    let style
    if (note.effects.slides.slideOut === 'slideToNote') {
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
        'width.px': 40,
        'transform': `translateX(${(segment.separationSpacePx / 2) + extraTranslation}px) scaleX(${(segment.separationSpacePx / 40 * widthMultiplier) + extraWidth}) rotate(20deg)`,
      }
    } else if (note.effects.slides.slideOut === 'slideDown') {
      style = { 'width.px': 30, 'max-width.px': segment.separationSpacePx, 'transform': 'translateX(25px) rotate(20deg)' }
    } else if (note.effects.slides.slideOut === 'slideUp') {
      style = { 'width.px': 30, 'max-width.px': segment.separationSpacePx, 'transform': 'translateX(25px) rotate(-20deg)' }
    } else {
      style = { 'display': 'none' }
    }
    return style
  }

  styleSlideIn(note: Note, segment: Segment) {
    if (!note.effects || !note.effects.slides) return {}
    let style
    if (note.effects.slides.slideIn === 'slideDown') {
      style = { 'width.px': 30, 'max-width.px': segment.separationSpacePx, 'transform': 'translateX(-25px) rotate(20deg)' }
    } else if (note.effects.slides.slideIn === 'slideUp') {
      style = { 'width.px': 30, 'max-width.px': segment.separationSpacePx, 'transform': 'translateX(-25px) rotate(-20deg)' }
    } else {
      style = { 'display': 'none' }
    }
    return style
  }

  assignRestImg(segment: Segment) {
    let restsFolder = 'https://firebasestorage.googleapis.com/v0/b/tab-player.appspot.com/o/assets%2Fsvgs%2Frests%2F'
    if (!segment.effects || !segment.effects?.isDotted) {
      switch (segment.initialDurationInverse) {
        case 1:
          return restsFolder + '1st_rest.svg?alt=media'
        case 2:
          return restsFolder + '2nd_rest.svg?alt=media'
        case 4:
          return restsFolder + '4th_rest.svg?alt=media'
        case 8:
          return restsFolder + '8th_rest.svg?alt=media'
        case 16:
          return restsFolder + '16th_rest.svg?alt=media'
        case 32:
          return restsFolder + '32nd_rest.svg?alt=media'
        case 64:
          return restsFolder + '64th_rest.svg?alt=media'
        default:
          return restsFolder + '4th_rest.svg?alt=media'
      }
    } else if (segment.effects.isDotted) {
      switch (segment.initialDurationInverse) {
        case 1:
          return restsFolder + 'dotted_1st_rest.svg?alt=media'
        case 2:
          return restsFolder + 'dotted_2nd_rest.svg?alt=media'
        case 4:
          return restsFolder + 'dotted_4th_rest.svg?alt=media'
        case 8:
          return restsFolder + 'dotted_8th_rest.svg?alt=media'
        case 16:
          return restsFolder + 'dotted_16th_rest.svg?alt=media'
        case 32:
          return restsFolder + 'dotted_32nd_rest.svg?alt=media'
        case 64:
          return restsFolder + 'dotted_64th_rest.svg?alt=media'
        default:
          return restsFolder + 'dotted_4th_rest.svg?alt=media'
      }
    } else {
      return restsFolder + '4th_rest.svg?alt=media'
    }
  }

  hasTimeSignatureChanged(bar: Bar, index: number) {
    if (index === 0 || (bar.timeSignature.denominator !== this.currentTab.bars[index - 1].timeSignature.denominator ||
      bar.timeSignature.numerator !== this.currentTab.bars[index - 1].timeSignature.numerator)) {
      return true
    }
    return false
  }

  play() {
    this.isPlaying.next(true)
  }

  pause() {
    this.isPlaying.next(false)
  }
}
