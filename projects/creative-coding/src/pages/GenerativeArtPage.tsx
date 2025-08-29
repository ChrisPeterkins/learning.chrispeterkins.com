import { useEffect, useRef, useState } from 'react'
import p5 from 'p5'

function GenerativeArtPage() {
  const sketchRef = useRef<HTMLDivElement>(null)
  const p5Instance = useRef<p5 | null>(null)
  const [params, setParams] = useState({
    particleCount: 100,
    speed: 1,
    colorMode: 'rainbow',
    connectionDistance: 100,
    particleSize: 2
  })

  useEffect(() => {
    if (!sketchRef.current) return

    const sketch = (p: p5) => {
      let particles: Array<{
        x: number
        y: number
        vx: number
        vy: number
        color: p5.Color
      }> = []

      p.setup = () => {
        const canvas = p.createCanvas(800, 600)
        canvas.parent(sketchRef.current!)
        p.background(10, 15, 13)
        
        // Initialize particles
        for (let i = 0; i < params.particleCount; i++) {
          particles.push({
            x: p.random(p.width),
            y: p.random(p.height),
            vx: p.random(-1, 1) * params.speed,
            vy: p.random(-1, 1) * params.speed,
            color: getParticleColor(p, i)
          })
        }
      }

      const getParticleColor = (p: p5, index: number) => {
        switch (params.colorMode) {
          case 'rainbow':
            p.colorMode(p.HSB, 360, 100, 100)
            return p.color((index * 360) / params.particleCount, 70, 100)
          case 'green':
            return p.color(74, 222, 128, 150)
          case 'blue':
            return p.color(96, 165, 250, 150)
          case 'monochrome':
            return p.color(240, 244, 242, 150)
          default:
            return p.color(74, 222, 128, 150)
        }
      }

      p.draw = () => {
        p.background(10, 15, 13, 25)
        
        // Update and draw particles
        for (let i = 0; i < particles.length; i++) {
          const particle = particles[i]
          
          // Update position
          particle.x += particle.vx * params.speed
          particle.y += particle.vy * params.speed
          
          // Bounce off edges
          if (particle.x < 0 || particle.x > p.width) {
            particle.vx *= -1
          }
          if (particle.y < 0 || particle.y > p.height) {
            particle.vy *= -1
          }
          
          // Keep particles in bounds
          particle.x = p.constrain(particle.x, 0, p.width)
          particle.y = p.constrain(particle.y, 0, p.height)
          
          // Draw connections
          for (let j = i + 1; j < particles.length; j++) {
            const other = particles[j]
            const d = p.dist(particle.x, particle.y, other.x, other.y)
            
            if (d < params.connectionDistance) {
              const alpha = p.map(d, 0, params.connectionDistance, 255, 0)
              p.stroke(particle.color.levels[0], particle.color.levels[1], particle.color.levels[2], alpha)
              p.strokeWeight(1)
              p.line(particle.x, particle.y, other.x, other.y)
            }
          }
          
          // Draw particle
          p.noStroke()
          p.fill(particle.color)
          p.circle(particle.x, particle.y, params.particleSize * 2)
        }
      }

      // Update particles when parameters change
      p.updateParticles = () => {
        particles = []
        for (let i = 0; i < params.particleCount; i++) {
          particles.push({
            x: p.random(p.width),
            y: p.random(p.height),
            vx: p.random(-1, 1) * params.speed,
            vy: p.random(-1, 1) * params.speed,
            color: getParticleColor(p, i)
          })
        }
      }
    }

    p5Instance.current = new p5(sketch)

    return () => {
      p5Instance.current?.remove()
    }
  }, [])

  // Update sketch when parameters change
  useEffect(() => {
    if (p5Instance.current && (p5Instance.current as any).updateParticles) {
      (p5Instance.current as any).updateParticles()
    }
  }, [params])

  const handleReset = () => {
    if (p5Instance.current && (p5Instance.current as any).updateParticles) {
      (p5Instance.current as any).updateParticles()
    }
  }

  return (
    <div className="page">
      <h2>Generative Art</h2>
      <p className="page-description">
        Create dynamic, evolving artwork using particles and connections. 
        Adjust the parameters to explore different visual patterns.
      </p>

      <div className="controls">
        <div className="control-group">
          <label>Particle Count: {params.particleCount}</label>
          <input
            type="range"
            min="10"
            max="200"
            value={params.particleCount}
            onChange={(e) => setParams({ ...params, particleCount: parseInt(e.target.value) })}
          />
        </div>

        <div className="control-group">
          <label>Speed: {params.speed.toFixed(1)}</label>
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
          <label>Connection Distance: {params.connectionDistance}</label>
          <input
            type="range"
            min="50"
            max="200"
            value={params.connectionDistance}
            onChange={(e) => setParams({ ...params, connectionDistance: parseInt(e.target.value) })}
          />
        </div>

        <div className="control-group">
          <label>Particle Size: {params.particleSize}</label>
          <input
            type="range"
            min="1"
            max="10"
            value={params.particleSize}
            onChange={(e) => setParams({ ...params, particleSize: parseInt(e.target.value) })}
          />
        </div>

        <div className="control-group">
          <label>Color Mode</label>
          <select
            value={params.colorMode}
            onChange={(e) => setParams({ ...params, colorMode: e.target.value })}
          >
            <option value="rainbow">Rainbow</option>
            <option value="green">Green</option>
            <option value="blue">Blue</option>
            <option value="monochrome">Monochrome</option>
          </select>
        </div>

        <button className="reset-button" onClick={handleReset}>
          Reset Particles
        </button>
      </div>

      <div className="canvas-container">
        <div ref={sketchRef} />
      </div>

      <div className="info-panel">
        <h3>How it Works</h3>
        <ul>
          <li><strong>Particles:</strong> Each particle moves with its own velocity vector</li>
          <li><strong>Connections:</strong> Lines are drawn between particles within the connection distance</li>
          <li><strong>Emergence:</strong> Complex patterns emerge from simple rules</li>
          <li><strong>Color Modes:</strong> Different color schemes create different moods</li>
        </ul>
      </div>
    </div>
  )
}

export default GenerativeArtPage