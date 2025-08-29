import { useState, useEffect, useCallback, useRef } from 'react'
import './hooks.css'

// Custom Hook: useCounter
function useCounter(initialValue = 0) {
  const [count, setCount] = useState(initialValue)
  
  const increment = useCallback(() => setCount(prev => prev + 1), [])
  const decrement = useCallback(() => setCount(prev => prev - 1), [])
  const reset = useCallback(() => setCount(initialValue), [initialValue])
  
  return { count, increment, decrement, reset }
}

// Custom Hook: useLocalStorage
function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error)
      return initialValue
    }
  })
  
  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      window.localStorage.setItem(key, JSON.stringify(valueToStore))
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error)
    }
  }, [key, storedValue])
  
  return [storedValue, setValue] as const
}

// Custom Hook: useFetch
function useFetch<T>(url: string) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    const abortController = new AbortController()
    
    async function fetchData() {
      try {
        setLoading(true)
        setError(null)
        
        const response = await fetch(url, {
          signal: abortController.signal
        })
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const result = await response.json()
        setData(result)
      } catch (err) {
        if (err instanceof Error && err.name !== 'AbortError') {
          setError(err.message)
        }
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
    
    return () => {
      abortController.abort()
    }
  }, [url])
  
  return { data, loading, error }
}

// Custom Hook: useDebounce
function useDebounce<T>(value: T, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)
  
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)
    
    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])
  
  return debouncedValue
}

// Custom Hook: useWindowSize
function useWindowSize() {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0
  })
  
  useEffect(() => {
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      })
    }
    
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])
  
  return windowSize
}

// Custom Hook: usePrevious
function usePrevious<T>(value: T) {
  const ref = useRef<T>()
  
  useEffect(() => {
    ref.current = value
  })
  
  return ref.current
}

// Demo Components
function CounterDemo() {
  const { count, increment, decrement, reset } = useCounter(0)
  
  return (
    <div className="demo-section">
      <h3>useCounter Hook</h3>
      <div style={{ fontSize: '2rem', margin: '1rem 0' }}>Count: {count}</div>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button onClick={increment} className="generate-button">+</button>
        <button onClick={decrement} className="generate-button">-</button>
        <button onClick={reset} className="reset-button">Reset</button>
      </div>
    </div>
  )
}

function LocalStorageDemo() {
  const [name, setName] = useLocalStorage('name', '')
  const [theme, setTheme] = useLocalStorage('theme', 'light')
  
  return (
    <div className="demo-section">
      <h3>useLocalStorage Hook</h3>
      <p>This data persists in localStorage!</p>
      
      <div style={{ marginBottom: '1rem' }}>
        <label>Name: </label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your name"
          style={{ marginLeft: '0.5rem' }}
        />
      </div>
      
      <div>
        <label>Theme: </label>
        <select 
          value={theme} 
          onChange={(e) => setTheme(e.target.value)}
          style={{ marginLeft: '0.5rem' }}
        >
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select>
      </div>
      
      <div style={{ marginTop: '1rem' }}>
        <strong>Stored Values:</strong> Name: "{name}", Theme: "{theme}"
      </div>
    </div>
  )
}

