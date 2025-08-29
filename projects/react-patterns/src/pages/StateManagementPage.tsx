import { useState, useContext, createContext, useReducer, useCallback, useMemo } from 'react'

// Context API Example
interface ThemeContextType {
  theme: 'light' | 'dark'
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | null>(null)

// Reducer for complex state management
interface CounterState {
  count: number
  history: number[]
  step: number
}

type CounterAction = 
  | { type: 'INCREMENT' }
  | { type: 'DECREMENT' }
  | { type: 'SET_STEP'; step: number }
  | { type: 'RESET' }
  | { type: 'UNDO' }

const counterReducer = (state: CounterState, action: CounterAction): CounterState => {
  switch (action.type) {
    case 'INCREMENT':
      return {
        ...state,
        count: state.count + state.step,
        history: [...state.history, state.count]
      }
    case 'DECREMENT':
      return {
        ...state,
        count: state.count - state.step,
        history: [...state.history, state.count]
      }
    case 'SET_STEP':
      return {
        ...state,
        step: action.step
      }
    case 'RESET':
      return {
        count: 0,
        history: [],
        step: 1
      }
    case 'UNDO':
      if (state.history.length > 0) {
        const newHistory = [...state.history]
        const previousValue = newHistory.pop()!
        return {
          ...state,
          count: previousValue,
          history: newHistory
        }
      }
      return state
    default:
      return state
  }
}

// Context Provider Component
function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  
  const toggleTheme = useCallback(() => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light')
  }, [])
  
  const value = useMemo(() => ({ theme, toggleTheme }), [theme, toggleTheme])
  
  return (
    <ThemeContext.Provider value={value}>
      <div style={{ 
        background: theme === 'light' ? '#ffffff' : '#1a1a1a',
        color: theme === 'light' ? '#000000' : '#ffffff',
        padding: '1rem',
        borderRadius: '8px',
        border: `1px solid ${theme === 'light' ? '#e2e8f0' : '#374151'}`
      }}>
        {children}
      </div>
    </ThemeContext.Provider>
  )
}

// Component using Context
function ThemedButton() {
  const context = useContext(ThemeContext)
  if (!context) throw new Error('ThemedButton must be used within ThemeProvider')
  
  const { theme, toggleTheme } = context
  
  return (
    <button 
      onClick={toggleTheme}
      style={{
        background: theme === 'light' ? '#3b82f6' : '#1e40af',
        color: 'white',
        border: 'none',
        padding: '0.5rem 1rem',
        borderRadius: '4px',
        cursor: 'pointer'
      }}
    >
      Toggle to {theme === 'light' ? 'Dark' : 'Light'} Theme
    </button>
  )
}

// Counter Component using useReducer
function AdvancedCounter() {
  const [state, dispatch] = useReducer(counterReducer, {
    count: 0,
    history: [],
    step: 1
  })
  
  return (
    <div style={{
      background: 'rgba(26, 93, 58, 0.1)',
      padding: '1.5rem',
      borderRadius: '8px',
      border: '1px solid rgba(26, 93, 58, 0.2)'
    }}>
      <h3>Advanced Counter with useReducer</h3>
      <div style={{ fontSize: '2rem', fontWeight: 'bold', margin: '1rem 0' }}>
        Count: {state.count}
      </div>
      
      <div style={{ marginBottom: '1rem' }}>
        <label>Step Size: </label>
        <input
          type="number"
          value={state.step}
          onChange={(e) => dispatch({ type: 'SET_STEP', step: parseInt(e.target.value) || 1 })}
          style={{ width: '60px', marginLeft: '0.5rem' }}
        />
      </div>
      
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        <button onClick={() => dispatch({ type: 'INCREMENT' })} className="generate-button">
          +{state.step}
        </button>
        <button onClick={() => dispatch({ type: 'DECREMENT' })} className="generate-button">
          -{state.step}
        </button>
        <button onClick={() => dispatch({ type: 'UNDO' })} className="reset-button"
                disabled={state.history.length === 0}>
          Undo
        </button>
        <button onClick={() => dispatch({ type: 'RESET' })} className="reset-button">
          Reset
        </button>
      </div>
      
      {state.history.length > 0 && (
        <div style={{ marginTop: '1rem' }}>
          <strong>History:</strong> {state.history.join(' → ')}
        </div>
      )}
    </div>
  )
}

// Component demonstrating state lifting and prop drilling
function ShoppingCart() {
  const [items, setItems] = useState<Array<{id: number, name: string, price: number, quantity: number}>>([
    { id: 1, name: 'React Book', price: 29.99, quantity: 1 },
    { id: 2, name: 'JavaScript Guide', price: 34.99, quantity: 2 }
  ])
  
  const updateQuantity = useCallback((id: number, quantity: number) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, quantity: Math.max(0, quantity) } : item
    ))
  }, [])
  
  const removeItem = useCallback((id: number) => {
    setItems(prev => prev.filter(item => item.id !== id))
  }, [])
  
  const total = useMemo(() => {
    return items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  }, [items])
  
  return (
    <div style={{
      background: 'rgba(15, 25, 20, 0.6)',
      padding: '1.5rem',
      borderRadius: '8px',
      border: '1px solid rgba(26, 93, 58, 0.2)'
    }}>
      <h3>Shopping Cart (State Lifting Example)</h3>
      
      {items.map(item => (
        <CartItem 
          key={item.id}
          item={item}
          onUpdateQuantity={updateQuantity}
          onRemove={removeItem}
        />
      ))}
      
      <div style={{ 
        marginTop: '1rem', 
        paddingTop: '1rem', 
        borderTop: '1px solid rgba(26, 93, 58, 0.3)',
        fontSize: '1.2rem',
        fontWeight: 'bold'
      }}>
        Total: ${total.toFixed(2)}
      </div>
    </div>
  )
}

