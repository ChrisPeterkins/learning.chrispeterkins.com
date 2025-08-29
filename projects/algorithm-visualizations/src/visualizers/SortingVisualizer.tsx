import React, { useRef, useEffect } from 'react'

interface SortingVisualizerProps {
  array: number[];
  comparingIndices: number[];
  swappingIndices: number[];
  sortedIndices: number[];
  width?: number;
  height?: number;
}

const SortingVisualizer: React.FC<SortingVisualizerProps> = ({
  array,
  comparingIndices,
  swappingIndices,
  sortedIndices,
  width = 800,
  height = 350
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    if (array.length === 0) return;

    // Calculate dimensions
    const maxValue = Math.max(...array);
    const barWidth = Math.max(1, (width - 40) / array.length);
    const barSpacing = Math.min(2, barWidth * 0.1);
    const maxBarHeight = height - 60;

    // Set font for values
    ctx.font = '12px Inter';
    ctx.textAlign = 'center';

    array.forEach((value, index) => {
      const barHeight = (value / maxValue) * maxBarHeight;
      const x = 20 + index * (barWidth + barSpacing);
      const y = height - 30 - barHeight;

      // Determine bar color based on state
      let color = '#1a5d3a'; // Default green
      if (sortedIndices.includes(index)) {
        color = '#4ade80'; // Bright green for sorted
      } else if (swappingIndices.includes(index)) {
        color = '#f87171'; // Red for swapping
      } else if (comparingIndices.includes(index)) {
        color = '#fbbf24'; // Yellow for comparing
      }

      // Draw bar
      ctx.fillStyle = color;
      ctx.fillRect(x, y, barWidth, barHeight);

      // Draw border
      ctx.strokeStyle = '#a8bdb2';
      ctx.lineWidth = 1;
      ctx.strokeRect(x, y, barWidth, barHeight);

      // Draw value on top of bar if there's space
      if (barWidth > 15) {
        ctx.fillStyle = '#f0f4f2';
        ctx.fillText(value.toString(), x + barWidth / 2, y - 5);
      }

      // Draw index at bottom
      if (barWidth > 10) {
        ctx.fillStyle = '#8fa99b';
        ctx.font = '10px Inter';
        ctx.fillText(index.toString(), x + barWidth / 2, height - 10);
        ctx.font = '12px Inter';
      }
    });

    // Draw legend
    ctx.font = '14px Inter';
    ctx.textAlign = 'left';
    
    const legendItems = [
      { color: '#1a5d3a', label: 'Unsorted' },
      { color: '#fbbf24', label: 'Comparing' },
      { color: '#f87171', label: 'Swapping' },
      { color: '#4ade80', label: 'Sorted' }
    ];

    legendItems.forEach((item, index) => {
      const x = 20 + index * 120;
      const y = 25;

      ctx.fillStyle = item.color;
      ctx.fillRect(x, y - 10, 15, 15);
      
      ctx.strokeStyle = '#a8bdb2';
      ctx.strokeRect(x, y - 10, 15, 15);

      ctx.fillStyle = '#f0f4f2';
      ctx.fillText(item.label, x + 20, y);
    });

  }, [array, comparingIndices, swappingIndices, sortedIndices, width, height]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="visualization-canvas"
      style={{ 
        border: '1px solid var(--border-primary)',
        borderRadius: '4px',
        background: 'rgba(15, 25, 20, 0.3)'
      }}
    />
  );
};

export default SortingVisualizer;