import { useEffect, useRef, useState } from 'react'
import p5 from 'p5'

function NoiseAlgorithmsPage() {
  const sketchRef = useRef<HTMLDivElement>(null)
  const p5Instance = useRef<p5 | null>(null)
  const [params, setParams] = useState({
    noiseType: 'perlin',
    scale: 0.01,
    speed: 1,
    amplitude: 100,
    octaves: 4,
    falloff: 0.5,
    visualization: 'terrain'
  })

  useEffect(() => {
    if (!sketchRef.current) return

    const sketch = (p: p5) => {
      let time = 0
      let flowField: p5.Vector[] = []
      let particles: Array<{ x: number; y: number; history: p5.Vector[] }> = []

      p.setup = () => {
        const canvas = p.createCanvas(800, 600)
        canvas.parent(sketchRef.current!)
        p.colorMode(p.HSB, 360, 100, 100)
        
        // Initialize flow field
        const cols = Math.floor(p.width / 20)
        const rows = Math.floor(p.height / 20)
        
        for (let y = 0; y < rows; y++) {
          for (let x = 0; x < cols; x++) {
            flowField.push(p.createVector(0, 0))
          }
        }

        // Initialize particles for flow field
        for (let i = 0; i < 50; i++) {
          particles.push({
            x: p.random(p.width),
            y: p.random(p.height),
            history: []
          })
        }
      }

      const generateNoise = (x: number, y: number, z: number = 0): number => {
        let value = 0
        let amplitude = params.amplitude
        let frequency = params.scale
        
        for (let i = 0; i < params.octaves; i++) {
          value += p.noise(x * frequency, y * frequency, z * frequency) * amplitude
          amplitude *= params.falloff
          frequency *= 2
        }
        
        return value
      }

      p.draw = () => {
        time += 0.01 * params.speed

        if (params.visualization === 'terrain') {
          drawTerrain()
        } else if (params.visualization === 'flowfield') {
          drawFlowField()
        } else if (params.visualization === 'landscape') {
          drawLandscape()
        } else if (params.visualization === 'clouds') {
          drawClouds()
        }
      }

      const drawTerrain = () => {
        p.background(220, 50, 20)
        p.noStroke()
        
        const resolution = 4
        for (let x = 0; x < p.width; x += resolution) {
          for (let y = 0; y < p.height; y += resolution) {
            const noiseVal = generateNoise(x, y, time)
            const normalizedNoise = p.map(noiseVal, 0, params.amplitude, 0, 1)
            
            // Create height-based colors
            let hue, sat, bright
            if (normalizedNoise < 0.3) {
              hue = 240; sat = 80; bright = 30 + normalizedNoise * 30 // Deep water
            } else if (normalizedNoise < 0.5) {
              hue = 200; sat = 60; bright = 40 + normalizedNoise * 20 // Shallow water
            } else if (normalizedNoise < 0.6) {
              hue = 60; sat = 40; bright = 60 + normalizedNoise * 15 // Beach
            } else if (normalizedNoise < 0.8) {
              hue = 120; sat = 60; bright = 50 + normalizedNoise * 30 // Grass
            } else {
              hue = 30; sat = 30; bright = 70 + normalizedNoise * 20 // Mountain
            }
            
            p.fill(hue, sat, bright)
            p.rect(x, y, resolution, resolution)
          }
        }
      }

      const drawFlowField = () => {
        p.background(0, 0, 10)
        
        // Update flow field
        const cols = Math.floor(p.width / 20)
        const rows = Math.floor(p.height / 20)
        
        for (let y = 0; y < rows; y++) {
          for (let x = 0; x < cols; x++) {
            const index = x + y * cols
            const angle = generateNoise(x * 0.1, y * 0.1, time) * 0.01
            flowField[index] = p5.Vector.fromAngle(angle)
          }
        }

        // Update and draw particles
        for (let particle of particles) {
          // Get flow field vector
          const x = Math.floor(particle.x / 20)
          const y = Math.floor(particle.y / 20)
          const index = x + y * cols
          
          if (flowField[index]) {
            const force = flowField[index].copy()
            force.mult(2)
            particle.x += force.x
            particle.y += force.y
          }

          // Wrap around edges
          if (particle.x < 0) particle.x = p.width
          if (particle.x > p.width) particle.x = 0
          if (particle.y < 0) particle.y = p.height
          if (particle.y > p.height) particle.y = 0

          // Add to history
          particle.history.push(p.createVector(particle.x, particle.y))
          if (particle.history.length > 50) {
            particle.history.shift()
          }

          // Draw trail
          p.noFill()
          for (let i = 0; i < particle.history.length - 1; i++) {
            const alpha = p.map(i, 0, particle.history.length, 0, 100)
            const hue = p.map(p.noise(particle.x * 0.01, particle.y * 0.01, time), 0, 1, 0, 360)
            p.stroke(hue, 60, 80, alpha)
            p.strokeWeight(2)
            p.line(
              particle.history[i].x, particle.history[i].y,
              particle.history[i + 1].x, particle.history[i + 1].y
            )
          }
        }
      }

      const drawLandscape = () => {
        p.background(220, 30, 20)
        
        // Draw layered mountains
        const layers = 5
        for (let layer = 0; layer < layers; layer++) {
          p.noStroke()
          const layerAlpha = p.map(layer, 0, layers - 1, 100, 40)
          const hue = 200 + layer * 20
          p.fill(hue, 40, 60, layerAlpha)
          
          p.beginShape()
          p.vertex(0, p.height)
          
          for (let x = 0; x <= p.width; x += 5) {
            const y = p.height * 0.3 + 
                     generateNoise(x * (params.scale + layer * 0.002), layer * 100, time) * 0.3
            p.vertex(x, y)
          }
          
          p.vertex(p.width, p.height)
          p.endShape(p.CLOSE)
        }
      }

      const drawClouds = () => {
        p.background(200, 30, 90)
        p.noStroke()
        
        const resolution = 8
        for (let x = 0; x < p.width; x += resolution) {
          for (let y = 0; y < p.height; y += resolution) {
            const noiseVal = generateNoise(x, y, time * 0.5)
            const opacity = p.map(noiseVal, 0, params.amplitude, 0, 80)
            
            if (opacity > 20) {
              p.fill(0, 0, 100, opacity)
              p.rect(x, y, resolution, resolution)
            }
          }
        }
      }
    }

    p5Instance.current = new p5(sketch)

    return () => {
      p5Instance.current?.remove()
    }
  }, [params])

  return (
    <div className="page">
      <h2>Noise Algorithms</h2>
      <p className="page-description">
        Explore Perlin noise and other algorithms to create organic, natural-looking patterns and simulations.
      </p>

      <div className="controls">
        <div className="control-group">
          <label>Visualization</label>
          <select
            value={params.visualization}
            onChange={(e) => setParams({ ...params, visualization: e.target.value })}
          >
            <option value="terrain">Terrain Map</option>
            <option value="flowfield">Flow Field</option>
            <option value="landscape">Mountain Landscape</option>
            <option value="clouds">Cloud Formation</option>
          </select>
        </div>

        <div className="control-group">
          <label>Noise Scale: {params.scale.toFixed(3)}</label>
          <input
            type="range"
            min="0.001"
            max="0.05"
            step="0.001"
            value={params.scale}
            onChange={(e) => setParams({ ...params, scale: parseFloat(e.target.value) })}
          />
        </div>

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
          <label>Amplitude: {params.amplitude}</label>
          <input
            type="range"
            min="10"
            max="200"
            value={params.amplitude}
            onChange={(e) => setParams({ ...params, amplitude: parseInt(e.target.value) })}
          />
        </div>

        <div className="control-group">
          <label>Octaves: {params.octaves}</label>
          <input
            type="range"
            min="1"
            max="8"
            value={params.octaves}
            onChange={(e) => setParams({ ...params, octaves: parseInt(e.target.value) })}
          />
        </div>

        <div className="control-group">
          <label>Falloff: {params.falloff.toFixed(2)}</label>
          <input
            type="range"
            min="0.1"
            max="0.9"
            step="0.05"
            value={params.falloff}
            onChange={(e) => setParams({ ...params, falloff: parseFloat(e.target.value) })}
          />
        </div>
      </div>

      <div className="canvas-container">
        <div ref={sketchRef} />
      </div>

      <div className="info-panel">
        <h3>Noise Algorithm Techniques</h3>
        <ul>
          <li><strong>Perlin Noise:</strong> Smooth, natural-looking randomness developed by Ken Perlin</li>
          <li><strong>Octaves:</strong> Multiple noise layers at different frequencies for detail</li>
          <li><strong>Flow Fields:</strong> Vector fields that guide particle movement</li>
          <li><strong>Terrain Generation:</strong> Height maps created using noise functions</li>
          <li><strong>Layering:</strong> Combining multiple noise scales for complex patterns</li>
          <li><strong>Animation:</strong> Time-based noise creates smooth, organic motion</li>
        </ul>
        
        <h3>Applications</h3>
        <ul>
          <li><strong>Game Development:</strong> Procedural terrain and texture generation</li>
          <li><strong>Visual Effects:</strong> Natural phenomena like clouds, water, and fire</li>
          <li><strong>Art & Design:</strong> Organic patterns and abstract compositions</li>
          <li><strong>Simulation:</strong> Natural movement patterns and environmental effects</li>
        </ul>
      </div>
    </div>
  )
}

export default NoiseAlgorithmsPage