// src/components/organisms/builder/FreeDraw.jsx
import { useRef, useState } from 'react'
import { observer } from 'mobx-react-lite'
import { SectionTab } from 'polotno/side-panel'
import { Button } from '@blueprintjs/core'
import { MdBrush } from 'react-icons/md'
import { Stage, Layer, Line } from 'react-konva'

const DrawingPanel = observer(({ store }) => {
  const [tool, setTool] = useState('brush')
  const [strokeColor, setStrokeColor] = useState('#df4b26')
  const [strokeWidth, setStrokeWidth] = useState(5)
  const [lines, setLines] = useState([])
  const isDrawing = useRef(false)
  const stageRef = useRef(null)

  const handleMouseDown = (e) => {
    isDrawing.current = true
    const stage = e.target.getStage()
    if (!stage) return
    const pos = stage.getPointerPosition()
    setLines((prevLines) => [
      ...prevLines,
      {
        tool,
        points: [pos.x, pos.y],
        stroke: strokeColor,
        strokeWidth: tool === 'eraser' ? strokeWidth * 2 : strokeWidth,
      },
    ])
  }

  const handleMouseMove = (e) => {
    if (!isDrawing.current) return
    const stage = e.target.getStage()
    if (!stage) return
    const point = stage.getPointerPosition()
    setLines((prevLines) => {
      const lastLine = prevLines[prevLines.length - 1]
      if (!lastLine) return prevLines
      lastLine.points = lastLine.points.concat([point.x, point.y])
      return [...prevLines.slice(0, -1), lastLine]
    })
  }

  const handleMouseUp = () => {
    isDrawing.current = false
  }

  const addDrawingToCanvas = async () => {
    if (stageRef.current) {
      const dataURL = stageRef.current.toDataURL()
      const { width, height } = await getImageSize(dataURL)
      store.activePage.addElement({
        type: 'image',
        src: dataURL,
        width,
        height,
        x: 0,
        y: 0,
      })
      setLines([]) // Clear drawing after adding to canvas
    }
  }

  const clearDrawing = () => {
    setLines([])
  }

  const getImageSize = (src) => {
    return new Promise((resolve) => {
      const img = new Image()
      img.src = src
      img.onload = () => {
        resolve({ width: img.width, height: img.height })
      }
    })
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: '20px' }}>
      <h3>Free Drawing</h3>
      <select
        value={tool}
        onChange={(e) => setTool(e.target.value)}
        style={{ marginBottom: '10px' }}
      >
        <option value="brush">Brush</option>
        <option value="eraser">Eraser</option>
      </select>
      <div style={{ marginBottom: '10px' }}>
        <label>Stroke Color: </label>
        <input type="color" value={strokeColor} onChange={(e) => setStrokeColor(e.target.value)} />
      </div>
      <div style={{ marginBottom: '10px' }}>
        <label>Stroke Width: {strokeWidth}px</label>
        <input
          type="range"
          min="1"
          max="20"
          value={strokeWidth}
          onChange={(e) => setStrokeWidth(Number(e.target.value))}
          style={{ width: '100%' }}
        />
      </div>
      <div style={{ border: '1px solid #ccc', marginBottom: '20px' }}>
        <Stage
          width={300}
          height={300}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onTouchStart={handleMouseDown}
          onTouchMove={handleMouseMove}
          onTouchEnd={handleMouseUp}
          ref={stageRef}
        >
          <Layer>
            {lines.map((line, i) => (
              <Line
                key={i}
                points={line.points}
                stroke={line.stroke}
                strokeWidth={line.strokeWidth}
                tension={0.5}
                lineCap="round"
                lineJoin="round"
                globalCompositeOperation={
                  line.tool === 'eraser' ? 'destination-out' : 'source-over'
                }
              />
            ))}
          </Layer>
        </Stage>
      </div>
      <Button intent="primary" onClick={addDrawingToCanvas}>
        Add Drawing to Canvas
      </Button>
      <Button intent="danger" onClick={clearDrawing} style={{ marginTop: '10px' }}>
        Clear Drawing
      </Button>
    </div>
  )
})

export const DrawSection = {
  name: 'drawing',
  Tab: (props) => (
    <SectionTab name="Drawing" {...props}>
      <span className="inline-block">
        <MdBrush size="1.4rem" />
      </span>
    </SectionTab>
  ),
  Panel: DrawingPanel,
}
