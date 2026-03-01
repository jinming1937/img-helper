const MIN_SCALE = 20
const MAX_SCALE = 200

interface Position {
  x: number
  y: number
}

interface ExportPosition extends Position {
  width: number
  height: number
}

export class DrawingBoard {
  private canvas: HTMLCanvasElement
  private context: CanvasRenderingContext2D
  private offscreenCanvas: OffscreenCanvas
  private offscreenContext: OffscreenCanvasRenderingContext2D
  private dpr: number
  private scale: number
  private showRect: boolean
  private exportPosition: ExportPosition
  private renderPosition: Position
  private renderPositionFormScale: Position
  private baseX: number
  private baseY: number
  private baseScale: number
  private rotateAngle: number
  private canvasWidth: number
  private canvasHeight: number
  private offscreenCanvasWidth: number
  private offscreenCanvasHeight: number
  private image: HTMLImageElement | null = null
  private eventFlag: boolean = false
  private mousePoint: Position = { x: 0, y: 0 }
  private previousOffset: Position = { x: NaN, y: NaN }
  private onScaleChange?: (scale: number) => void

  constructor(canvas: HTMLCanvasElement, onScaleChange?: (scale: number) => void) {
    this.onScaleChange = onScaleChange
    this.canvas = canvas
    this.context = canvas.getContext('2d')!
    this.offscreenCanvas = new OffscreenCanvas(256, 256)
    this.offscreenContext = this.offscreenCanvas.getContext('2d')!
    this.dpr = Math.floor(window.devicePixelRatio) || 2
    this.scale = 100
    this.showRect = false
    this.exportPosition = {
      x: 0,
      y: 0,
      width: 400,
      height: 300
    }
    this.renderPosition = { x: 0, y: 0 }
    this.renderPositionFormScale = { x: 0, y: 0 }
    this.baseX = 0
    this.baseY = 0
    this.baseScale = 100
    this.rotateAngle = 0
    this.canvasWidth = 0
    this.canvasHeight = 0
    this.offscreenCanvasWidth = 0
    this.offscreenCanvasHeight = 0

    const rect = this.resize()
    this.resizeOffscreen(rect)
    this.initEvent()
  }

  get Scale(): number {
    return this.scale / 100
  }

  private resetCanvas(): void {
    this.scale = 100
    this.renderPosition = { x: 0, y: 0 }
    this.renderPositionFormScale = { x: 0, y: 0 }
    this.showRect = false
    this.rotateAngle = 0
  }

