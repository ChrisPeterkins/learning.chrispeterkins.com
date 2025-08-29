import React, { useState, useMemo } from 'react'
import CodeExample from '../../components/CodeExample'
import './hooks.css'

const expensiveCalculationExample = `
function ExpensiveList() {
  const [filter, setFilter] = useState('')
  const [count, setCount] = useState(0)
  
  // Generate large list of items
  const items = useMemo(() => {
    console.log('Generating items...')
    return Array.from({ length: 1000 }, (_, i) => ({
      id: i,
      name: \`Item \${i}\`,
      category: i % 3 === 0 ? 'A' : i % 3 === 1 ? 'B' : 'C'
    }))
  }, []) // Only generate once
  
  // Filter items with useMemo
  const filteredItems = useMemo(() => {
    console.log('Filtering items...')
    if (!filter) return items.slice(0, 10)
    return items
      .filter(item => 
        item.name.toLowerCase().includes(filter.toLowerCase()) ||
        item.category === filter.toUpperCase()
      )
      .slice(0, 10)
  }, [items, filter]) // Only re-filter when filter changes
  
  return (
    <div style={{ padding: '1rem' }}>
      <div style={{ marginBottom: '1rem' }}>
        <input
          type="text"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Filter items (name or A/B/C)..."
          style={{
            padding: '0.5rem',
            marginRight: '1rem',
            background: 'rgba(15, 25, 20, 0.6)',
            color: '#f0f4f2',
            border: '1px solid rgba(143, 169, 155, 0.2)',
            borderRadius: '4px',
            width: '200px'
          }}
        />
        <button
          onClick={() => setCount(c => c + 1)}
          style={{
            padding: '0.5rem 1rem',
            background: '#1a5d3a',
            color: '#f0f4f2',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Count: {count} (doesn't re-filter)
        </button>
      </div>
      
      <div style={{ fontSize: '0.875rem', color: '#8fa99b', marginBottom: '0.5rem' }}>
        Showing {filteredItems.length} items (check console for calculations)
      </div>
      
      <div>
        {filteredItems.map(item => (
          <div
            key={item.id}
            style={{
              padding: '0.5rem',
              marginBottom: '0.25rem',
              background: 'rgba(15, 25, 20, 0.6)',
              border: '1px solid rgba(143, 169, 155, 0.2)',
              borderRadius: '4px',
              display: 'flex',
              justifyContent: 'space-between'
            }}
          >
            <span style={{ color: '#f0f4f2' }}>{item.name}</span>
            <span style={{ color: '#4ade80' }}>Category {item.category}</span>
          </div>
        ))}
      </div>
    </div>
  )
}`

function UseMemoPage() {
  return (
    <div className="hook-page">
      <header className="page-header">
        <h1>useMemo Hook</h1>
        <p className="subtitle">Optimize expensive computations with memoization</p>
      </header>

      <section className="content-section">
        <h2>Overview</h2>
        <p>
          The <code>useMemo</code> hook returns a memoized value. It only recalculates 
          the value when one of its dependencies changes, helping optimize performance 
          for expensive computations.
        </p>
      </section>

      <section className="content-section">
        <h2>Syntax</h2>
        <pre className="code-block">
{`const memoizedValue = useMemo(() => {
  return expensiveComputation(a, b)
}, [a, b]) // Dependencies`}
        </pre>
      </section>

      <section className="examples-section">
        <h2>Interactive Example</h2>
        
        <CodeExample
          title="Expensive Filtering with useMemo"
          description="Filter large dataset efficiently, avoiding unnecessary recalculations"
          code={expensiveCalculationExample}
          scope={{ React, useState, useMemo }}
        />
      </section>

      <section className="content-section">
        <h2>Best Practices</h2>
        <ul className="best-practices-list">
          <li>Use for genuinely expensive computations, not premature optimization</li>
          <li>Profile first to identify performance bottlenecks</li>
          <li>Ensure dependencies array is complete and correct</li>
          <li>Don't use for simple calculations or object creation</li>
          <li>Consider React.memo for component memoization instead</li>
        </ul>
      </section>
    </div>
  )
}

export default UseMemoPage
