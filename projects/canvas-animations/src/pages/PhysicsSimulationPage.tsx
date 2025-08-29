import { useEffect, useRef, useState } from 'react'
import './PhysicsSimulationPage.css'

interface PhysicsObject {
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  mass: number
  color: string
  trail?: { x: number; y: number }[]
  pinned?: boolean
  springTarget?: PhysicsObject
}

function PhysicsSimulationPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number | null>(null)
  const objectsRef = useRef<PhysicsObject[]>([])
  const draggedRef = useRef<PhysicsObject | null>(null)
  const mouseRef = useRef({ x: 0, y: 0, down: false })
  
  const [simulationType, setSimulationType] = useState<'gravity' | 'collision' | 'pendulum' | 'springs' | 'orbit'>('gravity')
  const [isRunning, setIsRunning] = useState(true)
  const [gravityStrength, setGravityStrength] = useState(0.5)
  const [damping, setDamping] = useState(0.99)
  const [showTrails, setShowTrails] = useState(false)

  const initializeSimulation = () => {
    objectsRef.current = []
    
    if (!canvasRef.current) return
    const canvas = canvasRef.current
    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    
    switch (simulationType) {
      case 'gravity':
        // Create falling balls
        for (let i = 0; i < 10; i++) {
          objectsRef.current.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height / 2,
            vx: (Math.random() - 0.5) * 2,
            vy: 0,
            radius: Math.random() * 20 + 10,
            mass: 1,
            color: `hsl(${Math.random() * 360}, 70%, 50%)`,
            trail: []
          })
        }
        break
      
      case 'collision':
        // Create bouncing balls
        for (let i = 0; i < 15; i++) {
          objectsRef.current.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 5,
            vy: (Math.random() - 0.5) * 5,
            radius: Math.random() * 15 + 10,
            mass: 1,
            color: `hsl(${Math.random() * 360}, 70%, 50%)`,
            trail: []
          })
        }
        break
      
      case 'pendulum':
        // Create double pendulum
        const anchor = {
          x: centerX,
          y: 100,
          vx: 0,
          vy: 0,
          radius: 10,
          mass: 0,
          color: '#666',
          pinned: true
        }
        
        const bob1 = {
          x: centerX + 100,
          y: 200,
          vx: 0,
          vy: 0,
          radius: 20,
          mass: 1,
          color: '#4ade80',
          springTarget: anchor,
          trail: []
        }
        
        const bob2 = {
          x: centerX + 150,
          y: 320,
          vx: 0,
          vy: 0,
          radius: 15,
          mass: 0.8,
          color: '#60a5fa',
          springTarget: bob1,
          trail: []
        }
        
        objectsRef.current = [anchor, bob1, bob2]
        break
      
      case 'springs':
        // Create spring mesh
        const rows = 5
        const cols = 7
        const spacing = 60
        const startX = centerX - (cols - 1) * spacing / 2
        const startY = centerY - (rows - 1) * spacing / 2
        
        for (let i = 0; i < rows; i++) {
          for (let j = 0; j < cols; j++) {
            const obj: PhysicsObject = {
              x: startX + j * spacing,
              y: startY + i * spacing,
              vx: 0,
              vy: 0,
              radius: 8,
              mass: 1,
              color: '#4ade80',
              pinned: (i === 0 && (j === 0 || j === cols - 1))
            }
            objectsRef.current.push(obj)
          }
        }
        break
      
      case 'orbit':
        // Central body (sun)
        const sun = {
          x: centerX,
          y: centerY,
          vx: 0,
          vy: 0,
          radius: 30,
          mass: 100,
          color: '#fbbf24',
          pinned: true
        }
        
        // Orbiting planets
        for (let i = 0; i < 4; i++) {
          const distance = 80 + i * 60
          const angle = (i * Math.PI) / 2
          const speed = Math.sqrt(50 / distance) * 3
          
          objectsRef.current.push({
            x: centerX + Math.cos(angle) * distance,
            y: centerY + Math.sin(angle) * distance,
            vx: -Math.sin(angle) * speed,
            vy: Math.cos(angle) * speed,
            radius: 8 + i * 2,
            mass: 1,
            color: `hsl(${200 + i * 40}, 70%, 50%)`,
            trail: []
          })
        }
        
        objectsRef.current.push(sun)
        break
    }
  }

  const applyForces = (obj: PhysicsObject, deltaTime: number) => {
    if (obj.pinned) return
    
    // Gravity
    if (simulationType === 'gravity' || simulationType === 'pendulum') {
      obj.vy += gravityStrength * deltaTime * 60
    }
    
    // Spring forces
    if (obj.springTarget) {
      const dx = obj.springTarget.x - obj.x
      const dy = obj.springTarget.y - obj.y
      const distance = Math.sqrt(dx * dx + dy * dy)
      const springLength = 100
      const springK = 0.1
      
      if (distance > 0) {
        const force = (distance - springLength) * springK
        obj.vx += (dx / distance) * force * deltaTime
        obj.vy += (dy / distance) * force * deltaTime
      }
    }
    
    // Orbital gravity
    if (simulationType === 'orbit') {
      objectsRef.current.forEach(other => {
        if (other !== obj && other.mass > 10) { // Only sun has mass > 10
          const dx = other.x - obj.x
          const dy = other.y - obj.y
          const distSq = dx * dx + dy * dy
          const distance = Math.sqrt(distSq)
          
          if (distance > 0) {
            const force = (gravityStrength * other.mass) / distSq
            obj.vx += (dx / distance) * force * deltaTime
            obj.vy += (dy / distance) * force * deltaTime
          }
        }
      })
    }
    
    // Spring mesh connections
    if (simulationType === 'springs') {
      const cols = 7
      const index = objectsRef.current.indexOf(obj)
      const neighbors = [
        index - cols, // top
        index + cols, // bottom
        index - 1,    // left
        index + 1     // right
      ]
      
      neighbors.forEach(nIndex => {
        if (nIndex >= 0 && nIndex < objectsRef.current.length) {
          const neighbor = objectsRef.current[nIndex]
          const dx = neighbor.x - obj.x
          const dy = neighbor.y - obj.y
          const distance = Math.sqrt(dx * dx + dy * dy)
          const restLength = 60
          
          if (distance > 0) {
            const force = (distance - restLength) * 0.1
            obj.vx += (dx / distance) * force * deltaTime
            obj.vy += (dy / distance) * force * deltaTime
          }
        }
      })
    }
  }

  const checkCollisions = () => {
    if (simulationType !== 'collision') return
    
    for (let i = 0; i < objectsRef.current.length; i++) {
      for (let j = i + 1; j < objectsRef.current.length; j++) {
        const obj1 = objectsRef.current[i]
        const obj2 = objectsRef.current[j]
        
        const dx = obj2.x - obj1.x
        const dy = obj2.y - obj1.y
        const distance = Math.sqrt(dx * dx + dy * dy)
        const minDistance = obj1.radius + obj2.radius
        
        if (distance < minDistance) {
          // Collision detected
          const nx = dx / distance
          const ny = dy / distance
          
          // Separate objects
          const overlap = minDistance - distance
          obj1.x -= nx * overlap * 0.5
          obj1.y -= ny * overlap * 0.5
          obj2.x += nx * overlap * 0.5
          obj2.y += ny * overlap * 0.5
          
          // Calculate relative velocity
          const dvx = obj2.vx - obj1.vx
          const dvy = obj2.vy - obj1.vy
          const dotProduct = dvx * nx + dvy * ny
          
          // Don't resolve if velocities are separating
          if (dotProduct > 0) {
            const impulse = 2 * dotProduct / (obj1.mass + obj2.mass)
            obj1.vx += impulse * obj2.mass * nx
            obj1.vy += impulse * obj2.mass * ny
            obj2.vx -= impulse * obj1.mass * nx
            obj2.vy -= impulse * obj1.mass * ny
          }
        }
      }
    }
  }

  const updateObject = (obj: PhysicsObject, deltaTime: number) => {
    if (obj.pinned) return
    
    applyForces(obj, deltaTime)
    
    // Apply damping
    obj.vx *= damping
    obj.vy *= damping
    
    // Update position
    obj.x += obj.vx * deltaTime * 60
    obj.y += obj.vy * deltaTime * 60
    
    // Boundary collision
    const canvas = canvasRef.current!
    if (obj.x - obj.radius < 0 || obj.x + obj.radius > canvas.width) {
      obj.vx *= -0.8
      obj.x = Math.max(obj.radius, Math.min(canvas.width - obj.radius, obj.x))
    }
    if (obj.y - obj.radius < 0 || obj.y + obj.radius > canvas.height) {
      obj.vy *= -0.8
      obj.y = Math.max(obj.radius, Math.min(canvas.height - obj.radius, obj.y))
    }
    
    // Update trail
    if (showTrails && obj.trail) {
      obj.trail.push({ x: obj.x, y: obj.y })
      if (obj.trail.length > 50) {
        obj.trail.shift()
      }
    } else if (obj.trail) {
      obj.trail = []
    }
  }

  const drawObject = (ctx: CanvasRenderingContext2D, obj: PhysicsObject) => {
    // Draw trail
    if (obj.trail && obj.trail.length > 1) {
      ctx.strokeStyle = obj.color + '40'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(obj.trail[0].x, obj.trail[0].y)
      for (let i = 1; i < obj.trail.length; i++) {
        ctx.lineTo(obj.trail[i].x, obj.trail[i].y)
      }
      ctx.stroke()
    }
    
    // Draw spring connections
    if (obj.springTarget) {
      ctx.strokeStyle = '#666'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(obj.x, obj.y)
      ctx.lineTo(obj.springTarget.x, obj.springTarget.y)
      ctx.stroke()
    }
    
    // Draw object
    ctx.fillStyle = obj.color
    ctx.beginPath()
    ctx.arc(obj.x, obj.y, obj.radius, 0, Math.PI * 2)
    ctx.fill()
    
    if (obj.pinned) {
      ctx.strokeStyle = '#fff'
      ctx.lineWidth = 2
      ctx.stroke()
    }
  }

  const animate = () => {
    if (!canvasRef.current || !isRunning) return
    
    const ctx = canvasRef.current.getContext('2d')!
    const canvas = canvasRef.current
    
    // Clear canvas
    ctx.fillStyle = 'rgba(10, 15, 13, 0.2)'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    const deltaTime = 0.016
    
    // Update physics
    checkCollisions()
    objectsRef.current.forEach(obj => updateObject(obj, deltaTime))
    
    // Draw objects
    objectsRef.current.forEach(obj => drawObject(ctx, obj))
    
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
            // Don't reinitialize simulation on resize, just update canvas dimensions
          }
        }
      }
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect()
        mouseRef.current.x = e.clientX - rect.left
        mouseRef.current.y = e.clientY - rect.top
        
        if (mouseRef.current.down && draggedRef.current) {
          draggedRef.current.x = mouseRef.current.x
          draggedRef.current.y = mouseRef.current.y
          draggedRef.current.vx = 0
          draggedRef.current.vy = 0
        }
      }
    }

    const handleMouseDown = (e: MouseEvent) => {
      mouseRef.current.down = true
      
      // Find object under mouse
      const rect = canvasRef.current!.getBoundingClientRect()
      const mx = e.clientX - rect.left
      const my = e.clientY - rect.top
      
      for (const obj of objectsRef.current) {
        const dx = obj.x - mx
        const dy = obj.y - my
        if (Math.sqrt(dx * dx + dy * dy) < obj.radius) {
          draggedRef.current = obj
          break
        }
      }
    }

    const handleMouseUp = () => {
      mouseRef.current.down = false
      draggedRef.current = null
    }

    // Initialize canvas size on mount
    if (canvasRef.current) {
      canvasRef.current.width = canvasRef.current.offsetWidth
      canvasRef.current.height = canvasRef.current.offsetHeight
    }
    
    window.addEventListener('resize', handleResize)
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('mouseup', handleMouseUp)

    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mousedown', handleMouseDown)
      window.removeEventListener('mouseup', handleMouseUp)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  useEffect(() => {
    initializeSimulation()
  }, [simulationType])

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
  }, [isRunning, simulationType, gravityStrength, damping, showTrails])

  return (
    <div className="physics-simulation-page">
      <h1>Physics Simulation</h1>
      
      <div className="controls">
        <div className="control-group">
          <label>Simulation Type</label>
          <div className="button-group">
            {(['gravity', 'collision', 'pendulum', 'springs', 'orbit'] as const).map(type => (
              <button
                key={type}
                className={simulationType === type ? 'active' : ''}
                onClick={() => setSimulationType(type)}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        </div>
        
        <div className="control-group">
          <label>Gravity: {gravityStrength.toFixed(2)}</label>
          <input
            type="range"
            min="0"
            max="2"
            step="0.1"
            value={gravityStrength}
            onChange={(e) => setGravityStrength(Number(e.target.value))}
          />
        </div>
        
        <div className="control-group">
          <label>Damping: {damping.toFixed(2)}</label>
          <input
            type="range"
            min="0.9"
            max="1"
            step="0.001"
            value={damping}
            onChange={(e) => setDamping(Number(e.target.value))}
          />
        </div>
        
        <div className="control-group">
          <label>
            <input
              type="checkbox"
              checked={showTrails}
              onChange={(e) => setShowTrails(e.target.checked)}
            />
            Show Trails
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
          onClick={initializeSimulation}
        >
          Reset
        </button>
      </div>
      
      <canvas
        ref={canvasRef}
        className="physics-canvas"
        width={800}
        height={600}
      />
      
      <div className="info-panel">
        <h3>Physics Concepts</h3>
        <ul>
          <li><strong>Newton's Laws:</strong> Force = mass × acceleration</li>
          <li><strong>Collision Detection:</strong> Circle-circle intersection tests</li>
          <li><strong>Conservation of Momentum:</strong> Elastic collision resolution</li>
          <li><strong>Spring Forces:</strong> Hooke's Law (F = -kx)</li>
          <li><strong>Orbital Mechanics:</strong> Gravitational attraction between bodies</li>
          <li>Drag objects with your mouse to interact!</li>
        </ul>
      </div>
    </div>
  )
}

export default PhysicsSimulationPage