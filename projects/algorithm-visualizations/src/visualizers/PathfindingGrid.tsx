import React, { useRef, useEffect } from 'react'
import { Grid, GridCell } from '../algorithms/pathfinding'

interface PathfindingGridProps {
  grid: Grid;
  visitedCells?: GridCell[];
  currentPath?: GridCell[];
  openSet?: GridCell[];
  closedSet?: GridCell[];
  width?: number;
  height?: number;
  onCellClick?: (cell: GridCell) => void;
}

const PathfindingGrid: React.FC<PathfindingGridProps> = ({
  grid,
  visitedCells = [],
  currentPath = [],
  openSet = [],
  closedSet = [],
  width = 800,
  height = 350,
  onCellClick
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    if (grid.length === 0) return;

    const gridHeight = grid.length;
    const gridWidth = grid[0].length;
    const cellWidth = (width - 40) / gridWidth;
    const cellHeight = (height - 80) / gridHeight;

    // Draw grid cells
    for (let y = 0; y < gridHeight; y++) {
      for (let x = 0; x < gridWidth; x++) {
        const cell = grid[y][x];
        const screenX = 20 + x * cellWidth;
        const screenY = 40 + y * cellHeight;

        // Determine cell color
        let fillColor = '#0a0f0d'; // Default empty cell
        
        if (cell.type === 'wall') {
          fillColor = '#a8bdb2';
        } else if (cell.type === 'start') {
          fillColor = '#4ade80';
        } else if (cell.type === 'end') {
          fillColor = '#f87171';
        } else if (currentPath.includes(cell)) {
          fillColor = '#fbbf24'; // Yellow for final path
        } else if (closedSet.includes(cell)) {
          fillColor = 'rgba(74, 222, 128, 0.6)'; // Light green for closed set
        } else if (openSet.includes(cell)) {
          fillColor = 'rgba(251, 191, 36, 0.6)'; // Light yellow for open set
        } else if (visitedCells.includes(cell)) {
          fillColor = 'rgba(74, 222, 128, 0.3)'; // Very light green for visited
        }

        // Draw cell
        ctx.fillStyle = fillColor;
        ctx.fillRect(screenX, screenY, cellWidth, cellHeight);

        // Draw cell border
        ctx.strokeStyle = '#1a5d3a';
        ctx.lineWidth = 0.5;
        ctx.strokeRect(screenX, screenY, cellWidth, cellHeight);

        // Draw f-cost for pathfinding algorithms
        if (cell.fCost !== undefined && cell.fCost !== Infinity && cellWidth > 30) {
          ctx.fillStyle = '#f0f4f2';
          ctx.font = '10px Inter';
          ctx.textAlign = 'center';
          
          // Show g-cost (top-left), h-cost (top-right), f-cost (bottom)
          if (cell.gCost !== undefined && cell.gCost !== Infinity) {
            ctx.textAlign = 'left';
            ctx.fillText(cell.gCost.toFixed(0), screenX + 2, screenY + 10);
          }
          
          if (cell.hCost !== undefined) {
            ctx.textAlign = 'right';
            ctx.fillText(cell.hCost.toFixed(0), screenX + cellWidth - 2, screenY + 10);
          }
          
          ctx.textAlign = 'center';
          ctx.font = 'bold 12px Inter';
          ctx.fillText(cell.fCost.toFixed(0), screenX + cellWidth / 2, screenY + cellHeight - 4);
        }

        // Draw coordinates for larger cells
        if (cellWidth > 40 && cellHeight > 40) {
          ctx.fillStyle = '#8fa99b';
          ctx.font = '8px Inter';
          ctx.textAlign = 'center';
          ctx.fillText(`${x},${y}`, screenX + cellWidth / 2, screenY + cellHeight / 2 + 2);
        }
      }
    }

    // Draw legend
    drawLegend(ctx);

  }, [grid, visitedCells, currentPath, openSet, closedSet, width, height]);

  const drawLegend = (ctx: CanvasRenderingContext2D) => {
    const legendItems = [
      { color: '#0a0f0d', label: 'Empty' },
      { color: '#a8bdb2', label: 'Wall' },
      { color: '#4ade80', label: 'Start' },
      { color: '#f87171', label: 'End' },
      { color: 'rgba(251, 191, 36, 0.6)', label: 'Open Set' },
      { color: 'rgba(74, 222, 128, 0.6)', label: 'Closed Set' },
      { color: '#fbbf24', label: 'Path' }
    ];

    ctx.font = '12px Inter';
    ctx.textAlign = 'left';

    legendItems.forEach((item, index) => {
      const x = 20 + (index % 4) * 150;
      const y = index < 4 ? 15 : height - 15;

      ctx.fillStyle = item.color;
      ctx.fillRect(x, y - 8, 12, 12);
      
      ctx.strokeStyle = '#1a5d3a';
      ctx.lineWidth = 0.5;
      ctx.strokeRect(x, y - 8, 12, 12);

      ctx.fillStyle = '#f0f4f2';
      ctx.fillText(item.label, x + 18, y + 2);
    });
  };

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!onCellClick || grid.length === 0) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;

    const gridHeight = grid.length;
    const gridWidth = grid[0].length;
    const cellWidth = (width - 40) / gridWidth;
    const cellHeight = (height - 80) / gridHeight;

    const gridX = Math.floor((clickX - 20) / cellWidth);
    const gridY = Math.floor((clickY - 40) / cellHeight);

    if (gridX >= 0 && gridX < gridWidth && gridY >= 0 && gridY < gridHeight) {
      onCellClick(grid[gridY][gridX]);
    }
  };

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="visualization-canvas"
      style={{ 
        border: '1px solid var(--border-primary)',
        borderRadius: '4px',
        background: 'rgba(15, 25, 20, 0.3)',
        cursor: onCellClick ? 'pointer' : 'default'
      }}
      onClick={handleCanvasClick}
    />
  );
};

export default PathfindingGrid;