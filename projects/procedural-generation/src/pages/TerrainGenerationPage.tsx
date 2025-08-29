import { useEffect, useRef, useState } from 'react'
import { generateHeightMap, getTerrainColor, applyErosion, TerrainConfig } from '../generators/terrain'

function TerrainGenerationPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [config, setConfig] = useState<TerrainConfig>({
    width: 400,
    height: 400,
    scale: 100,
    octaves: 4,
    persistence: 0.5,
    lacunarity: 2,
    seed: 'terrain-' + Date.now(),
    exponent: 1.2
  })
  const [isGenerating, setIsGenerating] = useState(false)
  const [useErosion, setUseErosion] = useState(false)
  const [stats, setStats] = useState({
    waterPercent: 0,
    landPercent: 0,
    mountainPercent: 0,
    generateTime: 0
  })

  const generateTerrain = () => {
    if (!canvasRef.current) return
    
    setIsGenerating(true)
    const startTime = performance.now()
    
    // Generate height map
    let heightMap = generateHeightMap(config)
    
    // Apply erosion if enabled
    if (useErosion) {
      heightMap = applyErosion(heightMap, 3)
    }
    
    // Draw to canvas
    const ctx = canvasRef.current.getContext('2d')!
    const imageData = ctx.createImageData(config.width, config.height)
    
    let waterCount = 0
    let mountainCount = 0
    
    for (let y = 0; y < config.height; y++) {
      for (let x = 0; x < config.width; x++) {
        const height = heightMap[y][x]
        const color = getTerrainColor(height)
        
        // Parse RGB values
        const matches = color.match(/\d+/g)!
        const r = parseInt(matches[0])
        const g = parseInt(matches[1])
        const b = parseInt(matches[2])
        
        // Set pixel
        const idx = (y * config.width + x) * 4
        imageData.data[idx] = r
        imageData.data[idx + 1] = g
        imageData.data[idx + 2] = b
        imageData.data[idx + 3] = 255
        
        // Count terrain types
        if (height < 0.3) waterCount++
        if (height > 0.6) mountainCount++
      }
    }
    
    ctx.putImageData(imageData, 0, 0)
    
    const endTime = performance.now()
    const totalPixels = config.width * config.height
    
    setStats({
      waterPercent: Math.round((waterCount / totalPixels) * 100),
      landPercent: Math.round(((totalPixels - waterCount) / totalPixels) * 100),
      mountainPercent: Math.round((mountainCount / totalPixels) * 100),
      generateTime: Math.round(endTime - startTime)
    })
    
    setIsGenerating(false)
  }

  useEffect(() => {
    generateTerrain()
  }, [])

  const handleGenerate = () => {
    setConfig({
      ...config,
      seed: 'terrain-' + Date.now()
    })
    generateTerrain()
  }

  return (
    <div className="page">
      <h2>Terrain Generation</h2>
      <p className="page-description">
        Generate realistic terrain using layered noise functions. Adjust parameters to create 
        different landscape types from islands to mountain ranges.
      </p>

      <div className="controls">
        <div className="control-group">
          <label>Scale: {config.scale}</label>
          <input
            type="range"
            min="20"
            max="200"
            value={config.scale}
            onChange={(e) => setConfig({ ...config, scale: parseInt(e.target.value) })}
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
          <label>Exponent: {config.exponent.toFixed(1)}</label>
          <input
            type="range"
            min="0.5"
            max="3"
            step="0.1"
            value={config.exponent}
            onChange={(e) => setConfig({ ...config, exponent: parseFloat(e.target.value) })}
          />
        </div>

        <div className="control-group">
          <label>
            <input
              type="checkbox"
              checked={useErosion}
              onChange={(e) => setUseErosion(e.target.checked)}
            />
            {' '}Apply Erosion
          </label>
        </div>

        <button 
          className="generate-button" 
          onClick={handleGenerate}
          disabled={isGenerating}
        >
          {isGenerating ? 'Generating...' : 'Generate New Terrain'}
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
          <span className="stat-label">Water</span>
          <span className="stat-value">{stats.waterPercent}%</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Land</span>
          <span className="stat-value">{stats.landPercent}%</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Mountains</span>
          <span className="stat-value">{stats.mountainPercent}%</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Generation Time</span>
          <span className="stat-value">{stats.generateTime}ms</span>
        </div>
      </div>

      <div className="info-panel">
        <h3>How It Works</h3>
        <ul>
          <li><strong>Noise Layers:</strong> Multiple octaves of Simplex noise are combined to create detail at different scales</li>
          <li><strong>Persistence:</strong> Controls how much each octave contributes to the final result</li>
          <li><strong>Lacunarity:</strong> Determines the frequency multiplier between octaves</li>
          <li><strong>Height Mapping:</strong> Values are mapped to terrain types (water, land, mountains, snow)</li>
          <li><strong>Erosion:</strong> Optional smoothing simulates natural weathering</li>
        </ul>
      </div>
    </div>
  )
}

export default TerrainGenerationPage