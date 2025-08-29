import { useEffect, useRef, useState } from 'react'
import p5 from 'p5'

function PatternMakingPage() {
  const sketchRef = useRef<HTMLDivElement>(null)
  const p5Instance = useRef<p5 | null>(null)
  const [params, setParams] = useState({
    patternType: 'islamic',
    gridSize: 8,
    symmetry: 4,
    complexity: 3,
    colorCount: 5,
    rotationSpeed: 1,
    scale: 1
  })

  useEffect(() => {
    if (!sketchRef.current) return

    const sketch = (p: p5) => {
      let time = 0
      let colors: p5.Color[] = []

      p.setup = () => {
        const canvas = p.createCanvas(800, 600)
        canvas.parent(sketchRef.current!)
        p.colorMode(p.HSB, 360, 100, 100)
        generateColors()
      }

      const generateColors = () => {
        colors = []
        for (let i = 0; i < params.colorCount; i++) {
          const hue = (i * 360) / params.colorCount
          colors.push(p.color(hue, 70, 90))
        }
      }

      p.draw = () => {
        time += 0.01 * params.rotationSpeed
        p.background(0, 0, 95)

        if (params.patternType === 'islamic') {
          drawIslamicPattern()
        } else if (params.patternType === 'tessellation') {
          drawTessellation()
        } else if (params.patternType === 'mandala') {
          drawMandala()
        } else if (params.patternType === 'celtic') {
          drawCelticKnot()
        } else if (params.patternType === 'tribal') {
          drawTribalPattern()
        }
      }

      const drawIslamicPattern = () => {
        const cellSize = (p.min(p.width, p.height) / params.gridSize) * params.scale
        
        for (let x = 0; x < params.gridSize; x++) {
          for (let y = 0; y < params.gridSize; y++) {
            const centerX = x * cellSize + cellSize / 2
            const centerY = y * cellSize + cellSize / 2
            
            p.push()
            p.translate(centerX, centerY)
            p.rotate(time + (x + y) * 0.1)
            
            drawIslamicUnit(cellSize * 0.4)
            p.pop()
          }
        }
      }

      const drawIslamicUnit = (size: number) => {
        p.stroke(0, 0, 20)
        p.strokeWeight(2)
        p.noFill()
        
        // Star pattern
        const points = params.symmetry * 2
        const outerRadius = size
        const innerRadius = size * 0.4
        
        p.beginShape()
        for (let i = 0; i < points; i++) {
          const angle = (i * p.TWO_PI) / points
          const radius = i % 2 === 0 ? outerRadius : innerRadius
          const x = p.cos(angle) * radius
          const y = p.sin(angle) * radius
          p.vertex(x, y)
        }
        p.endShape(p.CLOSE)
        
        // Inner circle
        p.fill(colors[Math.floor((time * 10) % colors.length)])
        p.circle(0, 0, innerRadius)
      }

      const drawTessellation = () => {
        const cellSize = (p.min(p.width, p.height) / params.gridSize) * params.scale
        
        for (let x = 0; x < params.gridSize; x++) {
          for (let y = 0; y < params.gridSize; y++) {
            const centerX = x * cellSize + cellSize / 2
            const centerY = y * cellSize + cellSize / 2
            
            const colorIndex = (x + y + Math.floor(time * 2)) % colors.length
            p.fill(colors[colorIndex])
            p.stroke(0, 0, 30)
            p.strokeWeight(1)
            
            if ((x + y) % 2 === 0) {
              // Hexagon
              drawRegularPolygon(centerX, centerY, 6, cellSize * 0.4)
            } else {
              // Triangle
              drawRegularPolygon(centerX, centerY, 3, cellSize * 0.3)
            }
          }
        }
      }

      const drawMandala = () => {
        p.push()
        p.translate(p.width / 2, p.height / 2)
        
        const layers = params.complexity + 2
        const maxRadius = p.min(p.width, p.height) * 0.4 * params.scale
        
        for (let layer = 0; layer < layers; layer++) {
          const radius = (maxRadius * (layer + 1)) / layers
          const elements = params.symmetry * (layer + 1)
          
          p.rotate(time * (layer % 2 === 0 ? 1 : -1) * 0.1)
          
          for (let i = 0; i < elements; i++) {
            const angle = (i * p.TWO_PI) / elements
            const x = p.cos(angle) * radius
            const y = p.sin(angle) * radius
            
            p.push()
            p.translate(x, y)
            p.rotate(angle + time)
            
            const colorIndex = (layer + i) % colors.length
            p.fill(colors[colorIndex])
            p.noStroke()
            
            const petals = 5 + layer
            drawFlower(0, 0, radius / layers, petals)
            
            p.pop()
          }
        }
        p.pop()
      }

      const drawFlower = (x: number, y: number, size: number, petals: number) => {
        for (let i = 0; i < petals; i++) {
          const angle = (i * p.TWO_PI) / petals
          const petalX = x + p.cos(angle) * size * 0.3
          const petalY = y + p.sin(angle) * size * 0.3
          p.circle(petalX, petalY, size * 0.4)
        }
        // Center
        p.fill(0, 0, 100)
        p.circle(x, y, size * 0.2)
      }

      const drawCelticKnot = () => {
        const cellSize = (p.min(p.width, p.height) / params.gridSize) * params.scale
        
        p.stroke(120, 60, 40)
        p.strokeWeight(8)
        p.noFill()
        
        for (let x = 0; x < params.gridSize - 1; x++) {
          for (let y = 0; y < params.gridSize - 1; y++) {
            const x1 = x * cellSize
            const y1 = y * cellSize
            const x2 = (x + 1) * cellSize
            const y2 = (y + 1) * cellSize
            
            // Create interwoven curves
            const t = time + x * 0.2 + y * 0.3
            const curve1 = p.sin(t) * 0.3 + 0.5
            const curve2 = p.cos(t + p.PI) * 0.3 + 0.5
            
            p.bezier(
              x1 + cellSize * curve1, y1,
              x1 + cellSize, y1 + cellSize * curve2,
              x2, y2 - cellSize * curve1,
              x2 - cellSize * curve2, y2
            )
          }
        }
      }

      const drawTribalPattern = () => {
        const cellSize = (p.min(p.width, p.height) / params.gridSize) * params.scale
        
        for (let x = 0; x < params.gridSize; x++) {
          for (let y = 0; y < params.gridSize; y++) {
            const centerX = x * cellSize + cellSize / 2
            const centerY = y * cellSize + cellSize / 2
            
            p.push()
            p.translate(centerX, centerY)
            
            const colorIndex = (x * params.gridSize + y) % colors.length
            p.fill(colors[colorIndex])
            p.stroke(0, 0, 0)
            p.strokeWeight(2)
            
            // Tribal motif
            const segments = 6
            p.beginShape()
            for (let i = 0; i <= segments; i++) {
              const angle = (i * p.TWO_PI) / segments
              let radius = cellSize * 0.3
              
              // Create jagged edges
              if (i % 2 === 0) {
                radius *= 1.3
              }
              
              // Add noise for organic feel
              radius += p.noise(x * 0.1, y * 0.1, i * 0.2 + time) * 10
              
              const px = p.cos(angle) * radius
              const py = p.sin(angle) * radius
              p.vertex(px, py)
            }
            p.endShape(p.CLOSE)
            
            // Inner detail
            p.fill(0, 0, 100)
            p.noStroke()
            p.circle(0, 0, cellSize * 0.1)
            
            p.pop()
          }
        }
      }

      const drawRegularPolygon = (x: number, y: number, sides: number, radius: number) => {
        p.beginShape()
        for (let i = 0; i < sides; i++) {
          const angle = (i * p.TWO_PI) / sides
          const px = x + p.cos(angle) * radius
          const py = y + p.sin(angle) * radius
          p.vertex(px, py)
        }
        p.endShape(p.CLOSE)
      }

      // Update function
      p.updateColors = () => {
        generateColors()
      }
    }

    p5Instance.current = new p5(sketch)

    return () => {
      p5Instance.current?.remove()
    }
  }, [params])

  // Update colors when colorCount changes
  useEffect(() => {
    if (p5Instance.current && (p5Instance.current as any).updateColors) {
      (p5Instance.current as any).updateColors()
    }
  }, [params.colorCount])

  return (
    <div className="page">
      <h2>Pattern Making</h2>
      <p className="page-description">
        Design repeating patterns and tessellations with code. Explore symmetry, tiling, and mathematical beauty.
      </p>

      <div className="controls">
        <div className="control-group">
          <label>Pattern Type</label>
          <select
            value={params.patternType}
            onChange={(e) => setParams({ ...params, patternType: e.target.value })}
          >
            <option value="islamic">Islamic Geometric</option>
            <option value="tessellation">Tessellation</option>
            <option value="mandala">Mandala</option>
            <option value="celtic">Celtic Knot</option>
            <option value="tribal">Tribal Pattern</option>
          </select>
        </div>

        <div className="control-group">
          <label>Grid Size: {params.gridSize}</label>
          <input
            type="range"
            min="4"
            max="16"
            value={params.gridSize}
            onChange={(e) => setParams({ ...params, gridSize: parseInt(e.target.value) })}
          />
        </div>

        <div className="control-group">
          <label>Symmetry: {params.symmetry}</label>
          <input
            type="range"
            min="3"
            max="12"
            value={params.symmetry}
            onChange={(e) => setParams({ ...params, symmetry: parseInt(e.target.value) })}
          />
        </div>

        <div className="control-group">
          <label>Complexity: {params.complexity}</label>
          <input
            type="range"
            min="1"
            max="6"
            value={params.complexity}
            onChange={(e) => setParams({ ...params, complexity: parseInt(e.target.value) })}
          />
        </div>

        <div className="control-group">
          <label>Colors: {params.colorCount}</label>
          <input
            type="range"
            min="2"
            max="12"
            value={params.colorCount}
            onChange={(e) => setParams({ ...params, colorCount: parseInt(e.target.value) })}
          />
        </div>

        <div className="control-group">
          <label>Animation Speed: {params.rotationSpeed.toFixed(1)}</label>
          <input
            type="range"
            min="0"
            max="3"
            step="0.1"
            value={params.rotationSpeed}
            onChange={(e) => setParams({ ...params, rotationSpeed: parseFloat(e.target.value) })}
          />
        </div>

        <div className="control-group">
          <label>Scale: {params.scale.toFixed(1)}</label>
          <input
            type="range"
            min="0.3"
            max="2"
            step="0.1"
            value={params.scale}
            onChange={(e) => setParams({ ...params, scale: parseFloat(e.target.value) })}
          />
        </div>
      </div>

      <div className="canvas-container">
        <div ref={sketchRef} />
      </div>

      <div className="info-panel">
        <h3>Pattern Design Principles</h3>
        <ul>
          <li><strong>Symmetry:</strong> Rotational, reflective, and translational symmetries</li>
          <li><strong>Tessellation:</strong> Patterns that tile the plane without gaps</li>
          <li><strong>Islamic Geometry:</strong> Mathematical precision in decorative art</li>
          <li><strong>Mandala:</strong> Circular patterns representing wholeness</li>
          <li><strong>Repetition:</strong> Creating rhythm and visual harmony</li>
          <li><strong>Sacred Geometry:</strong> Mathematical relationships in nature</li>
        </ul>
        
        <h3>Cultural & Mathematical Significance</h3>
        <ul>
          <li><strong>Islamic Art:</strong> Geometric patterns as spiritual expression</li>
          <li><strong>Celtic Traditions:</strong> Interwoven knots symbolizing eternity</li>
          <li><strong>Tribal Cultures:</strong> Patterns encoding cultural meaning</li>
          <li><strong>Mathematics:</strong> Group theory and crystallographic patterns</li>
          <li><strong>Modern Design:</strong> Wallpapers, textiles, and architectural elements</li>
        </ul>
      </div>
    </div>
  )
}

export default PatternMakingPage