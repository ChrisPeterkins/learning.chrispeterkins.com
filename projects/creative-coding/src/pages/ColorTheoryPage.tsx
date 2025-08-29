import { useEffect, useRef, useState } from 'react'
import p5 from 'p5'

interface ColorHSB {
  h: number
  s: number
  b: number
}

interface ColorRGB {
  r: number
  g: number
  b: number
}

function ColorTheoryPage() {
  const sketchRef = useRef<HTMLDivElement>(null)
  const p5Instance = useRef<p5 | null>(null)
  const [params, setParams] = useState({
    colorMode: 'colorWheel',
    baseHue: 180,
    baseSat: 80,
    baseBright: 90,
    harmonyType: 'complementary',
    gradientSteps: 10,
    paletteSize: 5,
    animationSpeed: 1
  })

  useEffect(() => {
    if (!sketchRef.current) return

    const sketch = (p: p5) => {
      let time = 0
      let palette: ColorHSB[] = []

      p.setup = () => {
        const canvas = p.createCanvas(800, 600)
        canvas.parent(sketchRef.current!)
        p.colorMode(p.HSB, 360, 100, 100)
        generatePalette()
      }

      const generatePalette = () => {
        palette = []
        const baseColor: ColorHSB = {
          h: params.baseHue,
          s: params.baseSat,
          b: params.baseBright
        }

        palette.push(baseColor)

        switch (params.harmonyType) {
          case 'complementary':
            palette.push({
              h: (params.baseHue + 180) % 360,
              s: params.baseSat,
              b: params.baseBright
            })
            break

          case 'analogous':
            for (let i = 1; i <= params.paletteSize - 1; i++) {
              palette.push({
                h: (params.baseHue + (i * 30)) % 360,
                s: params.baseSat,
                b: params.baseBright
              })
            }
            break

          case 'triadic':
            palette.push({
              h: (params.baseHue + 120) % 360,
              s: params.baseSat,
              b: params.baseBright
            })
            palette.push({
              h: (params.baseHue + 240) % 360,
              s: params.baseSat,
              b: params.baseBright
            })
            break

          case 'tetradic':
            palette.push({
              h: (params.baseHue + 90) % 360,
              s: params.baseSat,
              b: params.baseBright
            })
            palette.push({
              h: (params.baseHue + 180) % 360,
              s: params.baseSat,
              b: params.baseBright
            })
            palette.push({
              h: (params.baseHue + 270) % 360,
              s: params.baseSat,
              b: params.baseBright
            })
            break

          case 'monochromatic':
            for (let i = 1; i <= params.paletteSize - 1; i++) {
              palette.push({
                h: params.baseHue,
                s: Math.max(20, params.baseSat - (i * 15)),
                b: Math.min(100, params.baseBright + (i * 10))
              })
            }
            break

          case 'splitComplementary':
            palette.push({
              h: (params.baseHue + 150) % 360,
              s: params.baseSat,
              b: params.baseBright
            })
            palette.push({
              h: (params.baseHue + 210) % 360,
              s: params.baseSat,
              b: params.baseBright
            })
            break
        }
      }

      p.draw = () => {
        time += 0.01 * params.animationSpeed

        if (params.colorMode === 'colorWheel') {
          drawColorWheel()
        } else if (params.colorMode === 'gradients') {
          drawGradients()
        } else if (params.colorMode === 'palette') {
          drawPalette()
        } else if (params.colorMode === 'mixing') {
          drawColorMixing()
        } else if (params.colorMode === 'temperature') {
          drawColorTemperature()
        }
      }

      const drawColorWheel = () => {
        p.background(0, 0, 15)
        
        // Draw color wheel
        const centerX = p.width / 2
        const centerY = p.height / 2
        const radius = 150

        // Draw the wheel itself
        for (let angle = 0; angle < 360; angle += 2) {
          for (let r = 50; r < radius; r += 2) {
            const saturation = p.map(r, 50, radius, 0, 100)
            p.fill(angle, saturation, 90)
            p.noStroke()
            p.push()
            p.translate(centerX, centerY)
            p.rotate(p.radians(angle))
            p.rect(r - 1, -1, 2, 2)
            p.pop()
          }
        }

        // Draw center
        p.fill(0, 0, 100)
        p.circle(centerX, centerY, 100)

        // Draw harmony indicators
        drawHarmonyIndicators(centerX, centerY, radius)

        // Draw palette swatches
        drawPaletteSwatches()
      }

      const drawHarmonyIndicators = (centerX: number, centerY: number, radius: number) => {
        p.strokeWeight(3)
        p.stroke(0, 0, 100)
        
        for (let color of palette) {
          const angle = p.radians(color.h)
          const x = centerX + p.cos(angle) * (radius + 20)
          const y = centerY + p.sin(angle) * (radius + 20)
          
          p.fill(color.h, color.s, color.b)
          p.circle(x, y, 30)
          
          // Draw line to center
          p.line(centerX, centerY, x, y)
        }
      }

      const drawPaletteSwatches = () => {
        const swatchSize = 60
        const startX = 50
        const startY = p.height - 100

        for (let i = 0; i < palette.length; i++) {
          const color = palette[i]
          p.fill(color.h, color.s, color.b)
          p.noStroke()
          p.rect(startX + i * (swatchSize + 10), startY, swatchSize, swatchSize)
          
          // Add text labels
          p.fill(0, 0, 100)
          p.textAlign(p.CENTER)
          p.text(`H:${Math.round(color.h)}`, 
                  startX + i * (swatchSize + 10) + swatchSize/2, 
                  startY + swatchSize + 15)
        }
      }

      const drawGradients = () => {
        p.background(0, 0, 10)
        
        const gradientHeight = 80
        const spacing = 100
        
        // Linear gradients between palette colors
        for (let i = 0; i < palette.length - 1; i++) {
          const y = 50 + i * spacing
          const color1 = palette[i]
          const color2 = palette[i + 1]
          
          drawLinearGradient(0, y, p.width, y + gradientHeight, color1, color2)
          
          // Label
          p.fill(0, 0, 100)
          p.textAlign(p.LEFT)
          p.text(`Gradient ${i + 1}`, 10, y - 10)
        }
        
        // Radial gradient example
        const centerX = p.width / 2
        const centerY = p.height - 150
        drawRadialGradient(centerX, centerY, 100, palette[0], palette[1] || palette[0])
        
        p.fill(0, 0, 100)
        p.textAlign(p.CENTER)
        p.text('Radial Gradient', centerX, centerY + 120)
      }

      const drawLinearGradient = (x1: number, y1: number, x2: number, y2: number, 
                                  color1: ColorHSB, color2: ColorHSB) => {
        for (let i = 0; i <= params.gradientSteps; i++) {
          const t = i / params.gradientSteps
          const h = lerpHue(color1.h, color2.h, t)
          const s = p.lerp(color1.s, color2.s, t)
          const b = p.lerp(color1.b, color2.b, t)
          
          p.fill(h, s, b)
          p.noStroke()
          
          const x = p.lerp(x1, x2, i / params.gradientSteps)
          const w = (x2 - x1) / params.gradientSteps
          p.rect(x, y1, w, y2 - y1)
        }
      }

      const drawRadialGradient = (centerX: number, centerY: number, radius: number, 
                                  innerColor: ColorHSB, outerColor: ColorHSB) => {
        for (let r = radius; r >= 0; r -= 2) {
          const t = 1 - (r / radius)
          const h = lerpHue(innerColor.h, outerColor.h, t)
          const s = p.lerp(innerColor.s, outerColor.s, t)
          const b = p.lerp(innerColor.b, outerColor.b, t)
          
          p.fill(h, s, b)
          p.noStroke()
          p.circle(centerX, centerY, r * 2)
        }
      }

      const lerpHue = (hue1: number, hue2: number, t: number): number => {
        const d = hue2 - hue1
        if (Math.abs(d) > 180) {
          if (d > 0) {
            hue1 += 360
          } else {
            hue2 += 360
          }
        }
        return (p.lerp(hue1, hue2, t) + 360) % 360
      }

      const drawPalette = () => {
        p.background(0, 0, 95)
        
        const cols = Math.ceil(Math.sqrt(palette.length))
        const rows = Math.ceil(palette.length / cols)
        const cellWidth = (p.width - 100) / cols
        const cellHeight = (p.height - 100) / rows
        
        for (let i = 0; i < palette.length; i++) {
          const col = i % cols
          const row = Math.floor(i / cols)
          const x = 50 + col * cellWidth
          const y = 50 + row * cellHeight
          
          const color = palette[i]
          p.fill(color.h, color.s, color.b)
          p.noStroke()
          p.rect(x, y, cellWidth - 10, cellHeight - 10)
          
          // Add color information
          p.fill(0, 0, color.b > 50 ? 0 : 100)
          p.textAlign(p.CENTER)
          p.text(`H: ${Math.round(color.h)}°`, x + cellWidth/2, y + cellHeight/2 - 10)
          p.text(`S: ${Math.round(color.s)}%`, x + cellWidth/2, y + cellHeight/2)
          p.text(`B: ${Math.round(color.b)}%`, x + cellWidth/2, y + cellHeight/2 + 10)
          
          // RGB values
          const rgb = hsbToRgb(color)
          p.text(`RGB: ${rgb.r}, ${rgb.g}, ${rgb.b}`, x + cellWidth/2, y + cellHeight/2 + 30)
        }
      }

      const drawColorMixing = () => {
        p.background(0, 0, 95)
        
        // Additive mixing (RGB)
        p.fill(0, 0, 0)
        p.textAlign(p.LEFT)
        p.text('Additive Color Mixing (Light)', 50, 30)
        
        const mixCenterX = p.width * 0.25
        const mixCenterY = 150
        const mixRadius = 60
        
        // Red circle
        p.fill(0, 100, 100)
        p.circle(mixCenterX - 30, mixCenterY - 20, mixRadius)
        
        // Green circle  
        p.fill(120, 100, 100)
        p.circle(mixCenterX + 30, mixCenterY - 20, mixRadius)
        
        // Blue circle
        p.fill(240, 100, 100)
        p.circle(mixCenterX, mixCenterY + 30, mixRadius)
        
        // Subtractive mixing simulation
        p.fill(0, 0, 0)
        p.text('Subtractive Color Mixing (Pigments)', p.width * 0.6, 30)
        
        const subCenterX = p.width * 0.75
        const subCenterY = 150
        
        // Cyan
        p.fill(180, 100, 100)
        p.circle(subCenterX - 30, subCenterY - 20, mixRadius)
        
        // Magenta
        p.fill(300, 100, 100)
        p.circle(subCenterX + 30, subCenterY - 20, mixRadius)
        
        // Yellow
        p.fill(60, 100, 100)
        p.circle(subCenterX, subCenterY + 30, mixRadius)
        
        // Color temperature demonstration
        drawColorTemperatureBar()
      }

      const drawColorTemperature = () => {
        p.background(0, 0, 15)
        
        // Temperature scale
        p.fill(0, 0, 100)
        p.textAlign(p.CENTER)
        p.text('Color Temperature Scale', p.width/2, 30)
        
        const barWidth = p.width - 100
        const barHeight = 60
        const barX = 50
        const barY = 100
        
        // Draw temperature gradient
        for (let i = 0; i < barWidth; i++) {
          const t = i / barWidth
          const temp = p.lerp(1000, 10000, t)  // Kelvin scale
          const color = temperatureToColor(temp)
          
          p.fill(color.h, color.s, color.b)
          p.noStroke()
          p.rect(barX + i, barY, 1, barHeight)
        }
        
        // Temperature labels
        p.fill(0, 0, 100)
        p.textAlign(p.LEFT)
        p.text('1000K (Warm)', barX, barY + barHeight + 20)
        p.textAlign(p.RIGHT)
        p.text('10000K (Cool)', barX + barWidth, barY + barHeight + 20)
        p.textAlign(p.CENTER)
        p.text('6500K (Daylight)', barX + barWidth/2, barY + barHeight + 20)
        
        // Animated color temperature examples
        drawTemperatureExamples()
      }

      const temperatureToColor = (kelvin: number): ColorHSB => {
        // Simplified color temperature conversion
        let r, g, b
        
        if (kelvin <= 6600) {
          r = 255
          g = Math.min(255, 99.4708025861 * Math.log(kelvin / 100) - 161.1195681661)
          if (kelvin >= 2000) {
            b = Math.min(255, 138.5177312231 * Math.log(kelvin / 100 - 10) - 305.0447927307)
          } else {
            b = 0
          }
        } else {
          r = Math.min(255, 329.698727446 * Math.pow(kelvin / 100 - 60, -0.1332047592))
          g = Math.min(255, 288.1221695283 * Math.pow(kelvin / 100 - 60, -0.0755148492))
          b = 255
        }
        
        // Convert to HSB
        return rgbToHsb({ r: r / 255, g: g / 255, b: b / 255 })
      }

      const drawTemperatureExamples = () => {
        const examples = [
          { name: 'Candlelight', temp: 1900, y: 250 },
          { name: 'Sunset', temp: 3000, y: 300 },
          { name: 'Daylight', temp: 6500, y: 350 },
          { name: 'Overcast Sky', temp: 7000, y: 400 }
        ]
        
        examples.forEach(example => {
          const color = temperatureToColor(example.temp)
          const x = 100 + (example.temp / 10000) * (p.width - 200)
          
          p.fill(color.h, color.s, color.b)
          p.circle(x, example.y, 40)
          
          p.fill(0, 0, 100)
          p.textAlign(p.CENTER)
          p.text(example.name, x, example.y + 30)
          p.text(`${example.temp}K`, x, example.y + 45)
        })
      }

      const hsbToRgb = (hsb: ColorHSB): ColorRGB => {
        const h = hsb.h / 360
        const s = hsb.s / 100
        const b = hsb.b / 100
        
        const i = Math.floor(h * 6)
        const f = h * 6 - i
        const p = b * (1 - s)
        const q = b * (1 - f * s)
        const t = b * (1 - (1 - f) * s)
        
        let r, g, bl
        switch (i % 6) {
          case 0: r = b; g = t; bl = p; break
          case 1: r = q; g = b; bl = p; break
          case 2: r = p; g = b; bl = t; break
          case 3: r = p; g = q; bl = b; break
          case 4: r = t; g = p; bl = b; break
          case 5: r = b; g = p; bl = q; break
          default: r = g = bl = 0
        }
        
        return {
          r: Math.round(r * 255),
          g: Math.round(g * 255),
          b: Math.round(bl * 255)
        }
      }

      const rgbToHsb = (rgb: {r: number, g: number, b: number}): ColorHSB => {
        const max = Math.max(rgb.r, rgb.g, rgb.b)
        const min = Math.min(rgb.r, rgb.g, rgb.b)
        const diff = max - min
        
        let h = 0
        if (diff !== 0) {
          if (max === rgb.r) {
            h = 60 * (((rgb.g - rgb.b) / diff) % 6)
          } else if (max === rgb.g) {
            h = 60 * ((rgb.b - rgb.r) / diff + 2)
          } else {
            h = 60 * ((rgb.r - rgb.g) / diff + 4)
          }
        }
        if (h < 0) h += 360
        
        const s = max === 0 ? 0 : diff / max * 100
        const b = max * 100
        
        return { h, s, b }
      }

      // Update function
      p.updatePalette = () => {
        generatePalette()
      }
    }

    p5Instance.current = new p5(sketch)

    return () => {
      p5Instance.current?.remove()
    }
  }, [params])

  // Update palette when parameters change
  useEffect(() => {
    if (p5Instance.current && (p5Instance.current as any).updatePalette) {
      (p5Instance.current as any).updatePalette()
    }
  }, [params.baseHue, params.baseSat, params.baseBright, params.harmonyType, params.paletteSize])

  return (
    <div className="page">
      <h2>Color Theory</h2>
      <p className="page-description">
        Explore color relationships, harmonies, and theory through interactive visualizations and palette generators.
      </p>

      <div className="controls">
        <div className="control-group">
          <label>Visualization Mode</label>
          <select
            value={params.colorMode}
            onChange={(e) => setParams({ ...params, colorMode: e.target.value })}
          >
            <option value="colorWheel">Color Wheel & Harmonies</option>
            <option value="gradients">Gradient Exploration</option>
            <option value="palette">Palette Analysis</option>
            <option value="mixing">Color Mixing</option>
            <option value="temperature">Color Temperature</option>
          </select>
        </div>

        <div className="control-group">
          <label>Harmony Type</label>
          <select
            value={params.harmonyType}
            onChange={(e) => setParams({ ...params, harmonyType: e.target.value })}
          >
            <option value="complementary">Complementary</option>
            <option value="analogous">Analogous</option>
            <option value="triadic">Triadic</option>
            <option value="tetradic">Tetradic (Square)</option>
            <option value="monochromatic">Monochromatic</option>
            <option value="splitComplementary">Split Complementary</option>
          </select>
        </div>

        <div className="control-group">
          <label>Base Hue: {params.baseHue}°</label>
          <input
            type="range"
            min="0"
            max="360"
            value={params.baseHue}
            onChange={(e) => setParams({ ...params, baseHue: parseInt(e.target.value) })}
          />
        </div>

        <div className="control-group">
          <label>Saturation: {params.baseSat}%</label>
          <input
            type="range"
            min="0"
            max="100"
            value={params.baseSat}
            onChange={(e) => setParams({ ...params, baseSat: parseInt(e.target.value) })}
          />
        </div>

        <div className="control-group">
          <label>Brightness: {params.baseBright}%</label>
          <input
            type="range"
            min="10"
            max="100"
            value={params.baseBright}
            onChange={(e) => setParams({ ...params, baseBright: parseInt(e.target.value) })}
          />
        </div>

        {params.colorMode === 'gradients' && (
          <div className="control-group">
            <label>Gradient Steps: {params.gradientSteps}</label>
            <input
              type="range"
              min="5"
              max="50"
              value={params.gradientSteps}
              onChange={(e) => setParams({ ...params, gradientSteps: parseInt(e.target.value) })}
            />
          </div>
        )}

        {(params.harmonyType === 'analogous' || params.harmonyType === 'monochromatic') && (
          <div className="control-group">
            <label>Palette Size: {params.paletteSize}</label>
            <input
              type="range"
              min="2"
              max="8"
              value={params.paletteSize}
              onChange={(e) => setParams({ ...params, paletteSize: parseInt(e.target.value) })}
            />
          </div>
        )}
      </div>

      <div className="canvas-container">
        <div ref={sketchRef} />
      </div>

      <div className="info-panel">
        <h3>Color Theory Fundamentals</h3>
        <ul>
          <li><strong>Hue:</strong> The pure color without tint or shade (0-360°)</li>
          <li><strong>Saturation:</strong> The intensity or purity of the color</li>
          <li><strong>Brightness/Value:</strong> The lightness or darkness of the color</li>
          <li><strong>Complementary:</strong> Colors opposite on the color wheel (high contrast)</li>
          <li><strong>Analogous:</strong> Adjacent colors on the wheel (harmonious)</li>
          <li><strong>Triadic:</strong> Three colors evenly spaced (vibrant balance)</li>
        </ul>
        
        <h3>Practical Applications</h3>
        <ul>
          <li><strong>UI/UX Design:</strong> Creating accessible and appealing interfaces</li>
          <li><strong>Branding:</strong> Establishing visual identity and emotional connection</li>
          <li><strong>Data Visualization:</strong> Encoding information through color</li>
          <li><strong>Digital Art:</strong> Creating mood and atmosphere</li>
          <li><strong>Photography:</strong> Color grading and enhancement</li>
        </ul>
      </div>
    </div>
  )
}

export default ColorTheoryPage