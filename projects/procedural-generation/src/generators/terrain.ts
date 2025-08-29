import { createNoise2D } from 'simplex-noise'
import seedrandom from 'seedrandom'

export interface TerrainConfig {
  width: number
  height: number
  scale: number
  octaves: number
  persistence: number
  lacunarity: number
  seed: string
  exponent: number
}

export function generateHeightMap(config: TerrainConfig): number[][] {
  const rng = seedrandom(config.seed)
  const noise2D = createNoise2D(rng)
  
  const heightMap: number[][] = []
  
  let maxHeight = -Infinity
  let minHeight = Infinity
  
  // Generate raw height values
  for (let y = 0; y < config.height; y++) {
    heightMap[y] = []
    for (let x = 0; x < config.width; x++) {
      let amplitude = 1
      let frequency = 1
      let noiseHeight = 0
      
      // Apply octaves
      for (let i = 0; i < config.octaves; i++) {
        const sampleX = (x / config.scale) * frequency
        const sampleY = (y / config.scale) * frequency
        
        const perlinValue = noise2D(sampleX, sampleY)
        noiseHeight += perlinValue * amplitude
        
        amplitude *= config.persistence
        frequency *= config.lacunarity
      }
      
      heightMap[y][x] = noiseHeight
      
      if (noiseHeight > maxHeight) maxHeight = noiseHeight
      if (noiseHeight < minHeight) minHeight = noiseHeight
    }
  }
  
  // Normalize and apply exponent
  for (let y = 0; y < config.height; y++) {
    for (let x = 0; x < config.width; x++) {
      // Normalize to 0-1 range
      heightMap[y][x] = (heightMap[y][x] - minHeight) / (maxHeight - minHeight)
      
      // Apply exponent for more realistic terrain
      heightMap[y][x] = Math.pow(heightMap[y][x], config.exponent)
    }
  }
  
  return heightMap
}

export function getTerrainColor(height: number): string {
  // Water
  if (height < 0.3) {
    const depth = height / 0.3
    const r = Math.floor(10 + depth * 20)
    const g = Math.floor(40 + depth * 40)
    const b = Math.floor(60 + depth * 60)
    return `rgb(${r}, ${g}, ${b})`
  }
  // Beach
  if (height < 0.35) {
    return 'rgb(194, 178, 128)'
  }
  // Grass
  if (height < 0.6) {
    const grassLevel = (height - 0.35) / 0.25
    const r = Math.floor(50 + grassLevel * 20)
    const g = Math.floor(120 - grassLevel * 20)
    const b = Math.floor(50 + grassLevel * 10)
    return `rgb(${r}, ${g}, ${b})`
  }
  // Mountain
  if (height < 0.8) {
    const mountainLevel = (height - 0.6) / 0.2
    const gray = Math.floor(90 + mountainLevel * 40)
    return `rgb(${gray}, ${gray}, ${gray})`
  }
  // Snow
  const snowLevel = (height - 0.8) / 0.2
  const white = Math.floor(200 + snowLevel * 55)
  return `rgb(${white}, ${white}, ${white})`
}

export function applyErosion(heightMap: number[][], iterations: number = 5): number[][] {
  const width = heightMap[0].length
  const height = heightMap.length
  const eroded = heightMap.map(row => [...row])
  
  for (let iter = 0; iter < iterations; iter++) {
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        let sum = 0
        let count = 0
        
        // Average with neighbors
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            sum += eroded[y + dy][x + dx]
            count++
          }
        }
        
        const average = sum / count
        const current = eroded[y][x]
        
        // Smooth based on difference from average
        eroded[y][x] = current * 0.7 + average * 0.3
      }
    }
  }
  
  return eroded
}