import React, { useReducer } from 'react'
import CodeExample from '../../components/CodeExample'
import './hooks.css'

const counterReducerExample = `
// Define reducer function
function counterReducer(state, action) {
  switch (action.type) {
    case 'increment':
      return { count: state.count + 1 }
    case 'decrement':
      return { count: state.count - 1 }
    case 'reset':
      return { count: 0 }
    case 'setValue':
      return { count: action.payload }
    default:
      throw new Error('Unknown action: ' + action.type)
  }
}

function Counter() {
  // Initialize with useReducer
  const [state, dispatch] = useReducer(counterReducer, { count: 0 })
  
  return (
    <div style={{ padding: '1rem' }}>
      <h3 style={{ color: '#f0f4f2', marginBottom: '1rem' }}>
        Count: {state.count}
      </h3>
      
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        <button
          onClick={() => dispatch({ type: 'increment' })}
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
        
        <button
          onClick={() => dispatch({ type: 'decrement' })}
          style={{
            padding: '0.5rem 1rem',
            background: '#735c3a',
            color: '#f0f4f2',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Decrement
        </button>
        
        <button
          onClick={() => dispatch({ type: 'reset' })}
          style={{
            padding: '0.5rem 1rem',
            background: '#8b4513',
            color: '#f0f4f2',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Reset
        </button>
        
        <button
          onClick={() => dispatch({ type: 'setValue', payload: 100 })}
          style={{
            padding: '0.5rem 1rem',
            background: '#4a5568',
            color: '#f0f4f2',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Set to 100
        </button>
      </div>
    </div>
  )
}`

const todoReducerExample = `
// Todo reducer with multiple actions
function todoReducer(state, action) {
  switch (action.type) {
    case 'add':
      return {
        ...state,
        todos: [
          ...state.todos,
          {
            id: Date.now(),
            text: action.payload,
            completed: false
          }
        ]
      }
    case 'toggle':
      return {
        ...state,
        todos: state.todos.map(todo =>
          todo.id === action.payload
            ? { ...todo, completed: !todo.completed }
            : todo
        )
      }
    case 'delete':
      return {
        ...state,
        todos: state.todos.filter(todo => todo.id !== action.payload)
      }
    case 'setFilter':
      return {
        ...state,
        filter: action.payload
      }
    default:
      return state
  }
}

function TodoApp() {
  const initialState = {
    todos: [],
    filter: 'all' // all, active, completed
  }
  
  const [state, dispatch] = useReducer(todoReducer, initialState)
  const [inputValue, setInputValue] = React.useState('')
  
  const handleSubmit = (e) => {
    e.preventDefault()
    if (inputValue.trim()) {
      dispatch({ type: 'add', payload: inputValue })
      setInputValue('')
    }
  }
  
  const filteredTodos = state.todos.filter(todo => {
    if (state.filter === 'active') return !todo.completed
    if (state.filter === 'completed') return todo.completed
    return true
  })
  
  return (
    <div style={{ padding: '1rem' }}>
      <form onSubmit={handleSubmit} style={{ marginBottom: '1rem' }}>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Add a todo..."
          style={{
            padding: '0.5rem',
            marginRight: '0.5rem',
            background: 'rgba(15, 25, 20, 0.6)',
            color: '#f0f4f2',
            border: '1px solid rgba(143, 169, 155, 0.2)',
            borderRadius: '4px',
            width: '200px'
          }}
        />
        <button
          type="submit"
          style={{
            padding: '0.5rem 1rem',
            background: '#1a5d3a',
            color: '#f0f4f2',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Add
        </button>
      </form>
      
      <div style={{ marginBottom: '1rem' }}>
        {['all', 'active', 'completed'].map(filter => (
          <button
            key={filter}
            onClick={() => dispatch({ type: 'setFilter', payload: filter })}
            style={{
              padding: '0.25rem 0.75rem',
              marginRight: '0.5rem',
              background: state.filter === filter ? '#4ade80' : 'rgba(15, 25, 20, 0.6)',
              color: state.filter === filter ? '#0a0f0d' : '#f0f4f2',
              border: '1px solid rgba(143, 169, 155, 0.2)',
              borderRadius: '4px',
              cursor: 'pointer',
              textTransform: 'capitalize'
            }}
          >
            {filter}
          </button>
        ))}
      </div>
      
      <div>
        {filteredTodos.map(todo => (
          <div
            key={todo.id}
            style={{
              padding: '0.75rem',
              marginBottom: '0.5rem',
              background: 'rgba(15, 25, 20, 0.6)',
              border: '1px solid rgba(143, 169, 155, 0.2)',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <span
              onClick={() => dispatch({ type: 'toggle', payload: todo.id })}
              style={{
                color: todo.completed ? '#8fa99b' : '#f0f4f2',
                textDecoration: todo.completed ? 'line-through' : 'none',
                cursor: 'pointer',
                flex: 1
              }}
            >
              {todo.text}
            </span>
            <button
              onClick={() => dispatch({ type: 'delete', payload: todo.id })}
              style={{
                padding: '0.25rem 0.5rem',
                background: '#8b4513',
                color: '#f0f4f2',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.875rem'
              }}
            >
              Delete
            </button>
          </div>
        ))}
        {filteredTodos.length === 0 && (
          <p style={{ color: '#8fa99b', textAlign: 'center', marginTop: '1rem' }}>
            No todos to display
          </p>
        )}
      </div>
    </div>
  )
}`

