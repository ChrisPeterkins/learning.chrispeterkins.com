import { useEffect, useRef, useState } from 'react'
import './FlowFieldsPage.css'

interface FlowParticle {
  x: number
  y: number
  vx: number
  vy: number
  prevX: number
  prevY: number
  age: number
  maxAge: number
  hue: number
}

interface Vector {
  x: number
  y: number
  angle: number
}

// Simple Perlin noise implementation
class PerlinNoise {
  private permutation: number[]
  
  constructor() {
    this.permutation = []
    for (let i = 0; i < 256; i++) {
      this.permutation[i] = i
    }
    // Shuffle
    for (let i = 255; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[this.permutation[i], this.permutation[j]] = [this.permutation[j], this.permutation[i]]
    }
    // Duplicate for wrap
    for (let i = 0; i < 256; i++) {
      this.permutation[256 + i] = this.permutation[i]
    }
  }
  
  private fade(t: number): number {
    return t * t * t * (t * (t * 6 - 15) + 10)
  }
  
  private lerp(t: number, a: number, b: number): number {
    return a + t * (b - a)
  }
  
  private grad(hash: number, x: number, y: number): number {
    const h = hash & 3
    const u = h < 2 ? x : y
    const v = h < 2 ? y : x
    return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v)
  }
  
  noise(x: number, y: number): number {
    const X = Math.floor(x) & 255
    const Y = Math.floor(y) & 255
    
    x -= Math.floor(x)
    y -= Math.floor(y)
    
    const u = this.fade(x)
    const v = this.fade(y)
    
    const a = this.permutation[X] + Y
    const aa = this.permutation[a]
    const ab = this.permutation[a + 1]
    const b = this.permutation[X + 1] + Y
    const ba = this.permutation[b]
    const bb = this.permutation[b + 1]
    
    return this.lerp(v,
      this.lerp(u, this.grad(this.permutation[aa], x, y), this.grad(this.permutation[ba], x - 1, y)),
      this.lerp(u, this.grad(this.permutation[ab], x, y - 1), this.grad(this.permutation[bb], x - 1, y - 1))
    )
  }
}

function FlowFieldsPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number | null>(null)
  const particlesRef = useRef<FlowParticle[]>([])
  const flowFieldRef = useRef<Vector[][]>([])
  const noiseRef = useRef<PerlinNoise>(new PerlinNoise())
  const timeRef = useRef(0)
  
  const [fieldType, setFieldType] = useState<'perlin' | 'magnetic' | 'turbulence' | 'vortex' | 'gravity'>('perlin')
  const [isRunning, setIsRunning] = useState(true)
  const [particleCount, setParticleCount] = useState(1000)
  const [noiseScale, setNoiseScale] = useState(0.01)
  const [flowStrength, setFlowStrength] = useState(2)
  const [showField, setShowField] = useState(false)
  const [colorMode, setColorMode] = useState<'rainbow' | 'gradient' | 'monochrome'>('rainbow')

  const initializeFlowField = () => {
    if (!canvasRef.current) return
    
    const canvas = canvasRef.current
    const cols = Math.floor(canvas.width / 20)
    const rows = Math.floor(canvas.height / 20)
    
    flowFieldRef.current = []
    
    for (let x = 0; x < cols; x++) {
      flowFieldRef.current[x] = []
      for (let y = 0; y < rows; y++) {
        let angle = 0
        const px = x * 20
        const py = y * 20
        
        switch (fieldType) {
          case 'perlin':
            angle = noiseRef.current.noise(x * noiseScale, y * noiseScale) * Math.PI * 2
            break
          
          case 'magnetic':
            // Magnetic field around center points
            const cx1 = canvas.width * 0.3
            const cy1 = canvas.height * 0.5
            const cx2 = canvas.width * 0.7
            const cy2 = canvas.height * 0.5
            
            const dx1 = px - cx1
            const dy1 = py - cy1
            const dx2 = px - cx2
            const dy2 = py - cy2
            
            const angle1 = Math.atan2(dy1, dx1) + Math.PI / 2
            const angle2 = Math.atan2(dy2, dx2) - Math.PI / 2
            
            const dist1 = Math.sqrt(dx1 * dx1 + dy1 * dy1)
            const dist2 = Math.sqrt(dx2 * dx2 + dy2 * dy2)
            
            const influence1 = Math.max(0, 1 - dist1 / 200)
            const influence2 = Math.max(0, 1 - dist2 / 200)
            
            angle = (angle1 * influence1 + angle2 * influence2) / (influence1 + influence2 + 0.001)
            break
          
          case 'turbulence':
            // Turbulent flow with multiple octaves
            let turbulence = 0
            let amplitude = 1
            let frequency = noiseScale
            
            for (let i = 0; i < 4; i++) {
              turbulence += noiseRef.current.noise(x * frequency, y * frequency) * amplitude
              amplitude *= 0.5
              frequency *= 2
            }
            
            angle = turbulence * Math.PI * 2
            break
          
          case 'vortex':
            // Rotating vortex field
            const vcx = canvas.width / 2
            const vcy = canvas.height / 2
            const vdx = px - vcx
            const vdy = py - vcy
            angle = Math.atan2(vdy, vdx) + Math.PI / 2
            break
          
          case 'gravity':
            // Downward gravity with some noise
            angle = Math.PI / 2 + noiseRef.current.noise(x * noiseScale * 0.5, y * noiseScale * 0.5) * 0.5
            break
        }
        
        flowFieldRef.current[x][y] = {
          x: px,
          y: py,
          angle
        }
      }
    }
  }

  const initializeParticles = () => {
    particlesRef.current = []
    
    if (!canvasRef.current) return
    
    const canvas = canvasRef.current
    
    for (let i = 0; i < particleCount; i++) {
      const x = Math.random() * canvas.width
      const y = Math.random() * canvas.height
      
      particlesRef.current.push({
        x,
        y,
        vx: 0,
        vy: 0,
        prevX: x,
        prevY: y,
        age: 0,
        maxAge: Math.random() * 100 + 100,
        hue: colorMode === 'rainbow' ? Math.random() * 360 : 200
      })
    }
  }

  const getFlowVector = (x: number, y: number): Vector => {
    const cols = flowFieldRef.current.length
    const rows = cols > 0 ? flowFieldRef.current[0].length : 0
    
    if (cols === 0 || rows === 0) {
      return { x: 0, y: 0, angle: 0 }
    }
    
    const col = Math.floor(x / 20)
    const row = Math.floor(y / 20)
    
    if (col >= 0 && col < cols && row >= 0 && row < rows) {
      return flowFieldRef.current[col][row]
    }
    
    return { x: 0, y: 0, angle: 0 }
  }

  const updateParticle = (particle: FlowParticle, deltaTime: number) => {
    const vector = getFlowVector(particle.x, particle.y)
    
    // Apply flow field force
    const force = flowStrength * deltaTime
    particle.vx += Math.cos(vector.angle) * force
    particle.vy += Math.sin(vector.angle) * force
    
    // Apply additional forces based on field type
    if (fieldType === 'magnetic' || fieldType === 'vortex') {
      const centerX = canvasRef.current!.width / 2
      const centerY = canvasRef.current!.height / 2
      const dx = centerX - particle.x
      const dy = centerY - particle.y
      const dist = Math.sqrt(dx * dx + dy * dy)
      
      if (fieldType === 'vortex' && dist < 200) {
        // Add centripetal force for vortex
        particle.vx += (dx / dist) * 0.1
        particle.vy += (dy / dist) * 0.1
      }
    }
    
    // Limit speed
    const speed = Math.sqrt(particle.vx * particle.vx + particle.vy * particle.vy)
    if (speed > 5) {
      particle.vx = (particle.vx / speed) * 5
      particle.vy = (particle.vy / speed) * 5
    }
    
    // Update position
    particle.prevX = particle.x
    particle.prevY = particle.y
    particle.x += particle.vx
    particle.y += particle.vy
    
    // Apply damping
    particle.vx *= 0.99
    particle.vy *= 0.99
    
    // Update age
    particle.age++
    
    // Wrap around or respawn
    const canvas = canvasRef.current!
    if (particle.x < 0 || particle.x > canvas.width || 
        particle.y < 0 || particle.y > canvas.height ||
        particle.age > particle.maxAge) {
      
      if (fieldType === 'gravity') {
        // Respawn at top for gravity
        particle.x = Math.random() * canvas.width
        particle.y = 0
      } else {
        // Random respawn for others
        particle.x = Math.random() * canvas.width
        particle.y = Math.random() * canvas.height
      }
      
      particle.prevX = particle.x
      particle.prevY = particle.y
      particle.vx = 0
      particle.vy = 0
      particle.age = 0
      particle.maxAge = Math.random() * 100 + 100
      
      if (colorMode === 'rainbow') {
        particle.hue = (particle.hue + 1) % 360
      }
    }
  }

  const drawFlowField = (ctx: CanvasRenderingContext2D) => {
    if (!showField) return
    
    ctx.strokeStyle = 'rgba(74, 222, 128, 0.1)'
    ctx.lineWidth = 1
    
    const cols = flowFieldRef.current.length
    const rows = cols > 0 ? flowFieldRef.current[0].length : 0
    
    for (let x = 0; x < cols; x++) {
      for (let y = 0; y < rows; y++) {
        const vector = flowFieldRef.current[x][y]
        const length = 10
        
        ctx.save()
        ctx.translate(vector.x, vector.y)
        ctx.rotate(vector.angle)
        
        ctx.beginPath()
        ctx.moveTo(0, 0)
        ctx.lineTo(length, 0)
        ctx.moveTo(length - 3, -2)
        ctx.lineTo(length, 0)
        ctx.lineTo(length - 3, 2)
        ctx.stroke()
        
        ctx.restore()
      }
    }
  }

  const drawParticles = (ctx: CanvasRenderingContext2D) => {
    particlesRef.current.forEach(particle => {
      const opacity = Math.max(0, 1 - particle.age / particle.maxAge)
      
      if (colorMode === 'rainbow') {
        ctx.strokeStyle = `hsla(${particle.hue}, 70%, 50%, ${opacity})`
      } else if (colorMode === 'gradient') {
        const hue = 200 + (particle.y / canvasRef.current!.height) * 60
        ctx.strokeStyle = `hsla(${hue}, 70%, 50%, ${opacity})`
      } else {
        ctx.strokeStyle = `rgba(74, 222, 128, ${opacity})`
      }
      
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(particle.prevX, particle.prevY)
      ctx.lineTo(particle.x, particle.y)
      ctx.stroke()
    })
  }

  const animate = () => {
    if (!canvasRef.current || !isRunning) return
    
    const ctx = canvasRef.current.getContext('2d')!
    const canvas = canvasRef.current
    
    // Semi-transparent fade for trail effect
    ctx.fillStyle = 'rgba(10, 15, 13, 0.05)'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    const deltaTime = 0.016
    timeRef.current += deltaTime
    
    // Update flow field for animated effects
    if (fieldType === 'perlin' || fieldType === 'turbulence') {
      const cols = Math.floor(canvas.width / 20)
      const rows = Math.floor(canvas.height / 20)
      
      for (let x = 0; x < cols; x++) {
        for (let y = 0; y < rows; y++) {
          if (flowFieldRef.current[x] && flowFieldRef.current[x][y]) {
            let angle = 0
            
            if (fieldType === 'perlin') {
              angle = noiseRef.current.noise(x * noiseScale, y * noiseScale + timeRef.current * 0.1) * Math.PI * 2
            } else if (fieldType === 'turbulence') {
              let turbulence = 0
              let amplitude = 1
              let frequency = noiseScale
              
              for (let i = 0; i < 4; i++) {
                turbulence += noiseRef.current.noise(
                  x * frequency + timeRef.current * 0.1, 
                  y * frequency
                ) * amplitude
                amplitude *= 0.5
                frequency *= 2
              }
              
              angle = turbulence * Math.PI * 2
            }
            
            flowFieldRef.current[x][y].angle = angle
          }
        }
      }
    }
    
    // Draw flow field
    drawFlowField(ctx)
    
    // Update and draw particles
    particlesRef.current.forEach(particle => updateParticle(particle, deltaTime))
    drawParticles(ctx)
    
    animationRef.current = requestAnimationFrame(animate)
  }

  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        const newWidth = canvasRef.current.offsetWidth
        const newHeight = canvasRef.current.offsetHeight
        
        // Only proceed if we have valid dimensions (not 0)
        if (newWidth > 0 && newHeight > 0) {
          // Only resize if dimensions actually changed
          if (canvasRef.current.width !== newWidth || canvasRef.current.height !== newHeight) {
            canvasRef.current.width = newWidth
            canvasRef.current.height = newHeight
            // Don't reinitialize on resize to preserve state
          }
        }
      }
    }

    // Initialize canvas size on mount
    if (canvasRef.current) {
      canvasRef.current.width = canvasRef.current.offsetWidth
      canvasRef.current.height = canvasRef.current.offsetHeight
    }
    
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  useEffect(() => {
    initializeFlowField()
    initializeParticles()
  }, [fieldType, particleCount, noiseScale])

  useEffect(() => {
    if (isRunning) {
      animationRef.current = requestAnimationFrame(animate)
    } else if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isRunning, fieldType, noiseScale, flowStrength, showField, colorMode])

  return (
    <div className="flow-fields-page">
      <h1>Flow Fields</h1>
      
      <div className="controls">
        <div className="control-group">
          <label>Field Type</label>
          <div className="button-group">
            {(['perlin', 'magnetic', 'turbulence', 'vortex', 'gravity'] as const).map(type => (
              <button
                key={type}
                className={fieldType === type ? 'active' : ''}
                onClick={() => setFieldType(type)}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        </div>
        
        <div className="control-group">
          <label>Particles: {particleCount}</label>
          <input
            type="range"
            min="100"
            max="3000"
            step="100"
            value={particleCount}
            onChange={(e) => setParticleCount(Number(e.target.value))}
          />
        </div>
        
        <div className="control-group">
          <label>Noise Scale: {noiseScale.toFixed(3)}</label>
          <input
            type="range"
            min="0.001"
            max="0.05"
            step="0.001"
            value={noiseScale}
            onChange={(e) => setNoiseScale(Number(e.target.value))}
          />
        </div>
        
        <div className="control-group">
          <label>Flow Strength: {flowStrength.toFixed(1)}</label>
          <input
            type="range"
            min="0.5"
            max="5"
            step="0.1"
            value={flowStrength}
            onChange={(e) => setFlowStrength(Number(e.target.value))}
          />
        </div>
        
        <div className="control-group">
          <label>Color Mode</label>
          <div className="button-group">
            {(['rainbow', 'gradient', 'monochrome'] as const).map(mode => (
              <button
                key={mode}
                className={colorMode === mode ? 'active' : ''}
                onClick={() => setColorMode(mode)}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </div>
        </div>
        
        <div className="control-group">
          <label>
            <input
              type="checkbox"
              checked={showField}
              onChange={(e) => setShowField(e.target.checked)}
            />
            Show Flow Field
          </label>
        </div>
        
        <button
          className={`play-button ${isRunning ? 'pause' : 'play'}`}
          onClick={() => setIsRunning(!isRunning)}
        >
          {isRunning ? 'Pause' : 'Play'}
        </button>
        
        <button
          className="reset-button"
          onClick={() => {
            initializeFlowField()
            initializeParticles()
          }}
        >
          Reset
        </button>
      </div>
      
      <canvas
        ref={canvasRef}
        className="flow-canvas"
        width={800}
        height={600}
      />
      
      <div className="info-panel">
        <h3>Flow Field Concepts</h3>
        <ul>
          <li><strong>Perlin Noise:</strong> Smooth, organic random values for natural motion</li>
          <li><strong>Vector Fields:</strong> Grid of directional forces affecting particles</li>
          <li><strong>Magnetic Fields:</strong> Particles follow field lines around poles</li>
          <li><strong>Turbulence:</strong> Multiple noise octaves for chaotic flow</li>
          <li><strong>Vortex:</strong> Rotational flow creating spiral patterns</li>
          <li><strong>Steering Behaviors:</strong> Particles follow and respond to field forces</li>
        </ul>
      </div>
    </div>
  )
}

export default FlowFieldsPage