import { useEffect, useRef, useState } from 'react'
import p5 from 'p5'

interface LSystemRule {
  from: string
  to: string
}

interface Complex {
  real: number
  imag: number
}

function FractalExplorationsPage() {
  const sketchRef = useRef<HTMLDivElement>(null)
  const p5Instance = useRef<p5 | null>(null)
  const [params, setParams] = useState({
    fractalType: 'mandelbrot',
    maxIterations: 50,
    zoom: 1,
    centerX: -0.5,
    centerY: 0,
    juliaRe: -0.4,
    juliaIm: 0.6,
    lSystemGenerations: 4,
    lSystemAngle: 90,
    sierpinskiDepth: 6,
    colorMode: 'gradient'
  })

  useEffect(() => {
    if (!sketchRef.current) return

    const sketch = (p: p5) => {
      let mandelbrotData: number[][] = []
      let juliaData: number[][] = []

      p.setup = () => {
        const canvas = p.createCanvas(800, 600)
        canvas.parent(sketchRef.current!)
        p.colorMode(p.HSB, 360, 100, 100)
        
        generateFractalData()
      }

      const generateFractalData = () => {
        const width = p.width
        const height = p.height
        mandelbrotData = Array(height).fill(null).map(() => Array(width).fill(0))
        juliaData = Array(height).fill(null).map(() => Array(width).fill(0))

        for (let x = 0; x < width; x++) {
          for (let y = 0; y < height; y++) {
            // Mandelbrot
            const c: Complex = {
              real: (x - width / 2) / (width / 4 * params.zoom) + params.centerX,
              imag: (y - height / 2) / (height / 4 * params.zoom) + params.centerY
            }
            mandelbrotData[y][x] = mandelbrotSet(c, params.maxIterations)

            // Julia
            const z: Complex = {
              real: (x - width / 2) / (width / 4),
              imag: (y - height / 2) / (height / 4)
            }
            const julia_c: Complex = { real: params.juliaRe, imag: params.juliaIm }
            juliaData[y][x] = juliaSet(z, julia_c, params.maxIterations)
          }
        }
      }

      const mandelbrotSet = (c: Complex, maxIter: number): number => {
        let z: Complex = { real: 0, imag: 0 }
        let iter = 0
        
        while (iter < maxIter && (z.real * z.real + z.imag * z.imag) < 4) {
          const newReal = z.real * z.real - z.imag * z.imag + c.real
          const newImag = 2 * z.real * z.imag + c.imag
          z.real = newReal
          z.imag = newImag
          iter++
        }
        
        return iter
      }

      const juliaSet = (z: Complex, c: Complex, maxIter: number): number => {
        let iter = 0
        
        while (iter < maxIter && (z.real * z.real + z.imag * z.imag) < 4) {
          const newReal = z.real * z.real - z.imag * z.imag + c.real
          const newImag = 2 * z.real * z.imag + c.imag
          z.real = newReal
          z.imag = newImag
          iter++
        }
        
        return iter
      }

      p.draw = () => {
        if (params.fractalType === 'mandelbrot') {
          drawMandelbrot()
        } else if (params.fractalType === 'julia') {
          drawJulia()
        } else if (params.fractalType === 'lsystem') {
          drawLSystem()
        } else if (params.fractalType === 'sierpinski') {
          drawSierpinski()
        } else if (params.fractalType === 'dragon') {
          drawDragonCurve()
        }
      }

      const drawMandelbrot = () => {
        p.background(0, 0, 0)
        p.loadPixels()
        
        for (let x = 0; x < p.width; x++) {
          for (let y = 0; y < p.height; y++) {
            const iterations = mandelbrotData[y][x]
            const color = getIterationColor(iterations, params.maxIterations)
            
            const index = (x + y * p.width) * 4
            p.pixels[index] = p.red(color)
            p.pixels[index + 1] = p.green(color)
            p.pixels[index + 2] = p.blue(color)
            p.pixels[index + 3] = 255
          }
        }
        
        p.updatePixels()
      }

      const drawJulia = () => {
        p.background(0, 0, 0)
        p.loadPixels()
        
        for (let x = 0; x < p.width; x++) {
          for (let y = 0; y < p.height; y++) {
            const iterations = juliaData[y][x]
            const color = getIterationColor(iterations, params.maxIterations)
            
            const index = (x + y * p.width) * 4
            p.pixels[index] = p.red(color)
            p.pixels[index + 1] = p.green(color)
            p.pixels[index + 2] = p.blue(color)
            p.pixels[index + 3] = 255
          }
        }
        
        p.updatePixels()
      }

      const drawLSystem = () => {
        p.background(30, 20, 95)
        p.stroke(120, 80, 90)
        p.strokeWeight(1)
        
        // Simple tree L-System
        const axiom = "F"
        const rules: LSystemRule[] = [
          { from: "F", to: "F[+F]F[-F]F" }
        ]
        
        let current = axiom
        for (let i = 0; i < params.lSystemGenerations; i++) {
          let next = ""
          for (let char of current) {
            const rule = rules.find(r => r.from === char)
            next += rule ? rule.to : char
          }
          current = next
        }
        
        drawLSystemString(current)
      }

      const drawLSystemString = (lString: string) => {
        const len = Math.max(1, 100 / Math.pow(2, params.lSystemGenerations))
        const angle = p.radians(params.lSystemAngle)
        
        p.push()
        p.translate(p.width / 2, p.height - 50)
        p.rotate(p.PI)
        
        const stack: Array<{x: number, y: number, angle: number}> = []
        
        for (let char of lString) {
          if (char === 'F') {
            p.line(0, 0, 0, len)
            p.translate(0, len)
          } else if (char === '+') {
            p.rotate(angle)
          } else if (char === '-') {
            p.rotate(-angle)
          } else if (char === '[') {
            stack.push({ x: 0, y: 0, angle: 0 })
            p.push()
          } else if (char === ']') {
            p.pop()
            if (stack.length > 0) {
              stack.pop()
            }
          }
        }
        
        p.pop()
      }

      const drawSierpinski = () => {
        p.background(240, 30, 15)
        p.fill(280, 80, 90)
        p.noStroke()
        
        const size = p.min(p.width, p.height) * 0.8
        const x = p.width / 2
        const y = p.height / 2 + size / 4
        
        drawSierpinskiTriangle(x, y, size, params.sierpinskiDepth)
      }

      const drawSierpinskiTriangle = (x: number, y: number, size: number, depth: number) => {
        if (depth === 0) {
          p.triangle(
            x, y - size / 2,
            x - size / 2, y + size / 2,
            x + size / 2, y + size / 2
          )
        } else {
          const newSize = size / 2
          drawSierpinskiTriangle(x, y - newSize / 2, newSize, depth - 1)
          drawSierpinskiTriangle(x - newSize / 2, y + newSize / 2, newSize, depth - 1)
          drawSierpinskiTriangle(x + newSize / 2, y + newSize / 2, newSize, depth - 1)
        }
      }

      const drawDragonCurve = () => {
        p.background(0, 0, 20)
        p.stroke(60, 100, 100)
        p.strokeWeight(2)
        p.noFill()
        
        const points = generateDragonCurve(params.lSystemGenerations)
        
        if (points.length > 1) {
          p.beginShape()
          p.noFill()
          for (let point of points) {
            p.vertex(point.x, point.y)
          }
          p.endShape()
        }
      }

      const generateDragonCurve = (iterations: number): p5.Vector[] => {
        let sequence = "FX"
        
        for (let i = 0; i < iterations; i++) {
          let newSequence = ""
          for (let char of sequence) {
            if (char === 'X') {
              newSequence += "X+YF+"
            } else if (char === 'Y') {
              newSequence += "-FX-Y"
            } else {
              newSequence += char
            }
          }
          sequence = newSequence
        }
        
        const points: p5.Vector[] = []
        let x = p.width * 0.3
        let y = p.height * 0.5
        let angle = 0
        const stepLength = Math.max(1, 200 / Math.pow(2, iterations / 2))
        
        points.push(p.createVector(x, y))
        
        for (let char of sequence) {
          if (char === 'F') {
            x += p.cos(angle) * stepLength
            y += p.sin(angle) * stepLength
            points.push(p.createVector(x, y))
          } else if (char === '+') {
            angle += p.PI / 2
          } else if (char === '-') {
            angle -= p.PI / 2
          }
        }
        
        return points
      }

      const getIterationColor = (iterations: number, maxIterations: number): p5.Color => {
        if (iterations === maxIterations) {
          return p.color(0, 0, 0)
        }
        
        if (params.colorMode === 'gradient') {
          const hue = p.map(iterations, 0, maxIterations, 240, 360)
          const sat = 80
          const brightness = p.map(iterations, 0, maxIterations, 20, 100)
          return p.color(hue, sat, brightness)
        } else if (params.colorMode === 'bands') {
          const band = Math.floor(iterations / 5) % 6
          const hues = [240, 300, 0, 60, 120, 180]
          return p.color(hues[band], 70, 90)
        } else { // monochrome
          const brightness = p.map(iterations, 0, maxIterations, 0, 100)
          return p.color(0, 0, brightness)
        }
      }

      // Update function for regenerating fractals
      p.regenerateFractals = () => {
        generateFractalData()
      }
    }

    p5Instance.current = new p5(sketch)

    return () => {
      p5Instance.current?.remove()
    }
  }, [params])

  // Regenerate fractals when parameters change
  useEffect(() => {
    if (p5Instance.current && (p5Instance.current as any).regenerateFractals) {
      if (params.fractalType === 'mandelbrot' || params.fractalType === 'julia') {
        (p5Instance.current as any).regenerateFractals()
      }
    }
  }, [params.maxIterations, params.zoom, params.centerX, params.centerY, params.juliaRe, params.juliaIm])

  return (
    <div className="page">
      <h2>Fractal Explorations</h2>
      <p className="page-description">
        Discover the infinite complexity and self-similar beauty of mathematical fractals through interactive visualizations.
      </p>

      <div className="controls">
        <div className="control-group">
          <label>Fractal Type</label>
          <select
            value={params.fractalType}
            onChange={(e) => setParams({ ...params, fractalType: e.target.value })}
          >
            <option value="mandelbrot">Mandelbrot Set</option>
            <option value="julia">Julia Set</option>
            <option value="lsystem">L-System Tree</option>
            <option value="sierpinski">Sierpinski Triangle</option>
            <option value="dragon">Dragon Curve</option>
          </select>
        </div>

        {(params.fractalType === 'mandelbrot' || params.fractalType === 'julia') && (
          <>
            <div className="control-group">
              <label>Max Iterations: {params.maxIterations}</label>
              <input
                type="range"
                min="20"
                max="200"
                value={params.maxIterations}
                onChange={(e) => setParams({ ...params, maxIterations: parseInt(e.target.value) })}
              />
            </div>

            <div className="control-group">
              <label>Color Mode</label>
              <select
                value={params.colorMode}
                onChange={(e) => setParams({ ...params, colorMode: e.target.value })}
              >
                <option value="gradient">Gradient</option>
                <option value="bands">Color Bands</option>
                <option value="monochrome">Monochrome</option>
              </select>
            </div>
          </>
        )}

        {params.fractalType === 'mandelbrot' && (
          <>
            <div className="control-group">
              <label>Zoom: {params.zoom.toFixed(2)}</label>
              <input
                type="range"
                min="0.1"
                max="5"
                step="0.1"
                value={params.zoom}
                onChange={(e) => setParams({ ...params, zoom: parseFloat(e.target.value) })}
              />
            </div>

            <div className="control-group">
              <label>Center X: {params.centerX.toFixed(3)}</label>
              <input
                type="range"
                min="-2"
                max="1"
                step="0.01"
                value={params.centerX}
                onChange={(e) => setParams({ ...params, centerX: parseFloat(e.target.value) })}
              />
            </div>

            <div className="control-group">
              <label>Center Y: {params.centerY.toFixed(3)}</label>
              <input
                type="range"
                min="-1.5"
                max="1.5"
                step="0.01"
                value={params.centerY}
                onChange={(e) => setParams({ ...params, centerY: parseFloat(e.target.value) })}
              />
            </div>
          </>
        )}

        {params.fractalType === 'julia' && (
          <>
            <div className="control-group">
              <label>Julia Real: {params.juliaRe.toFixed(3)}</label>
              <input
                type="range"
                min="-1"
                max="1"
                step="0.01"
                value={params.juliaRe}
                onChange={(e) => setParams({ ...params, juliaRe: parseFloat(e.target.value) })}
              />
            </div>

            <div className="control-group">
              <label>Julia Imaginary: {params.juliaIm.toFixed(3)}</label>
              <input
                type="range"
                min="-1"
                max="1"
                step="0.01"
                value={params.juliaIm}
                onChange={(e) => setParams({ ...params, juliaIm: parseFloat(e.target.value) })}
              />
            </div>
          </>
        )}

        {params.fractalType === 'lsystem' && (
          <>
            <div className="control-group">
              <label>Generations: {params.lSystemGenerations}</label>
              <input
                type="range"
                min="1"
                max="7"
                value={params.lSystemGenerations}
                onChange={(e) => setParams({ ...params, lSystemGenerations: parseInt(e.target.value) })}
              />
            </div>

            <div className="control-group">
              <label>Branch Angle: {params.lSystemAngle}°</label>
              <input
                type="range"
                min="15"
                max="135"
                step="15"
                value={params.lSystemAngle}
                onChange={(e) => setParams({ ...params, lSystemAngle: parseInt(e.target.value) })}
              />
            </div>
          </>
        )}

        {(params.fractalType === 'sierpinski' || params.fractalType === 'dragon') && (
          <div className="control-group">
            <label>Depth/Iterations: {params.fractalType === 'sierpinski' ? params.sierpinskiDepth : params.lSystemGenerations}</label>
            <input
              type="range"
              min="1"
              max={params.fractalType === 'sierpinski' ? "8" : "12"}
              value={params.fractalType === 'sierpinski' ? params.sierpinskiDepth : params.lSystemGenerations}
              onChange={(e) => {
                if (params.fractalType === 'sierpinski') {
                  setParams({ ...params, sierpinskiDepth: parseInt(e.target.value) })
                } else {
                  setParams({ ...params, lSystemGenerations: parseInt(e.target.value) })
                }
              }}
            />
          </div>
        )}
      </div>

      <div className="canvas-container">
        <div ref={sketchRef} />
      </div>

      <div className="info-panel">
        <h3>Fractal Mathematics</h3>
        <ul>
          <li><strong>Self-Similarity:</strong> Fractals look similar at every scale of magnification</li>
          <li><strong>Mandelbrot Set:</strong> Points where z = z² + c remains bounded</li>
          <li><strong>Julia Sets:</strong> Related to Mandelbrot but with fixed c parameter</li>
          <li><strong>L-Systems:</strong> Grammar-based generation of organic structures</li>
          <li><strong>Iterative Functions:</strong> Simple rules create infinite complexity</li>
          <li><strong>Fractal Dimension:</strong> Non-integer dimensions between 1D and 2D</li>
        </ul>
        
        <h3>Applications & Significance</h3>
        <ul>
          <li><strong>Computer Graphics:</strong> Natural textures, coastlines, and landscapes</li>
          <li><strong>Data Compression:</strong> Efficient representation of complex images</li>
          <li><strong>Nature Modeling:</strong> Trees, clouds, lightning, and blood vessels</li>
          <li><strong>Mathematics:</strong> Understanding chaos theory and complex dynamics</li>
          <li><strong>Art & Design:</strong> Beautiful patterns for digital art and architecture</li>
        </ul>
      </div>
    </div>
  )
}

export default FractalExplorationsPage