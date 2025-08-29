import React, { useState } from 'react'

type DataStructure = 'stack' | 'queue' | 'linkedlist' | 'bst';

const DataStructuresPage: React.FC = () => {
  const [structure, setStructure] = useState<DataStructure>('stack');
  const [elements, setElements] = useState<number[]>([10, 20, 30]);
  const [inputValue, setInputValue] = useState('');

  const structureInfo = {
    stack: {
      name: 'Stack (LIFO)',
      operations: 'Push, Pop, Peek',
      timeComplexity: 'O(1)',
      description: 'Last In, First Out data structure. Elements are added and removed from the same end.',
      applications: 'Function calls, undo operations, expression evaluation'
    },
    queue: {
      name: 'Queue (FIFO)',
      operations: 'Enqueue, Dequeue, Front',
      timeComplexity: 'O(1)',
      description: 'First In, First Out data structure. Elements are added at rear and removed from front.',
      applications: 'Process scheduling, breadth-first search, print queues'
    },
    linkedlist: {
      name: 'Linked List',
      operations: 'Insert, Delete, Search',
      timeComplexity: 'O(1) insert/delete, O(n) search',
      description: 'Linear data structure where elements are stored in nodes with pointers.',
      applications: 'Dynamic memory allocation, implementation of other data structures'
    },
    bst: {
      name: 'Binary Search Tree',
      operations: 'Insert, Delete, Search',
      timeComplexity: 'O(log n) average, O(n) worst',
      description: 'Binary tree where left children are smaller and right children are larger.',
      applications: 'Searching, sorting, database indexing'
    }
  };

  const addElement = () => {
    const value = parseInt(inputValue);
    if (!isNaN(value) && inputValue.trim() !== '') {
      switch (structure) {
        case 'stack':
          setElements(prev => [...prev, value]); // Push to end
          break;
        case 'queue':
          setElements(prev => [...prev, value]); // Enqueue to end
          break;
        case 'linkedlist':
          setElements(prev => [value, ...prev]); // Insert at beginning
          break;
        case 'bst':
          setElements(prev => [...prev, value].sort((a, b) => a - b));
          break;
      }
      setInputValue('');
    }
  };

  const removeElement = () => {
    switch (structure) {
      case 'stack':
        setElements(prev => prev.slice(0, -1)); // Pop from end
        break;
      case 'queue':
        setElements(prev => prev.slice(1)); // Dequeue from front
        break;
      case 'linkedlist':
        setElements(prev => prev.slice(1)); // Remove from beginning
        break;
      case 'bst':
        setElements(prev => prev.slice(1)); // Remove first element
        break;
    }
  };

  const clearAll = () => {
    setElements([]);
  };

  const renderVisualization = () => {
    switch (structure) {
      case 'stack':
        return (
          <div style={{ display: 'flex', flexDirection: 'column-reverse', alignItems: 'center', gap: '5px' }}>
            {elements.map((element, index) => (
              <div key={index} style={{
                background: index === elements.length - 1 ? 'var(--accent-green-bright)' : 'var(--accent-green)',
                color: 'var(--text-primary)',
                padding: '10px 20px',
                borderRadius: '4px',
                border: '1px solid var(--border-primary)',
                minWidth: '60px',
                textAlign: 'center',
                position: 'relative'
              }}>
                {element}
                {index === elements.length - 1 && (
                  <div style={{ position: 'absolute', right: '-40px', top: '50%', transform: 'translateY(-50%)', color: 'var(--accent-green-bright)' }}>
                    ← TOP
                  </div>
                )}
              </div>
            ))}
            <div style={{ color: 'var(--text-secondary)', marginTop: '10px' }}>Stack Base</div>
          </div>
        );
        
      case 'queue':
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', overflowX: 'auto' }}>
            <div style={{ color: 'var(--text-secondary)' }}>FRONT →</div>
            {elements.map((element, index) => (
              <div key={index} style={{
                background: index === 0 ? 'var(--accent-green-bright)' : 'var(--accent-green)',
                color: 'var(--text-primary)',
                padding: '10px 20px',
                borderRadius: '4px',
                border: '1px solid var(--border-primary)',
                minWidth: '60px',
                textAlign: 'center'
              }}>
                {element}
              </div>
            ))}
            <div style={{ color: 'var(--text-secondary)' }}>← REAR</div>
          </div>
        );
        
      case 'linkedlist':
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflowX: 'auto' }}>
            <div style={{ color: 'var(--text-secondary)' }}>HEAD →</div>
            {elements.map((element, index) => (
              <React.Fragment key={index}>
                <div style={{
                  background: 'var(--accent-green)',
                  color: 'var(--text-primary)',
                  padding: '10px 20px',
                  borderRadius: '4px',
                  border: '1px solid var(--border-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}>
                  <span>{element}</span>
                  <span style={{ color: 'var(--text-secondary)' }}>→</span>
                </div>
                {index < elements.length - 1 && (
                  <div style={{ color: 'var(--text-secondary)' }}>→</div>
                )}
              </React.Fragment>
            ))}
            <div style={{ color: 'var(--text-secondary)' }}>NULL</div>
          </div>
        );
        
      case 'bst':
        return (
          <div style={{ textAlign: 'center' }}>
            <div style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>
              Binary Search Tree (sorted order)
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center' }}>
              {elements.map((element, index) => (
                <div key={index} style={{
                  background: 'var(--accent-green)',
                  color: 'var(--text-primary)',
                  padding: '10px',
                  borderRadius: '50%',
                  border: '1px solid var(--border-primary)',
                  width: '40px',
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {element}
                </div>
              ))}
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="data-structures-page">
      <header className="page-header">
        <h1>Data Structures</h1>
        <p className="page-description">
          Explore fundamental data structures and their operations.
          Understand how different structures organize data for efficient access and modification.
        </p>
      </header>

      <div className="algorithm-info">
        <h3 style={{ color: 'var(--accent-green-bright)', marginBottom: '1rem' }}>
          {structureInfo[structure].name}
        </h3>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
          {structureInfo[structure].description}
        </p>
        
        <div className="complexity-info">
          <div className="complexity-item">
            <div className="complexity-label">Operations</div>
            <div className="complexity-value" style={{ fontSize: '0.9rem' }}>
              {structureInfo[structure].operations}
            </div>
          </div>
          <div className="complexity-item">
            <div className="complexity-label">Time Complexity</div>
            <div className="complexity-value">{structureInfo[structure].timeComplexity}</div>
          </div>
          <div className="complexity-item">
            <div className="complexity-label">Applications</div>
            <div className="complexity-value" style={{ fontSize: '0.8rem' }}>
              {structureInfo[structure].applications}
            </div>
          </div>
        </div>
      </div>

      <div className="visualization-container">
        <div className="control-panel">
          <div className="control-group">
            <label className="control-label">Data Structure</label>
            <select
              value={structure}
              onChange={(e) => setStructure(e.target.value as DataStructure)}
              className="demo-button"
            >
              <option value="stack">Stack</option>
              <option value="queue">Queue</option>
              <option value="linkedlist">Linked List</option>
              <option value="bst">Binary Search Tree</option>
            </select>
          </div>

          <div className="control-group">
            <label className="control-label">Add Element</label>
            <input
              type="number"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Enter number"
              className="demo-button"
              style={{ width: '100px' }}
              onKeyPress={(e) => e.key === 'Enter' && addElement()}
            />
          </div>

          <button className="action-button" onClick={addElement}>
            {structure === 'stack' ? 'Push' :
             structure === 'queue' ? 'Enqueue' :
             structure === 'linkedlist' ? 'Insert' : 'Insert'}
          </button>
          
          <button className="demo-button" onClick={removeElement} disabled={elements.length === 0}>
            {structure === 'stack' ? 'Pop' :
             structure === 'queue' ? 'Dequeue' :
             structure === 'linkedlist' ? 'Remove' : 'Delete'}
          </button>
          
          <button className="demo-button" onClick={clearAll} disabled={elements.length === 0}>
            Clear All
          </button>
        </div>

        <div style={{
          background: 'var(--code-bg)',
          padding: '3rem',
          border: '1px solid var(--code-border)',
          borderRadius: '8px',
          minHeight: '250px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflowX: 'auto'
        }}>
          {elements.length > 0 ? renderVisualization() : (
            <p style={{ color: 'var(--text-secondary)' }}>
              Add elements to see the {structureInfo[structure].name} visualization
            </p>
          )}
        </div>
        
        <div style={{ marginTop: '1rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
          Current elements: [{elements.join(', ')}] (Count: {elements.length})
        </div>
      </div>

      <section style={{ marginTop: '3rem' }}>
        <h2 style={{ marginBottom: '2rem', color: 'var(--text-primary)' }}>Data Structure Comparison</h2>
        
        <div className="concept-grid">
          <div className="concept-card">
            <h3>Arrays vs Linked Lists</h3>
            <p>
              <strong>Arrays:</strong> O(1) access, O(n) insertion/deletion<br/>
              <strong>Linked Lists:</strong> O(n) access, O(1) insertion/deletion<br/>
              <strong>Trade-off:</strong> Memory locality vs dynamic size
            </p>
          </div>
          
          <div className="concept-card">
            <h3>Stack vs Queue</h3>
            <p>
              <strong>Stack:</strong> LIFO, recursion, undo operations<br/>
              <strong>Queue:</strong> FIFO, scheduling, breadth-first search<br/>
              <strong>Both:</strong> O(1) insertion and deletion
            </p>
          </div>
          
          <div className="concept-card">
            <h3>Trees vs Hash Tables</h3>
            <p>
              <strong>Trees:</strong> Ordered data, range queries, O(log n) operations<br/>
              <strong>Hash Tables:</strong> Fast lookup, O(1) average, no ordering<br/>
              <strong>Choice depends on:</strong> Ordering requirements vs speed
            </p>
          </div>
          
          <div className="concept-card">
            <h3>When to Use What</h3>
            <p>
              <strong>Stack:</strong> Function calls, expression parsing, backtracking<br/>
              <strong>Queue:</strong> BFS, task scheduling, buffering<br/>
              <strong>BST:</strong> Maintaining sorted data, range queries
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default DataStructuresPage;