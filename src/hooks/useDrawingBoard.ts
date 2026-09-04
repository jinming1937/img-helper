import { useCallback, useRef, useState, useEffect } from 'react'
import { DrawingBoard } from '../utils/DrawingBoard'

export const useDrawingBoard = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [range, setRange] = useState(100)
  const [selectSize, setSelectSize] = useState('0')
  const [customWidth, setCustomWidth] = useState('')
  const [customHeight, setCustomHeight] = useState('')
  const drawingBoardRef = useRef<DrawingBoard | null>(null)

  useEffect(() => {
    if (canvasRef.current && !drawingBoardRef.current) {
      drawingBoardRef.current = new DrawingBoard(canvasRef.current, (scale) => {
        setRange(scale)
      })
    }

    return () => {
      // Cleanup if needed
    }
  }, [])

  const onRangeChange = useCallback((value: number) => {
    setRange(value)
    if (drawingBoardRef.current) {
      drawingBoardRef.current.setScale(value)
    }
  }, [])

  const onRotate = useCallback(() => {
    if (drawingBoardRef.current) {
      drawingBoardRef.current.rotate()
    }
  }, [])

  const onSizeChange = useCallback((value: string) => {
    setSelectSize(value)
    if (drawingBoardRef.current) {
      drawingBoardRef.current.setSize(value)
    }
  }, [])

  const onCustomWidthChange = useCallback((value: string) => {
    setCustomWidth(value)
    if (selectSize === 'self' && drawingBoardRef.current) {
      const w = Number(value)
      const h = Number(customHeight)
      if (Number.isFinite(w) && w > 0 && Number.isFinite(h) && h > 0) {
        drawingBoardRef.current.setSize(`${w}x${h}`)
      }
    }
  }, [selectSize, customHeight])

  const onCustomHeightChange = useCallback((value: string) => {
    setCustomHeight(value)
    if (selectSize === 'self' && drawingBoardRef.current) {
      const w = Number(customWidth)
      const h = Number(value)
      if (Number.isFinite(w) && w > 0 && Number.isFinite(h) && h > 0) {
        drawingBoardRef.current.setSize(`${w}x${h}`)
      }
    }
  }, [selectSize, customWidth])

  const onExport = useCallback(() => {
    if (!drawingBoardRef.current) return

    // If custom size selected, apply it before exporting
    if (selectSize === 'self') {
      const w = Number(customWidth)
      const h = Number(customHeight)
      if (Number.isFinite(w) && w > 0 && Number.isFinite(h) && h > 0) {
        drawingBoardRef.current.setSize(`${w}x${h}`)
      } else {
        alert('请输入有效的自定义宽高')
        return
      }
    }

    drawingBoardRef.current.export()
  }, [selectSize, customWidth, customHeight])

  const onImageLoad = useCallback((img: HTMLImageElement) => {
    if (drawingBoardRef.current) {
      drawingBoardRef.current.loadImage(img)
      setRange(100)
      setSelectSize('0')
    }
  }, [])

  const drawText = useCallback((text: string) => {
    if (drawingBoardRef.current) {
      drawingBoardRef.current.drawText(text)
    }
  }, [])

  return {
    canvasRef,
    range,
    rangeValue: String(range),
    selectSize,
    onRangeChange,
    onRotate,
    onSizeChange,
    onExport,
    customWidth,
    customHeight,
    onCustomWidthChange,
    onCustomHeightChange,
    onImageLoad,
    drawText
  }
}
