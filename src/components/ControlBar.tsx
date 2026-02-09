import React from 'react'

interface ControlBarProps {
  range: number
  rangeValue: string
  selectSize: string
  onRangeChange: (value: number) => void
  onRotate: () => void
  onSizeChange: (value: string) => void
  onExport: () => void
}

export const ControlBar: React.FC<ControlBarProps> = ({
  range,
  rangeValue,
  selectSize,
  onRangeChange,
  onRotate,
  onSizeChange,
  onExport
}) => {
  return (
    <div className="status-bar">
      <div className="range-bar">
        <span>缩放比例(20%~200%)</span>
        <input
          type="range"
          id="range"
          min="20"
          max="200"
          value={range}
          className="range"
          onChange={(e) => onRangeChange(Number(e.target.value))}
        />
        <span className="view-rate">{rangeValue}%</span>
      </div>
      <input
        className="rotate-btn"
        type="button"
        value="旋转"
        id="rotate"
        onClick={onRotate}
      />
      <select
        id="select_size"
        value={selectSize}
        className="def_size"
        onChange={(e) => onSizeChange(e.target.value)}
      >
        <option value="0">请选择截图尺寸...</option>
        <optgroup label="2.13寸">
          <option value="212x104">212x104</option>
          <option value="104x212">104x212</option>
          <option value="122x250">122x250</option>
          <option value="296x128">296x128</option>
        </optgroup>
        <optgroup label="2.9寸">
          <option value="128x296">128x296</option>
          <option value="296x128">296x128</option>
        </optgroup>
        <optgroup label="4.3寸">
          <option value="400x300">400x300</option>
          <option value="300x400">300x400</option>
        </optgroup>
        <optgroup label="5.8寸">
          <option value="600x448">600x448</option>
          <option value="448x600">448x600</option>
        </optgroup>
        <optgroup label="其它常用尺寸">
          <option value="640x384">640x384</option>
        </optgroup>
      </select>
      <input
        className="export-btn"
        type="button"
        value="导出"
        id="export"
        onClick={onExport}
      />
    </div>
  )
}