const formReducerExample = `
// Form state reducer with validation
function formReducer(state, action) {
  switch (action.type) {
    case 'updateField':
      return {
        ...state,
        values: {
          ...state.values,
          [action.field]: action.value
        },
        errors: {
          ...state.errors,
          [action.field]: ''
        }
      }
    case 'setError':
      return {
        ...state,
        errors: {
          ...state.errors,
          [action.field]: action.error
        }
      }
    case 'submit':
      // Validate all fields
      const errors = {}
      if (!state.values.name) errors.name = 'Name is required'
      if (!state.values.email) errors.email = 'Email is required'
      else if (!/\\S+@\\S+\\.\\S+/.test(state.values.email)) {
        errors.email = 'Email is invalid'
      }
      if (!state.values.password) errors.password = 'Password is required'
      else if (state.values.password.length < 6) {
        errors.password = 'Password must be at least 6 characters'
      }
      
      if (Object.keys(errors).length > 0) {
        return { ...state, errors, submitted: false }
      }
      
      return { ...state, errors: {}, submitted: true }
    case 'reset':
      return {
        values: { name: '', email: '', password: '' },
        errors: {},
        submitted: false
      }
    default:
      return state
  }
}

function FormExample() {
  const initialState = {
    values: { name: '', email: '', password: '' },
    errors: {},
    submitted: false
  }
  
  const [state, dispatch] = useReducer(formReducer, initialState)
  
  const handleSubmit = (e) => {
    e.preventDefault()
    dispatch({ type: 'submit' })
  }
  
  if (state.submitted) {
    return (
      <div style={{ padding: '1rem' }}>
        <div style={{
          padding: '1rem',
          background: 'rgba(74, 222, 128, 0.1)',
          border: '1px solid rgba(74, 222, 128, 0.3)',
          borderRadius: '8px',
          marginBottom: '1rem'
        }}>
          <h4 style={{ color: '#4ade80', marginBottom: '0.5rem' }}>
            Form Submitted Successfully!
          </h4>
          <p style={{ color: '#a8bdb2' }}>Name: {state.values.name}</p>
          <p style={{ color: '#a8bdb2' }}>Email: {state.values.email}</p>
        </div>
        <button
          onClick={() => dispatch({ type: 'reset' })}
          style={{
            padding: '0.5rem 1rem',
            background: '#1a5d3a',
            color: '#f0f4f2',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Reset Form
        </button>
      </div>
    )
  }
  
  return (
    <form onSubmit={handleSubmit} style={{ padding: '1rem' }}>
      <div style={{ marginBottom: '1rem' }}>
        <input
          type="text"
          value={state.values.name}
          onChange={(e) => dispatch({
            type: 'updateField',
            field: 'name',
            value: e.target.value
          })}
          placeholder="Name"
          style={{
            padding: '0.5rem',
            width: '100%',
            background: 'rgba(15, 25, 20, 0.6)',
            color: '#f0f4f2',
            border: \`1px solid \${state.errors.name ? '#ef4444' : 'rgba(143, 169, 155, 0.2)'}\`,
            borderRadius: '4px'
          }}
        />
        {state.errors.name && (
          <p style={{ color: '#ef4444', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            {state.errors.name}
          </p>
        )}
      </div>
      
      <div style={{ marginBottom: '1rem' }}>
        <input
          type="email"
          value={state.values.email}
          onChange={(e) => dispatch({
            type: 'updateField',
            field: 'email',
            value: e.target.value
          })}
          placeholder="Email"
          style={{
            padding: '0.5rem',
            width: '100%',
            background: 'rgba(15, 25, 20, 0.6)',
            color: '#f0f4f2',
            border: \`1px solid \${state.errors.email ? '#ef4444' : 'rgba(143, 169, 155, 0.2)'}\`,
            borderRadius: '4px'
          }}
        />
        {state.errors.email && (
          <p style={{ color: '#ef4444', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            {state.errors.email}
          </p>
        )}
      </div>
      
      <div style={{ marginBottom: '1rem' }}>
        <input
          type="password"
          value={state.values.password}
          onChange={(e) => dispatch({
            type: 'updateField',
            field: 'password',
            value: e.target.value
          })}
          placeholder="Password"
          style={{
            padding: '0.5rem',
            width: '100%',
            background: 'rgba(15, 25, 20, 0.6)',
            color: '#f0f4f2',
            border: \`1px solid \${state.errors.password ? '#ef4444' : 'rgba(143, 169, 155, 0.2)'}\`,
            borderRadius: '4px'
          }}
        />
        {state.errors.password && (
          <p style={{ color: '#ef4444', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            {state.errors.password}
          </p>
        )}
      </div>
      
      <button
        type="submit"
        style={{
          padding: '0.75rem 1.5rem',
          background: '#1a5d3a',
          color: '#f0f4f2',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          width: '100%'
        }}
      >
        Submit
      </button>
    </form>
  )
}`

