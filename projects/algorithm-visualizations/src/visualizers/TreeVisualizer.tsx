import React, { useRef, useEffect } from 'react'
import { TreeNode, BinarySearchTree } from '../algorithms/trees'

interface TreeVisualizerProps {
  tree: BinarySearchTree;
  currentNode?: TreeNode;
  traversalOrder?: number[];
  width?: number;
  height?: number;
}

const TreeVisualizer: React.FC<TreeVisualizerProps> = ({
  tree,
  currentNode,
  traversalOrder = [],
  width = 800,
  height = 400
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    if (!tree.root) {
      ctx.fillStyle = '#8fa99b';
      ctx.font = '16px Inter';
      ctx.textAlign = 'center';
      ctx.fillText('Empty Tree', width / 2, height / 2);
      return;
    }

    // Calculate node positions
    const positions = tree.calculatePositions(width, height - 40);

    // Draw edges first
    drawEdges(ctx, tree.root, positions);
    
    // Draw nodes
    drawNodes(ctx, tree.root, positions, currentNode, traversalOrder);

    // Draw traversal order
    if (traversalOrder.length > 0) {
      drawTraversalOrder(ctx, traversalOrder);
    }

    // Draw legend
    drawLegend(ctx);

  }, [tree, currentNode, traversalOrder, width, height]);

  const drawEdges = (
    ctx: CanvasRenderingContext2D,
    node: TreeNode | null,
    positions: Map<TreeNode, { x: number, y: number }>
  ) => {
    if (!node) return;

    const nodePos = positions.get(node);
    if (!nodePos) return;

    ctx.strokeStyle = 'rgba(168, 189, 178, 0.6)';
    ctx.lineWidth = 2;

    // Draw line to left child
    if (node.left) {
      const leftPos = positions.get(node.left);
      if (leftPos) {
        ctx.beginPath();
        ctx.moveTo(nodePos.x, nodePos.y);
        ctx.lineTo(leftPos.x, leftPos.y);
        ctx.stroke();
      }
      drawEdges(ctx, node.left, positions);
    }

    // Draw line to right child
    if (node.right) {
      const rightPos = positions.get(node.right);
      if (rightPos) {
        ctx.beginPath();
        ctx.moveTo(nodePos.x, nodePos.y);
        ctx.lineTo(rightPos.x, rightPos.y);
        ctx.stroke();
      }
      drawEdges(ctx, node.right, positions);
    }
  };

  const drawNodes = (
    ctx: CanvasRenderingContext2D,
    node: TreeNode | null,
    positions: Map<TreeNode, { x: number, y: number }>,
    currentNode?: TreeNode,
    traversalOrder: number[] = []
  ) => {
    if (!node) return;

    const nodePos = positions.get(node);
    if (!nodePos) return;

    // Determine node color based on state
    let fillColor = '#1a5d3a'; // Default green
    let strokeColor = '#4ade80';

    if (node === currentNode) {
      fillColor = '#fbbf24'; // Yellow for current
      strokeColor = '#f59e0b';
    } else if (node.visited) {
      fillColor = '#4ade80'; // Bright green for visited
      strokeColor = '#22c55e';
    } else if (node.processing) {
      fillColor = '#8b5cf6'; // Purple for processing
      strokeColor = '#a855f7';
    }

    // Draw node circle
    ctx.fillStyle = fillColor;
    ctx.beginPath();
    ctx.arc(nodePos.x, nodePos.y, 25, 0, 2 * Math.PI);
    ctx.fill();

    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw node value
    ctx.fillStyle = '#f0f4f2';
    ctx.font = 'bold 14px Inter';
    ctx.textAlign = 'center';
    ctx.fillText(node.value.toString(), nodePos.x, nodePos.y + 5);

    // Draw traversal order number if visited
    const orderIndex = traversalOrder.indexOf(node.value);
    if (orderIndex !== -1) {
      ctx.fillStyle = 'rgba(15, 25, 20, 0.9)';
      ctx.beginPath();
      ctx.arc(nodePos.x + 20, nodePos.y - 20, 12, 0, 2 * Math.PI);
      ctx.fill();

      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = '#f0f4f2';
      ctx.font = 'bold 10px Inter';
      ctx.fillText((orderIndex + 1).toString(), nodePos.x + 20, nodePos.y - 16);
    }

    // Recursively draw child nodes
    drawNodes(ctx, node.left, positions, currentNode, traversalOrder);
    drawNodes(ctx, node.right, positions, currentNode, traversalOrder);
  };

  const drawTraversalOrder = (ctx: CanvasRenderingContext2D, order: number[]) => {
    if (order.length === 0) return;

    ctx.fillStyle = '#f0f4f2';
    ctx.font = '14px Inter';
    ctx.textAlign = 'left';
    ctx.fillText('Traversal Order:', 20, height - 45);

    const orderText = order.join(' → ');
    ctx.font = 'bold 16px Inter';
    ctx.fillStyle = '#4ade80';
    ctx.fillText(orderText, 20, height - 20);
  };

  const drawLegend = (ctx: CanvasRenderingContext2D) => {
    const legendItems = [
      { color: '#1a5d3a', strokeColor: '#4ade80', label: 'Unvisited' },
      { color: '#8b5cf6', strokeColor: '#a855f7', label: 'Processing' },
      { color: '#fbbf24', strokeColor: '#f59e0b', label: 'Current' },
      { color: '#4ade80', strokeColor: '#22c55e', label: 'Visited' }
    ];

    ctx.font = '12px Inter';
    ctx.textAlign = 'left';

    legendItems.forEach((item, index) => {
      const x = width - 400 + (index % 2) * 120;
      const y = 20 + Math.floor(index / 2) * 25;

      // Draw legend node
      ctx.fillStyle = item.color;
      ctx.beginPath();
      ctx.arc(x + 8, y, 6, 0, 2 * Math.PI);
      ctx.fill();

      ctx.strokeStyle = item.strokeColor;
      ctx.lineWidth = 1;
      ctx.stroke();

      // Draw legend label
      ctx.fillStyle = '#f0f4f2';
      ctx.fillText(item.label, x + 20, y + 4);
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

export default TreeVisualizer;