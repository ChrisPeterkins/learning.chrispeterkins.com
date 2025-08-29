// Pathfinding algorithms for grid-based navigation

export interface GridCell {
  x: number;
  y: number;
  type: 'empty' | 'wall' | 'start' | 'end';
  gCost?: number;  // Distance from start
  hCost?: number;  // Heuristic distance to end
  fCost?: number;  // Total cost (g + h)
  parent?: GridCell | null;
  visited?: boolean;
}

export interface PathfindingStep {
  type: 'explore' | 'visit' | 'path' | 'complete';
  cell?: GridCell;
  openSet?: GridCell[];
  closedSet?: GridCell[];
  currentPath?: GridCell[];
  message: string;
}

export type Grid = GridCell[][];

export function createGrid(width: number, height: number): Grid {
  const grid: Grid = [];
  
  for (let y = 0; y < height; y++) {
    const row: GridCell[] = [];
    for (let x = 0; x < width; x++) {
      row.push({
        x,
        y,
        type: 'empty',
        gCost: Infinity,
        hCost: 0,
        fCost: Infinity,
        parent: null,
        visited: false
      });
    }
    grid.push(row);
  }
  
  return grid;
}

export function getNeighbors(grid: Grid, cell: GridCell): GridCell[] {
  const neighbors: GridCell[] = [];
  const { x, y } = cell;
  const height = grid.length;
  const width = grid[0].length;

  // 4-directional movement (up, down, left, right)
  const directions = [
    { dx: 0, dy: -1 }, // up
    { dx: 0, dy: 1 },  // down
    { dx: -1, dy: 0 }, // left
    { dx: 1, dy: 0 }   // right
  ];

  for (const { dx, dy } of directions) {
    const newX = x + dx;
    const newY = y + dy;

    if (newX >= 0 && newX < width && newY >= 0 && newY < height) {
      const neighbor = grid[newY][newX];
      if (neighbor.type !== 'wall') {
        neighbors.push(neighbor);
      }
    }
  }

  return neighbors;
}

