import React, { forwardRef, useEffect, useState } from 'react'

interface CanvasProps {
  onImageLoad?: (img: HTMLImageElement) => void
  drawText?: (text: string) => void
}

export const Canvas = forwardRef<HTMLCanvasElement, CanvasProps>(
  ({ onImageLoad, drawText }, ref) => {
    const [isDragOver, setIsDragOver] = useState(false)

    useEffect(() => {
      if (!ref || typeof ref === 'function') return

      const canvas = ref.current
      if (!canvas) return

      const preventDefaults = (e: DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
      }

      const handleDragEnter = () => setIsDragOver(true)
      const handleDragLeave = () => setIsDragOver(false)
      const handleDrop = (e: DragEvent) => {
        preventDefaults(e)
        setIsDragOver(false)
        
        const files = e.dataTransfer?.files
        if (files) {
          for (let i = 0; i < files.length; i++) {
            const file = files[i]
            if (file.type.match('image.*')) {
              const reader = new FileReader()
              reader.onload = (event) => {
                const img = new Image()
                img.onload = () => {
                  if (onImageLoad) onImageLoad(img)
                }
                img.src = event.target?.result as string
              }
              reader.readAsDataURL(file)
            }
          }
        }
      }

      const dropzone = canvas.parentElement
      if (dropzone) {
        ;['dragenter', 'dragover', 'dragleave', 'drop'].forEach((eventName) => {
          dropzone.addEventListener(eventName, preventDefaults, false)
        })

        dropzone.addEventListener('dragenter', handleDragEnter)
        dropzone.addEventListener('dragleave', handleDragLeave)
        dropzone.addEventListener('drop', handleDrop)
      }

      // Handle paste
      const handlePaste = (e: ClipboardEvent) => {
        const { items, files } = e.clipboardData || {}
        if (items && files && files.length > 0) {
          const file = files[0]
          if (file.type.match('image.*')) {
            const reader = new FileReader()
            reader.onload = (event) => {
              const img = new Image()
              img.onload = () => {
                if (onImageLoad) onImageLoad(img)
              }
              img.src = event.target?.result as string
            }
            reader.readAsDataURL(file)
          }
        }
      }

      document.addEventListener('paste', handlePaste)

      // Draw initial text
      if (drawText) {
        drawText(window.innerWidth <= 400 ? '上传图片....' : '拖拽/粘贴图片上传....')
      }

      // Handle file input
      const fileInput = document.getElementById('upload_file') as HTMLInputElement
      if (fileInput) {
        fileInput.addEventListener('change', (e) => {
          const input = e.target as HTMLInputElement
          if (input.files && input.files.length > 0) {
            const file = input.files[0]
            if (file.type.match('image.*')) {
              const reader = new FileReader()
              reader.onload = (event) => {
                const img = new Image()
                img.onload = () => {
                  if (onImageLoad) onImageLoad(img)
                }
                img.src = event.target?.result as string
              }
              reader.readAsDataURL(file)
            }
          }
        })
      }

      return () => {
        if (dropzone) {
          ;['dragenter', 'dragover', 'dragleave', 'drop'].forEach((eventName) => {
            dropzone.removeEventListener(eventName, preventDefaults, false)
          })
          dropzone.removeEventListener('dragenter', handleDragEnter)
          dropzone.removeEventListener('dragleave', handleDragLeave)
          dropzone.removeEventListener('drop', handleDrop)
        }
        document.removeEventListener('paste', handlePaste)
      }
    }, [ref, onImageLoad, drawText])

    return (
      <div className={`dropzone ${isDragOver ? 'dragover' : ''}`}>
        <canvas ref={ref} className="canvas_box" />
      </div>
    )
  }
)

Canvas.displayName = 'Canvas'
