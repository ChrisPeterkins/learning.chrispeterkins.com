import React from 'react'

const HomePage: React.FC = () => {
  return (
    <div className="home-page">
      <header className="page-header">
        <h1>Algorithm Visualizations</h1>
        <p className="page-description">
          Master fundamental algorithms through interactive visualizations. Watch algorithms work step-by-step,
          understand their time and space complexity, and see how they solve real-world problems.
        </p>
      </header>

      <section>
        <h2 style={{ marginBottom: '2rem', color: 'var(--text-primary)' }}>What You'll Learn</h2>
        
        <div className="concept-grid">
          <div className="concept-card">
            <h3>Sorting Algorithms</h3>
            <p>
              Watch bubble sort, quicksort, mergesort, and heapsort in action. Compare their 
              performance and understand when to use each algorithm.
            </p>
          </div>
          
          <div className="concept-card">
            <h3>Searching Techniques</h3>
            <p>
              Explore linear search, binary search, and jump search. Learn how data structure 
              affects search efficiency and algorithm choice.
            </p>
          </div>
          
          <div className="concept-card">
            <h3>Graph Algorithms</h3>
            <p>
              Visualize depth-first search, breadth-first search, and Dijkstra's algorithm. 
              See how graphs are traversed and shortest paths are found.
            </p>
          </div>
          
          <div className="concept-card">
            <h3>Pathfinding</h3>
            <p>
              Discover A* and greedy best-first search on interactive grids. Understand 
              heuristics and how they guide intelligent search.
            </p>
          </div>
          
          <div className="concept-card">
            <h3>Tree Traversals</h3>
            <p>
              Learn inorder, preorder, and postorder tree traversals. See how recursive 
              algorithms navigate tree structures systematically.
            </p>
          </div>
          
          <div className="concept-card">
            <h3>Dynamic Programming</h3>
            <p>
              Solve complex problems by breaking them down. Watch memoization optimize 
              recursive solutions like Fibonacci and knapsack problems.
            </p>
          </div>
        </div>
      </section>

      <section style={{ marginTop: '3rem' }}>
        <h2 style={{ marginBottom: '2rem', color: 'var(--text-primary)' }}>Algorithm Complexity</h2>
        
        <div className="demo-container">
          <h3 style={{ marginBottom: '1rem', color: 'var(--accent-green-bright)' }}>
            Understanding Big O Notation
          </h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            Big O notation describes how algorithm performance scales with input size. Here's what different 
            complexities mean in practice:
          </p>
          
          <div className="code-container">
            <div className="code-header">
              <span className="code-title">Common Time Complexities</span>
            </div>
            <div className="code-content">
              <pre>{`O(1)      - Constant time      - Array access, hash lookup
O(log n)  - Logarithmic time   - Binary search, balanced tree ops
O(n)      - Linear time        - Linear search, simple loops
O(n log n)- Log-linear time    - Efficient sorting (merge, heap)
O(n²)     - Quadratic time     - Nested loops (bubble sort)
O(2^n)    - Exponential time   - Brute force recursive solutions

// Example: Finding maximum in array
function findMax(arr) {          // O(n) time complexity
  let max = arr[0];              // O(1) operation
  for (let i = 1; i < arr.length; i++) {  // O(n) loop
    if (arr[i] > max) {          // O(1) comparison
      max = arr[i];              // O(1) assignment
    }
  }
  return max;                    // O(1) return
}`}</pre>
            </div>
          </div>
        </div>
      </section>

      <section style={{ marginTop: '3rem' }}>
        <h2 style={{ marginBottom: '2rem', color: 'var(--text-primary)' }}>Algorithm Categories</h2>
        
        <div className="concept-grid">
          <div className="concept-card">
            <h3>Divide & Conquer</h3>
            <p>
              Break problems into smaller subproblems, solve recursively, then combine results. 
              Examples: mergesort, quicksort, binary search.
            </p>
          </div>
          
          <div className="concept-card">
            <h3>Greedy Algorithms</h3>
            <p>
              Make locally optimal choices at each step. Examples: Dijkstra's algorithm, 
              activity selection, huffman coding.
            </p>
          </div>
          
          <div className="concept-card">
            <h3>Dynamic Programming</h3>
            <p>
              Store solutions to subproblems to avoid redundant calculations. Examples: 
              Fibonacci, knapsack, longest common subsequence.
            </p>
          </div>
          
          <div className="concept-card">
            <h3>Backtracking</h3>
            <p>
              Explore all possible solutions by trying partial solutions and abandoning 
              those that cannot lead to a complete solution.
            </p>
          </div>
        </div>
      </section>

      <section style={{ marginTop: '3rem' }}>
        <h2 style={{ marginBottom: '1.5rem', color: 'var(--text-primary)' }}>Learning Path</h2>
        
        <div style={{ 
          background: 'var(--bg-secondary)', 
          padding: '2rem', 
          border: '1px solid var(--border-primary)',
          borderLeft: '3px solid var(--accent-green-bright)',
          borderRadius: '8px'
        }}>
          <ol style={{ 
            listStyle: 'none', 
            counterReset: 'step-counter',
            padding: 0 
          }}>
            {[
              'Start with Sorting Algorithms to understand algorithm analysis basics',
              'Learn Searching Algorithms to see how data organization affects efficiency',
              'Explore Graph Algorithms to understand traversal and pathfinding concepts',
              'Master Pathfinding with A* to see heuristic-guided search in action',
              'Study Tree Traversals to understand recursive algorithm patterns',
              'Tackle Dynamic Programming to learn optimization techniques',
              'Practice with Data Structures to see algorithms in context',
              'Apply knowledge by implementing your own algorithm visualizations'
            ].map((step, index) => (
              <li key={index} style={{ 
                counterIncrement: 'step-counter',
                position: 'relative',
                paddingLeft: '3rem',
                marginBottom: '1rem',
                color: 'var(--text-secondary)',
                lineHeight: '1.6'
              }}>
                <span style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  width: '2rem',
                  height: '2rem',
                  background: 'var(--accent-green)',
                  color: 'var(--text-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  borderRadius: '50%'
                }}>
                  {index + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section style={{ marginTop: '3rem' }}>
        <h2 style={{ marginBottom: '2rem', color: 'var(--text-primary)' }}>Interactive Features</h2>
        
        <div style={{ 
          background: 'var(--bg-secondary)', 
          padding: '2rem', 
          border: '1px solid var(--border-primary)',
          borderRadius: '8px'
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
            <div>
              <h4 style={{ color: 'var(--accent-green-bright)', marginBottom: '1rem' }}>
                Speed Control
              </h4>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                Adjust visualization speed from slow to fast. Perfect for learning at your own pace 
                or demonstrating to others.
              </p>
            </div>
            
            <div>
              <h4 style={{ color: 'var(--accent-green-bright)', marginBottom: '1rem' }}>
                Step-by-Step Execution
              </h4>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                Pause and step through algorithms one operation at a time. See exactly what 
                happens at each step with detailed explanations.
              </p>
            </div>
            
            <div>
              <h4 style={{ color: 'var(--accent-green-bright)', marginBottom: '1rem' }}>
                Custom Input Data
              </h4>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                Generate random data or create your own test cases. Experiment with different 
                inputs to see how algorithms behave.
              </p>
            </div>
            
            <div>
              <h4 style={{ color: 'var(--accent-green-bright)', marginBottom: '1rem' }}>
                Complexity Analysis
              </h4>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                View time and space complexity information alongside each algorithm. 
                Understand performance characteristics and trade-offs.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section style={{ marginTop: '3rem' }}>
        <h2 style={{ marginBottom: '2rem', color: 'var(--text-primary)' }}>Why Learn Algorithms?</h2>
        
        <div style={{ 
          background: 'var(--bg-secondary)', 
          padding: '2rem', 
          border: '1px solid var(--border-primary)',
          borderRadius: '8px'
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            <div>
              <h4 style={{ color: 'var(--accent-green-bright)', marginBottom: '1rem' }}>
                Problem Solving Skills
              </h4>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                Algorithms teach structured thinking and problem decomposition. These skills 
                transfer to all areas of programming and software development.
              </p>
            </div>
            
            <div>
              <h4 style={{ color: 'var(--accent-green-bright)', marginBottom: '1rem' }}>
                Performance Optimization
              </h4>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                Understanding algorithms helps you write efficient code. Know when to use 
                the right algorithm for optimal performance in your applications.
              </p>
            </div>
            
            <div>
              <h4 style={{ color: 'var(--accent-green-bright)', marginBottom: '1rem' }}>
                Technical Interviews
              </h4>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                Algorithm knowledge is essential for technical interviews at top companies. 
                Practice with visualizations builds intuition for solving problems under pressure.
              </p>
            </div>
            
            <div>
              <h4 style={{ color: 'var(--accent-green-bright)', marginBottom: '1rem' }}>
                Foundation for Advanced Topics
              </h4>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                Algorithms are the building blocks for machine learning, computer graphics, 
                databases, and many other advanced computer science fields.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default HomePage