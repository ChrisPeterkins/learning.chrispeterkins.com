// Graph algorithm implementations

export interface GraphNode {
  id: string;
  x: number;
  y: number;
  visited?: boolean;
  distance?: number;
  previous?: string | null;
}

export interface GraphEdge {
  from: string;
  to: string;
  weight?: number;
}

export interface Graph {
  nodes: Map<string, GraphNode>;
  edges: GraphEdge[];
  adjacencyList: Map<string, string[]>;
}

export interface GraphStep {
  type: 'visit' | 'explore' | 'backtrack' | 'complete' | 'updateDistance';
  nodeId?: string;
  edgeFrom?: string;
  edgeTo?: string;
  message: string;
  currentQueue?: string[];
  distances?: Map<string, number>;
}

export function createGraph(nodes: GraphNode[], edges: GraphEdge[]): Graph {
  const nodeMap = new Map<string, GraphNode>();
  const adjacencyList = new Map<string, string[]>();

  // Initialize nodes
  nodes.forEach(node => {
    nodeMap.set(node.id, { ...node, visited: false, distance: Infinity, previous: null });
    adjacencyList.set(node.id, []);
  });

  // Build adjacency list
  edges.forEach(edge => {
    adjacencyList.get(edge.from)?.push(edge.to);
    // For undirected graphs, add reverse edge
    adjacencyList.get(edge.to)?.push(edge.from);
  });

  return {
    nodes: nodeMap,
    edges,
    adjacencyList
  };
}

export async function depthFirstSearch(
  graph: Graph,
  startNodeId: string,
  onStep?: (step: GraphStep, graph: Graph) => Promise<void>
): Promise<string[]> {
  const visited: string[] = [];
  const stack: string[] = [startNodeId];

  // Reset all nodes
  graph.nodes.forEach(node => {
    node.visited = false;
  });

  while (stack.length > 0) {
    const currentId = stack.pop()!;
    const currentNode = graph.nodes.get(currentId)!;

    if (!currentNode.visited) {
      currentNode.visited = true;
      visited.push(currentId);

      if (onStep) {
        await onStep({
          type: 'visit',
          nodeId: currentId,
          message: `Visiting node ${currentId}`,
          currentQueue: [...stack]
        }, graph);
      }

      // Add unvisited neighbors to stack
      const neighbors = graph.adjacencyList.get(currentId) || [];
      for (const neighborId of neighbors.reverse()) {
        const neighbor = graph.nodes.get(neighborId)!;
        if (!neighbor.visited && !stack.includes(neighborId)) {
          stack.push(neighborId);

          if (onStep) {
            await onStep({
              type: 'explore',
              edgeFrom: currentId,
              edgeTo: neighborId,
              message: `Exploring edge from ${currentId} to ${neighborId}`,
              currentQueue: [...stack]
            }, graph);
          }
        }
      }
    }
  }

  if (onStep) {
    await onStep({
      type: 'complete',
      message: `DFS completed. Visited order: ${visited.join(' → ')}`,
      currentQueue: []
    }, graph);
  }

  return visited;
}

export async function breadthFirstSearch(
  graph: Graph,
  startNodeId: string,
  onStep?: (step: GraphStep, graph: Graph) => Promise<void>
): Promise<string[]> {
  const visited: string[] = [];
  const queue: string[] = [startNodeId];

  // Reset all nodes
  graph.nodes.forEach(node => {
    node.visited = false;
  });

  const startNode = graph.nodes.get(startNodeId)!;
  startNode.visited = true;

  while (queue.length > 0) {
    const currentId = queue.shift()!;
    visited.push(currentId);

    if (onStep) {
      await onStep({
        type: 'visit',
        nodeId: currentId,
        message: `Visiting node ${currentId}`,
        currentQueue: [...queue]
      }, graph);
    }

    // Add unvisited neighbors to queue
    const neighbors = graph.adjacencyList.get(currentId) || [];
    for (const neighborId of neighbors) {
      const neighbor = graph.nodes.get(neighborId)!;
      if (!neighbor.visited) {
        neighbor.visited = true;
        queue.push(neighborId);

        if (onStep) {
          await onStep({
            type: 'explore',
            edgeFrom: currentId,
            edgeTo: neighborId,
            message: `Adding ${neighborId} to queue`,
            currentQueue: [...queue]
          }, graph);
        }
      }
    }
  }

  if (onStep) {
    await onStep({
      type: 'complete',
      message: `BFS completed. Visited order: ${visited.join(' → ')}`,
      currentQueue: []
    }, graph);
  }

  return visited;
}