function CartItem({ 
  item, 
  onUpdateQuantity, 
  onRemove 
}: {
  item: {id: number, name: string, price: number, quantity: number}
  onUpdateQuantity: (id: number, quantity: number) => void
  onRemove: (id: number) => void
}) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '0.5rem',
      background: 'rgba(26, 93, 58, 0.05)',
      borderRadius: '4px',
      marginBottom: '0.5rem'
    }}>
      <div>
        <strong>{item.name}</strong>
        <div style={{ fontSize: '0.9rem', color: '#a8bdb2' }}>
          ${item.price.toFixed(2)} each
        </div>
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <button 
          onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
          disabled={item.quantity <= 1}
          style={{ width: '30px', height: '30px' }}
        >
          -
        </button>
        <span style={{ minWidth: '20px', textAlign: 'center' }}>
          {item.quantity}
        </span>
        <button 
          onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
          style={{ width: '30px', height: '30px' }}
        >
          +
        </button>
        <button 
          onClick={() => onRemove(item.id)}
          style={{ marginLeft: '1rem', background: '#dc2626', color: 'white' }}
        >
          Remove
        </button>
      </div>
    </div>
  )
}

function StateManagementPage() {
  return (
    <div className="page">
      <header className="page-header">
        <h1>State Management Patterns</h1>
        <p className="subtitle">Managing application state at scale with various React patterns</p>
      </header>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        {/* Context API Example */}
        <section className="info-panel">
          <h3>1. Context API for Global State</h3>
          <p>The Context API allows you to share state across components without prop drilling.</p>
          
          <ThemeProvider>
            <div style={{ padding: '1rem' }}>
              <h4>Themed Component</h4>
              <p>This component receives theme data through Context API</p>
              <ThemedButton />
            </div>
          </ThemeProvider>
        </section>
        
        {/* useReducer Example */}
        <section className="info-panel">
          <h3>2. useReducer for Complex State Logic</h3>
          <p>useReducer is ideal for complex state transitions and actions.</p>
          <AdvancedCounter />
        </section>
        
        {/* State Lifting Example */}
        <section className="info-panel">
          <h3>3. State Lifting and Prop Passing</h3>
          <p>Lifting state up to share it between sibling components.</p>
          <ShoppingCart />
        </section>
        
        {/* Code Examples */}
        <section className="info-panel">
          <h3>Key State Management Patterns</h3>
          
          <h4 style={{ marginTop: '2rem' }}>1. useState for Local State</h4>
          <pre style={{ 
            background: 'rgba(15, 25, 20, 0.8)', 
            padding: '1rem', 
            borderRadius: '4px',
            overflow: 'auto'
          }}>
{`const [count, setCount] = useState(0)
const [name, setName] = useState('')
const [todos, setTodos] = useState([])`}
          </pre>
          
          <h4 style={{ marginTop: '2rem' }}>2. useReducer for Complex State</h4>
          <pre style={{ 
            background: 'rgba(15, 25, 20, 0.8)', 
            padding: '1rem', 
            borderRadius: '4px',
            overflow: 'auto'
          }}>
{`const [state, dispatch] = useReducer(reducer, initialState)

function reducer(state, action) {
  switch (action.type) {
    case 'INCREMENT':
      return { count: state.count + 1 }
    case 'DECREMENT':
      return { count: state.count - 1 }
    default:
      return state
  }
}`}
          </pre>
          
          <h4 style={{ marginTop: '2rem' }}>3. Context API Pattern</h4>
          <pre style={{ 
            background: 'rgba(15, 25, 20, 0.8)', 
            padding: '1rem', 
            borderRadius: '4px',
            overflow: 'auto'
          }}>
{`const MyContext = createContext()

function Provider({ children }) {
  const [state, setState] = useState(initialState)
  return (
    <MyContext.Provider value={{ state, setState }}>
      {children}
    </MyContext.Provider>
  )
}

function Consumer() {
  const { state, setState } = useContext(MyContext)
  return <div>{state.value}</div>
}`}
          </pre>
        </section>
        
        <section className="info-panel">
          <h3>When to Use Each Pattern</h3>
          <ul>
            <li><strong>useState:</strong> Simple local component state</li>
            <li><strong>useReducer:</strong> Complex state logic with multiple actions</li>
            <li><strong>Context API:</strong> Global state needed across many components</li>
            <li><strong>State Lifting:</strong> Sharing state between sibling components</li>
            <li><strong>External Libraries:</strong> Redux, Zustand, Jotai for complex apps</li>
          </ul>
          
          <h3 style={{ marginTop: '2rem' }}>Best Practices</h3>
          <ul>
            <li>Keep state as close to where it's used as possible</li>
            <li>Use useCallback and useMemo to prevent unnecessary re-renders</li>
            <li>Split contexts to avoid over-rendering</li>
            <li>Consider state normalization for complex data structures</li>
            <li>Use TypeScript for better state management type safety</li>
          </ul>
        </section>
      </div>
    </div>
  )
}

export default StateManagementPage