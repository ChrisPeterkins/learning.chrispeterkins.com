import { useEffect, useRef, useState } from 'react'

interface Plant {
  x: number
  y: number
  species: PlantSpecies
  age: number
  size: number
  health: number
}

interface PlantSpecies {
  name: string
  color: string
  minSize: number
  maxSize: number
  density: number
  preferredElevation: number
  elevationTolerance: number
  waterNeed: number
  spacing: number
}

interface VegetationConfig {
  width: number
  height: number
  plantDensity: number
  ecosystemType: 'forest' | 'grassland' | 'desert' | 'wetland'
  showElevation: boolean
  showWaterMap: boolean
  seasonalVariation: number
  growthTime: number
}

const plantSpecies: Record<string, PlantSpecies[]> = {
  forest: [
    { name: 'Pine Tree', color: '#22543d', minSize: 8, maxSize: 15, density: 0.3, preferredElevation: 0.6, elevationTolerance: 0.3, waterNeed: 0.4, spacing: 20 },
    { name: 'Oak Tree', color: '#2f855a', minSize: 10, maxSize: 18, density: 0.25, preferredElevation: 0.4, elevationTolerance: 0.4, waterNeed: 0.6, spacing: 25 },
    { name: 'Birch', color: '#68d391', minSize: 6, maxSize: 12, density: 0.2, preferredElevation: 0.3, elevationTolerance: 0.5, waterNeed: 0.7, spacing: 15 },
    { name: 'Fern', color: '#48bb78', minSize: 2, maxSize: 4, density: 0.8, preferredElevation: 0.2, elevationTolerance: 0.3, waterNeed: 0.8, spacing: 8 },
  ],
  grassland: [
    { name: 'Tall Grass', color: '#68d391', minSize: 2, maxSize: 5, density: 1.5, preferredElevation: 0.4, elevationTolerance: 0.4, waterNeed: 0.5, spacing: 3 },
    { name: 'Wildflowers', color: '#f6e05e', minSize: 1, maxSize: 3, density: 1.2, preferredElevation: 0.3, elevationTolerance: 0.5, waterNeed: 0.4, spacing: 5 },
    { name: 'Shrubs', color: '#2f855a', minSize: 3, maxSize: 6, density: 0.4, preferredElevation: 0.5, elevationTolerance: 0.4, waterNeed: 0.3, spacing: 12 },
  ],
  desert: [
    { name: 'Saguaro Cactus', color: '#2f855a', minSize: 8, maxSize: 20, density: 0.1, preferredElevation: 0.3, elevationTolerance: 0.6, waterNeed: 0.1, spacing: 40 },
    { name: 'Prickly Pear', color: '#38a169', minSize: 3, maxSize: 6, density: 0.3, preferredElevation: 0.4, elevationTolerance: 0.5, waterNeed: 0.15, spacing: 20 },
    { name: 'Desert Grass', color: '#ecc94b', minSize: 1, maxSize: 3, density: 0.6, preferredElevation: 0.2, elevationTolerance: 0.7, waterNeed: 0.2, spacing: 8 },
    { name: 'Sage Brush', color: '#9ae6b4', minSize: 2, maxSize: 4, density: 0.5, preferredElevation: 0.5, elevationTolerance: 0.4, waterNeed: 0.25, spacing: 15 },
  ],
  wetland: [
    { name: 'Cattails', color: '#2d3748', minSize: 4, maxSize: 8, density: 1.0, preferredElevation: 0.1, elevationTolerance: 0.2, waterNeed: 0.9, spacing: 10 },
    { name: 'Water Lilies', color: '#f6e05e', minSize: 2, maxSize: 4, density: 0.8, preferredElevation: 0.05, elevationTolerance: 0.1, waterNeed: 1.0, spacing: 12 },
    { name: 'Marsh Grass', color: '#48bb78', minSize: 2, maxSize: 5, density: 1.3, preferredElevation: 0.15, elevationTolerance: 0.25, waterNeed: 0.8, spacing: 5 },
    { name: 'Willow', color: '#2f855a', minSize: 6, maxSize: 12, density: 0.2, preferredElevation: 0.2, elevationTolerance: 0.3, waterNeed: 0.85, spacing: 30 },
  ]
}

function VegetationPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [config, setConfig] = useState<VegetationConfig>({
    width: 600,
    height: 400,
    plantDensity: 1.0,
    ecosystemType: 'forest',
    showElevation: false,
    showWaterMap: false,
    seasonalVariation: 1.0,
    growthTime: 0
  })
  
  const [plants, setPlants] = useState<Plant[]>([])
  const [elevationMap, setElevationMap] = useState<number[][]>([])
  const [waterMap, setWaterMap] = useState<number[][]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [stats, setStats] = useState({
    totalPlants: 0,
    speciesCount: 0,
    density: 0,
    coverage: 0,
    generationTime: 0
  })

  const generateNoise = (width: number, height: number, scale: number): number[][] => {
    const noise: number[][] = []
    
    for (let y = 0; y < height; y++) {
      noise[y] = []
      for (let x = 0; x < width; x++) {
        // Simple multi-octave noise
        let value = 0
        let frequency = scale
        let amplitude = 1
        
        for (let i = 0; i < 4; i++) {
          value += Math.sin(x * frequency) * Math.cos(y * frequency) * amplitude
          frequency *= 2
          amplitude *= 0.5
        }
        
        noise[y][x] = (value + 1) / 2 // Normalize to 0-1
      }
    }
    
    return noise
  }

  const calculateSuitability = (x: number, y: number, species: PlantSpecies, elevation: number, water: number): number => {
    // Elevation suitability
    const elevationDiff = Math.abs(elevation - species.preferredElevation)
    const elevationSuit = Math.max(0, 1 - elevationDiff / species.elevationTolerance)
    
    // Water suitability
    const waterSuit = 1 - Math.abs(water - species.waterNeed)
    
    // Combined suitability
    return Math.max(0, elevationSuit * waterSuit)
  }

  const checkSpacing = (x: number, y: number, species: PlantSpecies, existingPlants: Plant[]): boolean => {
    for (const plant of existingPlants) {
      const distance = Math.sqrt((x - plant.x) ** 2 + (y - plant.y) ** 2)
      if (distance < species.spacing) {
        return false
      }
    }
    return true
  }

  const generateVegetation = async () => {
    setIsGenerating(true)
    const startTime = performance.now()
    
    // Generate terrain maps
    const elevationNoise = generateNoise(config.width / 4, config.height / 4, 0.02)
    const waterNoise = generateNoise(config.width / 4, config.height / 4, 0.03)
    
    // Interpolate to full resolution
    const elevation: number[][] = []
    const water: number[][] = []
    
    for (let y = 0; y < config.height; y++) {
      elevation[y] = []
      water[y] = []
      for (let x = 0; x < config.width; x++) {
        const ex = Math.floor(x / 4)
        const ey = Math.floor(y / 4)
        elevation[y][x] = elevationNoise[Math.min(ey, elevationNoise.length - 1)][Math.min(ex, elevationNoise[0].length - 1)]
        water[y][x] = waterNoise[Math.min(ey, waterNoise.length - 1)][Math.min(ex, waterNoise[0].length - 1)]
      }
    }
    
    setElevationMap(elevation)
    setWaterMap(water)
    
    // Generate plants
    const newPlants: Plant[] = []
    const species = plantSpecies[config.ecosystemType]
    
    for (const spec of species) {
      const targetCount = Math.floor(config.width * config.height * spec.density * config.plantDensity / 10000)
      
      let attempts = 0
      let placed = 0
      
      while (placed < targetCount && attempts < targetCount * 10) {
        const x = Math.random() * config.width
        const y = Math.random() * config.height
        
        const px = Math.floor(x)
        const py = Math.floor(y)
        
        if (px < 0 || px >= config.width || py < 0 || py >= config.height) {
          attempts++
          continue
        }
        
        const suitability = calculateSuitability(x, y, spec, elevation[py][px], water[py][px])
        
        if (Math.random() < suitability && checkSpacing(x, y, spec, newPlants)) {
          const size = spec.minSize + Math.random() * (spec.maxSize - spec.minSize)
          
          newPlants.push({
            x,
            y,
            species: spec,
            age: Math.random(),
            size: size * config.seasonalVariation,
            health: suitability
          })
          placed++
        }
        
        attempts++
      }
    }
    
    setPlants(newPlants)
    
    const endTime = performance.now()
    const speciesUsed = new Set(newPlants.map(p => p.species.name)).size
    const coverage = (newPlants.length * 10) / (config.width * config.height) * 100
    
    setStats({
      totalPlants: newPlants.length,
      speciesCount: speciesUsed,
      density: newPlants.length / ((config.width * config.height) / 1000),
      coverage,
      generationTime: Math.round(endTime - startTime)
    })
    
    setIsGenerating(false)
  }

  const drawVegetation = () => {
    if (!canvasRef.current) return
    
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')!
    
    // Clear canvas
    ctx.fillStyle = '#0a0f0d'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    // Draw background maps if enabled
    if (config.showElevation && elevationMap.length > 0) {
      const imageData = ctx.createImageData(config.width, config.height)
      
      for (let y = 0; y < config.height; y++) {
        for (let x = 0; x < config.width; x++) {
          const elevation = elevationMap[y][x]
          const gray = Math.floor(elevation * 128 + 64)
          
          const idx = (y * config.width + x) * 4
          imageData.data[idx] = gray
          imageData.data[idx + 1] = gray
          imageData.data[idx + 2] = gray
          imageData.data[idx + 3] = 100 // Semi-transparent
        }
      }
      
      ctx.putImageData(imageData, 0, 0)
    }
    
    if (config.showWaterMap && waterMap.length > 0) {
      const imageData = ctx.createImageData(config.width, config.height)
      
      for (let y = 0; y < config.height; y++) {
        for (let x = 0; x < config.width; x++) {
          const water = waterMap[y][x]
          const blue = Math.floor(water * 255)
          
          const idx = (y * config.width + x) * 4
          imageData.data[idx] = 0
          imageData.data[idx + 1] = 0
          imageData.data[idx + 2] = blue
          imageData.data[idx + 3] = 80 // Semi-transparent
        }
      }
      
      ctx.globalCompositeOperation = 'lighter'
      ctx.putImageData(imageData, 0, 0)
      ctx.globalCompositeOperation = 'source-over'
    }
    
    // Draw plants
    for (const plant of plants) {
      ctx.fillStyle = plant.species.color
      ctx.globalAlpha = plant.health * 0.8 + 0.2
      
      const adjustedSize = plant.size * (0.8 + config.growthTime * 0.4)
      
      // Simple plant representation
      if (plant.species.name.includes('Tree') || plant.species.name.includes('Cactus')) {
        // Trees and cacti - circles with stems
        ctx.beginPath()
        ctx.arc(plant.x, plant.y - adjustedSize / 2, adjustedSize / 2, 0, Math.PI * 2)
        ctx.fill()
        
        // Stem
        ctx.fillRect(plant.x - 1, plant.y, 2, adjustedSize / 3)
      } else if (plant.species.name.includes('Grass') || plant.species.name.includes('Fern')) {
        // Grass - small vertical lines
        ctx.fillRect(plant.x - 1, plant.y - adjustedSize, 2, adjustedSize)
      } else {
        // Other plants - simple circles
        ctx.beginPath()
        ctx.arc(plant.x, plant.y, adjustedSize / 2, 0, Math.PI * 2)
        ctx.fill()
      }
    }
    
    ctx.globalAlpha = 1
  }

  useEffect(() => {
    drawVegetation()
  }, [plants, config.showElevation, config.showWaterMap, config.growthTime])

  useEffect(() => {
    generateVegetation()
  }, [config.ecosystemType, config.plantDensity, config.seasonalVariation])

  return (
    <div className="page">
      <h2>Procedural Vegetation Distribution</h2>
      <p className="page-description">
        Generate realistic vegetation patterns based on ecological factors like elevation, 
        water availability, and species preferences. Watch how different ecosystems create 
        unique distribution patterns.
      </p>

      <div className="controls">
        <div className="control-group">
          <label>Ecosystem Type</label>
          <select 
            value={config.ecosystemType} 
            onChange={(e) => setConfig({ ...config, ecosystemType: e.target.value as any })}
          >
            <option value="forest">Forest</option>
            <option value="grassland">Grassland</option>
            <option value="desert">Desert</option>
            <option value="wetland">Wetland</option>
          </select>
        </div>

        <div className="control-group">
          <label>Plant Density: {config.plantDensity.toFixed(1)}x</label>
          <input
            type="range"
            min="0.1"
            max="2.0"
            step="0.1"
            value={config.plantDensity}
            onChange={(e) => setConfig({ ...config, plantDensity: parseFloat(e.target.value) })}
          />
        </div>

        <div className="control-group">
          <label>Seasonal Variation: {config.seasonalVariation.toFixed(1)}x</label>
          <input
            type="range"
            min="0.3"
            max="1.5"
            step="0.1"
            value={config.seasonalVariation}
            onChange={(e) => setConfig({ ...config, seasonalVariation: parseFloat(e.target.value) })}
          />
        </div>

        <div className="control-group">
          <label>Growth Time: {config.growthTime.toFixed(1)}</label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={config.growthTime}
            onChange={(e) => setConfig({ ...config, growthTime: parseFloat(e.target.value) })}
          />
        </div>

        <div className="control-group">
          <label>
            <input
              type="checkbox"
              checked={config.showElevation}
              onChange={(e) => setConfig({ ...config, showElevation: e.target.checked })}
            />
            {' '}Show Elevation Map
          </label>
        </div>

        <div className="control-group">
          <label>
            <input
              type="checkbox"
              checked={config.showWaterMap}
              onChange={(e) => setConfig({ ...config, showWaterMap: e.target.checked })}
            />
            {' '}Show Water Map
          </label>
        </div>

        <button 
          className="generate-button" 
          onClick={generateVegetation}
          disabled={isGenerating}
        >
          {isGenerating ? 'Generating...' : 'Generate New Vegetation'}
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
          <span className="stat-label">Total Plants</span>
          <span className="stat-value">{stats.totalPlants.toLocaleString()}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Species Count</span>
          <span className="stat-value">{stats.speciesCount}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Density</span>
          <span className="stat-value">{stats.density.toFixed(1)}/k</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Coverage</span>
          <span className="stat-value">{stats.coverage.toFixed(1)}%</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Generation Time</span>
          <span className="stat-value">{stats.generationTime}ms</span>
        </div>
      </div>

      <div className="info-panel">
        <h3>How Vegetation Distribution Works</h3>
        <ul>
          <li><strong>Elevation Preference:</strong> Each species has preferred elevation ranges</li>
          <li><strong>Water Requirements:</strong> Plants have varying water needs affecting placement</li>
          <li><strong>Spacing Rules:</strong> Minimum distance requirements prevent overcrowding</li>
          <li><strong>Suitability Calculation:</strong> Combines elevation and water factors</li>
          <li><strong>Density Control:</strong> Species-specific density values control population</li>
        </ul>

        <h3 style={{ marginTop: '2rem' }}>Ecosystem Characteristics</h3>
        <ul>
          <li><strong>Forest:</strong> Mixed species with large trees and understory plants</li>
          <li><strong>Grassland:</strong> Dominated by grasses with scattered shrubs and flowers</li>
          <li><strong>Desert:</strong> Sparse cacti and drought-resistant plants with wide spacing</li>
          <li><strong>Wetland:</strong> Water-loving plants clustered around water sources</li>
        </ul>
      </div>
    </div>
  )
}

export default VegetationPage