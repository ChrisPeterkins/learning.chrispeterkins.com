import React, { useRef, useState, useEffect } from 'react'
import CodeExample from '../../components/CodeExample'
import './hooks.css'

const focusExample = `
function FocusInput() {
  const inputRef = useRef(null)
  const [value, setValue] = useState('')
  
  const focusInput = () => {
    inputRef.current.focus()
    inputRef.current.select()
  }
  
  return (
    <div style={{ padding: '1rem' }}>
      <input
        ref={inputRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Click button to focus me"
        style={{
          padding: '0.5rem',
          marginRight: '1rem',
          background: 'rgba(15, 25, 20, 0.6)',
          color: '#f0f4f2',
          border: '1px solid rgba(143, 169, 155, 0.2)',
          borderRadius: '4px',
          width: '250px'
        }}
      />
      <button
        onClick={focusInput}
        style={{
          padding: '0.5rem 1rem',
          background: '#1a5d3a',
          color: '#f0f4f2',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Focus & Select
      </button>
    </div>
  )
}`

const previousValueExample = `
function PreviousValue() {
  const [count, setCount] = useState(0)
  const previousCountRef = useRef()
  
  useEffect(() => {
    previousCountRef.current = count
  })
  
  const previousCount = previousCountRef.current
  
  return (
    <div style={{ padding: '1rem' }}>
      <h4 style={{ color: '#f0f4f2', marginBottom: '1rem' }}>
        Current: {count}, Previous: {previousCount ?? 'N/A'}
      </h4>
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
        Increment
      </button>
    </div>
  )
}`

function UseRefPage() {
  return (
    <div className="hook-page">
      <header className="page-header">
        <h1>useRef Hook</h1>
        <p className="subtitle">Access DOM elements and persist values between renders</p>
      </header>

      <section className="content-section">
        <h2>Overview</h2>
        <p>
          The <code>useRef</code> hook creates a mutable ref object whose <code>.current</code> 
          property persists for the full lifetime of the component. Common uses include accessing 
          DOM elements and storing mutable values that don't trigger re-renders.
        </p>
      </section>

      <section className="content-section">
        <h2>Syntax</h2>
        <pre className="code-block">
{`const ref = useRef(initialValue)
// Access/modify: ref.current`}
        </pre>
      </section>

      <section className="examples-section">
        <h2>Interactive Examples</h2>
        
        <CodeExample
          title="DOM Element Access"
          description="Focus and select input programmatically"
          code={focusExample}
          scope={{ React, useRef, useState }}
        />
        
        <CodeExample
          title="Storing Previous Value"
          description="Keep track of previous state value"
          code={previousValueExample}
          scope={{ React, useRef, useState, useEffect }}
        />
      </section>

      <section className="content-section">
        <h2>Best Practices</h2>
        <ul className="best-practices-list">
          <li>Don't use refs for things that should be state</li>
          <li>Avoid reading/writing ref.current during rendering</li>
          <li>Use for DOM access, timers, and previous values</li>
          <li>Remember: changing ref.current doesn't trigger re-render</li>
        </ul>
      </section>
    </div>
  )
}

export default UseRefPage
