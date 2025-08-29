import { useEffect, useRef, useState } from 'react'
import './FractalsPage.css'

function FractalsPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [fractalType, setFractalType] = useState<'mandelbrot' | 'julia' | 'sierpinski' | 'dragon'>('mandelbrot')
  const [zoom, setZoom] = useState(1)
  const [iterations, setIterations] = useState(50)
  const [isRendering, setIsRendering] = useState(false)

  const drawMandelbrot = (ctx: CanvasRenderingContext2D) => {
    const width = ctx.canvas.width
    const height = ctx.canvas.height
    const imageData = ctx.createImageData(width, height)
    
    for (let px = 0; px < width; px++) {
      for (let py = 0; py < height; py++) {
        const x0 = (px - width / 2) / (0.5 * zoom * width) - 0.5
        const y0 = (py - height / 2) / (0.5 * zoom * height)
        
        let x = 0
        let y = 0
        let i = 0
        
        while (x * x + y * y <= 4 && i < iterations) {
          const xTemp = x * x - y * y + x0
          y = 2 * x * y + y0
          x = xTemp
          i++
        }
        
        const idx = (py * width + px) * 4
        const color = i === iterations ? 0 : (i / iterations) * 255
        const hue = (color / 255) * 360
        
        // Convert HSL to RGB
        const c = 0.7
        const h = hue / 60
        const x1 = c * (1 - Math.abs(h % 2 - 1))
        
        let r = 0, g = 0, b = 0
        if (h < 1) { r = c; g = x1; }
        else if (h < 2) { r = x1; g = c; }
        else if (h < 3) { g = c; b = x1; }
        else if (h < 4) { g = x1; b = c; }
        else if (h < 5) { r = x1; b = c; }
        else { r = c; b = x1; }
        
        imageData.data[idx] = r * 255
        imageData.data[idx + 1] = g * 255
        imageData.data[idx + 2] = b * 255
        imageData.data[idx + 3] = 255
      }
    }
    
    ctx.putImageData(imageData, 0, 0)
  }

  const drawSierpinski = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, depth: number) => {
    if (depth === 0) {
      ctx.fillStyle = `hsl(${depth * 30}, 70%, 50%)`
      ctx.fillRect(x, y, size, size)
      return
    }
    
    const newSize = size / 3
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (!(i === 1 && j === 1)) {
          drawSierpinski(ctx, x + i * newSize, y + j * newSize, newSize, depth - 1)
        }
      }
    }
  }

  const renderFractal = () => {
    if (!canvasRef.current) return
    
    setIsRendering(true)
    const ctx = canvasRef.current.getContext('2d')!
    const canvas = canvasRef.current
    
    ctx.fillStyle = '#0a0f0d'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    switch (fractalType) {
      case 'mandelbrot':
        drawMandelbrot(ctx)
        break
      case 'sierpinski':
        drawSierpinski(ctx, 0, 0, Math.min(canvas.width, canvas.height), Math.min(iterations / 10, 7))
        break
    }
    
    setIsRendering(false)
  }

  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        const newWidth = canvasRef.current.offsetWidth
        const newHeight = canvasRef.current.offsetHeight
        
        // Only proceed if we have valid dimensions (not 0)
        if (newWidth > 0 && newHeight > 0) {
          // Only resize and re-render if dimensions actually changed
          if (canvasRef.current.width !== newWidth || canvasRef.current.height !== newHeight) {
            canvasRef.current.width = newWidth
            canvasRef.current.height = newHeight
            renderFractal() // Fractals need re-rendering on resize
          }
        }
      }
    }

    // Initialize canvas size on mount
    if (canvasRef.current) {
      canvasRef.current.width = canvasRef.current.offsetWidth
      canvasRef.current.height = canvasRef.current.offsetHeight
      renderFractal()
    }
    
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  useEffect(() => {
    renderFractal()
  }, [fractalType, zoom, iterations])

  return (
    <div className="fractals-page">
      <h1>Fractals & Mathematical Art</h1>
      
      <div className="controls">
        <div className="control-group">
          <label>Fractal Type</label>
          <div className="button-group">
            {(['mandelbrot', 'sierpinski'] as const).map(type => (
              <button
                key={type}
                className={fractalType === type ? 'active' : ''}
                onClick={() => setFractalType(type)}
                disabled={isRendering}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        </div>
        
        <div className="control-group">
          <label>Zoom: {zoom.toFixed(1)}x</label>
          <input
            type="range"
            min="0.5"
            max="10"
            step="0.5"
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            disabled={isRendering}
          />
        </div>
        
        <div className="control-group">
          <label>Iterations: {iterations}</label>
          <input
            type="range"
            min="10"
            max="200"
            step="10"
            value={iterations}
            onChange={(e) => setIterations(Number(e.target.value))}
            disabled={isRendering}
          />
        </div>
        
        {isRendering && <span className="rendering">Rendering...</span>}
      </div>
      
      <canvas
        ref={canvasRef}
        className="fractal-canvas"
        width={800}
        height={600}
      />
      
      <div className="info-panel">
        <h3>Fractal Mathematics</h3>
        <ul>
          <li><strong>Mandelbrot Set:</strong> z → z² + c iteration in complex plane</li>
          <li><strong>Sierpinski Carpet:</strong> Recursive subdivision patterns</li>
          <li><strong>Self-Similarity:</strong> Patterns repeat at different scales</li>
          <li><strong>Infinite Complexity:</strong> Zoom in to discover endless detail</li>
        </ul>
      </div>
    </div>
  )
}

export default FractalsPage