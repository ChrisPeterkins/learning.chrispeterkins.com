import React, { useState, useEffect } from 'react'
import CodeExample from '../../components/CodeExample'
import './hooks.css'

const basicEffectExample = `
function Timer() {
  const [seconds, setSeconds] = useState(0)
  
  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds(prev => prev + 1)
    }, 1000)
    
    // Cleanup function
    return () => clearInterval(interval)
  }, []) // Empty dependency array = run once
  
  return (
    <div style={{ padding: '1rem' }}>
      <h4 style={{ color: '#f0f4f2' }}>
        Timer: {seconds} seconds
      </h4>
      <button 
        onClick={() => setSeconds(0)}
        style={{
          padding: '0.5rem 1rem',
          background: '#1a5d3a',
          color: '#f0f4f2',
          border: 'none',
          cursor: 'pointer'
        }}
      >
        Reset
      </button>
    </div>
  )
}`

const dataFetchingExample = `
function UserProfile() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState(1)
  
  useEffect(() => {
    setLoading(true)
    // Simulating API call
    const fetchUser = async () => {
      await new Promise(resolve => setTimeout(resolve, 1000))
      setUser({
        id: userId,
        name: \`User \${userId}\`,
        email: \`user\${userId}@example.com\`
      })
      setLoading(false)
    }
    
    fetchUser()
  }, [userId]) // Re-run when userId changes
  
  return (
    <div style={{ padding: '1rem' }}>
      <div style={{ marginBottom: '1rem' }}>
        <button 
          onClick={() => setUserId(prev => prev - 1)}
          disabled={userId <= 1}
          style={{
            padding: '0.5rem',
            marginRight: '0.5rem',
            background: userId <= 1 ? '#333' : '#735c3a',
            color: '#f0f4f2',
            border: 'none',
            cursor: userId <= 1 ? 'not-allowed' : 'pointer'
          }}
        >
          Previous User
        </button>
        <button 
          onClick={() => setUserId(prev => prev + 1)}
          style={{
            padding: '0.5rem',
            background: '#1a5d3a',
            color: '#f0f4f2',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          Next User
        </button>
      </div>
      
      {loading ? (
        <p style={{ color: '#8fa99b' }}>Loading...</p>
      ) : (
        <div style={{ 
          padding: '1rem',
          background: 'rgba(15, 25, 20, 0.6)',
          border: '1px solid rgba(143, 169, 155, 0.2)',
          borderRadius: '8px'
        }}>
          <h4 style={{ color: '#4ade80', marginBottom: '0.5rem' }}>
            {user.name}
          </h4>
          <p style={{ color: '#a8bdb2' }}>ID: {user.id}</p>
          <p style={{ color: '#a8bdb2' }}>Email: {user.email}</p>
        </div>
      )}
    </div>
  )
}`

const windowResizeExample = `
function WindowSize() {
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  })
  
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      })
    }
    
    window.addEventListener('resize', handleResize)
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, []) // Empty array = set up once
  
  return (
    <div style={{ 
      padding: '1rem',
      background: 'rgba(15, 25, 20, 0.6)',
      border: '1px solid rgba(143, 169, 155, 0.2)',
      borderRadius: '8px'
    }}>
      <h4 style={{ color: '#4ade80', marginBottom: '0.5rem' }}>
        Window Dimensions
      </h4>
      <p style={{ color: '#a8bdb2' }}>
        Width: {windowSize.width}px
      </p>
      <p style={{ color: '#a8bdb2' }}>
        Height: {windowSize.height}px
      </p>
      <p style={{ 
        marginTop: '0.5rem', 
        fontSize: '0.875rem',
        color: '#8fa99b' 
      }}>
        Try resizing your window!
      </p>
    </div>
  )
}`

