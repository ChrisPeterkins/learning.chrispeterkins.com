import { useEffect, useRef, useState } from 'react'

interface NoiseConfig {
  width: number
  height: number
  scale: number
  octaves: number
  persistence: number
  lacunarity: number
  noiseType: 'perlin' | 'simplex' | 'worley' | 'ridged'
  seed: number
  animated: boolean
  time: number
}

function NoiseFieldsPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()
  const [config, setConfig] = useState<NoiseConfig>({
    width: 600,
    height: 400,
    scale: 0.01,
    octaves: 4,
    persistence: 0.5,
    lacunarity: 2,
    noiseType: 'perlin',
    seed: Date.now(),
    animated: false,
    time: 0
  })
  
  const [stats, setStats] = useState({
    minValue: 0,
    maxValue: 1,
    avgValue: 0.5,
    generationTime: 0
  })

  // Simple pseudorandom function
  const pseudoRandom = (seed: number) => {
    const x = Math.sin(seed) * 10000
    return x - Math.floor(x)
  }

  // Interpolation function
  const lerp = (a: number, b: number, t: number) => a + (b - a) * t
  const smoothstep = (t: number) => t * t * (3 - 2 * t)

  // Simple Perlin-like noise
  const generatePerlinNoise = (x: number, y: number, seed: number, time: number = 0): number => {
    const X = Math.floor(x)
    const Y = Math.floor(y)
    const fx = x - X
    const fy = y - Y
    
    const a = pseudoRandom(X + Y * 57 + seed + time * 0.01)
    const b = pseudoRandom(X + 1 + Y * 57 + seed + time * 0.01)
    const c = pseudoRandom(X + (Y + 1) * 57 + seed + time * 0.01)
    const d = pseudoRandom(X + 1 + (Y + 1) * 57 + seed + time * 0.01)
    
    const i1 = lerp(a, b, smoothstep(fx))
    const i2 = lerp(c, d, smoothstep(fx))
    
    return lerp(i1, i2, smoothstep(fy))
  }

  // Worley/Voronoi noise
  const generateWorleyNoise = (x: number, y: number, seed: number): number => {
    const cellSize = 50
    const cellX = Math.floor(x / cellSize)
    const cellY = Math.floor(y / cellSize)
    
    let minDist = Infinity
    
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        const neighborX = cellX + dx
        const neighborY = cellY + dy
        
        const pointX = neighborX * cellSize + pseudoRandom(neighborX + neighborY * 57 + seed) * cellSize
        const pointY = neighborY * cellSize + pseudoRandom(neighborX * 2 + neighborY * 57 + seed) * cellSize
        
        const dist = Math.sqrt((x - pointX) ** 2 + (y - pointY) ** 2)
        minDist = Math.min(minDist, dist)
      }
    }
    
    return Math.min(1, minDist / cellSize)
  }

  // Fractal Brownian Motion
  const fbm = (x: number, y: number, config: NoiseConfig, time: number = 0): number => {
    let value = 0
    let frequency = config.scale
    let amplitude = 1
    let maxValue = 0
    
    for (let i = 0; i < config.octaves; i++) {
      const noiseValue = config.noiseType === 'worley' 
        ? generateWorleyNoise(x * frequency, y * frequency, config.seed)
        : generatePerlinNoise(x * frequency, y * frequency, config.seed, time)
      
      value += noiseValue * amplitude
      maxValue += amplitude
      
      amplitude *= config.persistence
      frequency *= config.lacunarity
    }
    
    let result = value / maxValue
    
    // Apply different transformations based on noise type
    switch (config.noiseType) {
      case 'ridged':
        result = 1 - Math.abs(result * 2 - 1)
        break
      case 'simplex':
        result = (result + 1) / 2 // Simulate simplex characteristics
        break
    }
    
    return Math.max(0, Math.min(1, result))
  }

  const generateNoise = (time: number = 0) => {
    if (!canvasRef.current) return
    
    const startTime = performance.now()
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')!
    
    const imageData = ctx.createImageData(config.width, config.height)
    let minValue = Infinity
    let maxValue = -Infinity
    let sum = 0
    let count = 0
    
    for (let y = 0; y < config.height; y++) {
      for (let x = 0; x < config.width; x++) {
        const noiseValue = fbm(x, y, config, time)
        
        minValue = Math.min(minValue, noiseValue)
        maxValue = Math.max(maxValue, noiseValue)
        sum += noiseValue
        count++
        
        const gray = Math.floor(noiseValue * 255)
        const idx = (y * config.width + x) * 4
        
        // Color based on noise type
        if (config.noiseType === 'worley') {
          imageData.data[idx] = gray * 0.5 + 50     // Red tint
          imageData.data[idx + 1] = gray * 0.3 + 30 // Green
          imageData.data[idx + 2] = gray           // Blue
        } else {
          imageData.data[idx] = gray
          imageData.data[idx + 1] = gray
          imageData.data[idx + 2] = gray
        }
        imageData.data[idx + 3] = 255 // Alpha
      }
    }
    
    ctx.putImageData(imageData, 0, 0)
    
    const endTime = performance.now()
    setStats({
      minValue: Math.round(minValue * 1000) / 1000,
      maxValue: Math.round(maxValue * 1000) / 1000,
      avgValue: Math.round((sum / count) * 1000) / 1000,
      generationTime: Math.round(endTime - startTime)
    })
  }

  const animate = (timestamp: number) => {
    if (config.animated) {
      const time = timestamp * 0.001
      generateNoise(time)
      animationRef.current = requestAnimationFrame(animate)
    }
  }

  useEffect(() => {
    if (config.animated) {
      animationRef.current = requestAnimationFrame(animate)
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      generateNoise()
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [config])

  return (
    <div className="page">
      <h2>Noise Fields</h2>
      <p className="page-description">
        Explore various noise algorithms for natural-looking randomness and organic patterns.
        Compare different noise types and see how parameters affect the generated patterns.
      </p>

      <div className="controls">
        <div className="control-group">
          <label>Noise Type</label>
          <select 
            value={config.noiseType} 
            onChange={(e) => setConfig({ ...config, noiseType: e.target.value as any })}
          >
            <option value="perlin">Perlin Noise</option>
            <option value="simplex">Simplex-like</option>
            <option value="worley">Worley/Voronoi</option>
            <option value="ridged">Ridged Noise</option>
          </select>
        </div>

        <div className="control-group">
          <label>Scale: {config.scale.toFixed(3)}</label>
          <input
            type="range"
            min="0.001"
            max="0.1"
            step="0.001"
            value={config.scale}
            onChange={(e) => setConfig({ ...config, scale: parseFloat(e.target.value) })}
          />
        </div>

        <div className="control-group">
          <label>Octaves: {config.octaves}</label>
          <input
            type="range"
            min="1"
            max="8"
            value={config.octaves}
            onChange={(e) => setConfig({ ...config, octaves: parseInt(e.target.value) })}
          />
        </div>

        <div className="control-group">
          <label>Persistence: {config.persistence.toFixed(2)}</label>
          <input
            type="range"
            min="0.1"
            max="1"
            step="0.05"
            value={config.persistence}
            onChange={(e) => setConfig({ ...config, persistence: parseFloat(e.target.value) })}
          />
        </div>

        <div className="control-group">
          <label>Lacunarity: {config.lacunarity.toFixed(1)}</label>
          <input
            type="range"
            min="1"
            max="4"
            step="0.1"
            value={config.lacunarity}
            onChange={(e) => setConfig({ ...config, lacunarity: parseFloat(e.target.value) })}
          />
        </div>

        <div className="control-group">
          <label>
            <input
              type="checkbox"
              checked={config.animated}
              onChange={(e) => setConfig({ ...config, animated: e.target.checked })}
            />
            {' '}Animate
          </label>
        </div>

        <button 
          className="generate-button" 
          onClick={() => setConfig({ ...config, seed: Date.now() })}
        >
          New Seed
        </button>
      </div>

      <div className="canvas-container">
        <canvas 
          ref={canvasRef} 
          width={config.width} 
          height={config.height}
        />
        <div className="canvas-info">
          {config.width}×{config.height}
        </div>
      </div>

      <div className="stats-panel">
        <div className="stat-item">
          <span className="stat-label">Min Value</span>
          <span className="stat-value">{stats.minValue}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Max Value</span>
          <span className="stat-value">{stats.maxValue}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Average</span>
          <span className="stat-value">{stats.avgValue}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Generation Time</span>
          <span className="stat-value">{stats.generationTime}ms</span>
        </div>
      </div>

      <div className="info-panel">
        <h3>Noise Types</h3>
        <ul>
          <li><strong>Perlin Noise:</strong> Classic gradient noise with smooth, organic patterns</li>
          <li><strong>Simplex-like:</strong> Similar to Perlin but with different characteristics</li>
          <li><strong>Worley/Voronoi:</strong> Cell-based noise creating cellular patterns</li>
          <li><strong>Ridged Noise:</strong> Sharp ridges created by inverting absolute noise values</li>
        </ul>

        <h3 style={{ marginTop: '2rem' }}>Parameters</h3>
        <ul>
          <li><strong>Scale:</strong> Controls the "zoom" level of the noise pattern</li>
          <li><strong>Octaves:</strong> Number of noise layers combined together</li>
          <li><strong>Persistence:</strong> How much each octave contributes to the final result</li>
          <li><strong>Lacunarity:</strong> Frequency multiplier between octaves</li>
        </ul>
      </div>
    </div>
  )
}

export default NoiseFieldsPage