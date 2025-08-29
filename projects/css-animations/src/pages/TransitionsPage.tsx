import React, { useState } from 'react'

const TransitionsPage: React.FC = () => {
  const [property, setProperty] = useState('all')
  const [duration, setDuration] = useState('0.3')
  const [timing, setTiming] = useState('ease')
  const [delay, setDelay] = useState('0')
  
  const properties = ['all', 'transform', 'opacity', 'background-color', 'width', 'height']
  const timingFunctions = ['linear', 'ease', 'ease-in', 'ease-out', 'ease-in-out', 'cubic-bezier(0.4, 0, 0.2, 1)']

  return (
    <div className="transitions-page">
      <header className="page-header">
        <h1>CSS Transitions</h1>
        <p className="page-description">
          Create smooth transitions between CSS property changes. Perfect for hover effects, 
          state changes, and micro-interactions.
        </p>
      </header>

      <section>
        <h2 style={{ marginBottom: '2rem' }}>Transition Playground</h2>
        
        <div className="demo-container">
          <div className="demo-controls">
            <div className="control-group">
              <label>Property</label>
              <select 
                className="control-input"
                value={property} 
                onChange={(e) => setProperty(e.target.value)}
              >
                {properties.map(prop => (
                  <option key={prop} value={prop}>{prop}</option>
                ))}
              </select>
            </div>
            
            <div className="control-group">
              <label>Duration: {duration}s</label>
              <input 
                type="range" 
                min="0.1" 
                max="2" 
                step="0.1"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                style={{ width: '150px' }}
              />
            </div>
            
            <div className="control-group">
              <label>Timing</label>
              <select 
                className="control-input"
                value={timing} 
                onChange={(e) => setTiming(e.target.value)}
              >
                {timingFunctions.map(func => (
                  <option key={func} value={func}>
                    {func.includes('cubic') ? 'cubic-bezier' : func}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="control-group">
              <label>Delay: {delay}s</label>
              <input 
                type="range" 
                min="0" 
                max="1" 
                step="0.1"
                value={delay}
                onChange={(e) => setDelay(e.target.value)}
                style={{ width: '150px' }}
              />
            </div>
          </div>
          
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '2rem',
            marginTop: '2rem'
          }}>
            <div style={{ textAlign: 'center' }}>
              <h4 style={{ color: 'var(--accent-green-bright)', marginBottom: '1rem' }}>Hover Me</h4>
              <div style={{
                width: '100px',
                height: '100px',
                margin: '0 auto',
                background: 'var(--accent-green)',
                transition: `${property} ${duration}s ${timing} ${delay}s`,
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.2) rotate(45deg)'
                e.currentTarget.style.background = 'var(--accent-green-bright)'
                e.currentTarget.style.borderRadius = '50%'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1) rotate(0deg)'
                e.currentTarget.style.background = 'var(--accent-green)'
                e.currentTarget.style.borderRadius = '0'
              }} />
            </div>
            
            <div style={{ textAlign: 'center' }}>
              <h4 style={{ color: 'var(--accent-green-bright)', marginBottom: '1rem' }}>Click Me</h4>
              <button 
                style={{
                  padding: '1rem 2rem',
                  background: 'transparent',
                  border: '2px solid var(--accent-green)',
                  color: 'var(--accent-green-bright)',
                  cursor: 'pointer',
                  transition: `${property} ${duration}s ${timing} ${delay}s`,
                  fontSize: '1rem'
                }}
                onClick={(e) => {
                  const btn = e.currentTarget
                  btn.style.background = 'var(--accent-green)'
                  btn.style.color = 'var(--bg-primary)'
                  btn.style.transform = 'scale(0.95)'
                  setTimeout(() => {
                    btn.style.background = 'transparent'
                    btn.style.color = 'var(--accent-green-bright)'
                    btn.style.transform = 'scale(1)'
                  }, 200)
                }}
              >
                Button
              </button>
            </div>
            
            <div style={{ textAlign: 'center' }}>
              <h4 style={{ color: 'var(--accent-green-bright)', marginBottom: '1rem' }}>Focus Me</h4>
              <input 
                type="text"
                placeholder="Type here..."
                style={{
                  padding: '0.75rem',
                  background: 'var(--code-bg)',
                  border: '2px solid var(--border-primary)',
                  color: 'var(--text-primary)',
                  outline: 'none',
                  transition: `${property} ${duration}s ${timing} ${delay}s`,
                  width: '150px'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'var(--accent-green-bright)'
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(74, 222, 128, 0.2)'
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-primary)'
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              />
            </div>
          </div>
        </div>
      </section>

      <section style={{ marginTop: '3rem' }}>
        <h2 style={{ marginBottom: '1.5rem' }}>Generated CSS</h2>
        
        <div className="code-container">
          <div className="code-header">
            <span className="code-title">Transition CSS</span>
          </div>
          <div className="code-content">
            <pre>{`.element {
  transition: ${property} ${duration}s ${timing} ${delay}s;
  
  /* Or use individual properties */
  transition-property: ${property};
  transition-duration: ${duration}s;
  transition-timing-function: ${timing};
  transition-delay: ${delay}s;
}

/* Multiple transitions */
.multi-transition {
  transition: 
    transform 0.3s ease,
    opacity 0.5s ease-out,
    background-color 0.2s linear;
}`}</pre>
          </div>
        </div>
      </section>

      <section style={{ marginTop: '3rem' }}>
        <h2 style={{ marginBottom: '1.5rem' }}>Common Transition Patterns</h2>
        
        <div className="concept-grid">
          <div className="concept-card">
            <h3>Button Hover</h3>
            <p>Transform scale, background color, and shadow for interactive feedback.</p>
          </div>
          
          <div className="concept-card">
            <h3>Menu Slides</h3>
            <p>Transform translateX/Y for sliding menus and drawers.</p>
          </div>
          
          <div className="concept-card">
            <h3>Card Lifts</h3>
            <p>Combine translateY with box-shadow for elevation effects.</p>
          </div>
        </div>
      </section>
    </div>
  )
}

export default TransitionsPage