function DebounceDemo() {
  const [text, setText] = useState('')
  const debouncedText = useDebounce(text, 500)
  const [searchResults, setSearchResults] = useState<string[]>([])
  
  useEffect(() => {
    if (debouncedText) {
      // Simulate search
      const results = [
        'React Hooks',
        'Custom Hooks',
        'useEffect',
        'useState',
        'useCallback'
      ].filter(item => 
        item.toLowerCase().includes(debouncedText.toLowerCase())
      )
      setSearchResults(results)
    } else {
      setSearchResults([])
    }
  }, [debouncedText])
  
  return (
    <div className="demo-section">
      <h3>useDebounce Hook</h3>
      <p>Search is debounced by 500ms to avoid excessive API calls.</p>
      
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Search..."
        style={{ width: '100%', marginBottom: '1rem' }}
      />
      
      <div>
        <strong>Current Input:</strong> "{text}"
      </div>
      <div>
        <strong>Debounced Input:</strong> "{debouncedText}"
      </div>
      
      {searchResults.length > 0 && (
        <div style={{ marginTop: '1rem' }}>
          <strong>Search Results:</strong>
          <ul>
            {searchResults.map((result, index) => (
              <li key={index}>{result}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

function WindowSizeDemo() {
  const { width, height } = useWindowSize()
  
  return (
    <div className="demo-section">
      <h3>useWindowSize Hook</h3>
      <p>Resize your window to see the values change!</p>
      <div style={{ 
        background: 'rgba(26, 93, 58, 0.1)', 
        padding: '1rem', 
        borderRadius: '8px',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '1rem'
      }}>
        <div>
          <strong>Width:</strong> {width}px
        </div>
        <div>
          <strong>Height:</strong> {height}px
        </div>
      </div>
    </div>
  )
}

function PreviousValueDemo() {
  const [count, setCount] = useState(0)
  const previousCount = usePrevious(count)
  
  return (
    <div className="demo-section">
      <h3>usePrevious Hook</h3>
      <div style={{ margin: '1rem 0' }}>
        <div><strong>Current:</strong> {count}</div>
        <div><strong>Previous:</strong> {previousCount ?? 'undefined'}</div>
      </div>
      
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button 
          onClick={() => setCount(c => c + 1)} 
          className="generate-button"
        >
          Increment
        </button>
        <button 
          onClick={() => setCount(c => c - 1)} 
          className="generate-button"
        >
          Decrement
        </button>
      </div>
    </div>
  )
}

function CustomHooksPage() {
  return (
    <div className="hook-page">
      <header className="page-header">
        <h1>Custom Hooks</h1>
        <p className="subtitle">Build reusable stateful logic with custom hooks</p>
      </header>
      
      <div style={{ display: 'grid', gap: '2rem' }}>
        
        {/* Interactive Demos */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
          gap: '2rem' 
        }}>
          <CounterDemo />
          <LocalStorageDemo />
          <DebounceDemo />
          <WindowSizeDemo />
          <PreviousValueDemo />
        </div>
        
        {/* Code Examples */}
        <section className="info-panel">
          <h3>Custom Hook Examples</h3>
          
          <h4 style={{ marginTop: '2rem' }}>useCounter Hook</h4>
          <pre style={{ 
            background: 'rgba(15, 25, 20, 0.8)', 
            padding: '1rem', 
            borderRadius: '4px',
            overflow: 'auto'
          }}>
{`function useCounter(initialValue = 0) {
  const [count, setCount] = useState(initialValue)
  
  const increment = useCallback(() => setCount(prev => prev + 1), [])
  const decrement = useCallback(() => setCount(prev => prev - 1), [])
  const reset = useCallback(() => setCount(initialValue), [initialValue])
  
  return { count, increment, decrement, reset }
}`}
          </pre>
          
          <h4 style={{ marginTop: '2rem' }}>useLocalStorage Hook</h4>
          <pre style={{ 
            background: 'rgba(15, 25, 20, 0.8)', 
            padding: '1rem', 
            borderRadius: '4px',
            overflow: 'auto'
          }}>
{`function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      return initialValue
    }
  })
  
  const setValue = useCallback((value) => {
    try {
      const valueToStore = value instanceof Function 
        ? value(storedValue) : value
      setStoredValue(valueToStore)
      window.localStorage.setItem(key, JSON.stringify(valueToStore))
    } catch (error) {
      console.error('Error setting localStorage:', error)
    }
  }, [key, storedValue])
  
  return [storedValue, setValue]
}`}
          </pre>
          
          <h4 style={{ marginTop: '2rem' }}>useDebounce Hook</h4>
          <pre style={{ 
            background: 'rgba(15, 25, 20, 0.8)', 
            padding: '1rem', 
            borderRadius: '4px',
            overflow: 'auto'
          }}>
{`function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value)
  
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)
    
    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])
  
  return debouncedValue
}`}
          </pre>
        </section>
        
        <section className="info-panel">
          <h3>Custom Hook Best Practices</h3>
          <ul>
            <li><strong>Start with "use":</strong> Follow the naming convention for hooks</li>
            <li><strong>Extract reusable logic:</strong> Move common stateful logic into custom hooks</li>
            <li><strong>Return consistent interfaces:</strong> Use objects or arrays consistently</li>
            <li><strong>Handle cleanup:</strong> Use useEffect cleanup for subscriptions and timers</li>
            <li><strong>Add TypeScript:</strong> Type your custom hooks for better developer experience</li>
            <li><strong>Keep them focused:</strong> Each hook should have a single responsibility</li>
          </ul>
          
          <h3 style={{ marginTop: '2rem' }}>Common Custom Hook Patterns</h3>
          <ul>
            <li><strong>Data Fetching:</strong> useFetch, useApi, useQuery</li>
            <li><strong>Form Handling:</strong> useForm, useValidation, useInput</li>
            <li><strong>UI State:</strong> useToggle, useModal, useLocalStorage</li>
            <li><strong>Performance:</strong> useDebounce, useThrottle, useMemoized</li>
            <li><strong>Browser APIs:</strong> useWindowSize, useGeolocation, useMediaQuery</li>
          </ul>
        </section>
      </div>
    </div>
  )
}

export default CustomHooksPage