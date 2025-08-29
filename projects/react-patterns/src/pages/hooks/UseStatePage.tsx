import React, { useState } from 'react'
import CodeExample from '../../components/CodeExample'
import './hooks.css'

const basicCounterExample = `
function Counter() {
  const [count, setCount] = useState(0)
  
  return (
    <div style={{ padding: '1rem' }}>
      <h4 style={{ color: '#f0f4f2' }}>Count: {count}</h4>
      <button 
        onClick={() => setCount(count + 1)}
        style={{
          padding: '0.5rem 1rem',
          background: '#1a5d3a',
          color: '#f0f4f2',
          border: 'none',
          marginRight: '0.5rem',
          cursor: 'pointer'
        }}
      >
        Increment
      </button>
      <button 
        onClick={() => setCount(count - 1)}
        style={{
          padding: '0.5rem 1rem',
          background: '#735c3a',
          color: '#f0f4f2',
          border: 'none',
          cursor: 'pointer'
        }}
      >
        Decrement
      </button>
    </div>
  )
}`

const formExample = `
function Form() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  })
  
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }
  
  return (
    <div style={{ padding: '1rem' }}>
      <div style={{ marginBottom: '1rem' }}>
        <input
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Name"
          style={{
            padding: '0.5rem',
            marginRight: '0.5rem',
            background: 'rgba(15, 25, 20, 0.6)',
            border: '1px solid rgba(143, 169, 155, 0.2)',
            color: '#f0f4f2'
          }}
        />
        <input
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Email"
          style={{
            padding: '0.5rem',
            background: 'rgba(15, 25, 20, 0.6)',
            border: '1px solid rgba(143, 169, 155, 0.2)',
            color: '#f0f4f2'
          }}
        />
      </div>
      <div style={{ color: '#a8bdb2' }}>
        <p>Name: {formData.name}</p>
        <p>Email: {formData.email}</p>
      </div>
    </div>
  )
}`

const toggleExample = `
function Toggle() {
  const [isOn, setIsOn] = useState(false)
  
  return (
    <div style={{ padding: '1rem' }}>
      <button
        onClick={() => setIsOn(!isOn)}
        style={{
          padding: '0.75rem 1.5rem',
          background: isOn ? '#4ade80' : 'rgba(26, 93, 58, 0.2)',
          color: isOn ? '#0a0f0d' : '#f0f4f2',
          border: '1px solid rgba(26, 93, 58, 0.5)',
          cursor: 'pointer',
          transition: 'all 0.3s ease'
        }}
      >
        {isOn ? 'ON' : 'OFF'}
      </button>
      <p style={{ marginTop: '1rem', color: '#a8bdb2' }}>
        The switch is currently {isOn ? 'on' : 'off'}
      </p>
    </div>
  )
}`

function UseStatePage() {
  return (
    <div className="hook-page">
      <header className="page-header">
        <h1>useState Hook</h1>
        <p className="subtitle">The fundamental hook for managing component state</p>
      </header>

      <section className="content-section">
        <h2>Overview</h2>
        <p>
          The <code>useState</code> hook allows functional components to have state variables. 
          It returns an array with two elements: the current state value and a function to update it.
        </p>
      </section>

      <section className="content-section">
        <h2>Syntax</h2>
        <pre className="code-block">
{`const [state, setState] = useState(initialValue)`}
        </pre>
      </section>

      <section className="examples-section">
        <h2>Interactive Examples</h2>
        
        <CodeExample
          title="Basic Counter"
          description="A simple counter demonstrating basic useState functionality"
          code={basicCounterExample}
          scope={{ React, useState }}
        />
        
        <CodeExample
          title="Form Input Handling"
          description="Managing multiple form inputs with a single state object"
          code={formExample}
          scope={{ React, useState }}
        />
        
        <CodeExample
          title="Toggle State"
          description="Boolean state for toggling UI elements"
          code={toggleExample}
          scope={{ React, useState }}
        />
      </section>

      <section className="content-section">
        <h2>Best Practices</h2>
        <ul className="best-practices-list">
          <li>Use multiple useState calls for unrelated state variables</li>
          <li>Keep state as simple as possible</li>
          <li>Use the function form of setState when new state depends on previous state</li>
          <li>Initialize state with a function for expensive computations</li>
        </ul>
      </section>
    </div>
  )
}

export default UseStatePage