import { useEffect, useRef, useState } from 'react'
import './ParticleSystemsPage.css'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
  size: number
  color: string
  type?: string
}

function ParticleSystemsPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number | null>(null)
  const particlesRef = useRef<Particle[]>([])
  const mouseRef = useRef({ x: 0, y: 0 })
  const canvasInitializedRef = useRef(false)
  
  const [effectType, setEffectType] = useState<'fireworks' | 'starfield' | 'smoke' | 'confetti' | 'fountain'>('fireworks')
  const [isRunning, setIsRunning] = useState(true)
  const [particleCount, setParticleCount] = useState(100)
  const [gravity, setGravity] = useState(0.1)

  const createParticle = (x: number, y: number, type: string): Particle => {
    switch (type) {
      case 'fireworks':
        return {
          x,
          y,
          vx: (Math.random() - 0.5) * 8,
          vy: Math.random() * -10 - 5,
          life: 1,
          maxLife: 1,
          size: Math.random() * 3 + 1,
          color: `hsl(${Math.random() * 360}, 70%, 50%)`,
          type
        }
      
      case 'starfield':
        return {
          x: Math.random() * (canvasRef.current?.width || 800),
          y: Math.random() * (canvasRef.current?.height || 600),
          vx: 0,
          vy: Math.random() * 2 + 0.5,
          life: 1,
          maxLife: 1,
          size: Math.random() * 2 + 0.5,
          color: '#ffffff',
          type
        }
      
      case 'smoke':
        return {
          x,
          y,
          vx: (Math.random() - 0.5) * 2,
          vy: -Math.random() * 2 - 1,
          life: 1,
          maxLife: 1,
          size: Math.random() * 20 + 10,
          color: 'rgba(150, 150, 150, 0.3)',
          type
        }
      
      case 'confetti':
        return {
          x,
          y: 0,
          vx: (Math.random() - 0.5) * 4,
          vy: Math.random() * 3 + 2,
          life: 1,
          maxLife: 1,
          size: Math.random() * 5 + 3,
          color: `hsl(${Math.random() * 360}, 80%, 60%)`,
          type
        }
      
      case 'fountain':
        return {
          x,
          y,
          vx: (Math.random() - 0.5) * 4,
          vy: -Math.random() * 8 - 4,
          life: 1,
          maxLife: 1,
          size: Math.random() * 4 + 2,
          color: `hsl(200, 70%, ${50 + Math.random() * 30}%)`,
          type
        }
      
      default:
        return {
          x, y, vx: 0, vy: 0, life: 1, maxLife: 1, size: 5, color: '#fff', type
        }
    }
  }

  const updateParticle = (particle: Particle, deltaTime: number) => {
    particle.x += particle.vx * deltaTime * 60
    particle.y += particle.vy * deltaTime * 60
    
    if (particle.type === 'fireworks' || particle.type === 'fountain') {
      particle.vy += gravity * deltaTime * 60
    }
    
    if (particle.type === 'smoke') {
      particle.vx += (Math.random() - 0.5) * 0.2
      particle.size *= 1.01
    }
    
    particle.life -= deltaTime * 2
    
    // Respawn logic for continuous effects
    if (particle.life <= 0) {
      if (particle.type === 'starfield') {
        particle.y = 0
        particle.x = Math.random() * (canvasRef.current?.width || 800)
        particle.life = 1
      } else if (particle.type === 'fountain' || particle.type === 'smoke') {
        const newParticle = createParticle(
          particle.type === 'fountain' ? canvasRef.current!.width / 2 : mouseRef.current.x,
          particle.type === 'fountain' ? canvasRef.current!.height - 50 : mouseRef.current.y,
          particle.type
        )
        Object.assign(particle, newParticle)
      }
    }
  }

  const drawParticle = (ctx: CanvasRenderingContext2D, particle: Particle) => {
    ctx.save()
    
    if (particle.type === 'confetti') {
      ctx.fillStyle = particle.color
      ctx.translate(particle.x, particle.y)
      ctx.rotate(particle.x * 0.01)
      ctx.fillRect(-particle.size / 2, -particle.size / 2, particle.size, particle.size * 2)
    } else if (particle.type === 'smoke') {
      const gradient = ctx.createRadialGradient(particle.x, particle.y, 0, particle.x, particle.y, particle.size)
      gradient.addColorStop(0, `rgba(150, 150, 150, ${particle.life * 0.3})`)
      gradient.addColorStop(1, 'rgba(150, 150, 150, 0)')
      ctx.fillStyle = gradient
      ctx.beginPath()
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
      ctx.fill()
    } else {
      ctx.globalAlpha = particle.life
      ctx.fillStyle = particle.color
      ctx.shadowBlur = particle.type === 'starfield' ? 5 : 10
      ctx.shadowColor = particle.color
      ctx.beginPath()
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
      ctx.fill()
    }
    
    ctx.restore()
  }

  const animate = (currentTime: number) => {
    if (!canvasRef.current || !isRunning) return
    
    const ctx = canvasRef.current.getContext('2d')!
    const canvas = canvasRef.current
    
    // Clear with trail effect
    ctx.fillStyle = effectType === 'starfield' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(10, 15, 13, 0.1)'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    const deltaTime = 0.016 // Assuming 60 FPS
    
    // Update and draw particles
    particlesRef.current = particlesRef.current.filter(particle => {
      updateParticle(particle, deltaTime)
      
      if (particle.life > 0 || ['starfield', 'fountain', 'smoke'].includes(particle.type!)) {
        drawParticle(ctx, particle)
        return true
      }
      return false
    })
    
    // Add new particles for certain effects
    if (effectType === 'fireworks' && Math.random() < 0.02) {
      const x = Math.random() * canvas.width
      const y = canvas.height * 0.8
      for (let i = 0; i < 50; i++) {
        particlesRef.current.push(createParticle(x, y, effectType))
      }
    } else if (effectType === 'confetti' && particlesRef.current.length < particleCount) {
      for (let i = 0; i < 2; i++) {
        particlesRef.current.push(createParticle(Math.random() * canvas.width, 0, effectType))
      }
    }
    
    animationRef.current = requestAnimationFrame(animate)
  }

  const initializeParticles = () => {
    particlesRef.current = []
    
    if (!canvasRef.current) return
    
    const canvas = canvasRef.current
    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    
    for (let i = 0; i < particleCount; i++) {
      if (effectType === 'starfield') {
        particlesRef.current.push(createParticle(0, 0, effectType))
      } else if (effectType === 'fountain') {
        particlesRef.current.push(createParticle(centerX, canvas.height - 50, effectType))
      } else if (effectType === 'smoke') {
        particlesRef.current.push(createParticle(centerX, centerY, effectType))
      }
    }
  }

  useEffect(() => {
    // Initialize canvas size only once on mount
    if (canvasRef.current && !canvasInitializedRef.current) {
      const width = canvasRef.current.offsetWidth
      const height = canvasRef.current.offsetHeight
      if (width > 0 && height > 0) {
        canvasRef.current.width = width
        canvasRef.current.height = height
        canvasInitializedRef.current = true
      }
    }

    const handleResize = () => {
      if (canvasRef.current) {
        // Get new dimensions
        const newWidth = canvasRef.current.offsetWidth
        const newHeight = canvasRef.current.offsetHeight
        
        // Only proceed if we have valid dimensions (not 0)
        if (newWidth > 0 && newHeight > 0) {
          // Only resize if dimensions actually changed
          if (canvasRef.current.width !== newWidth || canvasRef.current.height !== newHeight) {
            // Store current canvas content
            const imageData = canvasRef.current.getContext('2d')?.getImageData(
              0, 0, canvasRef.current.width, canvasRef.current.height
            )
            
            canvasRef.current.width = newWidth
            canvasRef.current.height = newHeight
            
            // Restore canvas content if it existed
            if (imageData && canvasRef.current.width > 0 && canvasRef.current.height > 0) {
              canvasRef.current.getContext('2d')?.putImageData(imageData, 0, 0)
            }
          }
        }
      }
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect()
        mouseRef.current = {
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        }
      }
    }

    window.addEventListener('resize', handleResize)
    window.addEventListener('mousemove', handleMouseMove)

    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('mousemove', handleMouseMove)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  useEffect(() => {
    initializeParticles()
  }, [effectType, particleCount])

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
  }, [isRunning, effectType, gravity])

  return (
    <div className="particle-systems-page">
      <h1>Particle Systems</h1>
      
      <div className="controls">
        <div className="control-group">
          <label>Effect Type</label>
          <div className="button-group">
            {(['fireworks', 'starfield', 'smoke', 'confetti', 'fountain'] as const).map(type => (
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
        
        <div className="control-group">
          <label>Particle Count: {particleCount}</label>
          <input
            type="range"
            min="10"
            max="500"
            value={particleCount}
            onChange={(e) => setParticleCount(Number(e.target.value))}
          />
        </div>
        
        <div className="control-group">
          <label>Gravity: {gravity.toFixed(2)}</label>
          <input
            type="range"
            min="0"
            max="0.5"
            step="0.01"
            value={gravity}
            onChange={(e) => setGravity(Number(e.target.value))}
          />
        </div>
        
        <button
          className={`play-button ${isRunning ? 'pause' : 'play'}`}
          onClick={() => setIsRunning(!isRunning)}
        >
          {isRunning ? 'Pause' : 'Play'}
        </button>
      </div>
      
      <canvas
        ref={canvasRef}
        className="particle-canvas"
        width={800}
        height={600}
      />
      
      <div className="info-panel">
        <h3>Particle System Techniques</h3>
        <ul>
          <li><strong>Particle Pooling:</strong> Reuse particles to improve performance</li>
          <li><strong>Force Accumulation:</strong> Apply multiple forces (gravity, wind, etc.)</li>
          <li><strong>Particle States:</strong> Birth, life, and death cycles</li>
          <li><strong>Emitters:</strong> Control particle spawn points and rates</li>
          <li><strong>Trail Effects:</strong> Use partial canvas clearing for motion blur</li>
        </ul>
      </div>
    </div>
  )
}

export default ParticleSystemsPage