function UseReducerPage() {
  return (
    <div className="hook-page">
      <header className="page-header">
        <h1>useReducer Hook</h1>
        <p className="subtitle">Manage complex state logic with reducers</p>
      </header>

      <section className="content-section">
        <h2>Overview</h2>
        <p>
          The <code>useReducer</code> hook is an alternative to <code>useState</code> for managing 
          complex state logic. It's particularly useful when state updates depend on previous state 
          or when you have multiple sub-values that need to be updated together.
        </p>
      </section>

      <section className="content-section">
        <h2>Syntax</h2>
        <pre className="code-block">
{`const [state, dispatch] = useReducer(reducer, initialState)

// Reducer function
function reducer(state, action) {
  switch (action.type) {
    case 'ACTION_TYPE':
      return newState
    default:
      return state
  }
}`}
        </pre>
      </section>

      <section className="content-section">
        <h2>Key Concepts</h2>
        <ul className="concepts-list">
          <li><strong>Reducer:</strong> Pure function that takes state and action, returns new state</li>
          <li><strong>Dispatch:</strong> Function to trigger state updates with actions</li>
          <li><strong>Actions:</strong> Objects describing what happened (usually with type and payload)</li>
          <li><strong>Predictable Updates:</strong> All state changes go through the reducer</li>
        </ul>
      </section>

      <section className="examples-section">
        <h2>Interactive Examples</h2>
        
        <CodeExample
          title="Counter with Multiple Actions"
          description="Counter demonstrating different action types and payloads"
          code={counterReducerExample}
          scope={{ React, useReducer }}
        />
        
        <CodeExample
          title="Todo List with Filters"
          description="Complex state management with todos and filtering"
          code={todoReducerExample}
          scope={{ React, useReducer }}
        />
        
        <CodeExample
          title="Form with Validation"
          description="Form state and validation logic managed by reducer"
          code={formReducerExample}
          scope={{ React, useReducer }}
        />
      </section>

      <section className="content-section">
        <h2>When to Use useReducer</h2>
        <div className="comparison-grid">
          <div className="comparison-card">
            <h3>Use useState When:</h3>
            <ul>
              <li>State is a primitive value</li>
              <li>State updates are simple</li>
              <li>Limited state transitions</li>
              <li>State updates are independent</li>
            </ul>
          </div>
          
          <div className="comparison-card">
            <h3>Use useReducer When:</h3>
            <ul>
              <li>State is an object or array</li>
              <li>Complex state update logic</li>
              <li>Multiple ways to update state</li>
              <li>State updates depend on previous state</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="content-section">
        <h2>Best Practices</h2>
        <ul className="best-practices-list">
          <li>Keep reducers pure - no side effects</li>
          <li>Always return a new state object, don't mutate</li>
          <li>Use descriptive action types</li>
          <li>Consider combining with Context for global state</li>
          <li>Handle default case in switch statements</li>
          <li>Use TypeScript for type-safe actions and state</li>
        </ul>
      </section>
    </div>
  )
}

export default UseReducerPage