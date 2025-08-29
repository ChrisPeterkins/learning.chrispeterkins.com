import React, { useState, useCallback } from 'react'

type SearchingAlgorithm = 'linear' | 'binary' | 'jump';

const SearchingAlgorithmsPage: React.FC = () => {
  const [array] = useState<number[]>([2, 5, 8, 12, 16, 23, 38, 45, 56, 67, 78, 89, 92]);
  const [target, setTarget] = useState(23);
  const [algorithm, setAlgorithm] = useState<SearchingAlgorithm>('binary');
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState<string>('');

  const algorithmInfo = {
    linear: {
      name: 'Linear Search',
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(1)',
      description: 'Searches sequentially through each element until the target is found.',
    },
    binary: {
      name: 'Binary Search',
      timeComplexity: 'O(log n)',
      spaceComplexity: 'O(1)',
      description: 'Efficiently searches sorted arrays by repeatedly dividing the search interval in half.',
    },
    jump: {
      name: 'Jump Search',
      timeComplexity: 'O(√n)',
      spaceComplexity: 'O(1)',
      description: 'Jumps ahead by fixed steps, then performs linear search in the identified block.',
    }
  };

  return (
    <div className="searching-algorithms-page">
      <header className="page-header">
        <h1>Searching Algorithms</h1>
        <p className="page-description">
          Learn how different searching algorithms find elements in arrays.
          Compare linear search, binary search, and jump search performance.
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
              onChange={(e) => setAlgorithm(e.target.value as SearchingAlgorithm)}
              disabled={isRunning}
              className="demo-button"
            >
              <option value="linear">Linear Search</option>
              <option value="binary">Binary Search</option>
              <option value="jump">Jump Search</option>
            </select>
          </div>

          <div className="control-group">
            <label className="control-label">Target Value</label>
            <input
              type="number"
              value={target}
              onChange={(e) => setTarget(Number(e.target.value))}
              disabled={isRunning}
              className="demo-button"
              style={{ width: '80px' }}
            />
          </div>

          <button
            className="action-button"
            onClick={() => setCurrentStep('Search functionality coming soon!')}
            disabled={isRunning}
          >
            Start Search
          </button>
        </div>

        <div style={{
          background: 'var(--code-bg)',
          padding: '2rem',
          border: '1px solid var(--code-border)',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            Array: [{array.join(', ')}]
          </p>
          <p style={{ color: 'var(--accent-green-bright)' }}>
            Target: {target}
          </p>
          {currentStep && (
            <p style={{ color: 'var(--text-primary)', marginTop: '1rem' }}>
              {currentStep}
            </p>
          )}
        </div>
      </div>

      <section style={{ marginTop: '3rem' }}>
        <h2 style={{ marginBottom: '2rem', color: 'var(--text-primary)' }}>Search Algorithm Comparison</h2>
        
        <div className="concept-grid">
          <div className="concept-card">
            <h3>Linear Search</h3>
            <p>
              <strong>Best for:</strong> Unsorted data, small datasets<br/>
              <strong>Time:</strong> O(n) - checks every element<br/>
              <strong>Space:</strong> O(1) - no extra space needed
            </p>
          </div>
          
          <div className="concept-card">
            <h3>Binary Search</h3>
            <p>
              <strong>Best for:</strong> Sorted data, large datasets<br/>
              <strong>Time:</strong> O(log n) - divides search space in half<br/>
              <strong>Space:</strong> O(1) iterative, O(log n) recursive
            </p>
          </div>
          
          <div className="concept-card">
            <h3>Jump Search</h3>
            <p>
              <strong>Best for:</strong> Sorted data, when binary search overhead is high<br/>
              <strong>Time:</strong> O(√n) - optimal jump size is √n<br/>
              <strong>Space:</strong> O(1) - no extra space needed
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SearchingAlgorithmsPage;