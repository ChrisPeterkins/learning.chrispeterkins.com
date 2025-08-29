import { useEffect, useRef, useState } from 'react'
import './CreativeCodingPage.css'

function CreativeCodingPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number | null>(null)
  const timeRef = useRef(0)
  
  const [pattern, setPattern] = useState<'spirograph' | 'waves' | 'tree' | 'voronoi'>('spirograph')
  const [isRunning, setIsRunning] = useState(true)
  const [complexity, setComplexity] = useState(5)
  const [colorMode, setColorMode] = useState<'rainbow' | 'monochrome' | 'gradient'>('rainbow')

  const drawSpirograph = (ctx: CanvasRenderingContext2D, time: number) => {
    const centerX = ctx.canvas.width / 2
    const centerY = ctx.canvas.height / 2
    const R = 100
    const r = 30 * complexity
    const d = 50
    
    ctx.beginPath()
    for (let t = 0; t < Math.PI * 20; t += 0.01) {
      const x = centerX + (R - r) * Math.cos(t + time) + d * Math.cos(((R - r) / r) * (t + time))
      const y = centerY + (R - r) * Math.sin(t + time) + d * Math.sin(((R - r) / r) * (t + time))
      
      if (t === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    }
    
    const hue = colorMode === 'rainbow' ? (time * 50) % 360 : 120
    ctx.strokeStyle = colorMode === 'monochrome' ? '#4ade80' : `hsl(${hue}, 70%, 50%)`
    ctx.lineWidth = 1
    ctx.stroke()
  }

  const drawWaves = (ctx: CanvasRenderingContext2D, time: number) => {
    const width = ctx.canvas.width
    const height = ctx.canvas.height
    
    for (let y = 0; y < height; y += 10) {
      ctx.beginPath()
      for (let x = 0; x < width; x++) {
        const wave1 = Math.sin((x * 0.01) + time + (y * 0.01)) * 20
        const wave2 = Math.sin((x * 0.02) - time * 0.5 + (y * 0.005)) * 15
        const wave3 = Math.sin((x * 0.005) + time * 2) * 10
        const yPos = y + wave1 + wave2 + wave3
        
        if (x === 0) ctx.moveTo(x, yPos)
        else ctx.lineTo(x, yPos)
      }
      
      const hue = colorMode === 'rainbow' ? (y + time * 100) % 360 : 200
      const alpha = 0.5 - (y / height) * 0.5
      ctx.strokeStyle = colorMode === 'gradient' 
        ? `hsla(${200 + y / 3}, 70%, 50%, ${alpha})`
        : `hsla(${hue}, 70%, 50%, ${alpha})`
      ctx.stroke()
    }
  }

  const drawTree = (ctx: CanvasRenderingContext2D, x: number, y: number, angle: number, depth: number, time: number) => {
    if (depth === 0) return
    
    const length = depth * 10 * (1 + Math.sin(time + depth) * 0.1)
    const endX = x + Math.cos(angle) * length
    const endY = y + Math.sin(angle) * length
    
    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.lineTo(endX, endY)
    
    const hue = colorMode === 'rainbow' ? (depth * 30 + time * 50) % 360 : 120
    ctx.strokeStyle = colorMode === 'monochrome' ? '#4ade80' : `hsl(${hue}, 70%, ${50 + depth * 5}%)`
    ctx.lineWidth = depth / 2
    ctx.stroke()
    
    const angleVariation = Math.PI / (4 + Math.sin(time) * 2)
    drawTree(ctx, endX, endY, angle - angleVariation, depth - 1, time)
    drawTree(ctx, endX, endY, angle + angleVariation, depth - 1, time)
    
    if (Math.random() < 0.1) {
      drawTree(ctx, endX, endY, angle, depth - 2, time)
    }
  }

  const animate = () => {
    if (!canvasRef.current || !isRunning) return
    
    const ctx = canvasRef.current.getContext('2d')!
    const canvas = canvasRef.current
    
    ctx.fillStyle = 'rgba(10, 15, 13, 0.05)'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    timeRef.current += 0.01
    
    switch (pattern) {
      case 'spirograph':
        drawSpirograph(ctx, timeRef.current)
        break
      case 'waves':
        drawWaves(ctx, timeRef.current)
        break
      case 'tree':
        ctx.fillStyle = 'rgba(10, 15, 13, 1)'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        drawTree(ctx, canvas.width / 2, canvas.height, -Math.PI / 2, complexity + 5, timeRef.current)
        break
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
            // Don't reset state on resize
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
  }, [isRunning, pattern, complexity, colorMode])

  return (
    <div className="creative-coding-page">
      <h1>Creative Coding</h1>
      
      <div className="controls">
        <div className="control-group">
          <label>Pattern</label>
          <div className="button-group">
            {(['spirograph', 'waves', 'tree'] as const).map(p => (
              <button
                key={p}
                className={pattern === p ? 'active' : ''}
                onClick={() => setPattern(p)}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>
        </div>
        
        <div className="control-group">
          <label>Complexity: {complexity}</label>
          <input
            type="range"
            min="1"
            max="10"
            value={complexity}
            onChange={(e) => setComplexity(Number(e.target.value))}
          />
        </div>
        
        <div className="control-group">
          <label>Color Mode</label>
          <div className="button-group">
            {(['rainbow', 'monochrome', 'gradient'] as const).map(mode => (
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
        
        <button
          className={`play-button ${isRunning ? 'pause' : 'play'}`}
          onClick={() => setIsRunning(!isRunning)}
        >
          {isRunning ? 'Pause' : 'Play'}
        </button>
      </div>
      
      <canvas
        ref={canvasRef}
        className="creative-canvas"
        width={800}
        height={600}
      />
      
      <div className="info-panel">
        <h3>Creative Coding Techniques</h3>
        <ul>
          <li><strong>Spirograph:</strong> Mathematical curves from rotating circles</li>
          <li><strong>Wave Interference:</strong> Combining sine waves for organic patterns</li>
          <li><strong>Recursive Trees:</strong> Fractal geometry through recursion</li>
          <li><strong>Parametric Equations:</strong> Time-based mathematical art</li>
        </ul>
      </div>
    </div>
  )
}

export default CreativeCodingPage