  private initEvent(): void {
    const down = (e: MouseEvent) => {
      e.preventDefault()
      e.stopImmediatePropagation()
      this.eventFlag = true
      this.mousePoint.x = e.offsetX
      this.mousePoint.y = e.offsetY
    }

    const move = (e: MouseEvent) => {
      if (this.eventFlag) {
        e.preventDefault()
        e.stopImmediatePropagation()
        const changeX = (e.offsetX - this.mousePoint.x) * this.dpr
        const changeY = (e.offsetY - this.mousePoint.y) * this.dpr
        this.renderPosition.x += changeX
        this.renderPosition.y += changeY
        this.mousePoint.x = e.offsetX
        this.mousePoint.y = e.offsetY
        this.render()
      }
    }

    const up = (e: MouseEvent) => {
      e.preventDefault()
      e.stopImmediatePropagation()
      this.eventFlag = false
      this.mousePoint = { x: 0, y: 0 }
    }

    const touchStart = (e: TouchEvent) => {
      e.preventDefault()
      e.stopImmediatePropagation()
      this.eventFlag = true
      this.mousePoint.x = e.touches[0].clientX
      this.mousePoint.y = e.touches[0].clientY
    }

    const touchMove = (e: TouchEvent) => {
      if (this.eventFlag) {
        e.preventDefault()
        e.stopImmediatePropagation()
        const changeX = (e.touches[0].clientX - this.mousePoint.x) * this.dpr
        const changeY = (e.touches[0].clientY - this.mousePoint.y) * this.dpr
        this.renderPosition.x += changeX
        this.renderPosition.y += changeY
        this.mousePoint.x = e.touches[0].clientX
        this.mousePoint.y = e.touches[0].clientY
        this.render()
      }
    }

    const wheel = (e: WheelEvent) => {
      e.preventDefault()
      e.stopImmediatePropagation()

      if (e.ctrlKey || (e as any).metaKey) {
        const scaleFactor = Math.ceil(Math.abs(e.deltaY) / 10)
        if (e.deltaY > 0) {
          if (
            scaleFactor !== 0 &&
            this.scale > MIN_SCALE &&
            this.scale - scaleFactor >= MIN_SCALE
          ) {
            this.setScaleMove(e.offsetX, e.offsetY, this.scale, this.scale - scaleFactor)
            this.scale -= scaleFactor
            this.previousOffset.x = e.offsetX
            this.previousOffset.y = e.offsetY
            this.render()
            this.onScaleChange?.(this.scale)
          }
        } else {
          if (
            scaleFactor !== 0 &&
            this.scale < MAX_SCALE &&
            this.scale + scaleFactor <= MAX_SCALE
          ) {
            this.setScaleMove(e.offsetX, e.offsetY, this.scale, this.scale + scaleFactor)
            this.scale += scaleFactor
            this.previousOffset.x = e.offsetX
            this.previousOffset.y = e.offsetY
            this.render()
            this.onScaleChange?.(this.scale)
          }
        }
      } else {
        this.renderPosition.x -= e.deltaX
        this.renderPosition.y -= e.deltaY
        this.render()
      }
    }

    this.canvas.addEventListener('mousedown', down)
    this.canvas.addEventListener('mousemove', move)
    this.canvas.addEventListener('wheel', wheel, { passive: false })
    this.canvas.addEventListener('mouseup', up)
    this.canvas.addEventListener('touchstart', touchStart, { passive: false })
    this.canvas.addEventListener('touchmove', touchMove, { passive: false })
    this.canvas.addEventListener('touchend', up, { passive: false })
  }

  private setScaleMove(
    offsetX: number,
    offsetY: number,
    previousScale: number,
    afterScale: number
  ): void {
    const originPositionX = this.renderPosition.x
    const originPositionY = this.renderPosition.y

    if (!isNaN(this.previousOffset.x) && this.previousOffset.x !== offsetX) {
      this.baseX = this.renderPositionFormScale.x
      this.baseScale = previousScale
    }
    if (!isNaN(this.previousOffset.y) && this.previousOffset.y !== offsetY) {
      this.baseY = this.renderPositionFormScale.y
      this.baseScale = previousScale
    }

    const dx = offsetX * this.dpr - originPositionX - this.baseX
    const dy = offsetY * this.dpr - originPositionY - this.baseY
    const x = dx * (1 - afterScale / this.baseScale)
    const y = dy * (1 - afterScale / this.baseScale)

    this.renderPositionFormScale.x = Math.floor(x + this.baseX)
    this.renderPositionFormScale.y = Math.floor(y + this.baseY)
  }

  private cutRect(): void {
    if (this.showRect) {
      const { x, y, width, height } = this.exportPosition
      this.context.save()
      this.context.beginPath()
      this.context.moveTo(x, y)
      this.context.rect(
        x - this.dpr,
        y - this.dpr,
        width * this.dpr + 2 * this.dpr,
        height * this.dpr + 2 * this.dpr
      )
      this.context.strokeStyle = '#F00'
      this.context.lineWidth = this.dpr
      this.context.stroke()
      this.context.restore()
    }
  }

  private resize(): { width: number; height: number } {
    const rect = this.canvas.getBoundingClientRect()
    const width = Math.floor(rect.width) * this.dpr
    const height = Math.floor(rect.height) * this.dpr
    this.setCanvasSize({ width, height })
    return { width, height }
  }

