import { useEffect, useRef, useState } from 'react'
import './InteractiveAnimationsPage.css'

interface Point {
  x: number
  y: number
  vx?: number
  vy?: number
  age?: number
  size?: number
  color?: string
}

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  originalX: number
  originalY: number
  color: string
  distance?: number
}

function InteractiveAnimationsPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number | null>(null)
  const mouseRef = useRef<Point>({ x: 0, y: 0 })
  const mouseHistoryRef = useRef<Point[]>([])
  const particlesRef = useRef<Particle[]>([])
  const imageDataRef = useRef<ImageData | null>(null)
  
  const [effectType, setEffectType] = useState<'trail' | 'gravity' | 'repulsion' | 'connect' | 'morph' | 'paint'>('trail')
  const [isRunning, setIsRunning] = useState(true)
  const [brushSize, setBrushSize] = useState(20)
  const [attractionStrength, setAttractionStrength] = useState(0.5)
  const [connectionDistance, setConnectionDistance] = useState(100)

  const initializeParticles = () => {
    particlesRef.current = []
    
    if (!canvasRef.current) return
    
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')!
    
    if (effectType === 'morph') {
      // Create text particles
      ctx.fillStyle = '#0a0f0d'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      
      ctx.fillStyle = '#4ade80'
      ctx.font = 'bold 80px Playfair Display'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('INTERACTIVE', canvas.width / 2, canvas.height / 2)
      
      imageDataRef.current = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const pixels = imageDataRef.current.data
      
      for (let y = 0; y < canvas.height; y += 4) {
        for (let x = 0; x < canvas.width; x += 4) {
          const index = (y * canvas.width + x) * 4
          if (pixels[index + 3] > 128) {
            particlesRef.current.push({
              x: x,
              y: y,
              vx: 0,
              vy: 0,
              size: 2,
              originalX: x,
              originalY: y,
              color: `hsl(${(x / canvas.width) * 60 + 100}, 70%, 50%)`
            })
          }
        }
      }
    } else if (effectType === 'gravity' || effectType === 'repulsion') {
      // Create random particles
      for (let i = 0; i < 200; i++) {
        const x = Math.random() * canvas.width
        const y = Math.random() * canvas.height
        particlesRef.current.push({
          x,
          y,
          vx: 0,
          vy: 0,
          size: Math.random() * 3 + 1,
          originalX: x,
          originalY: y,
          color: `hsl(${Math.random() * 360}, 70%, 50%)`
        })
      }
    } else if (effectType === 'connect') {
      // Create grid of particles
      const spacing = 30
      for (let x = spacing; x < canvas.width; x += spacing) {
        for (let y = spacing; y < canvas.height; y += spacing) {
          particlesRef.current.push({
            x,
            y,
            vx: 0,
            vy: 0,
            size: 3,
            originalX: x,
            originalY: y,
            color: '#4ade80'
          })
        }
      }
    }
  }

  const drawMouseTrail = (ctx: CanvasRenderingContext2D) => {
    if (mouseHistoryRef.current.length < 2) return
    
    ctx.strokeStyle = '#4ade80'
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    
    for (let i = 1; i < mouseHistoryRef.current.length; i++) {
      const point = mouseHistoryRef.current[i]
      const prevPoint = mouseHistoryRef.current[i - 1]
      
      const age = point.age || 0
      const opacity = Math.max(0, 1 - age)
      
      ctx.globalAlpha = opacity
      ctx.lineWidth = (point.size || brushSize) * opacity
      
      ctx.beginPath()
      ctx.moveTo(prevPoint.x, prevPoint.y)
      ctx.lineTo(point.x, point.y)
      ctx.stroke()
      
      // Draw glow
      if (opacity > 0.5) {
        ctx.shadowBlur = 20
        ctx.shadowColor = '#4ade80'
        ctx.stroke()
        ctx.shadowBlur = 0
      }
    }
    
    ctx.globalAlpha = 1
  }

  const drawPaintBrush = (ctx: CanvasRenderingContext2D) => {
    if (mouseHistoryRef.current.length < 2) return
    
    for (let i = 1; i < mouseHistoryRef.current.length; i++) {
      const point = mouseHistoryRef.current[i]
      const prevPoint = mouseHistoryRef.current[i - 1]
      
      const dx = point.x - prevPoint.x
      const dy = point.y - prevPoint.y
      const distance = Math.sqrt(dx * dx + dy * dy)
      
      for (let j = 0; j < distance; j += 2) {
        const t = j / distance
        const x = prevPoint.x + dx * t
        const y = prevPoint.y + dy * t
        
        // Create paint splatter effect
        for (let k = 0; k < 5; k++) {
          const offsetX = (Math.random() - 0.5) * brushSize
          const offsetY = (Math.random() - 0.5) * brushSize
          const size = Math.random() * 3 + 1
          
          const gradient = ctx.createRadialGradient(
            x + offsetX, y + offsetY, 0,
            x + offsetX, y + offsetY, size
          )
          
          const hue = (Date.now() * 0.05 + i * 10) % 360
          gradient.addColorStop(0, `hsla(${hue}, 70%, 50%, 0.8)`)
          gradient.addColorStop(1, `hsla(${hue}, 70%, 50%, 0)`)
          
          ctx.fillStyle = gradient
          ctx.beginPath()
          ctx.arc(x + offsetX, y + offsetY, size, 0, Math.PI * 2)
          ctx.fill()
        }
      }
    }
  }

  const updateParticles = (deltaTime: number) => {
    const mouse = mouseRef.current
    
    particlesRef.current.forEach(particle => {
      const dx = mouse.x - particle.x
      const dy = mouse.y - particle.y
      const distance = Math.sqrt(dx * dx + dy * dy)
      particle.distance = distance
      
      if (effectType === 'gravity') {
        // Attract to mouse
        if (distance > 0 && distance < 200) {
          const force = (200 - distance) / 200 * attractionStrength
          particle.vx += (dx / distance) * force
          particle.vy += (dy / distance) * force
        }
      } else if (effectType === 'repulsion') {
        // Repel from mouse
        if (distance > 0 && distance < 150) {
          const force = (150 - distance) / 150 * attractionStrength * 2
          particle.vx -= (dx / distance) * force
          particle.vy -= (dy / distance) * force
        }
      } else if (effectType === 'morph') {
        // Morph text on mouse proximity
        if (distance < 100) {
          const force = (100 - distance) / 100
          particle.vx += (Math.random() - 0.5) * force * 10
          particle.vy += (Math.random() - 0.5) * force * 10
        }
        
        // Return to original position
        const returnX = particle.originalX - particle.x
        const returnY = particle.originalY - particle.y
        particle.vx += returnX * 0.05
        particle.vy += returnY * 0.05
      }
      
      // Apply velocity
      particle.x += particle.vx * deltaTime * 60
      particle.y += particle.vy * deltaTime * 60
      
      // Apply damping
      particle.vx *= 0.92
      particle.vy *= 0.92
      
      // Boundary check for non-morph effects
      if (effectType !== 'morph') {
        const canvas = canvasRef.current!
        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -0.8
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -0.8
        
        particle.x = Math.max(0, Math.min(canvas.width, particle.x))
        particle.y = Math.max(0, Math.min(canvas.height, particle.y))
      }
    })
  }

  const drawParticles = (ctx: CanvasRenderingContext2D) => {
    if (effectType === 'connect') {
      // Draw connections
      particlesRef.current.forEach((p1, i) => {
        particlesRef.current.slice(i + 1).forEach(p2 => {
          const dx = p1.x - p2.x
          const dy = p1.y - p2.y
          const distance = Math.sqrt(dx * dx + dy * dy)
          
          if (distance < connectionDistance) {
            const opacity = (1 - distance / connectionDistance) * 0.5
            ctx.strokeStyle = `rgba(74, 222, 128, ${opacity})`
            ctx.lineWidth = 1
            ctx.beginPath()
            ctx.moveTo(p1.x, p1.y)
            ctx.lineTo(p2.x, p2.y)
            ctx.stroke()
          }
        })
        
        // Connect to mouse
        const mouseDist = p1.distance || 0
        if (mouseDist < connectionDistance) {
          const opacity = (1 - mouseDist / connectionDistance) * 0.8
          ctx.strokeStyle = `rgba(74, 222, 128, ${opacity})`
          ctx.lineWidth = 2
          ctx.beginPath()
          ctx.moveTo(p1.x, p1.y)
          ctx.lineTo(mouseRef.current.x, mouseRef.current.y)
          ctx.stroke()
        }
      })
    }
    
    // Draw particles
    particlesRef.current.forEach(particle => {
      ctx.fillStyle = particle.color
      
      if (effectType === 'morph') {
        const mouseDist = particle.distance || 0
        const scale = mouseDist < 100 ? 1 + (100 - mouseDist) / 100 : 1
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size * scale, 0, Math.PI * 2)
        ctx.fill()
      } else {
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        ctx.fill()
      }
    })
  }

  const animate = () => {
    if (!canvasRef.current || !isRunning) return
    
    const ctx = canvasRef.current.getContext('2d')!
    const canvas = canvasRef.current
    
    // Clear canvas
    if (effectType === 'paint') {
      ctx.fillStyle = 'rgba(10, 15, 13, 0.02)'
    } else {
      ctx.fillStyle = 'rgba(10, 15, 13, 0.1)'
    }
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    const deltaTime = 0.016
    
    // Update mouse trail
    mouseHistoryRef.current.forEach(point => {
      point.age = (point.age || 0) + deltaTime
    })
    mouseHistoryRef.current = mouseHistoryRef.current.filter(p => (p.age || 0) < 1)
    
    // Draw effects
    if (effectType === 'trail') {
      drawMouseTrail(ctx)
    } else if (effectType === 'paint') {
      drawPaintBrush(ctx)
    } else {
      updateParticles(deltaTime)
      drawParticles(ctx)
    }
    
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

    const handleMouseMove = (e: MouseEvent) => {
      if (canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top
        
        mouseRef.current = { x, y }
        
        // Add to history for trail effects
        if (effectType === 'trail' || effectType === 'paint') {
          mouseHistoryRef.current.push({
            x,
            y,
            age: 0,
            size: brushSize + Math.random() * 10
          })
          
          // Limit history length
          if (mouseHistoryRef.current.length > 50) {
            mouseHistoryRef.current.shift()
          }
        }
      }
    }

    const handleTouch = (e: TouchEvent) => {
      if (e.touches.length > 0 && canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect()
        const touch = e.touches[0]
        const x = touch.clientX - rect.left
        const y = touch.clientY - rect.top
        
        mouseRef.current = { x, y }
        
        if (effectType === 'trail' || effectType === 'paint') {
          mouseHistoryRef.current.push({
            x,
            y,
            age: 0,
            size: brushSize + Math.random() * 10
          })
        }
      }
    }

    // Initialize canvas size on mount
    if (canvasRef.current) {
      canvasRef.current.width = canvasRef.current.offsetWidth
      canvasRef.current.height = canvasRef.current.offsetHeight
    }
    
    window.addEventListener('resize', handleResize)
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('touchmove', handleTouch)
    window.addEventListener('touchstart', handleTouch)

    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('touchmove', handleTouch)
      window.removeEventListener('touchstart', handleTouch)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [effectType, brushSize])

  useEffect(() => {
    initializeParticles()
  }, [effectType])

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
  }, [isRunning, effectType, brushSize, attractionStrength, connectionDistance])

  return (
    <div className="interactive-animations-page">
      <h1>Interactive Animations</h1>
      
      <div className="controls">
        <div className="control-group">
          <label>Effect Type</label>
          <div className="button-group">
            {(['trail', 'gravity', 'repulsion', 'connect', 'morph', 'paint'] as const).map(type => (
              <button
                key={type}
                className={effectType === type ? 'active' : ''}
                onClick={() => setEffectType(type)}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        </div>
        
        {(effectType === 'trail' || effectType === 'paint') && (
          <div className="control-group">
            <label>Brush Size: {brushSize}</label>
            <input
              type="range"
              min="5"
              max="50"
              value={brushSize}
              onChange={(e) => setBrushSize(Number(e.target.value))}
            />
          </div>
        )}
        
        {(effectType === 'gravity' || effectType === 'repulsion') && (
          <div className="control-group">
            <label>Force Strength: {attractionStrength.toFixed(2)}</label>
            <input
              type="range"
              min="0.1"
              max="2"
              step="0.1"
              value={attractionStrength}
              onChange={(e) => setAttractionStrength(Number(e.target.value))}
            />
          </div>
        )}
        
        {effectType === 'connect' && (
          <div className="control-group">
            <label>Connection Distance: {connectionDistance}</label>
            <input
              type="range"
              min="50"
              max="200"
              value={connectionDistance}
              onChange={(e) => setConnectionDistance(Number(e.target.value))}
            />
          </div>
        )}
        
        <button
          className={`play-button ${isRunning ? 'pause' : 'play'}`}
          onClick={() => setIsRunning(!isRunning)}
        >
          {isRunning ? 'Pause' : 'Play'}
        </button>
        
        {(effectType === 'paint' || effectType === 'trail') && (
          <button
            className="clear-button"
            onClick={() => {
              mouseHistoryRef.current = []
              if (canvasRef.current) {
                const ctx = canvasRef.current.getContext('2d')!
                ctx.fillStyle = '#0a0f0d'
                ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height)
              }
            }}
          >
            Clear Canvas
          </button>
        )}
      </div>
      
      <canvas
        ref={canvasRef}
        className="interactive-canvas"
        width={800}
        height={600}
      />
      
      <div className="info-panel">
        <h3>Interactive Techniques</h3>
        <ul>
          <li><strong>Mouse Trail:</strong> Smooth bezier curves following cursor movement</li>
          <li><strong>Gravity:</strong> Particles attracted to mouse position</li>
          <li><strong>Repulsion:</strong> Particles pushed away from cursor</li>
          <li><strong>Connect:</strong> Dynamic line connections based on proximity</li>
          <li><strong>Morph:</strong> Text particles that react to mouse distance</li>
          <li><strong>Paint:</strong> Digital painting with splatter effects</li>
          <li>Works with both mouse and touch input!</li>
        </ul>
      </div>
    </div>
  )
}

export default InteractiveAnimationsPage