import React, { useState } from 'react'
import GraphVisualizer from '../visualizers/GraphVisualizer'
import { createGraph, generateSampleGraph } from '../algorithms/graph'

type GraphAlgorithm = 'dfs' | 'bfs' | 'dijkstra';

const GraphAlgorithmsPage: React.FC = () => {
  const { nodes, edges } = generateSampleGraph();
  const [graph] = useState(() => createGraph(nodes, edges));
  const [algorithm, setAlgorithm] = useState<GraphAlgorithm>('bfs');
  const [isRunning, setIsRunning] = useState(false);
  const [visitedNodes, setVisitedNodes] = useState<string[]>([]);
  const [currentNode, setCurrentNode] = useState<string>('');

  const algorithmInfo = {
    dfs: {
      name: 'Depth-First Search',
      timeComplexity: 'O(V + E)',
      spaceComplexity: 'O(V)',
      description: 'Explores as far as possible along each branch before backtracking.',
    },
    bfs: {
      name: 'Breadth-First Search',
      timeComplexity: 'O(V + E)',
      spaceComplexity: 'O(V)',
      description: 'Explores all vertices at the current depth before moving to vertices at the next depth.',
    },
    dijkstra: {
      name: "Dijkstra's Algorithm",
      timeComplexity: 'O((V + E) log V)',
      spaceComplexity: 'O(V)',
      description: 'Finds the shortest paths from a source vertex to all other vertices.',
    }
  };

  return (
    <div className="graph-algorithms-page">
      <header className="page-header">
        <h1>Graph Algorithms</h1>
        <p className="page-description">
          Explore graph traversal and shortest path algorithms.
          See how DFS, BFS, and Dijkstra's algorithm navigate through connected nodes.
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
              onChange={(e) => setAlgorithm(e.target.value as GraphAlgorithm)}
              disabled={isRunning}
              className="demo-button"
            >
              <option value="dfs">Depth-First Search</option>
              <option value="bfs">Breadth-First Search</option>
              <option value="dijkstra">Dijkstra's Algorithm</option>
            </select>
          </div>

          <button
            className="action-button"
            onClick={() => console.log('Graph algorithm running...')}
            disabled={isRunning}
          >
            Start Algorithm
          </button>
        </div>

        <GraphVisualizer
          graph={graph}
          currentNode={currentNode}
          visitedNodes={visitedNodes}
        />
      </div>

      <section style={{ marginTop: '3rem' }}>
        <h2 style={{ marginBottom: '2rem', color: 'var(--text-primary)' }}>Graph Algorithm Applications</h2>
        
        <div className="concept-grid">
          <div className="concept-card">
            <h3>Depth-First Search</h3>
            <p>
              <strong>Applications:</strong> Topological sorting, cycle detection, maze solving<br/>
              <strong>Strategy:</strong> Go deep first, backtrack when stuck<br/>
              <strong>Data Structure:</strong> Stack (or recursion)
            </p>
          </div>
          
          <div className="concept-card">
            <h3>Breadth-First Search</h3>
            <p>
              <strong>Applications:</strong> Shortest path (unweighted), level-order traversal<br/>
              <strong>Strategy:</strong> Explore all neighbors first<br/>
              <strong>Data Structure:</strong> Queue
            </p>
          </div>
          
          <div className="concept-card">
            <h3>Dijkstra's Algorithm</h3>
            <p>
              <strong>Applications:</strong> GPS navigation, network routing, shortest paths<br/>
              <strong>Strategy:</strong> Greedy approach with priority queue<br/>
              <strong>Limitation:</strong> No negative edge weights
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default GraphAlgorithmsPage;