  private setCanvasSize({ width, height }: { width: number; height: number }): void {
    this.canvas.width = width
    this.canvas.height = height
    this.canvasWidth = width
    this.canvasHeight = height
  }

  private resizeOffscreen({ width, height }: { width: number; height: number }): void {
    this.offscreenCanvas.width = width
    this.offscreenCanvas.height = height
    this.offscreenCanvasWidth = width
    this.offscreenCanvasHeight = height
  }

  private clear(): void {
    this.context.clearRect(0, 0, this.canvasWidth, this.canvasHeight)
  }

  public drawText(text: string): void {
    this.clear()
    this.context.save()
    this.context.font = '48px serif'
    const offset = this.context.measureText(text)
    this.context.fillText(text, this.canvasWidth / 2 - offset.width / 2, this.canvasHeight / 2)
    this.context.restore()
  }

  private render(): void {
    this.clear()
    this.context.save()
    const scale = this.Scale
    const { x, y } = this.renderPosition
    const { x: scaleX, y: scaleY } = this.renderPositionFormScale
    this.context.translate(x + scaleX, y + scaleY)
    this.context.scale(scale, scale)

    if (this.rotateAngle !== 0) {
      this.context.translate(this.offscreenCanvasWidth / 2, this.offscreenCanvasHeight / 2)
      this.context.rotate((this.rotateAngle * Math.PI) / 180)
      this.context.translate(-this.offscreenCanvasWidth / 2, -this.offscreenCanvasHeight / 2)
    }

    this.context.drawImage(
      this.offscreenCanvas,
      0,
      0,
      this.offscreenCanvasWidth,
      this.offscreenCanvasHeight,
      0,
      0,
      this.offscreenCanvasWidth,
      this.offscreenCanvasHeight
    )
    this.context.restore()
    this.cutRect()
  }

  public loadImage(img: HTMLImageElement): void {
    this.image = img
    this.resetCanvas()
    this.clear()

    const width = img.width
    const height = img.height
    this.resizeOffscreen({ width, height })
    this.offscreenContext.drawImage(img, 0, 0, width, height, 0, 0, width, height)
    this.context.drawImage(
      this.offscreenCanvas,
      0,
      0,
      width,
      height,
      0,
      0,
      width,
      height
    )
  }

  public setScale(value: number): void {
    this.scale = value
    this.render()
  }

  public rotate(): void {
    if (this.rotateAngle === 270) {
      this.rotateAngle = 0
    } else {
      this.rotateAngle += 90
    }
    this.render()
  }

  public setSize(value: string): void {
    if (value && value.split('x').length === 2) {
      const [width, height] = value.split('x').map(Number)
      this.showRect = true
      this.exportPosition.width = width
      this.exportPosition.height = height
      this.exportPosition.x = this.canvasWidth / 2 - (this.exportPosition.width * this.dpr) / 2
      this.exportPosition.y = this.canvasHeight / 2 - (this.exportPosition.height * this.dpr) / 2
      this.render()
    } else {
      this.showRect = false
      this.render()
    }
  }

  public export(): void {
    if (!this.showRect) {
      alert('请选择截图尺寸')
      return
    }

    const { x, y, width, height } = this.exportPosition
    const exportWidth = width * this.dpr
    const exportHeight = height * this.dpr
    const imageData = this.context.getImageData(x, y, exportWidth, exportHeight)

    const offline = new OffscreenCanvas(exportWidth, exportHeight)
    const offContext = offline.getContext('2d')!
    offContext.putImageData(imageData, 0, 0)

    const canView = document.createElement('canvas')
    const ctx = canView.getContext('2d')!
    canView.width = width
    canView.height = height
    ctx.drawImage(offline, 0, 0, exportWidth, exportHeight, 0, 0, width, height)

    const link = document.createElement('a')
    link.href = canView.toDataURL('image/png')
    link.download = `img-${this.exportPosition.width}x${this.exportPosition.height}-${Date.now()}.png`
    link.click()
  }
}
