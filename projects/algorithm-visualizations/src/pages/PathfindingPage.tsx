import React, { useState } from 'react'
import PathfindingGrid from '../visualizers/PathfindingGrid'
import { createGrid, GridCell } from '../algorithms/pathfinding'

type PathfindingAlgorithm = 'astar' | 'greedy' | 'dijkstra';

const PathfindingPage: React.FC = () => {
  const [grid, setGrid] = useState(() => createGrid(20, 15));
  const [algorithm, setAlgorithm] = useState<PathfindingAlgorithm>('astar');
  const [isRunning, setIsRunning] = useState(false);
  const [start, setStart] = useState<GridCell | null>(null);
  const [end, setEnd] = useState<GridCell | null>(null);
  const [mode, setMode] = useState<'wall' | 'start' | 'end'>('wall');

  const algorithmInfo = {
    astar: {
      name: 'A* Search',
      timeComplexity: 'O(b^d)',
      spaceComplexity: 'O(b^d)',
      description: 'Uses both actual distance and heuristic to find the optimal path efficiently.',
    },
    greedy: {
      name: 'Greedy Best-First',
      timeComplexity: 'O(b^m)',
      spaceComplexity: 'O(b^m)',
      description: 'Uses only the heuristic to guide search, faster but not guaranteed optimal.',
    },
    dijkstra: {
      name: "Dijkstra's Algorithm",
      timeComplexity: 'O(V²)',
      spaceComplexity: 'O(V)',
      description: 'Guarantees the shortest path but explores more nodes than A*.',
    }
  };

  const handleCellClick = (cell: GridCell) => {
    if (isRunning) return;

    const newGrid = grid.map(row => [...row]);
    const targetCell = newGrid[cell.y][cell.x];

    if (mode === 'start') {
      // Clear previous start
      if (start) {
        newGrid[start.y][start.x].type = 'empty';
      }
      targetCell.type = 'start';
      setStart(targetCell);
    } else if (mode === 'end') {
      // Clear previous end
      if (end) {
        newGrid[end.y][end.x].type = 'empty';
      }
      targetCell.type = 'end';
      setEnd(targetCell);
    } else if (mode === 'wall') {
      targetCell.type = targetCell.type === 'wall' ? 'empty' : 'wall';
    }

    setGrid(newGrid);
  };

  const clearGrid = () => {
    if (isRunning) return;
    const newGrid = createGrid(20, 15);
    setGrid(newGrid);
    setStart(null);
    setEnd(null);
  };

  return (
    <div className="pathfinding-page">
      <header className="page-header">
        <h1>Pathfinding Algorithms</h1>
        <p className="page-description">
          Find optimal paths through grids using A*, Greedy Best-First, and Dijkstra's algorithms.
          Click to add walls, set start and end points, then watch the algorithms find paths.
        </p>
      </header>

      <div className="algorithm-info">
        <h3 style={{ color: 'var(--accent-green-bright)', marginBottom: '1rem' }}>
          {algorithmInfo[algorithm].name}
        </h3>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
          {algorithmInfo[algorithm].description}
        </p>
        
        <div className="complexity-info">
          <div className="complexity-item">
            <div className="complexity-label">Time Complexity</div>
            <div className="complexity-value">{algorithmInfo[algorithm].timeComplexity}</div>
          </div>
          <div className="complexity-item">
            <div className="complexity-label">Space Complexity</div>
            <div className="complexity-value">{algorithmInfo[algorithm].spaceComplexity}</div>
          </div>
        </div>
      </div>

      <div className="visualization-container">
        <div className="control-panel">
          <div className="control-group">
            <label className="control-label">Algorithm</label>
            <select
              value={algorithm}
              onChange={(e) => setAlgorithm(e.target.value as PathfindingAlgorithm)}
              disabled={isRunning}
              className="demo-button"
            >
              <option value="astar">A* Search</option>
              <option value="greedy">Greedy Best-First</option>
              <option value="dijkstra">Dijkstra's Algorithm</option>
            </select>
          </div>

          <div className="control-group">
            <label className="control-label">Mode</label>
            <div className="speed-control">
              {(['wall', 'start', 'end'] as const).map(m => (
                <button
                  key={m}
                  className={`speed-button ${mode === m ? 'active' : ''}`}
                  onClick={() => setMode(m)}
                  disabled={isRunning}
                >
                  {m.charAt(0).toUpperCase() + m.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <button
            className="action-button"
            onClick={() => console.log('Pathfinding...')}
            disabled={isRunning || !start || !end}
          >
            Find Path
          </button>
          
          <button
            className="demo-button"
            onClick={clearGrid}
            disabled={isRunning}
          >
            Clear Grid
          </button>
        </div>

        <PathfindingGrid
          grid={grid}
          onCellClick={handleCellClick}
        />
        
        <p style={{ color: 'var(--text-secondary)', marginTop: '1rem', textAlign: 'center' }}>
          Click cells to toggle walls, or select Start/End mode to place start and end points.
        </p>
      </div>

      <section style={{ marginTop: '3rem' }}>
        <h2 style={{ marginBottom: '2rem', color: 'var(--text-primary)' }}>Pathfinding Concepts</h2>
        
        <div className="concept-grid">
          <div className="concept-card">
            <h3>Heuristic Function</h3>
            <p>
              A heuristic estimates the cost from current position to goal. Manhattan distance 
              is commonly used for grid-based pathfinding where only 4-directional movement is allowed.
            </p>
          </div>
          
          <div className="concept-card">
            <h3>A* Algorithm</h3>
            <p>
              Combines actual distance (g-cost) and heuristic (h-cost) to find optimal paths efficiently. 
              The f-cost (g + h) guides the search toward the goal.
            </p>
          </div>
          
          <div className="concept-card">
            <h3>Open vs Closed Sets</h3>
            <p>
              Open set contains nodes to be evaluated. Closed set contains nodes already evaluated. 
              This prevents revisiting nodes and ensures termination.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PathfindingPage;