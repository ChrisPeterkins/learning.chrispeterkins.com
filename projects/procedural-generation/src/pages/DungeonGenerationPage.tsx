import { useEffect, useRef, useState } from 'react'
import p5 from 'p5'

interface Room {
  x: number
  y: number
  width: number
  height: number
}

interface Corridor {
  x1: number
  y1: number
  x2: number
  y2: number
}

function DungeonGenerationPage() {
  const sketchRef = useRef<HTMLDivElement>(null)
  const p5Instance = useRef<p5 | null>(null)
  const [params, setParams] = useState({
    algorithm: 'bsp',
    gridSize: 50,
    minRoomSize: 4,
    maxRoomSize: 12,
    roomDensity: 0.3,
    corridorWidth: 1,
    seed: Math.floor(Math.random() * 1000)
  })

  useEffect(() => {
    if (!sketchRef.current) return

    const sketch = (p: p5) => {
      let dungeon: number[][] = []
      let rooms: Room[] = []
      let corridors: Corridor[] = []

      p.setup = () => {
        const canvas = p.createCanvas(800, 600)
        canvas.parent(sketchRef.current!)
        p.randomSeed(params.seed)
        generateDungeon()
      }

      const generateDungeon = () => {
        const cellSize = Math.min(p.width / params.gridSize, p.height / params.gridSize)
        dungeon = Array(params.gridSize).fill(null).map(() => Array(params.gridSize).fill(0))
        rooms = []
        corridors = []

        if (params.algorithm === 'bsp') {
          generateBSPDungeon()
        } else if (params.algorithm === 'random') {
          generateRandomRooms()
        } else if (params.algorithm === 'maze') {
          generateMazeDungeon()
        }
      }

      const generateBSPDungeon = () => {
        // Binary Space Partitioning
        const partitions = [{ x: 0, y: 0, width: params.gridSize, height: params.gridSize }]
        
        // Split recursively
        for (let i = 0; i < 4; i++) {
          const newPartitions = []
          for (let partition of partitions) {
            if (partition.width > params.maxRoomSize * 2 && partition.height > params.maxRoomSize * 2) {
              if (p.random() > 0.5 && partition.width > params.minRoomSize * 3) {
                // Split vertically
                const split = Math.floor(partition.width * (0.3 + p.random() * 0.4))
                newPartitions.push({ x: partition.x, y: partition.y, width: split, height: partition.height })
                newPartitions.push({ x: partition.x + split, y: partition.y, width: partition.width - split, height: partition.height })
              } else if (partition.height > params.minRoomSize * 3) {
                // Split horizontally
                const split = Math.floor(partition.height * (0.3 + p.random() * 0.4))
                newPartitions.push({ x: partition.x, y: partition.y, width: partition.width, height: split })
                newPartitions.push({ x: partition.x, y: partition.y + split, width: partition.width, height: partition.height - split })
              } else {
                newPartitions.push(partition)
              }
            } else {
              newPartitions.push(partition)
            }
          }
          partitions.length = 0
          partitions.push(...newPartitions)
        }

        // Create rooms in partitions
        for (let partition of partitions) {
          if (p.random() < params.roomDensity) {
            const roomWidth = Math.floor(params.minRoomSize + p.random() * (Math.min(partition.width - 2, params.maxRoomSize) - params.minRoomSize))
            const roomHeight = Math.floor(params.minRoomSize + p.random() * (Math.min(partition.height - 2, params.maxRoomSize) - params.minRoomSize))
            const roomX = partition.x + Math.floor(p.random() * (partition.width - roomWidth))
            const roomY = partition.y + Math.floor(p.random() * (partition.height - roomHeight))
            
            const room = { x: roomX, y: roomY, width: roomWidth, height: roomHeight }
            rooms.push(room)
            
            // Fill room in dungeon grid
            for (let x = roomX; x < roomX + roomWidth; x++) {
              for (let y = roomY; y < roomY + roomHeight; y++) {
                if (x >= 0 && x < params.gridSize && y >= 0 && y < params.gridSize) {
                  dungeon[y][x] = 1 // Floor
                }
              }
            }
          }
        }

        // Connect rooms with corridors
        for (let i = 1; i < rooms.length; i++) {
          const room1 = rooms[i - 1]
          const room2 = rooms[i]
          const corridor = connectRooms(room1, room2)
          corridors.push(corridor)
        }
      }

      const generateRandomRooms = () => {
        const roomCount = Math.floor(params.roomDensity * 20)
        
        for (let i = 0; i < roomCount; i++) {
          let attempts = 0
          while (attempts < 50) {
            const roomWidth = Math.floor(params.minRoomSize + p.random() * (params.maxRoomSize - params.minRoomSize))
            const roomHeight = Math.floor(params.minRoomSize + p.random() * (params.maxRoomSize - params.minRoomSize))
            const roomX = Math.floor(p.random() * (params.gridSize - roomWidth))
            const roomY = Math.floor(p.random() * (params.gridSize - roomHeight))
            
            // Check for overlap
            let overlaps = false
            for (let room of rooms) {
              if (roomX < room.x + room.width + 1 && roomX + roomWidth + 1 > room.x &&
                  roomY < room.y + room.height + 1 && roomY + roomHeight + 1 > room.y) {
                overlaps = true
                break
              }
            }
            
            if (!overlaps) {
              const room = { x: roomX, y: roomY, width: roomWidth, height: roomHeight }
              rooms.push(room)
              
              // Fill room
              for (let x = roomX; x < roomX + roomWidth; x++) {
                for (let y = roomY; y < roomY + roomHeight; y++) {
                  dungeon[y][x] = 1
                }
              }
              break
            }
            attempts++
          }
        }

        // Connect all rooms
        for (let i = 1; i < rooms.length; i++) {
          const room1 = rooms[i - 1]
          const room2 = rooms[i]
          const corridor = connectRooms(room1, room2)
          corridors.push(corridor)
        }
      }

      const generateMazeDungeon = () => {
        // Initialize all as walls
        for (let y = 0; y < params.gridSize; y++) {
          for (let x = 0; x < params.gridSize; x++) {
            dungeon[y][x] = 0
          }
        }

        // Recursive backtracking maze
        const visited = Array(params.gridSize).fill(null).map(() => Array(params.gridSize).fill(false))
        const stack = []
        
        // Start from (1, 1)
        let currentX = 1
        let currentY = 1
        dungeon[currentY][currentX] = 1
        visited[currentY][currentX] = true
        stack.push({ x: currentX, y: currentY })
        
        const directions = [[0, -2], [2, 0], [0, 2], [-2, 0]]
        
        while (stack.length > 0) {
          const neighbors = []
          
          for (let [dx, dy] of directions) {
            const newX = currentX + dx
            const newY = currentY + dy
            
            if (newX > 0 && newX < params.gridSize - 1 && 
                newY > 0 && newY < params.gridSize - 1 && 
                !visited[newY][newX]) {
              neighbors.push({ x: newX, y: newY, dx, dy })
            }
          }
          
          if (neighbors.length > 0) {
            const next = neighbors[Math.floor(p.random() * neighbors.length)]
            
            // Create path to next cell
            dungeon[currentY + next.dy / 2][currentX + next.dx / 2] = 1
            dungeon[next.y][next.x] = 1
            visited[next.y][next.x] = true
            
            stack.push({ x: currentX, y: currentY })
            currentX = next.x
            currentY = next.y
          } else {
            const prev = stack.pop()
            if (prev) {
              currentX = prev.x
              currentY = prev.y
            }
          }
        }
      }

      const connectRooms = (room1: Room, room2: Room): Corridor => {
        const x1 = room1.x + Math.floor(room1.width / 2)
        const y1 = room1.y + Math.floor(room1.height / 2)
        const x2 = room2.x + Math.floor(room2.width / 2)
        const y2 = room2.y + Math.floor(room2.height / 2)

        // Create L-shaped corridor
        // Horizontal first, then vertical
        for (let x = Math.min(x1, x2); x <= Math.max(x1, x2); x++) {
          for (let w = 0; w < params.corridorWidth; w++) {
            if (y1 + w >= 0 && y1 + w < params.gridSize) {
              dungeon[y1 + w][x] = 1
            }
          }
        }
        
        for (let y = Math.min(y1, y2); y <= Math.max(y1, y2); y++) {
          for (let w = 0; w < params.corridorWidth; w++) {
            if (x2 + w >= 0 && x2 + w < params.gridSize) {
              dungeon[y][x2 + w] = 1
            }
          }
        }

        return { x1, y1, x2, y2 }
      }

      p.draw = () => {
        p.background(40, 40, 45)
        
        const cellSize = Math.min(p.width / params.gridSize, p.height / params.gridSize)
        const offsetX = (p.width - params.gridSize * cellSize) / 2
        const offsetY = (p.height - params.gridSize * cellSize) / 2

        // Draw dungeon grid
        p.strokeWeight(0.5)
        for (let y = 0; y < params.gridSize; y++) {
          for (let x = 0; x < params.gridSize; x++) {
            const drawX = offsetX + x * cellSize
            const drawY = offsetY + y * cellSize
            
            if (dungeon[y][x] === 1) {
              p.fill(220, 220, 200) // Floor
              p.stroke(200, 200, 180)
            } else {
              p.fill(60, 60, 70) // Wall
              p.stroke(80, 80, 90)
            }
            
            p.rect(drawX, drawY, cellSize, cellSize)
          }
        }

        // Highlight rooms
        p.strokeWeight(2)
        p.stroke(100, 150, 255)
        p.noFill()
        for (let room of rooms) {
          const drawX = offsetX + room.x * cellSize
          const drawY = offsetY + room.y * cellSize
          p.rect(drawX, drawY, room.width * cellSize, room.height * cellSize)
        }
      }

      p.regenerateDungeon = () => {
        p.randomSeed(params.seed)
        generateDungeon()
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
      <h2>Dungeon Generation</h2>
      <p className="page-description">
        Build procedural dungeons using BSP, random placement, and maze algorithms for game environments.
      </p>

      <div className="controls">
        <div className="control-group">
          <label>Algorithm</label>
          <select
            value={params.algorithm}
            onChange={(e) => setParams({ ...params, algorithm: e.target.value })}
          >
            <option value="bsp">Binary Space Partitioning</option>
            <option value="random">Random Room Placement</option>
            <option value="maze">Maze Generation</option>
          </select>
        </div>

        <div className="control-group">
          <label>Grid Size: {params.gridSize}</label>
          <input
            type="range"
            min="20"
            max="80"
            value={params.gridSize}
            onChange={(e) => setParams({ ...params, gridSize: parseInt(e.target.value) })}
          />
        </div>

        <div className="control-group">
          <label>Min Room Size: {params.minRoomSize}</label>
          <input
            type="range"
            min="3"
            max="8"
            value={params.minRoomSize}
            onChange={(e) => setParams({ ...params, minRoomSize: parseInt(e.target.value) })}
          />
        </div>

        <div className="control-group">
          <label>Max Room Size: {params.maxRoomSize}</label>
          <input
            type="range"
            min="8"
            max="20"
            value={params.maxRoomSize}
            onChange={(e) => setParams({ ...params, maxRoomSize: parseInt(e.target.value) })}
          />
        </div>

        <div className="control-group">
          <label>Room Density: {params.roomDensity.toFixed(2)}</label>
          <input
            type="range"
            min="0.1"
            max="0.8"
            step="0.05"
            value={params.roomDensity}
            onChange={(e) => setParams({ ...params, roomDensity: parseFloat(e.target.value) })}
          />
        </div>

        <button className="reset-button" onClick={handleRegenerate}>
          Generate New Dungeon
        </button>
      </div>

      <div className="canvas-container">
        <div ref={sketchRef} />
      </div>

      <div className="info-panel">
        <h3>Dungeon Generation Algorithms</h3>
        <ul>
          <li><strong>BSP (Binary Space Partitioning):</strong> Recursively divide space into rooms</li>
          <li><strong>Random Placement:</strong> Place rooms randomly and connect them</li>
          <li><strong>Maze Generation:</strong> Create maze-like corridors using backtracking</li>
          <li><strong>Room Connection:</strong> A* pathfinding or simple L-shaped corridors</li>
          <li><strong>Cellular Automata:</strong> Natural cave-like structures</li>
        </ul>
        
        <h3>Game Development Applications</h3>
        <ul>
          <li><strong>Roguelike Games:</strong> Infinite dungeon exploration</li>
          <li><strong>RPG Dungeons:</strong> Structured level design</li>
          <li><strong>Puzzle Games:</strong> Maze and room-based challenges</li>
          <li><strong>Architecture:</strong> Building layout generation</li>
        </ul>
      </div>
    </div>
  )
}

export default DungeonGenerationPage