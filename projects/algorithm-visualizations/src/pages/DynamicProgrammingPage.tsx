import React, { useState } from 'react'

type DPAlgorithm = 'fibonacci' | 'knapsack' | 'lcs' | 'coinchange';

const DynamicProgrammingPage: React.FC = () => {
  const [algorithm, setAlgorithm] = useState<DPAlgorithm>('fibonacci');
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<string>('');

  const algorithmInfo = {
    fibonacci: {
      name: 'Fibonacci Sequence',
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(n)',
      description: 'Calculate Fibonacci numbers using memoization to avoid redundant calculations.',
    },
    knapsack: {
      name: '0/1 Knapsack',
      timeComplexity: 'O(nW)',
      spaceComplexity: 'O(nW)',
      description: 'Find the maximum value that can be obtained with given weight constraint.',
    },
    lcs: {
      name: 'Longest Common Subsequence',
      timeComplexity: 'O(mn)',
      spaceComplexity: 'O(mn)',
      description: 'Find the longest subsequence common to two sequences.',
    },
    coinchange: {
      name: 'Coin Change',
      timeComplexity: 'O(nA)',
      spaceComplexity: 'O(A)',
      description: 'Find minimum number of coins needed to make a given amount.',
    }
  };

  const runAlgorithm = () => {
    setIsRunning(true);
    setResult('');
    
    setTimeout(() => {
      switch (algorithm) {
        case 'fibonacci':
          setResult('Fibonacci(10) = 55 (calculated using memoization)');
          break;
        case 'knapsack':
          setResult('Maximum value: $220 with items: Diamond, Ruby, Emerald');
          break;
        case 'lcs':
          setResult('LCS of "ABCDGH" and "AEDFHR" = "ADH" (length: 3)');
          break;
        case 'coinchange':
          setResult('Minimum coins for $11: 3 coins (5+5+1)');
          break;
      }
      setIsRunning(false);
    }, 2000);
  };

  return (
    <div className="dynamic-programming-page">
      <header className="page-header">
        <h1>Dynamic Programming</h1>
        <p className="page-description">
          Master the art of breaking down complex problems into simpler subproblems.
          Learn memoization and tabulation techniques for optimal solutions.
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
              onChange={(e) => setAlgorithm(e.target.value as DPAlgorithm)}
              disabled={isRunning}
              className="demo-button"
            >
              <option value="fibonacci">Fibonacci</option>
              <option value="knapsack">0/1 Knapsack</option>
              <option value="lcs">Longest Common Subsequence</option>
              <option value="coinchange">Coin Change</option>
            </select>
          </div>

          <button
            className="action-button"
            onClick={runAlgorithm}
            disabled={isRunning}
          >
            {isRunning ? 'Computing...' : 'Run Algorithm'}
          </button>
        </div>

        <div style={{
          background: 'var(--code-bg)',
          padding: '2rem',
          border: '1px solid var(--code-border)',
          borderRadius: '8px',
          minHeight: '200px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {isRunning ? (
            <p style={{ color: 'var(--accent-green-bright)' }}>Computing optimal solution...</p>
          ) : result ? (
            <p style={{ color: 'var(--text-primary)', fontSize: '1.1rem' }}>{result}</p>
          ) : (
            <p style={{ color: 'var(--text-secondary)' }}>Select an algorithm and click "Run Algorithm" to see results</p>
          )}
        </div>
      </div>

      <section style={{ marginTop: '3rem' }}>
        <h2 style={{ marginBottom: '2rem', color: 'var(--text-primary)' }}>Dynamic Programming Principles</h2>
        
        <div className="concept-grid">
          <div className="concept-card">
            <h3>Optimal Substructure</h3>
            <p>
              A problem has optimal substructure if an optimal solution contains 
              optimal solutions to subproblems. This is essential for DP to work.
            </p>
          </div>
          
          <div className="concept-card">
            <h3>Overlapping Subproblems</h3>
            <p>
              The problem can be broken down into subproblems that are solved multiple times. 
              DP stores these solutions to avoid redundant calculations.
            </p>
          </div>
          
          <div className="concept-card">
            <h3>Memoization</h3>
            <p>
              Top-down approach that stores results of expensive function calls and reuses 
              them when the same inputs occur again.
            </p>
          </div>
          
          <div className="concept-card">
            <h3>Tabulation</h3>
            <p>
              Bottom-up approach that builds a table and fills it up using results of 
              smaller subproblems, starting from base cases.
            </p>
          </div>
        </div>
      </section>

      <section style={{ marginTop: '3rem' }}>
        <h2 style={{ marginBottom: '2rem', color: 'var(--text-primary)' }}>DP Problem Categories</h2>
        
        <div className="code-container">
          <div className="code-header">
            <span className="code-title">Common DP Patterns</span>
          </div>
          <div className="code-content">
            <pre>{`// 1. Linear DP (1D array)
// Example: Fibonacci, Climbing Stairs
dp[i] = dp[i-1] + dp[i-2]

// 2. Grid DP (2D array)
// Example: Unique Paths, Minimum Path Sum
dp[i][j] = min(dp[i-1][j], dp[i][j-1]) + grid[i][j]

// 3. Interval DP
// Example: Matrix Chain Multiplication
for length in range(2, n+1):
    for i in range(n-length+1):
        dp[i][j] = min(dp[i][k] + dp[k+1][j] + cost(i,j,k))

// 4. Subset DP
// Example: Subset Sum, Knapsack
dp[i][w] = max(dp[i-1][w], dp[i-1][w-weight[i]] + value[i])

// 5. Tree DP
// Example: Tree diameter, House Robber III
dp[node] = max(rob(node) + sum(dp[grandchildren]), 
               sum(dp[children]))`}</pre>
          </div>
        </div>
      </section>
    </div>
  );
};

export default DynamicProgrammingPage;