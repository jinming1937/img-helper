import { useCallback, useRef, useState, useEffect } from 'react'
import { DrawingBoard } from '../utils/DrawingBoard'

export const useDrawingBoard = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [range, setRange] = useState(100)
  const [selectSize, setSelectSize] = useState('0')
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

  const onExport = useCallback(() => {
    if (drawingBoardRef.current) {
      drawingBoardRef.current.export()
    }
  }, [])

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
    onImageLoad,
    drawText
  }
}
