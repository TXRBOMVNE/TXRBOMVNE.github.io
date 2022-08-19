import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { Bar, exampleSong, Segment } from 'src/app/models/song.model';

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
    let canvas = this.canvas?.nativeElement!
    let ctx: CanvasRenderingContext2D = canvas?.getContext("2d")!

    canvas.width = this.song.bars.length * tabLayout.initialBarWidth * 1.5
    ctx.translate(0, 20)
    ctx.strokeStyle = "#707070"
    ctx.lineWidth = 1
    ctx.font = "500 22pt Barlow Condensed"
    ctx.textAlign = "start"
    ctx.textBaseline = "middle"
    ctx.fillStyle = "#D6D6D6"

    ctx.save()

    // Iterating over bars array to draw tab

    this.song.bars.forEach((bar, i) => {
      // Draw staff bar
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

    ctx.stroke()

    ctx.restore()
    ctx.save()

    ctx.fillRect(10, 10, 10, 10)
  }

  // Draw staff
  private drawBar(canvasContext: CanvasRenderingContext2D, canvas: HTMLCanvasElement, bar: Bar, index: number) {
    if (index === 0 || JSON.stringify(bar.timeSignature) !== JSON.stringify(this.song.bars[index - 1].timeSignature)) {
      canvasContext.strokeRect(0, 0, tabLayout.barExtraWidth, canvas.height - 40)
      this.drawStrings(canvasContext, bar, index)
      this.drawTimeSignature(canvasContext, bar)
      canvasContext.translate(tabLayout.barExtraWidth, 0)
    } else {
      canvasContext.strokeRect(0, 0, tabLayout.initialBarWidth, canvas.height - 40)
      this.drawStrings(canvasContext, bar, index)
      canvasContext.translate(tabLayout.initialBarWidth, 0)
    }
  }

  // Draw instrument strings
  private drawStrings(canvasContext: CanvasRenderingContext2D, bar: Bar, index: number) {
    for (let i = 1; i <= this.song.instrument.strings - 2; i++) {
      canvasContext.moveTo(0, 42 * i)
      if (index === 0 || JSON.stringify(bar.timeSignature) !== JSON.stringify(this.song.bars[index - 1].timeSignature)) {
        canvasContext.lineTo(tabLayout.barExtraWidth, 42 * i)
      } else {
        canvasContext.lineTo(tabLayout.initialBarWidth, 42 * i)
      }
    }
    canvasContext.stroke()
  }

  // Draw segments
  private drawSegment(segment: Segment, canvasContext: CanvasRenderingContext2D) {
    if (segment.notes && segment.notes.length > 0) {
      for (let note of segment.notes) {
        canvasContext.fillText(note.fretValue.toString(), 0, 42 * note.string)
      }
    }
    canvasContext.translate(segment.separationSpace, 0)
  }

  private drawTimeSignature(canvasContext: CanvasRenderingContext2D, bar: Bar) {
    canvasContext.globalCompositeOperation = "source-over"
    canvasContext.font = "500 60px Barlow"
    canvasContext.fillStyle = "#fff"
    canvasContext.textAlign = "center"
    canvasContext.fillText(bar.timeSignature.numerator.toString(), tabLayout.leftBarExtraPadding / 2, 105 - 30)
    canvasContext.fillText(bar.timeSignature.denominator.toString(), tabLayout.leftBarExtraPadding / 2, 105 + 30)
  }

  private spaceLeft(canvasContext: CanvasRenderingContext2D, bar: Bar, index: number) {
    if (index === 0 || JSON.stringify(bar.timeSignature) !== JSON.stringify(this.song.bars[index - 1].timeSignature)) {
      canvasContext.translate(tabLayout.leftBarExtraPadding, 0)
    } else {
      canvasContext.translate(tabLayout.leftBarPadding, 0)
    }
  }

  private translateToNextBar(canvasContext: CanvasRenderingContext2D, bar: Bar, index: number) {
    if (index === 0 || JSON.stringify(bar.timeSignature) !== JSON.stringify(this.song.bars[index - 1].timeSignature)) {
      canvasContext.translate(tabLayout.barExtraWidth, 0)
    } else {
      canvasContext.translate(tabLayout.initialBarWidth, 0)
    }
  }

}
