import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { Bar, exampleSong, Segment } from 'src/app/models/song.model';
import { rests } from 'src/assets/svgs'

export const tabLayout = {
  leftBarPadding: 48,
  leftBarExtraPadding: 80,
  initialBarWidth: 480,
  initialBarInnerWidth: 432,
  barExtraWidth: 528,
}

@Component({
  selector: 'app-tab',
  templateUrl: './tab.component.html',
  styleUrls: ['./tab.component.css']
})
export class TabComponent implements AfterViewInit {
  @ViewChild("canvas", { static: false }) canvas: ElementRef<HTMLCanvasElement> | undefined

  constructor() { }

  song = exampleSong

  ngAfterViewInit(): void {
    const canvas = this.canvas!.nativeElement
    const ctx: CanvasRenderingContext2D = canvas?.getContext("2d")!

    // Sets the value for the canvas context container according to each bar time signatures ratio
    const canvasWidth = (): number => {
      let width = 480
      this.song.bars.forEach((bar, index) => {
        if (index === 0 || JSON.stringify(bar.timeSignature) !== JSON.stringify(this.song.bars[index - 1].timeSignature)) {
          width += 528 * bar.timeSignatureRatio
        } else {
          width += 480 * bar.timeSignatureRatio
        }
      })
      return width
    }

    canvas.width = canvasWidth()
    ctx.translate(0, 50)
    ctx.strokeStyle = "#707070"
    ctx.lineWidth = 1
    ctx.font = "500 22pt Barlow Condensed"
    ctx.textAlign = "start"
    ctx.textBaseline = "middle"
    ctx.fillStyle = "#D6D6D6"

    ctx.save()

    // Iterates over bars array to draw tab
    this.song.bars.forEach((bar, i) => {
      // Draws staff bar
      this.drawBar(ctx, canvas, bar, i)
      // Restore to staff upper left corner
      ctx.restore()
      ctx.globalCompositeOperation = "source-over"
      ctx.save()
      // Add left padding
      this.spaceLeft(ctx, bar, i)
      // Iterating over segments to draw notes
      for (let segment of bar.segments) {
        this.drawSegment(segment, ctx)
      }
      // Restore to staff upper left corner
      ctx.restore()
      ctx.globalCompositeOperation = "destination-over"
      // Remapping to next bar
      this.translateToNextBar(ctx, bar, i)
      ctx.save()
    })

    ctx.restore()
    ctx.save()

    ctx.fillRect(0, 0, 10, 10)
  }

  // Draws bar frame and its strings
  private drawBar(canvasContext: CanvasRenderingContext2D, canvas: HTMLCanvasElement, bar: Bar, index: number) {
    canvasContext.font = "600 15px Barlow"
    canvasContext.fillStyle = "#404040"
    canvasContext.fillText((index + 1).toString(), 2, -10)
    if (index === 0 || JSON.stringify(bar.timeSignature) !== JSON.stringify(this.song.bars[index - 1].timeSignature)) {
      canvasContext.strokeRect(0, 0, tabLayout.barExtraWidth * bar.timeSignatureRatio, canvas.height - 110)
      this.drawStrings(canvasContext, bar, index)
      this.drawTimeSignature(canvasContext, bar)
      canvasContext.translate(tabLayout.barExtraWidth * bar.timeSignatureRatio, 0)
    } else {
      canvasContext.strokeRect(0, 0, tabLayout.initialBarWidth * bar.timeSignatureRatio, canvas.height - 110)
      this.drawStrings(canvasContext, bar, index)
      canvasContext.translate(tabLayout.initialBarWidth * bar.timeSignatureRatio, 0)
    }
  }

  // Draws instrument strings
  private drawStrings(canvasContext: CanvasRenderingContext2D, bar: Bar, index: number) {
    for (let i = 1; i <= this.song.instrument.strings - 2; i++) {
      canvasContext.moveTo(0, 42 * i)
      if (index === 0 || JSON.stringify(bar.timeSignature) !== JSON.stringify(this.song.bars[index - 1].timeSignature)) {
        canvasContext.lineTo(tabLayout.barExtraWidth * bar.timeSignatureRatio, 42 * i)
      } else {
        canvasContext.lineTo(tabLayout.initialBarWidth * bar.timeSignatureRatio, 42 * i)
      }
    }
    canvasContext.stroke()
  }

  // Draws segments
  private drawSegment(segment: Segment, canvasContext: CanvasRenderingContext2D) {
    if (segment.notes && segment.notes.length > 0) {
      for (let note of segment.notes) {
        let { fontBoundingBoxDescent, fontBoundingBoxAscent, actualBoundingBoxRight } = canvasContext.measureText(note.fretValue.toString())
        // Draws text background according to tab background color
        canvasContext.fillStyle = "#202020"
        canvasContext.fillRect(-2, 42 * note.string - 15, actualBoundingBoxRight + 4, fontBoundingBoxAscent + fontBoundingBoxDescent)
        // Draws note
        canvasContext.fillStyle = "white"
        canvasContext.fillText(note.fretValue.toString(), 0, 42 * note.string)
      }
    } else {

    }
    canvasContext.translate(segment.separationSpace, 0)
  }

  // Draws time signature at the beginning of the indicated bar
  private drawTimeSignature(canvasContext: CanvasRenderingContext2D, bar: Bar) {
    canvasContext.globalCompositeOperation = "source-over"
    canvasContext.font = "500 60px Barlow Condensed"
    canvasContext.fillStyle = "#fff"
    canvasContext.textAlign = "center"
    canvasContext.fillText(bar.timeSignature.numerator.toString(), tabLayout.leftBarExtraPadding / 2 * bar.timeSignatureRatio, 105 - 30)
    canvasContext.fillText(bar.timeSignature.denominator.toString(), tabLayout.leftBarExtraPadding / 2 * bar.timeSignatureRatio, 105 + 30)
  }

  // Adds left padding to the indicated bar
  private spaceLeft(canvasContext: CanvasRenderingContext2D, bar: Bar, index: number) {
    if (index === 0 || JSON.stringify(bar.timeSignature) !== JSON.stringify(this.song.bars[index - 1].timeSignature)) {
      canvasContext.translate(tabLayout.leftBarExtraPadding * bar.timeSignatureRatio, 0)
    } else {
      canvasContext.translate(tabLayout.leftBarPadding * bar.timeSignatureRatio, 0)
    }
  }

  // Remaps (0,0) to the next bar
  private translateToNextBar(canvasContext: CanvasRenderingContext2D, bar: Bar, index: number) {
    if (index === 0 || JSON.stringify(bar.timeSignature) !== JSON.stringify(this.song.bars[index - 1].timeSignature)) {
      canvasContext.translate(tabLayout.barExtraWidth * bar.timeSignatureRatio, 0)
    } else {
      canvasContext.translate(tabLayout.initialBarWidth * bar.timeSignatureRatio, 0)
    }
  }
}