export function manhattanDistance(a: GridCell, b: GridCell): number {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

export function euclideanDistance(a: GridCell, b: GridCell): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

export async function aStar(
  grid: Grid,
  start: GridCell,
  end: GridCell,
  onStep?: (step: PathfindingStep) => Promise<void>
): Promise<GridCell[] | null> {
  // Reset grid
  for (const row of grid) {
    for (const cell of row) {
      cell.gCost = Infinity;
      cell.hCost = 0;
      cell.fCost = Infinity;
      cell.parent = null;
      cell.visited = false;
    }
  }

  const openSet: GridCell[] = [];
  const closedSet: GridCell[] = [];

  start.gCost = 0;
  start.hCost = manhattanDistance(start, end);
  start.fCost = start.gCost + start.hCost;
  openSet.push(start);

  while (openSet.length > 0) {
    // Find node with lowest fCost
    let current = openSet[0];
    let currentIndex = 0;

    for (let i = 1; i < openSet.length; i++) {
      if (openSet[i].fCost! < current.fCost! || 
          (openSet[i].fCost! === current.fCost! && openSet[i].hCost! < current.hCost!)) {
        current = openSet[i];
        currentIndex = i;
      }
    }

    // Move current from open to closed set
    openSet.splice(currentIndex, 1);
    closedSet.push(current);
    current.visited = true;

    if (onStep) {
      await onStep({
        type: 'visit',
        cell: current,
        openSet: [...openSet],
        closedSet: [...closedSet],
        message: `Exploring cell (${current.x}, ${current.y}) with f-cost ${current.fCost?.toFixed(1)}`
      });
    }

    // Check if we reached the goal
    if (current === end) {
      const path = reconstructPath(current);
      
      if (onStep) {
        await onStep({
          type: 'complete',
          currentPath: path,
          message: `Path found! Length: ${path.length - 1} steps`
        });
      }
      
      return path;
    }

    // Explore neighbors
    const neighbors = getNeighbors(grid, current);
    
    for (const neighbor of neighbors) {
      // Skip if in closed set
      if (closedSet.includes(neighbor)) continue;

      const tentativeGCost = current.gCost! + 1; // Cost of moving to adjacent cell

      // If this path to neighbor is better than any previous one
      if (tentativeGCost < neighbor.gCost!) {
        neighbor.parent = current;
        neighbor.gCost = tentativeGCost;
        neighbor.hCost = manhattanDistance(neighbor, end);
        neighbor.fCost = neighbor.gCost + neighbor.hCost;

        if (!openSet.includes(neighbor)) {
          openSet.push(neighbor);
          
          if (onStep) {
            await onStep({
              type: 'explore',
              cell: neighbor,
              openSet: [...openSet],
              closedSet: [...closedSet],
              message: `Added (${neighbor.x}, ${neighbor.y}) to open set with f-cost ${neighbor.fCost.toFixed(1)}`
            });
          }
        }
      }
    }
  }

  if (onStep) {
    await onStep({
      type: 'complete',
      message: 'No path found to target!'
    });
  }

  return null; // No path found
}

export async function greedyBestFirst(
  grid: Grid,
  start: GridCell,
  end: GridCell,
  onStep?: (step: PathfindingStep) => Promise<void>
): Promise<GridCell[] | null> {
  // Reset grid
  for (const row of grid) {
    for (const cell of row) {
      cell.gCost = Infinity;
      cell.hCost = 0;
      cell.fCost = Infinity;
      cell.parent = null;
      cell.visited = false;
    }
  }

  const openSet: GridCell[] = [];
  const closedSet: GridCell[] = [];

  start.hCost = manhattanDistance(start, end);
  start.fCost = start.hCost;
  openSet.push(start);

  while (openSet.length > 0) {
    // Find node with lowest heuristic cost
    let current = openSet[0];
    let currentIndex = 0;

    for (let i = 1; i < openSet.length; i++) {
      if (openSet[i].hCost! < current.hCost!) {
        current = openSet[i];
        currentIndex = i;
      }
    }

    // Move current from open to closed set
    openSet.splice(currentIndex, 1);
    closedSet.push(current);
    current.visited = true;

    if (onStep) {
      await onStep({
        type: 'visit',
        cell: current,
        openSet: [...openSet],
        closedSet: [...closedSet],
        message: `Exploring cell (${current.x}, ${current.y}) with h-cost ${current.hCost?.toFixed(1)}`
      });
    }

    // Check if we reached the goal
    if (current === end) {
      const path = reconstructPath(current);
      
      if (onStep) {
        await onStep({
          type: 'complete',
          currentPath: path,
          message: `Path found! Length: ${path.length - 1} steps`
        });
      }
      
      return path;
    }

    // Explore neighbors
    const neighbors = getNeighbors(grid, current);
    
    for (const neighbor of neighbors) {
      // Skip if in closed set or already in open set
      if (closedSet.includes(neighbor) || openSet.includes(neighbor)) continue;

      neighbor.parent = current;
      neighbor.hCost = manhattanDistance(neighbor, end);
      neighbor.fCost = neighbor.hCost;
      openSet.push(neighbor);

      if (onStep) {
        await onStep({
          type: 'explore',
          cell: neighbor,
          openSet: [...openSet],
          closedSet: [...closedSet],
          message: `Added (${neighbor.x}, ${neighbor.y}) to open set with h-cost ${neighbor.hCost.toFixed(1)}`
        });
      }
    }
  }

  if (onStep) {
    await onStep({
      type: 'complete',
      message: 'No path found to target!'
    });
  }

  return null;
}

export async function dijkstraGrid(
  grid: Grid,
  start: GridCell,
  end: GridCell,
  onStep?: (step: PathfindingStep) => Promise<void>
): Promise<GridCell[] | null> {
  // Reset grid
  for (const row of grid) {
    for (const cell of row) {
      cell.gCost = Infinity;
      cell.hCost = 0;
      cell.fCost = Infinity;
      cell.parent = null;
      cell.visited = false;
    }
  }

  const unvisited: GridCell[] = [];
  
  // Add all walkable cells to unvisited
  for (const row of grid) {
    for (const cell of row) {
      if (cell.type !== 'wall') {
        unvisited.push(cell);
      }
    }
  }

  start.gCost = 0;
  start.fCost = 0;

  while (unvisited.length > 0) {
    // Find unvisited node with minimum distance
    let current = unvisited[0];
    let currentIndex = 0;

    for (let i = 1; i < unvisited.length; i++) {
      if (unvisited[i].gCost! < current.gCost!) {
        current = unvisited[i];
        currentIndex = i;
      }
    }

    // If we can't reach any more nodes, break
    if (current.gCost === Infinity) break;

    // Remove current from unvisited
    unvisited.splice(currentIndex, 1);
    current.visited = true;

    if (onStep) {
      await onStep({
        type: 'visit',
        cell: current,
        message: `Visiting cell (${current.x}, ${current.y}) with distance ${current.gCost}`
      });
    }

    // Check if we reached the goal
    if (current === end) {
      const path = reconstructPath(current);
      
      if (onStep) {
        await onStep({
          type: 'complete',
          currentPath: path,
          message: `Shortest path found! Length: ${path.length - 1} steps`
        });
      }
      
      return path;
    }

    // Update distances to neighbors
    const neighbors = getNeighbors(grid, current);
    
    for (const neighbor of neighbors) {
      if (unvisited.includes(neighbor)) {
        const newDistance = current.gCost! + 1;

        if (newDistance < neighbor.gCost!) {
          neighbor.gCost = newDistance;
          neighbor.fCost = newDistance;
          neighbor.parent = current;

          if (onStep) {
            await onStep({
              type: 'explore',
              cell: neighbor,
              message: `Updated distance to (${neighbor.x}, ${neighbor.y}): ${newDistance}`
            });
          }
        }
      }
    }
  }

  if (onStep) {
    await onStep({
      type: 'complete',
      message: 'No path found to target!'
    });
  }

  return null;
}

function reconstructPath(endCell: GridCell): GridCell[] {
  const path: GridCell[] = [];
  let current: GridCell | null = endCell;

  while (current !== null) {
    path.unshift(current);
    current = current.parent;
  }

  return path;
}

// Generate a sample grid with some walls
export function generateSampleGrid(width: number, height: number): {
  grid: Grid;
  start: GridCell;
  end: GridCell;
} {
  const grid = createGrid(width, height);
  
  // Add some random walls
  for (let i = 0; i < width * height * 0.3; i++) {
    const x = Math.floor(Math.random() * width);
    const y = Math.floor(Math.random() * height);
    grid[y][x].type = 'wall';
  }
  
  // Set start and end positions
  const start = grid[0][0];
  const end = grid[height - 1][width - 1];
  
  start.type = 'start';
  end.type = 'end';
  
  return { grid, start, end };
}