import React, { useState, useCallback, memo } from 'react'
import CodeExample from '../../components/CodeExample'
import './hooks.css'

const callbackExample = `
// Child component that only re-renders when props change
const ExpensiveChild = memo(({ onClick, data }) => {
  console.log('ExpensiveChild rendered')
  return (
    <button
      onClick={onClick}
      style={{
        padding: '0.5rem 1rem',
        background: '#735c3a',
        color: '#f0f4f2',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer'
      }}
    >
      Click me (data: {data})
    </button>
  )
})

function Parent() {
  const [count, setCount] = useState(0)
  const [text, setText] = useState('')
  
  // Without useCallback, this function is recreated every render
  // causing ExpensiveChild to re-render unnecessarily
  const handleClick = useCallback(() => {
    console.log('Button clicked with count:', count)
    alert(\`Count is \${count}\`)
  }, [count]) // Only recreate when count changes
  
  return (
    <div style={{ padding: '1rem' }}>
      <div style={{ marginBottom: '1rem' }}>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type something..."
          style={{
            padding: '0.5rem',
            marginRight: '1rem',
            background: 'rgba(15, 25, 20, 0.6)',
            color: '#f0f4f2',
            border: '1px solid rgba(143, 169, 155, 0.2)',
            borderRadius: '4px'
          }}
        />
        <span style={{ color: '#8fa99b' }}>
          (typing doesn't re-render child)
        </span>
      </div>
      
      <div style={{ marginBottom: '1rem' }}>
        <button
          onClick={() => setCount(c => c + 1)}
          style={{
            padding: '0.5rem 1rem',
            background: '#1a5d3a',
            color: '#f0f4f2',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginRight: '1rem'
          }}
        >
          Increment Count: {count}
        </button>
        <span style={{ color: '#8fa99b' }}>
          (this re-renders child)
        </span>
      </div>
      
      <ExpensiveChild onClick={handleClick} data={count} />
      
      <p style={{ marginTop: '1rem', fontSize: '0.875rem', color: '#8fa99b' }}>
        Check console to see when child re-renders
      </p>
    </div>
  )
}`

function UseCallbackPage() {
  return (
    <div className="hook-page">
      <header className="page-header">
        <h1>useCallback Hook</h1>
        <p className="subtitle">Memoize callback functions to prevent unnecessary re-renders</p>
      </header>

      <section className="content-section">
        <h2>Overview</h2>
        <p>
          The <code>useCallback</code> hook returns a memoized callback function. 
          It's useful when passing callbacks to optimized child components that rely on 
          reference equality to prevent unnecessary re-renders.
        </p>
      </section>

      <section className="content-section">
        <h2>Syntax</h2>
        <pre className="code-block">
{`const memoizedCallback = useCallback(() => {
  doSomething(a, b)
}, [a, b]) // Dependencies`}
        </pre>
      </section>

      <section className="examples-section">
        <h2>Interactive Example</h2>
        
        <CodeExample
          title="Preventing Child Re-renders"
          description="Use useCallback to maintain function reference equality"
          code={callbackExample}
          scope={{ React, useState, useCallback, memo }}
        />
      </section>

      <section className="content-section">
        <h2>Best Practices</h2>
        <ul className="best-practices-list">
          <li>Use with React.memo or shouldComponentUpdate</li>
          <li>Don't use for every function - only when needed for optimization</li>
          <li>Include all dependencies in the array</li>
          <li>Consider useMemo for expensive computations instead</li>
        </ul>
      </section>
    </div>
  )
}

export default UseCallbackPage
