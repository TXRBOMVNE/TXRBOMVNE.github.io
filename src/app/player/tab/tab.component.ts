import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { exampleSong, Note, Segment } from 'src/app/models/song.model';

export const tabLayout = {
  leftBarPadding: 48,
  barWidth: 480,
  barInnerWidth: 384
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

    canvas.width = this.song.bars.length * tabLayout.barWidth
    ctx.translate(0, 20)
    ctx.strokeStyle = "#707070"
    ctx.lineWidth = 2
    ctx.font = "500 25pt Barlow Condensed"
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.fillStyle = "#D6D6D6"

    ctx.save()

    // Draw all bars
    this.song.bars.forEach(() => {
      this.drawBar(ctx, canvas)
    })

    ctx.restore()
    ctx.translate(tabLayout.leftBarPadding, 0)
    ctx.save()

    this.song.bars.forEach(bar => {
      ctx.restore()
      ctx.save()
      for (let segment of bar.segments) {
        this.drawSegment(segment, ctx)
      }
      ctx.restore()
      ctx.translate(tabLayout.barWidth, 0)
      ctx.save()
    })

    ctx.globalCompositeOperation = "destination-over"
    ctx.stroke()

    ctx.restore()
    ctx.save()
  }

  // Draw bar frame and first and last string
  private drawBar(canvasContext: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
    canvasContext.strokeRect(0, 0, tabLayout.barWidth, canvas?.height! - 40)
    this.drawStrings(canvasContext)
    canvasContext.translate(tabLayout.barWidth, 0)
  }

  // Draw instrument strings
  private drawStrings(canvasContext: CanvasRenderingContext2D) {
    for (let i = 1; i <= this.song.instrument.strings - 2; i++) {
      canvasContext.moveTo(0, 42 * i)
      canvasContext.lineTo(tabLayout.barWidth, 42 * i)
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

}
