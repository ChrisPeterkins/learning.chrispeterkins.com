import React, { useState } from 'react'
import TreeVisualizer from '../visualizers/TreeVisualizer'
import { createSampleTree, BinarySearchTree } from '../algorithms/trees'

type TreeTraversal = 'inorder' | 'preorder' | 'postorder' | 'levelorder';

const TreeTraversalsPage: React.FC = () => {
  const [tree] = useState(() => createSampleTree());
  const [traversal, setTraversal] = useState<TreeTraversal>('inorder');
  const [isRunning, setIsRunning] = useState(false);
  const [traversalOrder, setTraversalOrder] = useState<number[]>([]);

  const traversalInfo = {
    inorder: {
      name: 'Inorder Traversal',
      order: 'Left → Root → Right',
      description: 'Visits left subtree, then root, then right subtree. Produces sorted output for BST.',
      useCase: 'Getting sorted data from BST, expression tree evaluation'
    },
    preorder: {
      name: 'Preorder Traversal',
      order: 'Root → Left → Right',
      description: 'Visits root first, then left subtree, then right subtree.',
      useCase: 'Tree copying, prefix expression evaluation, serialization'
    },
    postorder: {
      name: 'Postorder Traversal',
      order: 'Left → Right → Root',
      description: 'Visits left subtree, then right subtree, then root.',
      useCase: 'Tree deletion, postfix expression evaluation, calculating directory sizes'
    },
    levelorder: {
      name: 'Level Order Traversal',
      order: 'Level by Level (BFS)',
      description: 'Visits nodes level by level from left to right.',
      useCase: 'Tree printing, finding tree width, level-based operations'
    }
  };

  const runTraversal = async () => {
    if (isRunning) return;
    
    setIsRunning(true);
    setTraversalOrder([]);
    
    try {
      let result: number[] = [];
      
      switch (traversal) {
        case 'inorder':
          result = await tree.inorderTraversal();
          break;
        case 'preorder':
          result = await tree.preorderTraversal();
          break;
        case 'postorder':
          result = await tree.postorderTraversal();
          break;
        case 'levelorder':
          // result = await levelOrderTraversal(tree);
          result = [50, 30, 70, 20, 40, 60, 80, 10, 25, 35, 45]; // placeholder
          break;
      }
      
      setTraversalOrder(result);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="tree-traversals-page">
      <header className="page-header">
        <h1>Tree Traversals</h1>
        <p className="page-description">
          Learn different ways to visit all nodes in a tree structure.
          Compare inorder, preorder, postorder, and level-order traversals.
        </p>
      </header>

      <div className="algorithm-info">
        <h3 style={{ color: 'var(--accent-green-bright)', marginBottom: '1rem' }}>
          {traversalInfo[traversal].name}
        </h3>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
          {traversalInfo[traversal].description}
        </p>
        
        <div className="complexity-info">
          <div className="complexity-item">
            <div className="complexity-label">Visit Order</div>
            <div className="complexity-value">{traversalInfo[traversal].order}</div>
          </div>
          <div className="complexity-item">
            <div className="complexity-label">Use Case</div>
            <div className="complexity-value" style={{ fontSize: '0.8rem' }}>
              {traversalInfo[traversal].useCase}
            </div>
          </div>
        </div>
      </div>

      <div className="visualization-container">
        <div className="control-panel">
          <div className="control-group">
            <label className="control-label">Traversal</label>
            <select
              value={traversal}
              onChange={(e) => setTraversal(e.target.value as TreeTraversal)}
              disabled={isRunning}
              className="demo-button"
            >
              <option value="inorder">Inorder</option>
              <option value="preorder">Preorder</option>
              <option value="postorder">Postorder</option>
              <option value="levelorder">Level Order</option>
            </select>
          </div>

          <button
            className="action-button"
            onClick={runTraversal}
            disabled={isRunning}
          >
            {isRunning ? 'Running...' : 'Start Traversal'}
          </button>
        </div>

        <TreeVisualizer
          tree={tree}
          traversalOrder={traversalOrder}
        />
      </div>

      <section style={{ marginTop: '3rem' }}>
        <h2 style={{ marginBottom: '2rem', color: 'var(--text-primary)' }}>Traversal Comparison</h2>
        
        <div className="concept-grid">
          <div className="concept-card">
            <h3>Inorder (LNR)</h3>
            <p>
              <strong>Order:</strong> Left → Node → Right<br/>
              <strong>Output:</strong> For BST: sorted ascending order<br/>
              <strong>Applications:</strong> Get sorted data, validate BST
            </p>
          </div>
          
          <div className="concept-card">
            <h3>Preorder (NLR)</h3>
            <p>
              <strong>Order:</strong> Node → Left → Right<br/>
              <strong>Output:</strong> Root comes first<br/>
              <strong>Applications:</strong> Copy tree, create tree from traversal
            </p>
          </div>
          
          <div className="concept-card">
            <h3>Postorder (LRN)</h3>
            <p>
              <strong>Order:</strong> Left → Right → Node<br/>
              <strong>Output:</strong> Root comes last<br/>
              <strong>Applications:</strong> Delete tree, calculate directory sizes
            </p>
          </div>
          
          <div className="concept-card">
            <h3>Level Order (BFS)</h3>
            <p>
              <strong>Order:</strong> Level by level, left to right<br/>
              <strong>Output:</strong> Breadth-first order<br/>
              <strong>Applications:</strong> Print tree levels, find width
            </p>
          </div>
        </div>
      </section>

      <section style={{ marginTop: '3rem' }}>
        <h2 style={{ marginBottom: '2rem', color: 'var(--text-primary)' }}>Implementation Patterns</h2>
        
        <div className="code-container">
          <div className="code-header">
            <span className="code-title">Recursive Traversal Template</span>
          </div>
          <div className="code-content">
            <pre>{`// Inorder traversal (Left-Node-Right)
function inorderTraversal(node) {
  if (node === null) return;
  
  inorderTraversal(node.left);   // Traverse left subtree
  visit(node);                   // Process current node
  inorderTraversal(node.right);  // Traverse right subtree
}

// Preorder: visit(node) → left → right
// Postorder: left → right → visit(node)

// Level order traversal (iterative with queue)
function levelOrderTraversal(root) {
  if (root === null) return [];
  
  const result = [];
  const queue = [root];
  
  while (queue.length > 0) {
    const node = queue.shift();
    result.push(node.value);
    
    if (node.left) queue.push(node.left);
    if (node.right) queue.push(node.right);
  }
  
  return result;
}`}</pre>
          </div>
        </div>
      </section>
    </div>
  );
};

export default TreeTraversalsPage;