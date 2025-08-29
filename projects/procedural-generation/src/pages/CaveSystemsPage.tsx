import { useEffect, useRef, useState } from 'react'
import p5 from 'p5'

function CaveSystemsPage() {
  const sketchRef = useRef<HTMLDivElement>(null)
  const p5Instance = useRef<p5 | null>(null)
  const [params, setParams] = useState({
    gridSize: 80,
    fillProbability: 0.45,
    smoothingIterations: 5,
    birthLimit: 4,
    deathLimit: 3,
    seed: Math.floor(Math.random() * 1000)
  })

  useEffect(() => {
    if (!sketchRef.current) return

    const sketch = (p: p5) => {
      let cave: number[][] = []

      p.setup = () => {
        const canvas = p.createCanvas(800, 600)
        canvas.parent(sketchRef.current!)
        p.randomSeed(params.seed)
        generateCave()
      }

      const generateCave = () => {
        // Initialize with random noise
        cave = Array(params.gridSize).fill(null).map(() => 
          Array(params.gridSize).fill(0).map(() => 
            p.random() < params.fillProbability ? 1 : 0
          )
        )

        // Apply cellular automata rules
        for (let i = 0; i < params.smoothingIterations; i++) {
          cave = smoothCave(cave)
        }
      }

      const smoothCave = (oldCave: number[][]): number[][] => {
        const newCave = Array(params.gridSize).fill(null).map(() => Array(params.gridSize).fill(0))
        
        for (let x = 0; x < params.gridSize; x++) {
          for (let y = 0; y < params.gridSize; y++) {
            const neighbors = countAliveNeighbors(oldCave, x, y)
            
            if (oldCave[y][x] === 1) {
              newCave[y][x] = neighbors >= params.deathLimit ? 1 : 0
            } else {
              newCave[y][x] = neighbors > params.birthLimit ? 1 : 0
            }
          }
        }
        
        return newCave
      }

      const countAliveNeighbors = (caveMap: number[][], x: number, y: number): number => {
        let count = 0
        
        for (let i = -1; i <= 1; i++) {
          for (let j = -1; j <= 1; j++) {
            if (i === 0 && j === 0) continue
            
            const neighborX = x + i
            const neighborY = y + j
            
            if (neighborX < 0 || neighborX >= params.gridSize || 
                neighborY < 0 || neighborY >= params.gridSize) {
              count++ // Consider edges as walls
            } else {
              count += caveMap[neighborY][neighborX]
            }
          }
        }
        
        return count
      }

      p.draw = () => {
        p.background(20, 25, 30)
        
        const cellSize = Math.min(p.width / params.gridSize, p.height / params.gridSize)
        const offsetX = (p.width - params.gridSize * cellSize) / 2
        const offsetY = (p.height - params.gridSize * cellSize) / 2

        p.noStroke()
        for (let y = 0; y < params.gridSize; y++) {
          for (let x = 0; x < params.gridSize; x++) {
            const drawX = offsetX + x * cellSize
            const drawY = offsetY + y * cellSize
            
            if (cave[y][x] === 1) {
              p.fill(60, 50, 40) // Rock
            } else {
              // Cave floor - slight color variation
              const variation = p.noise(x * 0.1, y * 0.1) * 20
              p.fill(180 + variation, 160 + variation, 140 + variation)
            }
            
            p.rect(drawX, drawY, cellSize, cellSize)
          }
        }
      }

      p.regenerateCave = () => {
        p.randomSeed(params.seed)
        generateCave()
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
      <h2>Cave Systems</h2>
      <p className="page-description">
        Generate natural cave networks using cellular automata algorithms that simulate rock formation and erosion.
      </p>

      <div className="controls">
        <div className="control-group">
          <label>Grid Size: {params.gridSize}</label>
          <input
            type="range"
            min="40"
            max="120"
            value={params.gridSize}
            onChange={(e) => setParams({ ...params, gridSize: parseInt(e.target.value) })}
          />
        </div>

        <div className="control-group">
          <label>Fill Probability: {params.fillProbability.toFixed(2)}</label>
          <input
            type="range"
            min="0.3"
            max="0.7"
            step="0.01"
            value={params.fillProbability}
            onChange={(e) => setParams({ ...params, fillProbability: parseFloat(e.target.value) })}
          />
        </div>

        <div className="control-group">
          <label>Smoothing Iterations: {params.smoothingIterations}</label>
          <input
            type="range"
            min="1"
            max="10"
            value={params.smoothingIterations}
            onChange={(e) => setParams({ ...params, smoothingIterations: parseInt(e.target.value) })}
          />
        </div>

        <div className="control-group">
          <label>Birth Limit: {params.birthLimit}</label>
          <input
            type="range"
            min="2"
            max="6"
            value={params.birthLimit}
            onChange={(e) => setParams({ ...params, birthLimit: parseInt(e.target.value) })}
          />
        </div>

        <div className="control-group">
          <label>Death Limit: {params.deathLimit}</label>
          <input
            type="range"
            min="2"
            max="6"
            value={params.deathLimit}
            onChange={(e) => setParams({ ...params, deathLimit: parseInt(e.target.value) })}
          />
        </div>

        <button className="reset-button" onClick={handleRegenerate}>
          Generate New Cave
        </button>
      </div>

      <div className="canvas-container">
        <div ref={sketchRef} />
      </div>

      <div className="info-panel">
        <h3>Cellular Automata Cave Generation</h3>
        <ul>
          <li><strong>Initial Noise:</strong> Random distribution of rock and empty space</li>
          <li><strong>Birth/Death Rules:</strong> Cells become rock/empty based on neighbors</li>
          <li><strong>Iterative Smoothing:</strong> Multiple passes create natural formations</li>
          <li><strong>Connectivity:</strong> Ensures cave networks are traversable</li>
          <li><strong>Erosion Simulation:</strong> Mimics natural cave formation processes</li>
        </ul>
      </div>
    </div>
  )
}

export default CaveSystemsPage