const localStorageExample = `
function Preferences() {
  const [theme, setTheme] = useState(() => {
    // Initialize from localStorage
    return localStorage.getItem('theme') || 'dark'
  })
  
  const [fontSize, setFontSize] = useState(() => {
    return localStorage.getItem('fontSize') || 'medium'
  })
  
  // Save to localStorage when values change
  useEffect(() => {
    localStorage.setItem('theme', theme)
  }, [theme])
  
  useEffect(() => {
    localStorage.setItem('fontSize', fontSize)
  }, [fontSize])
  
  return (
    <div style={{ padding: '1rem' }}>
      <div style={{ marginBottom: '1rem' }}>
        <label style={{ color: '#a8bdb2', marginRight: '1rem' }}>
          Theme:
          <select 
            value={theme} 
            onChange={(e) => setTheme(e.target.value)}
            style={{
              marginLeft: '0.5rem',
              padding: '0.25rem',
              background: 'rgba(15, 25, 20, 0.6)',
              color: '#f0f4f2',
              border: '1px solid rgba(143, 169, 155, 0.2)'
            }}
          >
            <option value="dark">Dark</option>
            <option value="light">Light</option>
            <option value="auto">Auto</option>
          </select>
        </label>
      </div>
      
      <div style={{ marginBottom: '1rem' }}>
        <label style={{ color: '#a8bdb2', marginRight: '1rem' }}>
          Font Size:
          <select 
            value={fontSize} 
            onChange={(e) => setFontSize(e.target.value)}
            style={{
              marginLeft: '0.5rem',
              padding: '0.25rem',
              background: 'rgba(15, 25, 20, 0.6)',
              color: '#f0f4f2',
              border: '1px solid rgba(143, 169, 155, 0.2)'
            }}
          >
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="large">Large</option>
          </select>
        </label>
      </div>
      
      <div style={{
        padding: '1rem',
        background: 'rgba(15, 25, 20, 0.6)',
        border: '1px solid rgba(143, 169, 155, 0.2)',
        borderRadius: '8px',
        fontSize: fontSize === 'small' ? '0.875rem' : 
                 fontSize === 'large' ? '1.25rem' : '1rem'
      }}>
        <p style={{ color: '#4ade80' }}>
          Current Settings:
        </p>
        <p style={{ color: '#a8bdb2' }}>
          Theme: {theme} | Font: {fontSize}
        </p>
        <p style={{ 
          marginTop: '0.5rem',
          fontSize: '0.875rem',
          color: '#8fa99b'
        }}>
          These preferences are saved to localStorage
        </p>
      </div>
    </div>
  )
}`

function UseEffectPage() {
  return (
    <div className="hook-page">
      <header className="page-header">
        <h1>useEffect Hook</h1>
        <p className="subtitle">Handle side effects and lifecycle events</p>
      </header>

      <section className="content-section">
        <h2>Overview</h2>
        <p>
          The <code>useEffect</code> hook lets you perform side effects in functional components.
          It serves the same purpose as <code>componentDidMount</code>, <code>componentDidUpdate</code>, 
          and <code>componentWillUnmount</code> combined.
        </p>
      </section>

      <section className="content-section">
        <h2>Syntax</h2>
        <pre className="code-block">
{`useEffect(() => {
  // Side effect logic
  
  return () => {
    // Cleanup function (optional)
  }
}, [dependencies])`}
        </pre>
      </section>

      <section className="content-section">
        <h2>Key Concepts</h2>
        <ul className="concepts-list">
          <li><strong>Side Effects:</strong> Operations like data fetching, subscriptions, or DOM manipulation</li>
          <li><strong>Dependencies:</strong> Array of values that trigger re-execution when changed</li>
          <li><strong>Cleanup:</strong> Return a function to clean up resources</li>
          <li><strong>Timing:</strong> Runs after every render by default</li>
        </ul>
      </section>

      <section className="examples-section">
        <h2>Interactive Examples</h2>
        
        <CodeExample
          title="Timer with Cleanup"
          description="A timer that demonstrates effect cleanup on unmount"
          code={basicEffectExample}
          scope={{ React, useState, useEffect }}
        />
        
        <CodeExample
          title="Data Fetching"
          description="Fetch data based on changing dependencies"
          code={dataFetchingExample}
          scope={{ React, useState, useEffect }}
        />
        
        <CodeExample
          title="Window Resize Listener"
          description="Subscribe to browser events with proper cleanup"
          code={windowResizeExample}
          scope={{ React, useState, useEffect }}
        />
        
        <CodeExample
          title="LocalStorage Sync"
          description="Persist state to localStorage automatically"
          code={localStorageExample}
          scope={{ React, useState, useEffect }}
        />
      </section>

      <section className="content-section">
        <h2>Common Patterns</h2>
        <div className="patterns-grid">
          <div className="pattern-card">
            <h3>Run Once on Mount</h3>
            <pre className="code-snippet">
{`useEffect(() => {
  // Runs once after mount
}, [])`}
            </pre>
          </div>
          
          <div className="pattern-card">
            <h3>Run on Specific Changes</h3>
            <pre className="code-snippet">
{`useEffect(() => {
  // Runs when 'value' changes
}, [value])`}
            </pre>
          </div>
          
          <div className="pattern-card">
            <h3>Cleanup Subscriptions</h3>
            <pre className="code-snippet">
{`useEffect(() => {
  const subscription = subscribe()
  return () => subscription.unsubscribe()
}, [])`}
            </pre>
          </div>
        </div>
      </section>

      <section className="content-section">
        <h2>Best Practices</h2>
        <ul className="best-practices-list">
          <li>Always include all dependencies in the array</li>
          <li>Use multiple effects for unrelated logic</li>
          <li>Clean up subscriptions and timers to prevent memory leaks</li>
          <li>Avoid using indexes or objects as dependencies</li>
          <li>Consider useLayoutEffect for DOM measurements</li>
        </ul>
      </section>
    </div>
  )
}

export default UseEffectPage