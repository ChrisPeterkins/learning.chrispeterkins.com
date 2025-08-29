import { useEffect, useRef, useState } from 'react'

interface Cell {
  x: number
  y: number
  walls: {
    top: boolean
    right: boolean
    bottom: boolean
    left: boolean
  }
  visited: boolean
  distance?: number
}

interface MazeConfig {
  width: number
  height: number
  cellSize: number
  algorithm: 'backtracking' | 'prims' | 'binaryTree' | 'aldousBroder'
  animationSpeed: number
  showSolution: boolean
}

type Direction = 'top' | 'right' | 'bottom' | 'left'

function MazeGenerationPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [config, setConfig] = useState<MazeConfig>({
    width: 40,
    height: 30,
    cellSize: 15,
    algorithm: 'backtracking',
    animationSpeed: 50,
    showSolution: false
  })
  
  const [maze, setMaze] = useState<Cell[][]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [stats, setStats] = useState({
    totalCells: 0,
    visitedCells: 0,
    generationTime: 0,
    solutionLength: 0
  })
  const [solution, setSolution] = useState<{x: number, y: number}[]>([])

  const createEmptyMaze = (width: number, height: number): Cell[][] => {
    const maze: Cell[][] = []
    
    for (let y = 0; y < height; y++) {
      maze[y] = []
      for (let x = 0; x < width; x++) {
        maze[y][x] = {
          x,
          y,
          walls: { top: true, right: true, bottom: true, left: true },
          visited: false
        }
      }
    }
    
    return maze
  }

  const getNeighbors = (x: number, y: number, maze: Cell[][]): Cell[] => {
    const neighbors: Cell[] = []
    const directions = [
      { x: 0, y: -1 }, // top
      { x: 1, y: 0 },  // right
      { x: 0, y: 1 },  // bottom
      { x: -1, y: 0 }  // left
    ]
    
    for (const dir of directions) {
      const nx = x + dir.x
      const ny = y + dir.y
      
      if (nx >= 0 && nx < maze[0].length && ny >= 0 && ny < maze.length) {
        neighbors.push(maze[ny][nx])
      }
    }
    
    return neighbors
  }

  const removeWallBetween = (cell1: Cell, cell2: Cell, maze: Cell[][]) => {
    const dx = cell1.x - cell2.x
    const dy = cell1.y - cell2.y
    
    if (dx === 1) { // cell1 is to the right of cell2
      maze[cell1.y][cell1.x].walls.left = false
      maze[cell2.y][cell2.x].walls.right = false
    } else if (dx === -1) { // cell1 is to the left of cell2
      maze[cell1.y][cell1.x].walls.right = false
      maze[cell2.y][cell2.x].walls.left = false
    } else if (dy === 1) { // cell1 is below cell2
      maze[cell1.y][cell1.x].walls.top = false
      maze[cell2.y][cell2.x].walls.bottom = false
    } else if (dy === -1) { // cell1 is above cell2
      maze[cell1.y][cell1.x].walls.bottom = false
      maze[cell2.y][cell2.x].walls.top = false
    }
  }

  const generateRecursiveBacktracking = async (maze: Cell[][], animate: boolean = true) => {
    const stack: Cell[] = []
    const current = maze[0][0]
    current.visited = true
    stack.push(current)
    
    let visitedCount = 1
    
    while (stack.length > 0) {
      const current = stack[stack.length - 1]
      const neighbors = getNeighbors(current.x, current.y, maze).filter(n => !n.visited)
      
      if (neighbors.length > 0) {
        const next = neighbors[Math.floor(Math.random() * neighbors.length)]
        removeWallBetween(current, next, maze)
        next.visited = true
        stack.push(next)
        visitedCount++
      } else {
        stack.pop()
      }
      
      if (animate && visitedCount % 10 === 0) {
        drawMaze(maze)
        setStats(prev => ({ ...prev, visitedCells: visitedCount }))
        await new Promise(resolve => setTimeout(resolve, config.animationSpeed))
      }
    }
    
    return visitedCount
  }

  const generatePrims = async (maze: Cell[][], animate: boolean = true) => {
    const walls: {cell1: Cell, cell2: Cell}[] = []
    const current = maze[Math.floor(maze.length/2)][Math.floor(maze[0].length/2)]
    current.visited = true
    let visitedCount = 1
    
    // Add walls of the current cell to the list
    const addWalls = (cell: Cell) => {
      const neighbors = getNeighbors(cell.x, cell.y, maze)
      neighbors.forEach(neighbor => {
        if (!neighbor.visited) {
          walls.push({ cell1: cell, cell2: neighbor })
        }
      })
    }
    
    addWalls(current)
    
    while (walls.length > 0) {
      const randomIndex = Math.floor(Math.random() * walls.length)
      const { cell1, cell2 } = walls[randomIndex]
      walls.splice(randomIndex, 1)
      
      if (!cell2.visited) {
        removeWallBetween(cell1, cell2, maze)
        cell2.visited = true
        visitedCount++
        addWalls(cell2)
        
        if (animate && visitedCount % 5 === 0) {
          drawMaze(maze)
          setStats(prev => ({ ...prev, visitedCells: visitedCount }))
          await new Promise(resolve => setTimeout(resolve, config.animationSpeed))
        }
      }
    }
    
    return visitedCount
  }

  const generateBinaryTree = async (maze: Cell[][], animate: boolean = true) => {
    let visitedCount = 0
    
    for (let y = 0; y < maze.length; y++) {
      for (let x = 0; x < maze[0].length; x++) {
        const cell = maze[y][x]
        cell.visited = true
        visitedCount++
        
        const neighbors: Cell[] = []
        
        // Add north neighbor
        if (y > 0) neighbors.push(maze[y-1][x])
        // Add east neighbor
        if (x < maze[0].length - 1) neighbors.push(maze[y][x+1])
        
        if (neighbors.length > 0) {
          const chosen = neighbors[Math.floor(Math.random() * neighbors.length)]
          removeWallBetween(cell, chosen, maze)
        }
        
        if (animate && visitedCount % 20 === 0) {
          drawMaze(maze)
          setStats(prev => ({ ...prev, visitedCells: visitedCount }))
          await new Promise(resolve => setTimeout(resolve, config.animationSpeed / 2))
        }
      }
    }
    
    return visitedCount
  }

  const generateAldousBroder = async (maze: Cell[][], animate: boolean = true) => {
    let current = maze[Math.floor(Math.random() * maze.length)][Math.floor(Math.random() * maze[0].length)]
    current.visited = true
    let visitedCount = 1
    const totalCells = maze.length * maze[0].length
    
    while (visitedCount < totalCells) {
      const neighbors = getNeighbors(current.x, current.y, maze)
      const next = neighbors[Math.floor(Math.random() * neighbors.length)]
      
      if (!next.visited) {
        removeWallBetween(current, next, maze)
        next.visited = true
        visitedCount++
        
        if (animate && visitedCount % 10 === 0) {
          drawMaze(maze)
          setStats(prev => ({ ...prev, visitedCells: visitedCount }))
          await new Promise(resolve => setTimeout(resolve, config.animationSpeed))
        }
      }
      
      current = next
    }
    
    return visitedCount
  }

  const solveMaze = (maze: Cell[][]): {x: number, y: number}[] => {
    const start = { x: 0, y: 0 }
    const end = { x: maze[0].length - 1, y: maze.length - 1 }
    const queue = [{ ...start, path: [start] }]
    const visited = new Set<string>()
    
    while (queue.length > 0) {
      const { x, y, path } = queue.shift()!
      const key = `${x},${y}`
      
      if (visited.has(key)) continue
      visited.add(key)
      
      if (x === end.x && y === end.y) {
        return path
      }
      
      const cell = maze[y][x]
      const directions: {dx: number, dy: number, wall: Direction}[] = [
        { dx: 0, dy: -1, wall: 'top' },
        { dx: 1, dy: 0, wall: 'right' },
        { dx: 0, dy: 1, wall: 'bottom' },
        { dx: -1, dy: 0, wall: 'left' }
      ]
      
      for (const { dx, dy, wall } of directions) {
        if (!cell.walls[wall]) {
          const nx = x + dx
          const ny = y + dy
          
          if (nx >= 0 && nx < maze[0].length && ny >= 0 && ny < maze.length) {
            const newPos = { x: nx, y: ny }
            queue.push({ ...newPos, path: [...path, newPos] })
          }
        }
      }
    }
    
    return []
  }

  const drawMaze = (maze: Cell[][]) => {
    if (!canvasRef.current) return
    
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')!
    
    // Clear canvas
    ctx.fillStyle = '#0a0f0d'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    // Draw cells and walls
    for (let y = 0; y < maze.length; y++) {
      for (let x = 0; x < maze[0].length; x++) {
        const cell = maze[y][x]
        const px = x * config.cellSize
        const py = y * config.cellSize
        
        // Fill visited cells
        if (cell.visited) {
          ctx.fillStyle = 'rgba(26, 93, 58, 0.1)'
          ctx.fillRect(px, py, config.cellSize, config.cellSize)
        }
        
        // Draw walls
        ctx.strokeStyle = '#4ade80'
        ctx.lineWidth = 2
        
        ctx.beginPath()
        
        if (cell.walls.top) {
          ctx.moveTo(px, py)
          ctx.lineTo(px + config.cellSize, py)
        }
        if (cell.walls.right) {
          ctx.moveTo(px + config.cellSize, py)
          ctx.lineTo(px + config.cellSize, py + config.cellSize)
        }
        if (cell.walls.bottom) {
          ctx.moveTo(px + config.cellSize, py + config.cellSize)
          ctx.lineTo(px, py + config.cellSize)
        }
        if (cell.walls.left) {
          ctx.moveTo(px, py + config.cellSize)
          ctx.lineTo(px, py)
        }
        
        ctx.stroke()
      }
    }
    
    // Draw start and end
    ctx.fillStyle = '#22c55e'
    ctx.fillRect(2, 2, config.cellSize - 4, config.cellSize - 4)
    
    ctx.fillStyle = '#dc2626'
    const endX = (maze[0].length - 1) * config.cellSize
    const endY = (maze.length - 1) * config.cellSize
    ctx.fillRect(endX + 2, endY + 2, config.cellSize - 4, config.cellSize - 4)
    
    // Draw solution path if enabled
    if (config.showSolution && solution.length > 0) {
      ctx.strokeStyle = '#fbbf24'
      ctx.lineWidth = 3
      ctx.lineCap = 'round'
      
      ctx.beginPath()
      for (let i = 0; i < solution.length; i++) {
        const point = solution[i]
        const px = point.x * config.cellSize + config.cellSize / 2
        const py = point.y * config.cellSize + config.cellSize / 2
        
        if (i === 0) {
          ctx.moveTo(px, py)
        } else {
          ctx.lineTo(px, py)
        }
      }
      ctx.stroke()
    }
  }

  const generateMaze = async () => {
    setIsGenerating(true)
    const startTime = performance.now()
    
    const newMaze = createEmptyMaze(config.width, config.height)
    setMaze(newMaze)
    
    let visitedCount = 0
    
    try {
      switch (config.algorithm) {
        case 'backtracking':
          visitedCount = await generateRecursiveBacktracking(newMaze, true)
          break
        case 'prims':
          visitedCount = await generatePrims(newMaze, true)
          break
        case 'binaryTree':
          visitedCount = await generateBinaryTree(newMaze, true)
          break
        case 'aldousBroder':
          visitedCount = await generateAldousBroder(newMaze, true)
          break
      }
      
      // Generate solution
      const solutionPath = solveMaze(newMaze)
      setSolution(solutionPath)
      
      const endTime = performance.now()
      
      setStats({
        totalCells: config.width * config.height,
        visitedCells: visitedCount,
        generationTime: Math.round(endTime - startTime),
        solutionLength: solutionPath.length
      })
      
      setMaze(newMaze)
      drawMaze(newMaze)
      
    } catch (error) {
      console.error('Error generating maze:', error)
    }
    
    setIsGenerating(false)
  }

  useEffect(() => {
    if (maze.length > 0) {
      drawMaze(maze)
    }
  }, [config.showSolution])

  useEffect(() => {
    generateMaze()
  }, [])

  return (
    <div className="page">
      <h2>Maze Generation Algorithms</h2>
      <p className="page-description">
        Explore different algorithms for generating perfect mazes. Each algorithm creates unique 
        patterns and has different characteristics in terms of difficulty and visual appeal.
      </p>

      <div className="controls">
        <div className="control-group">
          <label>Algorithm</label>
          <select 
            value={config.algorithm} 
            onChange={(e) => setConfig({ ...config, algorithm: e.target.value as any })}
          >
            <option value="backtracking">Recursive Backtracking</option>
            <option value="prims">Prim's Algorithm</option>
            <option value="binaryTree">Binary Tree</option>
            <option value="aldousBroder">Aldous-Broder</option>
          </select>
        </div>

        <div className="control-group">
          <label>Width: {config.width}</label>
          <input
            type="range"
            min="10"
            max="80"
            value={config.width}
            onChange={(e) => setConfig({ ...config, width: parseInt(e.target.value) })}
          />
        </div>

        <div className="control-group">
          <label>Height: {config.height}</label>
          <input
            type="range"
            min="10"
            max="60"
            value={config.height}
            onChange={(e) => setConfig({ ...config, height: parseInt(e.target.value) })}
          />
        </div>

        <div className="control-group">
          <label>Cell Size: {config.cellSize}px</label>
          <input
            type="range"
            min="8"
            max="25"
            value={config.cellSize}
            onChange={(e) => setConfig({ ...config, cellSize: parseInt(e.target.value) })}
          />
        </div>

        <div className="control-group">
          <label>Animation Speed: {config.animationSpeed}ms</label>
          <input
            type="range"
            min="10"
            max="200"
            step="10"
            value={config.animationSpeed}
            onChange={(e) => setConfig({ ...config, animationSpeed: parseInt(e.target.value) })}
          />
        </div>

        <div className="control-group">
          <label>
            <input
              type="checkbox"
              checked={config.showSolution}
              onChange={(e) => setConfig({ ...config, showSolution: e.target.checked })}
            />
            {' '}Show Solution
          </label>
        </div>

        <button 
          className="generate-button" 
          onClick={generateMaze}
          disabled={isGenerating}
        >
          {isGenerating ? 'Generating...' : 'Generate New Maze'}
        </button>
      </div>

      <div className="canvas-container">
        <canvas 
          ref={canvasRef} 
          width={config.width * config.cellSize} 
          height={config.height * config.cellSize}
        />
        <div className="canvas-info">
          {config.width}×{config.height} cells
        </div>
      </div>

      <div className="stats-panel">
        <div className="stat-item">
          <span className="stat-label">Total Cells</span>
          <span className="stat-value">{stats.totalCells.toLocaleString()}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Visited Cells</span>
          <span className="stat-value">{stats.visitedCells.toLocaleString()}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Generation Time</span>
          <span className="stat-value">{stats.generationTime}ms</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Solution Length</span>
          <span className="stat-value">{stats.solutionLength} steps</span>
        </div>
      </div>

      <div className="info-panel">
        <h3>Algorithm Characteristics</h3>
        <ul>
          <li><strong>Recursive Backtracking:</strong> Creates mazes with long winding passages and fewer dead ends</li>
          <li><strong>Prim's Algorithm:</strong> Produces mazes with many short dead ends and a tree-like structure</li>
          <li><strong>Binary Tree:</strong> Creates mazes with a distinctive texture, always solvable along two walls</li>
          <li><strong>Aldous-Broder:</strong> Generates mazes using random walks, creating uniform spanning trees</li>
        </ul>

        <h3 style={{ marginTop: '2rem' }}>Legend</h3>
        <ul>
          <li><strong style={{ color: '#22c55e' }}>Green Square:</strong> Starting position (top-left)</li>
          <li><strong style={{ color: '#dc2626' }}>Red Square:</strong> End position (bottom-right)</li>
          <li><strong style={{ color: '#fbbf24' }}>Yellow Line:</strong> Solution path (when enabled)</li>
          <li><strong style={{ color: '#4ade80' }}>Green Lines:</strong> Walls between cells</li>
        </ul>
      </div>
    </div>
  )
}

export default MazeGenerationPage