export async function dijkstraAlgorithm(
  graph: Graph,
  startNodeId: string,
  targetNodeId?: string,
  onStep?: (step: GraphStep, graph: Graph) => Promise<void>
): Promise<{ distances: Map<string, number>; paths: Map<string, string[]> }> {
  const distances = new Map<string, number>();
  const paths = new Map<string, string[]>();
  const unvisited = new Set<string>();

  // Initialize distances and paths
  graph.nodes.forEach((node, nodeId) => {
    distances.set(nodeId, nodeId === startNodeId ? 0 : Infinity);
    paths.set(nodeId, nodeId === startNodeId ? [startNodeId] : []);
    unvisited.add(nodeId);
    node.visited = false;
    node.distance = nodeId === startNodeId ? 0 : Infinity;
    node.previous = null;
  });

  while (unvisited.size > 0) {
    // Find unvisited node with minimum distance
    let currentId: string | null = null;
    let minDistance = Infinity;

    for (const nodeId of unvisited) {
      const distance = distances.get(nodeId)!;
      if (distance < minDistance) {
        minDistance = distance;
        currentId = nodeId;
      }
    }

    if (currentId === null || minDistance === Infinity) break;

    unvisited.delete(currentId);
    const currentNode = graph.nodes.get(currentId)!;
    currentNode.visited = true;

    if (onStep) {
      await onStep({
        type: 'visit',
        nodeId: currentId,
        message: `Visiting ${currentId} with distance ${minDistance}`,
        distances: new Map(distances)
      }, graph);
    }

    // If we reached the target, we can stop early
    if (targetNodeId && currentId === targetNodeId) {
      if (onStep) {
        await onStep({
          type: 'complete',
          message: `Reached target ${targetNodeId}! Shortest distance: ${minDistance}`,
          distances: new Map(distances)
        }, graph);
      }
      break;
    }

    // Update distances to neighbors
    const neighbors = graph.adjacencyList.get(currentId) || [];
    for (const neighborId of neighbors) {
      if (unvisited.has(neighborId)) {
        // Find edge weight (default to 1 if not specified)
        const edge = graph.edges.find(e => 
          (e.from === currentId && e.to === neighborId) ||
          (e.from === neighborId && e.to === currentId)
        );
        const edgeWeight = edge?.weight || 1;

        const newDistance = distances.get(currentId)! + edgeWeight;
        const currentDistance = distances.get(neighborId)!;

        if (newDistance < currentDistance) {
          distances.set(neighborId, newDistance);
          const neighbor = graph.nodes.get(neighborId)!;
          neighbor.distance = newDistance;
          neighbor.previous = currentId;

          // Update path
          const currentPath = paths.get(currentId)!;
          paths.set(neighborId, [...currentPath, neighborId]);

          if (onStep) {
            await onStep({
              type: 'updateDistance',
              edgeFrom: currentId,
              edgeTo: neighborId,
              message: `Updated distance to ${neighborId}: ${newDistance} (via ${currentId})`,
              distances: new Map(distances)
            }, graph);
          }
        }
      }
    }
  }

  if (onStep && !targetNodeId) {
    await onStep({
      type: 'complete',
      message: 'Dijkstra\'s algorithm completed for all nodes',
      distances: new Map(distances)
    }, graph);
  }

  return { distances, paths };
}

// Generate a sample graph for visualization
export function generateSampleGraph(): { nodes: GraphNode[], edges: GraphEdge[] } {
  const nodes: GraphNode[] = [
    { id: 'A', x: 100, y: 100 },
    { id: 'B', x: 200, y: 50 },
    { id: 'C', x: 300, y: 100 },
    { id: 'D', x: 150, y: 200 },
    { id: 'E', x: 250, y: 200 },
    { id: 'F', x: 350, y: 150 }
  ];

  const edges: GraphEdge[] = [
    { from: 'A', to: 'B', weight: 4 },
    { from: 'A', to: 'D', weight: 2 },
    { from: 'B', to: 'C', weight: 3 },
    { from: 'B', to: 'E', weight: 1 },
    { from: 'C', to: 'F', weight: 2 },
    { from: 'D', to: 'E', weight: 5 },
    { from: 'E', to: 'F', weight: 3 }
  ];

  return { nodes, edges };
}