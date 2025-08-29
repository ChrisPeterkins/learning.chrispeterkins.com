import { useState, ReactNode, createContext, useContext, cloneElement } from 'react'

// Higher-Order Component Pattern
function withToggle<P extends object>(Component: React.ComponentType<P & { isOpen: boolean; toggle: () => void }>) {
  return function WithToggleComponent(props: P) {
    const [isOpen, setIsOpen] = useState(false)
    const toggle = () => setIsOpen(!isOpen)
    
    return <Component {...props} isOpen={isOpen} toggle={toggle} />
  }
}

// Render Props Pattern
interface ToggleProps {
  children: (args: { isOpen: boolean; toggle: () => void }) => ReactNode
}

function Toggle({ children }: ToggleProps) {
  const [isOpen, setIsOpen] = useState(false)
  const toggle = () => setIsOpen(!isOpen)
  
  return <>{children({ isOpen, toggle })}</>
}

// Compound Components Pattern
interface AccordionContextType {
  activeIndex: number | null
  setActiveIndex: (index: number | null) => void
}

const AccordionContext = createContext<AccordionContextType | null>(null)

function useAccordion() {
  const context = useContext(AccordionContext)
  if (!context) {
    throw new Error('Accordion compound components must be used within Accordion')
  }
  return context
}

interface AccordionProps {
  children: ReactNode
}

function Accordion({ children }: AccordionProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  
  return (
    <AccordionContext.Provider value={{ activeIndex, setActiveIndex }}>
      <div className="accordion">
        {children}
      </div>
    </AccordionContext.Provider>
  )
}

interface AccordionItemProps {
  index: number
  children: ReactNode
}

function AccordionItem({ index, children }: AccordionItemProps) {
  const { activeIndex, setActiveIndex } = useAccordion()
  const isActive = activeIndex === index
  
  const toggle = () => {
    setActiveIndex(isActive ? null : index)
  }
  
  return (
    <div className={`accordion-item ${isActive ? 'active' : ''}`}>
      {typeof children === 'function' 
        ? (children as any)({ isActive, toggle })
        : cloneElement(children as React.ReactElement, { isActive, toggle })
      }
    </div>
  )
}

function AccordionHeader({ children, isActive, toggle }: { children: ReactNode; isActive?: boolean; toggle?: () => void }) {
  return (
    <button 
      className={`accordion-header ${isActive ? 'active' : ''}`}
      onClick={toggle}
    >
      {children}
      <span className={`accordion-icon ${isActive ? 'expanded' : ''}`}>▼</span>
    </button>
  )
}

function AccordionPanel({ children, isActive }: { children: ReactNode; isActive?: boolean }) {
  return (
    <div className={`accordion-panel ${isActive ? 'expanded' : 'collapsed'}`}>
      <div className="accordion-content">
        {children}
      </div>
    </div>
  )
}

// Controlled Components Pattern
interface ControlledInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

function ControlledInput({ value, onChange, placeholder }: ControlledInputProps) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="controlled-input"
    />
  )
}

// Custom Hooks Pattern
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
  
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      window.localStorage.setItem(key, JSON.stringify(valueToStore))
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error)
    }
  }
  
  return [storedValue, setValue] as const
}

function useCounter(initialValue = 0) {
  const [count, setCount] = useState(initialValue)
  
  const increment = () => setCount(c => c + 1)
  const decrement = () => setCount(c => c - 1)
  const reset = () => setCount(initialValue)
  
  return { count, increment, decrement, reset }
}

// Example Components using patterns
const ButtonWithToggle = withToggle(({ isOpen, toggle }: { isOpen: boolean; toggle: () => void }) => (
  <div>
    <button onClick={toggle}>
      {isOpen ? 'Hide' : 'Show'} Content (HOC Pattern)
    </button>
    {isOpen && <p>Content revealed by Higher-Order Component!</p>}
  </div>
))

