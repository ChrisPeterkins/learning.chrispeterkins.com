import React, { useRef, useEffect } from 'react'
import { Graph, GraphNode, GraphEdge } from '../algorithms/graph'

interface GraphVisualizerProps {
  graph: Graph;
  currentNode?: string;
  visitedNodes?: string[];
  exploringEdge?: { from: string; to: string };
  distances?: Map<string, number>;
  width?: number;
  height?: number;
}

const GraphVisualizer: React.FC<GraphVisualizerProps> = ({
  graph,
  currentNode,
  visitedNodes = [],
  exploringEdge,
  distances,
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

    // Draw edges first (so nodes appear on top)
    drawEdges(ctx, graph, exploringEdge);
    
    // Draw nodes
    drawNodes(ctx, graph, currentNode, visitedNodes, distances);

    // Draw legend
    drawLegend(ctx);

  }, [graph, currentNode, visitedNodes, exploringEdge, distances, width, height]);

  const drawEdges = (
    ctx: CanvasRenderingContext2D, 
    graph: Graph, 
    exploringEdge?: { from: string; to: string }
  ) => {
    graph.edges.forEach(edge => {
      const fromNode = graph.nodes.get(edge.from);
      const toNode = graph.nodes.get(edge.to);
      
      if (!fromNode || !toNode) return;

      const isExploring = exploringEdge && 
        ((exploringEdge.from === edge.from && exploringEdge.to === edge.to) ||
         (exploringEdge.from === edge.to && exploringEdge.to === edge.from));

      // Line style
      ctx.strokeStyle = isExploring ? '#4ade80' : 'rgba(168, 189, 178, 0.6)';
      ctx.lineWidth = isExploring ? 3 : 2;

      // Draw line
      ctx.beginPath();
      ctx.moveTo(fromNode.x, fromNode.y);
      ctx.lineTo(toNode.x, toNode.y);
      ctx.stroke();

      // Draw weight if specified
      if (edge.weight !== undefined) {
        const midX = (fromNode.x + toNode.x) / 2;
        const midY = (fromNode.y + toNode.y) / 2;

        // Background for weight label
        ctx.fillStyle = 'rgba(15, 25, 20, 0.8)';
        ctx.fillRect(midX - 12, midY - 10, 24, 20);
        
        ctx.strokeStyle = 'var(--border-primary)';
        ctx.lineWidth = 1;
        ctx.strokeRect(midX - 12, midY - 10, 24, 20);

        // Weight text
        ctx.fillStyle = '#f0f4f2';
        ctx.font = '12px Inter';
        ctx.textAlign = 'center';
        ctx.fillText(edge.weight.toString(), midX, midY + 3);
      }
    });
  };

  const drawNodes = (
    ctx: CanvasRenderingContext2D,
    graph: Graph,
    currentNode?: string,
    visitedNodes: string[] = [],
    distances?: Map<string, number>
  ) => {
    graph.nodes.forEach((node, nodeId) => {
      const isCurrent = currentNode === nodeId;
      const isVisited = visitedNodes.includes(nodeId);

      // Determine node color
      let fillColor = '#1a5d3a'; // Default green
      let strokeColor = '#4ade80';

      if (isCurrent) {
        fillColor = '#fbbf24'; // Yellow for current
        strokeColor = '#f59e0b';
      } else if (isVisited) {
        fillColor = '#4ade80'; // Bright green for visited
        strokeColor = '#22c55e';
      }

      // Draw node circle
      ctx.fillStyle = fillColor;
      ctx.beginPath();
      ctx.arc(node.x, node.y, 20, 0, 2 * Math.PI);
      ctx.fill();

      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw node label
      ctx.fillStyle = '#f0f4f2';
      ctx.font = '14px Inter';
      ctx.textAlign = 'center';
      ctx.fillText(nodeId, node.x, node.y + 4);

      // Draw distance if available
      if (distances && distances.has(nodeId)) {
        const distance = distances.get(nodeId)!;
        const distanceText = distance === Infinity ? '∞' : distance.toString();
        
        ctx.fillStyle = 'rgba(15, 25, 20, 0.9)';
        ctx.fillRect(node.x - 15, node.y - 40, 30, 20);
        
        ctx.strokeStyle = '#4ade80';
        ctx.lineWidth = 1;
        ctx.strokeRect(node.x - 15, node.y - 40, 30, 20);

        ctx.fillStyle = '#4ade80';
        ctx.font = '11px Inter';
        ctx.fillText(distanceText, node.x, node.y - 27);
      }
    });
  };

  const drawLegend = (ctx: CanvasRenderingContext2D) => {
    const legendItems = [
      { color: '#1a5d3a', strokeColor: '#4ade80', label: 'Unvisited' },
      { color: '#fbbf24', strokeColor: '#f59e0b', label: 'Current' },
      { color: '#4ade80', strokeColor: '#22c55e', label: 'Visited' }
    ];

    ctx.font = '14px Inter';
    ctx.textAlign = 'left';

    legendItems.forEach((item, index) => {
      const x = 20 + index * 120;
      const y = 25;

      // Draw legend node
      ctx.fillStyle = item.color;
      ctx.beginPath();
      ctx.arc(x + 10, y, 8, 0, 2 * Math.PI);
      ctx.fill();

      ctx.strokeStyle = item.strokeColor;
      ctx.lineWidth = 1;
      ctx.stroke();

      // Draw legend label
      ctx.fillStyle = '#f0f4f2';
      ctx.fillText(item.label, x + 25, y + 4);
    });
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
        background: 'rgba(15, 25, 20, 0.3)'
      }}
    />
  );
};

export default GraphVisualizer;