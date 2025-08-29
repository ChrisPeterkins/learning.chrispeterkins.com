import { useEffect, useRef, useState } from 'react'
import p5 from 'p5'

interface Biome {
  name: string
  color: p5.Color
  temperature: number
  moisture: number
}

function WorldBuildingPage() {
  const sketchRef = useRef<HTMLDivElement>(null)
  const p5Instance = useRef<p5 | null>(null)
  const [params, setParams] = useState({
    worldSize: 200,
    seaLevel: 0.3,
    temperatureVariation: 0.7,
    moistureVariation: 0.6,
    mountainHeight: 0.8,
    riverDensity: 0.15,
    seed: Math.floor(Math.random() * 1000)
  })

  useEffect(() => {
    if (!sketchRef.current) return

    const sketch = (p: p5) => {
      let elevation: number[][] = []
      let temperature: number[][] = []
      let moisture: number[][] = []
      let biomes: Biome[]

      p.setup = () => {
        const canvas = p.createCanvas(800, 600)
        canvas.parent(sketchRef.current!)
        p.colorMode(p.HSB, 360, 100, 100)
        p.randomSeed(params.seed)
        
        initializeBiomes()
        generateWorld()
      }

      const initializeBiomes = () => {
        biomes = [
          { name: 'Ocean', color: p.color(220, 80, 60), temperature: 0.5, moisture: 1.0 },
          { name: 'Desert', color: p.color(45, 60, 85), temperature: 0.8, moisture: 0.1 },
          { name: 'Grassland', color: p.color(90, 60, 70), temperature: 0.6, moisture: 0.4 },
          { name: 'Forest', color: p.color(120, 70, 50), temperature: 0.5, moisture: 0.7 },
          { name: 'Rainforest', color: p.color(140, 80, 40), temperature: 0.8, moisture: 0.9 },
          { name: 'Tundra', color: p.color(180, 30, 80), temperature: 0.2, moisture: 0.3 },
          { name: 'Taiga', color: p.color(160, 50, 45), temperature: 0.3, moisture: 0.6 },
          { name: 'Mountains', color: p.color(30, 20, 70), temperature: 0.2, moisture: 0.4 }
        ]
      }

      const generateWorld = () => {
        generateElevation()
        generateTemperature()
        generateMoisture()
      }

      const generateElevation = () => {
        elevation = Array(params.worldSize).fill(null).map(() => Array(params.worldSize).fill(0))
        
        // Generate using multiple octaves of noise
        for (let y = 0; y < params.worldSize; y++) {
          for (let x = 0; x < params.worldSize; x++) {
            let height = 0
            let amplitude = 1
            let frequency = 0.01
            
            // Multiple noise octaves for realistic terrain
            for (let i = 0; i < 6; i++) {
              height += p.noise(x * frequency, y * frequency) * amplitude
              amplitude *= 0.5
              frequency *= 2
            }
            
            elevation[y][x] = height
          }
        }
      }

      const generateTemperature = () => {
        temperature = Array(params.worldSize).fill(null).map(() => Array(params.worldSize).fill(0))
        
        for (let y = 0; y < params.worldSize; y++) {
          for (let x = 0; x < params.worldSize; x++) {
            // Base temperature on latitude (distance from equator)
            const latitude = Math.abs(y - params.worldSize / 2) / (params.worldSize / 2)
            let temp = 1 - latitude * 0.8 // Warmer at equator
            
            // Modify by elevation (higher = cooler)
            temp -= elevation[y][x] * 0.3
            
            // Add noise variation
            temp += (p.noise(x * 0.02, y * 0.02, 100) - 0.5) * params.temperatureVariation
            
            temperature[y][x] = p.constrain(temp, 0, 1)
          }
        }
      }

      const generateMoisture = () => {
        moisture = Array(params.worldSize).fill(null).map(() => Array(params.worldSize).fill(0))
        
        for (let y = 0; y < params.worldSize; y++) {
          for (let x = 0; x < params.worldSize; x++) {
            let moist = p.noise(x * 0.03, y * 0.03, 200)
            
            // Ocean areas have high moisture
            if (elevation[y][x] < params.seaLevel) {
              moist = 1.0
            } else {
              // Distance from ocean affects moisture
              const distanceFromOcean = getDistanceFromOcean(x, y)
              moist *= Math.max(0.1, 1 - distanceFromOcean * 0.01)
            }
            
            // Add variation
            moist += (p.noise(x * 0.05, y * 0.05, 300) - 0.5) * params.moistureVariation
            
            moisture[y][x] = p.constrain(moist, 0, 1)
          }
        }
      }

      const getDistanceFromOcean = (x: number, y: number): number => {
        let minDistance = Infinity
        
        for (let dy = 0; dy < params.worldSize; dy += 5) {
          for (let dx = 0; dx < params.worldSize; dx += 5) {
            if (elevation[dy][dx] < params.seaLevel) {
              const distance = p.dist(x, y, dx, dy)
              minDistance = Math.min(minDistance, distance)
            }
          }
        }
        
        return minDistance
      }

      const getBiome = (x: number, y: number): Biome => {
        const elev = elevation[y][x]
        const temp = temperature[y][x]
        const moist = moisture[y][x]
        
        if (elev < params.seaLevel) {
          return biomes[0] // Ocean
        }
        
        if (elev > params.mountainHeight) {
          return biomes[7] // Mountains
        }
        
        // Determine biome based on temperature and moisture
        if (temp > 0.7 && moist < 0.3) return biomes[1] // Desert
        if (temp > 0.6 && moist > 0.8) return biomes[4] // Rainforest
        if (temp < 0.3 && moist < 0.5) return biomes[5] // Tundra
        if (temp < 0.4 && moist > 0.5) return biomes[6] // Taiga
        if (moist > 0.6) return biomes[3] // Forest
        return biomes[2] // Grassland
      }

      p.draw = () => {
        p.background(0, 0, 20)
        
        const cellSize = Math.min(p.width / params.worldSize, p.height / params.worldSize)
        const offsetX = (p.width - params.worldSize * cellSize) / 2
        const offsetY = (p.height - params.worldSize * cellSize) / 2

        p.noStroke()
        for (let y = 0; y < params.worldSize; y += 2) { // Skip pixels for performance
          for (let x = 0; x < params.worldSize; x += 2) {
            const drawX = offsetX + x * cellSize
            const drawY = offsetY + y * cellSize
            
            const biome = getBiome(x, y)
            p.fill(biome.color)
            p.rect(drawX, drawY, cellSize * 2, cellSize * 2)
          }
        }
        
        // Draw rivers (simplified)
        p.stroke(220, 80, 80)
        p.strokeWeight(1)
        for (let i = 0; i < params.riverDensity * 50; i++) {
          drawRiver()
        }
      }

      const drawRiver = () => {
        let x = p.random(params.worldSize * 0.2, params.worldSize * 0.8)
        let y = p.random(params.worldSize * 0.2, params.worldSize * 0.8)
        
        const cellSize = Math.min(p.width / params.worldSize, p.height / params.worldSize)
        const offsetX = (p.width - params.worldSize * cellSize) / 2
        const offsetY = (p.height - params.worldSize * cellSize) / 2
        
        // Follow elevation gradient downhill
        for (let step = 0; step < 100; step++) {
          if (x < 1 || x >= params.worldSize - 1 || y < 1 || y >= params.worldSize - 1) break
          if (elevation[Math.floor(y)][Math.floor(x)] < params.seaLevel) break
          
          const currentElev = elevation[Math.floor(y)][Math.floor(x)]
          let bestX = x, bestY = y
          let bestElev = currentElev
          
          // Find steepest descent
          for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
              if (dx === 0 && dy === 0) continue
              
              const newX = Math.floor(x + dx)
              const newY = Math.floor(y + dy)
              
              if (newX >= 0 && newX < params.worldSize && newY >= 0 && newY < params.worldSize) {
                const elev = elevation[newY][newX]
                if (elev < bestElev) {
                  bestElev = elev
                  bestX = x + dx
                  bestY = y + dy
                }
              }
            }
          }
          
          const drawX1 = offsetX + x * cellSize
          const drawY1 = offsetY + y * cellSize
          const drawX2 = offsetX + bestX * cellSize
          const drawY2 = offsetY + bestY * cellSize
          
          p.line(drawX1, drawY1, drawX2, drawY2)
          
          x = bestX
          y = bestY
        }
      }

      p.regenerateWorld = () => {
        p.randomSeed(params.seed)
        generateWorld()
      }
    }

    p5Instance.current = new p5(sketch)

    return () => {
      p5Instance.current?.remove()
    }
  }, [params])

  const handleRegenerate = () => {
    const newSeed = Math.floor(Math.random() * 1000)
    setParams({ ...params, seed: newSeed })
  }

  return (
    <div className="page">
      <h2>World Building</h2>
      <p className="page-description">
        Generate entire worlds with realistic biome distributions, elevation, climate, and geographic features.
      </p>

      <div className="controls">
        <div className="control-group">
          <label>World Resolution: {params.worldSize}</label>
          <input
            type="range"
            min="100"
            max="300"
            value={params.worldSize}
            onChange={(e) => setParams({ ...params, worldSize: parseInt(e.target.value) })}
          />
        </div>

        <div className="control-group">
          <label>Sea Level: {params.seaLevel.toFixed(2)}</label>
          <input
            type="range"
            min="0.1"
            max="0.6"
            step="0.05"
            value={params.seaLevel}
            onChange={(e) => setParams({ ...params, seaLevel: parseFloat(e.target.value) })}
          />
        </div>

        <div className="control-group">
          <label>Temperature Variation: {params.temperatureVariation.toFixed(2)}</label>
          <input
            type="range"
            min="0.2"
            max="1.0"
            step="0.1"
            value={params.temperatureVariation}
            onChange={(e) => setParams({ ...params, temperatureVariation: parseFloat(e.target.value) })}
          />
        </div>

        <div className="control-group">
          <label>River Density: {params.riverDensity.toFixed(2)}</label>
          <input
            type="range"
            min="0.05"
            max="0.3"
            step="0.05"
            value={params.riverDensity}
            onChange={(e) => setParams({ ...params, riverDensity: parseFloat(e.target.value) })}
          />
        </div>

        <button className="reset-button" onClick={handleRegenerate}>
          Generate New World
        </button>
      </div>

      <div className="canvas-container">
        <div ref={sketchRef} />
      </div>

      <div className="info-panel">
        <h3>World Generation Techniques</h3>
        <ul>
          <li><strong>Elevation Maps:</strong> Multi-octave Perlin noise for realistic terrain</li>
          <li><strong>Climate Simulation:</strong> Temperature based on latitude and elevation</li>
          <li><strong>Biome Distribution:</strong> Temperature and moisture determine biome types</li>
          <li><strong>Hydrography:</strong> Rivers follow elevation gradients to sea level</li>
          <li><strong>Erosion Effects:</strong> Moisture patterns influenced by ocean proximity</li>
        </ul>
      </div>
    </div>
  )
}

export default WorldBuildingPage