function PatternsPage() {
  const [inputValue, setInputValue] = useState('')
  const [savedValue, setSavedValue] = useLocalStorage('demo-input', '')
  const counter = useCounter(0)
  
  return (
    <div className="page">
      <header className="page-header">
        <h1>Component Patterns</h1>
        <p className="subtitle">Advanced React component patterns and techniques</p>
      </header>
      
      <div className="patterns-demo">
        
        {/* Higher-Order Component Pattern */}
        <section className="pattern-section">
          <h2>Higher-Order Component (HOC) Pattern</h2>
          <p>Enhances components by wrapping them with additional functionality.</p>
          <div className="demo">
            <ButtonWithToggle />
          </div>
        </section>

        {/* Render Props Pattern */}
        <section className="pattern-section">
          <h2>Render Props Pattern</h2>
          <p>Shares code between components using a prop whose value is a function.</p>
          <div className="demo">
            <Toggle>
              {({ isOpen, toggle }) => (
                <div>
                  <button onClick={toggle}>
                    {isOpen ? 'Hide' : 'Show'} Content (Render Props)
                  </button>
                  {isOpen && <p>Content revealed by Render Props pattern!</p>}
                </div>
              )}
            </Toggle>
          </div>
        </section>

        {/* Compound Components Pattern */}
        <section className="pattern-section">
          <h2>Compound Components Pattern</h2>
          <p>Creates a set of components that work together to form a complete UI.</p>
          <div className="demo">
            <Accordion>
              <AccordionItem index={0}>
                <AccordionHeader>What are React Patterns?</AccordionHeader>
                <AccordionPanel>
                  React patterns are reusable solutions to common problems in React development. 
                  They help create maintainable, scalable, and well-structured applications.
                </AccordionPanel>
              </AccordionItem>
              
              <AccordionItem index={1}>
                <AccordionHeader>Why use Component Patterns?</AccordionHeader>
                <AccordionPanel>
                  Component patterns improve code reusability, maintainability, and testability. 
                  They also help establish consistent APIs across your application.
                </AccordionPanel>
              </AccordionItem>
              
              <AccordionItem index={2}>
                <AccordionHeader>When to use each pattern?</AccordionHeader>
                <AccordionPanel>
                  Choose patterns based on your specific needs: HOCs for cross-cutting concerns, 
                  Render Props for flexible sharing, and Compound Components for related UI elements.
                </AccordionPanel>
              </AccordionItem>
            </Accordion>
          </div>
        </section>

        {/* Controlled Components Pattern */}
        <section className="pattern-section">
          <h2>Controlled Components Pattern</h2>
          <p>Components whose form data is handled by React state.</p>
          <div className="demo">
            <ControlledInput 
              value={inputValue}
              onChange={setInputValue}
              placeholder="Type something..."
            />
            <p>Current value: <code>{inputValue || 'empty'}</code></p>
          </div>
        </section>

        {/* Custom Hooks Pattern */}
        <section className="pattern-section">
          <h2>Custom Hooks Pattern</h2>
          <p>Extract component logic into reusable functions.</p>
          <div className="demo">
            <div className="hook-demo">
              <h4>useCounter Hook</h4>
              <p>Count: <strong>{counter.count}</strong></p>
              <div className="button-group">
                <button onClick={counter.increment}>+</button>
                <button onClick={counter.decrement}>-</button>
                <button onClick={counter.reset}>Reset</button>
              </div>
            </div>
            
            <div className="hook-demo">
              <h4>useLocalStorage Hook</h4>
              <ControlledInput 
                value={savedValue}
                onChange={setSavedValue}
                placeholder="This persists in localStorage..."
              />
              <p>Saved value: <code>{savedValue || 'empty'}</code></p>
            </div>
          </div>
        </section>
        
      </div>

      <div className="patterns-reference">
        <h2>Pattern Reference</h2>
        
        <div className="pattern-cards">
          <div className="pattern-card">
            <h3>Higher-Order Components (HOC)</h3>
            <p><strong>Use when:</strong> You need to enhance multiple components with the same functionality</p>
            <p><strong>Benefits:</strong> Code reuse, separation of concerns</p>
            <p><strong>Drawbacks:</strong> Wrapper hell, prop collision</p>
          </div>
          
          <div className="pattern-card">
            <h3>Render Props</h3>
            <p><strong>Use when:</strong> You need flexible, dynamic component composition</p>
            <p><strong>Benefits:</strong> Maximum flexibility, explicit data flow</p>
            <p><strong>Drawbacks:</strong> Can be verbose, callback hell</p>
          </div>
          
          <div className="pattern-card">
            <h3>Compound Components</h3>
            <p><strong>Use when:</strong> You have related components that work together</p>
            <p><strong>Benefits:</strong> Intuitive API, flexible composition</p>
            <p><strong>Drawbacks:</strong> Tight coupling, complex state management</p>
          </div>
          
          <div className="pattern-card">
            <h3>Custom Hooks</h3>
            <p><strong>Use when:</strong> You need to share stateful logic between components</p>
            <p><strong>Benefits:</strong> Clean separation, easy testing, reusability</p>
            <p><strong>Drawbacks:</strong> Can become complex, learning curve</p>
          </div>
        </div>
      </div>

      <style jsx>{`
        .patterns-demo {
          max-width: 1000px;
          margin: 2rem auto;
          padding: 0 1rem;
        }
        
        .pattern-section {
          margin: 3rem 0;
          padding: 2rem;
          border: 1px solid rgba(26, 93, 58, 0.2);
          border-radius: 8px;
          background: rgba(15, 25, 20, 0.4);
        }
        
        .pattern-section h2 {
          color: #4ade80;
          margin-bottom: 0.5rem;
        }
        
        .demo {
          margin: 1.5rem 0;
          padding: 1rem;
          background: rgba(15, 25, 20, 0.6);
          border-radius: 4px;
          border: 1px solid rgba(26, 93, 58, 0.3);
        }
        
        .accordion {
          border: 1px solid rgba(26, 93, 58, 0.3);
          border-radius: 4px;
          overflow: hidden;
        }
        
        .accordion-item {
          border-bottom: 1px solid rgba(26, 93, 58, 0.2);
        }
        
        .accordion-item:last-child {
          border-bottom: none;
        }
        
        .accordion-header {
          width: 100%;
          padding: 1rem;
          background: rgba(26, 93, 58, 0.1);
          border: none;
          color: #f0f4f2;
          text-align: left;
          cursor: pointer;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-family: inherit;
        }
        
        .accordion-header:hover {
          background: rgba(26, 93, 58, 0.2);
        }
        
        .accordion-header.active {
          background: rgba(26, 93, 58, 0.3);
          color: #4ade80;
        }
        
        .accordion-icon {
          transition: transform 0.3s ease;
        }
        
        .accordion-icon.expanded {
          transform: rotate(180deg);
        }
        
        .accordion-panel {
          overflow: hidden;
          transition: max-height 0.3s ease;
        }
        
        .accordion-panel.collapsed {
          max-height: 0;
        }
        
        .accordion-panel.expanded {
          max-height: 200px;
        }
        
        .accordion-content {
          padding: 1rem;
          color: #a8bdb2;
        }
        
        .controlled-input {
          width: 100%;
          max-width: 300px;
          padding: 0.5rem;
          background: rgba(15, 25, 20, 0.6);
          border: 1px solid rgba(26, 93, 58, 0.3);
          color: #f0f4f2;
          border-radius: 4px;
          font-family: inherit;
          margin-bottom: 0.5rem;
        }
        
        .controlled-input:focus {
          outline: none;
          border-color: #4ade80;
        }
        
        .hook-demo {
          margin: 1rem 0;
          padding: 1rem;
          border: 1px solid rgba(26, 93, 58, 0.2);
          border-radius: 4px;
        }
        
        .button-group {
          display: flex;
          gap: 0.5rem;
          margin-top: 0.5rem;
        }
        
        .button-group button {
          padding: 0.5rem 1rem;
          background: rgba(26, 93, 58, 0.2);
          border: 1px solid #1a5d3a;
          color: #4ade80;
          border-radius: 4px;
          cursor: pointer;
          font-family: inherit;
        }
        
        .button-group button:hover {
          background: rgba(26, 93, 58, 0.3);
        }
        
        .patterns-reference {
          max-width: 1000px;
          margin: 3rem auto;
          padding: 0 1rem;
        }
        
        .pattern-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
          margin-top: 2rem;
        }
        
        .pattern-card {
          padding: 1.5rem;
          background: rgba(15, 25, 20, 0.4);
          border: 1px solid rgba(26, 93, 58, 0.2);
          border-radius: 8px;
        }
        
        .pattern-card h3 {
          color: #4ade80;
          margin-bottom: 1rem;
        }
        
        .pattern-card p {
          color: #a8bdb2;
          margin: 0.5rem 0;
          font-size: 0.9rem;
        }
        
        code {
          background: rgba(26, 93, 58, 0.2);
          padding: 0.2rem 0.4rem;
          border-radius: 3px;
          font-family: 'JetBrains Mono', monospace;
          color: #4ade80;
        }
      `}</style>
    </div>
  )
}

export default PatternsPage