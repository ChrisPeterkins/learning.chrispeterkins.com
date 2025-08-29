import { useEffect, useRef, useState } from 'react'
import p5 from 'p5'

interface Point {
  x: number
  y: number
}

function GeometricDesignsPage() {
  const sketchRef = useRef<HTMLDivElement>(null)
  const p5Instance = useRef<p5 | null>(null)
  const [params, setParams] = useState({
    designType: 'spirograph',
    sides: 6,
    radius1: 100,
    radius2: 30,
    speed: 1,
    trailLength: 500,
    strokeWeight: 2,
    colorMode: 'rainbow'
  })

  useEffect(() => {
    if (!sketchRef.current) return

    const sketch = (p: p5) => {
      let time = 0
      let points: Point[] = []
      let voronoiSeeds: Point[] = []

      p.setup = () => {
        const canvas = p.createCanvas(800, 600)
        canvas.parent(sketchRef.current!)
        p.colorMode(p.HSB, 360, 100, 100)
        generateVoronoiSeeds()
      }

      const generateVoronoiSeeds = () => {
        voronoiSeeds = []
        for (let i = 0; i < 20; i++) {
          voronoiSeeds.push({
            x: p.random(p.width),
            y: p.random(p.height)
          })
        }
      }

      p.draw = () => {
        time += 0.01 * params.speed

        if (params.designType === 'spirograph') {
          drawSpirograph()
        } else if (params.designType === 'polygons') {
          drawPolygons()
        } else if (params.designType === 'sacred') {
          drawSacredGeometry()
        } else if (params.designType === 'voronoi') {
          drawVoronoi()
        } else if (params.designType === 'golden') {
          drawGoldenSpiral()
        }
      }

      const drawSpirograph = () => {
        p.background(0, 0, 5)
        
        const centerX = p.width / 2
        const centerY = p.height / 2
        
        // Parameters for spirograph
        const R = params.radius1 // Fixed circle radius
        const r = params.radius2 // Moving circle radius
        const d = r * 0.7       // Distance from center of moving circle
        
        // Calculate new point
        const ratio = r / R
        const t = time * 10
        
        const x = centerX + (R - r) * p.cos(t) + d * p.cos(((R - r) / r) * t)
        const y = centerY + (R - r) * p.sin(t) + d * p.sin(((R - r) / r) * t)
        
        // Add point to trail
        points.push({ x, y })
        if (points.length > params.trailLength) {
          points.shift()
        }
        
        // Draw trail
        p.strokeWeight(params.strokeWeight)
        p.noFill()
        
        if (points.length > 1) {
          for (let i = 1; i < points.length; i++) {
            const alpha = p.map(i, 0, points.length, 0, 100)
            
            if (params.colorMode === 'rainbow') {
              const hue = p.map(i, 0, points.length, 0, 360)
              p.stroke(hue, 80, 90, alpha)
            } else if (params.colorMode === 'gradient') {
              p.stroke(200, 80, 90, alpha)
            } else {
              p.stroke(0, 0, 100, alpha)
            }
            
            p.line(points[i-1].x, points[i-1].y, points[i].x, points[i].y)
          }
        }
        
        // Draw the moving circle for reference
        p.stroke(0, 0, 80, 50)
        p.strokeWeight(1)
        p.noFill()
        
        const circleX = centerX + (R - r) * p.cos(t)
        const circleY = centerY + (R - r) * p.sin(t)
        p.circle(circleX, circleY, r * 2)
        
        // Draw current point
        p.fill(60, 100, 100)
        p.noStroke()
        p.circle(x, y, 8)
      }

      const drawPolygons = () => {
        p.background(0, 0, 10)
        
        const layers = 5
        const centerX = p.width / 2
        const centerY = p.height / 2
        
        for (let layer = 0; layer < layers; layer++) {
          const radius = (layer + 1) * 50
          const sides = params.sides + layer
          const rotation = time + layer * 0.5
          
          p.push()
          p.translate(centerX, centerY)
          p.rotate(rotation)
          
          // Color based on layer
          const hue = (layer * 60) % 360
          p.stroke(hue, 80, 90)
          p.strokeWeight(params.strokeWeight)
          p.noFill()
          
          drawRegularPolygon(0, 0, sides, radius)
          
          // Draw connecting lines between vertices of adjacent layers
          if (layer > 0) {
            const prevRadius = layer * 50
            const prevSides = params.sides + layer - 1
            
            for (let i = 0; i < Math.min(sides, prevSides); i++) {
              const angle1 = (i * p.TWO_PI) / sides
              const angle2 = (i * p.TWO_PI) / prevSides
              
              const x1 = p.cos(angle1) * radius
              const y1 = p.sin(angle1) * radius
              const x2 = p.cos(angle2) * prevRadius
              const y2 = p.sin(angle2) * prevRadius
              
              p.stroke(hue, 60, 70, 30)
              p.line(x1, y1, x2, y2)
            }
          }
          
          p.pop()
        }
      }

      const drawSacredGeometry = () => {
        p.background(240, 20, 5)
        
        const centerX = p.width / 2
        const centerY = p.height / 2
        const baseRadius = 80
        
        // Flower of Life pattern
        p.stroke(280, 80, 90)
        p.strokeWeight(2)
        p.noFill()
        
        // Central circle
        p.circle(centerX, centerY, baseRadius * 2)
        
        // Surrounding circles
        const numCircles = 6
        for (let i = 0; i < numCircles; i++) {
          const angle = (i * p.TWO_PI) / numCircles
          const x = centerX + p.cos(angle) * baseRadius
          const y = centerY + p.sin(angle) * baseRadius
          p.circle(x, y, baseRadius * 2)
        }
        
        // Outer ring
        for (let i = 0; i < numCircles; i++) {
          const angle = (i * p.TWO_PI) / numCircles
          const nextAngle = ((i + 1) * p.TWO_PI) / numCircles
          
          const x1 = centerX + p.cos(angle) * baseRadius
          const y1 = centerY + p.sin(angle) * baseRadius
          
          const x2 = centerX + p.cos(nextAngle) * baseRadius
          const y2 = centerY + p.sin(nextAngle) * baseRadius
          
          // Calculate intersection point for outer circles
          const midAngle = (angle + nextAngle) / 2
          const outerX = centerX + p.cos(midAngle) * baseRadius * 1.732 // sqrt(3)
          const outerY = centerY + p.sin(midAngle) * baseRadius * 1.732
          
          p.circle(outerX, outerY, baseRadius * 2)
        }
        
        // Vesica Piscis overlays
        p.stroke(60, 100, 90, 80)
        p.strokeWeight(1)
        
        // Animated geometry
        p.push()
        p.translate(centerX, centerY)
        p.rotate(time * 0.5)
        
        const triangleSides = 3
        const triangleRadius = baseRadius * 1.5
        
        for (let i = 0; i < 2; i++) {
          p.rotate(p.PI)
          drawRegularPolygon(0, 0, triangleSides, triangleRadius)
        }
        
        p.pop()
      }

      const drawVoronoi = () => {
        p.background(0, 0, 95)
        
        // Update seed positions slightly
        for (let seed of voronoiSeeds) {
          seed.x += p.noise(seed.x * 0.01, time) * 2 - 1
          seed.y += p.noise(seed.y * 0.01, time + 1000) * 2 - 1
          
          // Keep seeds in bounds
          seed.x = p.constrain(seed.x, 0, p.width)
          seed.y = p.constrain(seed.y, 0, p.height)
        }
        
        // Draw Voronoi cells (simplified)
        const resolution = 4
        p.loadPixels()
        
        for (let x = 0; x < p.width; x += resolution) {
          for (let y = 0; y < p.height; y += resolution) {
            let minDist = Infinity
            let closestSeed = 0
            
            // Find closest seed
            for (let i = 0; i < voronoiSeeds.length; i++) {
              const dist = p.dist(x, y, voronoiSeeds[i].x, voronoiSeeds[i].y)
              if (dist < minDist) {
                minDist = dist
                closestSeed = i
              }
            }
            
            // Color based on seed
            const hue = (closestSeed * 30) % 360
            const sat = p.map(minDist, 0, 100, 100, 20)
            const bright = p.map(minDist, 0, 100, 90, 40)
            
            p.fill(hue, sat, bright)
            p.noStroke()
            p.rect(x, y, resolution, resolution)
          }
        }
        
        // Draw seeds
        for (let i = 0; i < voronoiSeeds.length; i++) {
          const seed = voronoiSeeds[i]
          p.fill(0, 0, 0)
          p.stroke(0, 0, 100)
          p.strokeWeight(2)
          p.circle(seed.x, seed.y, 8)
        }
      }

      const drawGoldenSpiral = () => {
        p.background(45, 30, 5)
        
        const centerX = p.width / 2
        const centerY = p.height / 2
        
        // Golden ratio
        const phi = (1 + Math.sqrt(5)) / 2
        
        // Draw Fibonacci squares
        p.stroke(45, 80, 90)
        p.strokeWeight(2)
        p.noFill()
        
        let size = 5
        let x = centerX
        let y = centerY
        let direction = 0 // 0: right, 1: up, 2: left, 3: down
        
        const maxIterations = 10
        
        for (let i = 0; i < maxIterations; i++) {
          // Draw square
          p.rect(x, y, size, size)
          
          // Draw quarter circle (spiral segment)
          p.stroke(60, 100, 100)
          p.strokeWeight(3)
          p.noFill()
          
          const quarterCircleX = x + (direction % 2 === 0 ? 0 : size)
          const quarterCircleY = y + (direction < 2 ? size : 0)
          
          const startAngle = direction * p.HALF_PI
          const endAngle = (direction + 1) * p.HALF_PI
          
          p.arc(quarterCircleX, quarterCircleY, size * 2, size * 2, startAngle, endAngle)
          
          // Calculate next position
          const nextSize = Math.round(size * phi)
          
          switch (direction) {
            case 0: // right
              x = x - nextSize + size
              y = y - nextSize + size
              break
            case 1: // up
              x = x - nextSize + size
              y = y
              break
            case 2: // left
              x = x
              y = y
              break
            case 3: // down
              x = x
              y = y - nextSize + size
              break
          }
          
          size = nextSize
          direction = (direction + 1) % 4
          
          p.stroke(45, 80, 90)
          p.strokeWeight(2)
        }
        
        // Draw connecting lines showing the golden ratio
        p.stroke(120, 60, 100, 50)
        p.strokeWeight(1)
        
        const goldenLines = 8
        for (let i = 0; i < goldenLines; i++) {
          const angle = (i * p.TWO_PI) / goldenLines + time
          const radius = 50 * Math.pow(phi, i * 0.2)
          
          const x1 = centerX + p.cos(angle) * radius
          const y1 = centerY + p.sin(angle) * radius
          
          p.line(centerX, centerY, x1, y1)
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
      p.regenerateSeeds = () => {
        generateVoronoiSeeds()
      }

      p.clearTrail = () => {
        points = []
      }
    }

    p5Instance.current = new p5(sketch)

    return () => {
      p5Instance.current?.remove()
    }
  }, [params])

  const handleClearTrail = () => {
    if (p5Instance.current && (p5Instance.current as any).clearTrail) {
      (p5Instance.current as any).clearTrail()
    }
  }

  const handleRegenerateSeeds = () => {
    if (p5Instance.current && (p5Instance.current as any).regenerateSeeds) {
      (p5Instance.current as any).regenerateSeeds()
    }
  }

  return (
    <div className="page">
      <h2>Geometric Designs</h2>
      <p className="page-description">
        Create precise geometric compositions and explore mathematical constructions from spirographs to sacred geometry.
      </p>

      <div className="controls">
        <div className="control-group">
          <label>Design Type</label>
          <select
            value={params.designType}
            onChange={(e) => setParams({ ...params, designType: e.target.value })}
          >
            <option value="spirograph">Spirograph</option>
            <option value="polygons">Nested Polygons</option>
            <option value="sacred">Sacred Geometry</option>
            <option value="voronoi">Voronoi Diagram</option>
            <option value="golden">Golden Spiral</option>
          </select>
        </div>

        {params.designType === 'spirograph' && (
          <>
            <div className="control-group">
              <label>Outer Radius: {params.radius1}</label>
              <input
                type="range"
                min="50"
                max="200"
                value={params.radius1}
                onChange={(e) => setParams({ ...params, radius1: parseInt(e.target.value) })}
              />
            </div>

            <div className="control-group">
              <label>Inner Radius: {params.radius2}</label>
              <input
                type="range"
                min="10"
                max="100"
                value={params.radius2}
                onChange={(e) => setParams({ ...params, radius2: parseInt(e.target.value) })}
              />
            </div>

            <div className="control-group">
              <label>Trail Length: {params.trailLength}</label>
              <input
                type="range"
                min="100"
                max="1000"
                value={params.trailLength}
                onChange={(e) => setParams({ ...params, trailLength: parseInt(e.target.value) })}
              />
            </div>

            <button className="reset-button" onClick={handleClearTrail}>
              Clear Trail
            </button>
          </>
        )}

        {params.designType === 'polygons' && (
          <div className="control-group">
            <label>Base Sides: {params.sides}</label>
            <input
              type="range"
              min="3"
              max="12"
              value={params.sides}
              onChange={(e) => setParams({ ...params, sides: parseInt(e.target.value) })}
            />
          </div>
        )}

        {params.designType === 'voronoi' && (
          <button className="reset-button" onClick={handleRegenerateSeeds}>
            Regenerate Seeds
          </button>
        )}

        <div className="control-group">
          <label>Animation Speed: {params.speed.toFixed(1)}</label>
          <input
            type="range"
            min="0"
            max="3"
            step="0.1"
            value={params.speed}
            onChange={(e) => setParams({ ...params, speed: parseFloat(e.target.value) })}
          />
        </div>

        <div className="control-group">
          <label>Stroke Weight: {params.strokeWeight}</label>
          <input
            type="range"
            min="1"
            max="8"
            value={params.strokeWeight}
            onChange={(e) => setParams({ ...params, strokeWeight: parseInt(e.target.value) })}
          />
        </div>

        {params.designType === 'spirograph' && (
          <div className="control-group">
            <label>Color Mode</label>
            <select
              value={params.colorMode}
              onChange={(e) => setParams({ ...params, colorMode: e.target.value })}
            >
              <option value="rainbow">Rainbow</option>
              <option value="gradient">Blue Gradient</option>
              <option value="monochrome">Monochrome</option>
            </select>
          </div>
        )}
      </div>

      <div className="canvas-container">
        <div ref={sketchRef} />
      </div>

      <div className="info-panel">
        <h3>Geometric Construction Techniques</h3>
        <ul>
          <li><strong>Spirograph:</strong> Mathematical curves created by rolling circles</li>
          <li><strong>Regular Polygons:</strong> Equal sides and angles, constructed with compass</li>
          <li><strong>Sacred Geometry:</strong> Flower of Life, golden ratio, and natural patterns</li>
          <li><strong>Voronoi Diagrams:</strong> Regions closest to specific seed points</li>
          <li><strong>Golden Spiral:</strong> Based on Fibonacci sequence and golden ratio</li>
          <li><strong>Parametric Equations:</strong> Mathematical descriptions of curves</li>
        </ul>
        
        <h3>Mathematical Applications</h3>
        <ul>
          <li><strong>Architecture:</strong> Structural design and aesthetic proportions</li>
          <li><strong>Art & Design:</strong> Creating harmonious and pleasing compositions</li>
          <li><strong>Nature:</strong> Understanding growth patterns and natural forms</li>
          <li><strong>Computer Graphics:</strong> Procedural generation and algorithmic art</li>
          <li><strong>Physics:</strong> Modeling wave patterns and interference</li>
        </ul>
      </div>
    </div>
  )
}

export default GeometricDesignsPage