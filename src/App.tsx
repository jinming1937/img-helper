import { useDrawingBoard } from './hooks/useDrawingBoard'
import { Canvas } from './components/Canvas'
import { ControlBar } from './components/ControlBar'
import { Header } from './components/Header'
import { Footer } from './components/Footer'
import './App.css'

function App() {
  const {
    canvasRef,
    range,
    rangeValue,
    rotateAngle,
    selectSize,
    onRangeChange,
    onRotate,
    onSizeChange,
    onExport,
    onImageLoad,
    drawText
  } = useDrawingBoard()

  return (
    <div className="page-container">
      <Header />
      
      <div className="container">
        <Canvas ref={canvasRef} onImageLoad={onImageLoad} drawText={drawText} />
      </div>

      <div className="upload-box hide">
        <label className="file-upload" htmlFor="upload_file">
          点击选择上传图片...
          <input type="file" className="hide" accept="image/*" id="upload_file" />
        </label>
      </div>

      <ControlBar
        range={range}
        rangeValue={rangeValue}
        selectSize={selectSize}
        onRangeChange={onRangeChange}
        onRotate={onRotate}
        onSizeChange={onSizeChange}
        onExport={onExport}
      />

      <div>
        <p>
          说明：1. 拖拽或粘贴上传图片；2. 选择截图尺寸或自定义截图区域；3. 调整缩放比例；4. 点击导出按钮保存截图。
        </p>
      </div>

      <Footer />
    </div>
  )
}

export default App
