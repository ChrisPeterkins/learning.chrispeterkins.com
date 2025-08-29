import React, { useState } from 'react'

const FlexboxPage: React.FC = () => {
  const [flexDirection, setFlexDirection] = useState('row')
  const [justifyContent, setJustifyContent] = useState('flex-start')
  const [alignItems, setAlignItems] = useState('stretch')
  const [flexWrap, setFlexWrap] = useState('nowrap')
  const [gap, setGap] = useState('10')
  const [itemCount, setItemCount] = useState(5)
  
  const directions = ['row', 'row-reverse', 'column', 'column-reverse']
  const justifyOptions = ['flex-start', 'flex-end', 'center', 'space-between', 'space-around', 'space-evenly']
  const alignOptions = ['stretch', 'flex-start', 'flex-end', 'center', 'baseline']
  const wrapOptions = ['nowrap', 'wrap', 'wrap-reverse']

  return (
    <div className="flexbox-page">
      <header className="page-header">
        <h1>Flexbox Layout</h1>
        <p className="page-description">
          Flexbox is a one-dimensional layout method for arranging items in rows or columns. 
          Items flex to fill additional space or shrink to fit into smaller spaces.
        </p>
      </header>

      <section>
        <h2 style={{ marginBottom: '2rem' }}>Interactive Flexbox Playground</h2>
        
        <div className="demo-container">
          <div className="demo-controls">
            <div className="control-group">
              <label>Flex Direction</label>
              <select 
                className="control-input"
                value={flexDirection} 
                onChange={(e) => setFlexDirection(e.target.value)}
              >
                {directions.map(dir => (
                  <option key={dir} value={dir}>{dir}</option>
                ))}
              </select>
            </div>
            
            <div className="control-group">
              <label>Justify Content</label>
              <select 
                className="control-input"
                value={justifyContent} 
                onChange={(e) => setJustifyContent(e.target.value)}
              >
                {justifyOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
            
            <div className="control-group">
              <label>Align Items</label>
              <select 
                className="control-input"
                value={alignItems} 
                onChange={(e) => setAlignItems(e.target.value)}
              >
                {alignOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
            
            <div className="control-group">
              <label>Flex Wrap</label>
              <select 
                className="control-input"
                value={flexWrap} 
                onChange={(e) => setFlexWrap(e.target.value)}
              >
                {wrapOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
            
            <div className="control-group">
              <label>Gap: {gap}px</label>
              <input 
                type="range" 
                min="0" 
                max="50" 
                value={gap}
                onChange={(e) => setGap(e.target.value)}
                style={{ width: '150px' }}
              />
            </div>
            
            <div className="control-group">
              <label>Items: {itemCount}</label>
              <input 
                type="range" 
                min="1" 
                max="10" 
                value={itemCount}
                onChange={(e) => setItemCount(Number(e.target.value))}
                style={{ width: '150px' }}
              />
            </div>
          </div>
          
          <div 
            style={{
              background: 'var(--code-bg)',
              border: '2px dashed var(--border-primary)',
              padding: '2rem',
              minHeight: '300px',
              display: 'flex',
              flexDirection: flexDirection as any,
              justifyContent: justifyContent as any,
              alignItems: alignItems as any,
              flexWrap: flexWrap as any,
              gap: `${gap}px`
            }}
          >
            {Array.from({ length: itemCount }, (_, i) => (
              <div 
                key={i}
                style={{
                  background: `linear-gradient(135deg, var(--accent-green) ${i * 20}%, var(--accent-green-bright))`,
                  color: 'var(--bg-primary)',
                  padding: '1rem 1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 600,
                  fontSize: '1.2rem',
                  minWidth: '60px',
                  minHeight: '60px',
                  flex: i === 2 ? '2' : '1'
                }}
              >
                {i + 1}
                {i === 2 && <span style={{ fontSize: '0.7rem', marginLeft: '0.5rem' }}>(flex: 2)</span>}
              </div>
            ))}
          </div>
          
          <div style={{ 
            marginTop: '1rem',
            padding: '1rem',
            background: 'rgba(74, 222, 128, 0.1)',
            border: '1px solid var(--accent-green)',
            borderRadius: '4px'
          }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>
              💡 <strong>Tip:</strong> Item 3 has flex: 2 while others have flex: 1, making it grow twice as much
            </p>
          </div>
        </div>
      </section>

      <section style={{ marginTop: '3rem' }}>
        <h2 style={{ marginBottom: '1.5rem' }}>Generated CSS</h2>
        
        <div className="code-container">
          <div className="code-header">
            <span className="code-title">Current Flexbox CSS</span>
          </div>
          <div className="code-content">
            <pre>{`.container {
  display: flex;
  flex-direction: ${flexDirection};
  justify-content: ${justifyContent};
  align-items: ${alignItems};
  flex-wrap: ${flexWrap};
  gap: ${gap}px;
}

.item {
  flex: 1; /* Grow and shrink equally */
}

.item-special {
  flex: 2; /* Takes up twice the space */
}`}</pre>
          </div>
        </div>
      </section>

      <section style={{ marginTop: '3rem' }}>
        <h2 style={{ marginBottom: '1.5rem' }}>Common Flexbox Patterns</h2>
        
        <div className="demo-container">
          <h3 style={{ color: 'var(--accent-green-bright)', marginBottom: '1rem' }}>Navigation Bar</h3>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '1rem',
            background: 'var(--code-bg)',
            border: '1px solid var(--border-primary)'
          }}>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Logo</span>
              <span style={{ color: 'var(--text-secondary)' }}>Home</span>
              <span style={{ color: 'var(--text-secondary)' }}>About</span>
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Login</span>
              <span style={{ color: 'var(--text-secondary)' }}>Sign Up</span>
            </div>
          </div>
          
          <h3 style={{ color: 'var(--accent-green-bright)', marginTop: '2rem', marginBottom: '1rem' }}>
            Card Layout
          </h3>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            {[1, 2, 3, 4].map(i => (
              <div key={i} style={{
                flex: '1 1 200px',
                padding: '1rem',
                background: 'var(--code-bg)',
                border: '1px solid var(--border-primary)',
                textAlign: 'center',
                color: 'var(--text-secondary)'
              }}>
                Card {i}
              </div>
            ))}
          </div>
          
          <h3 style={{ color: 'var(--accent-green-bright)', marginTop: '2rem', marginBottom: '1rem' }}>
            Holy Grail Layout
          </h3>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            height: '300px',
            background: 'var(--code-bg)',
            border: '1px solid var(--border-primary)'
          }}>
            <header style={{ 
              padding: '1rem', 
              background: 'var(--accent-green)', 
              color: 'var(--bg-primary)' 
            }}>
              Header
            </header>
            <div style={{ display: 'flex', flex: '1' }}>
              <aside style={{ 
                width: '150px', 
                padding: '1rem', 
                background: 'rgba(26, 93, 58, 0.2)',
                color: 'var(--text-secondary)' 
              }}>
                Sidebar
              </aside>
              <main style={{ flex: '1', padding: '1rem', color: 'var(--text-secondary)' }}>
                Main Content
              </main>
              <aside style={{ 
                width: '150px', 
                padding: '1rem', 
                background: 'rgba(26, 93, 58, 0.2)',
                color: 'var(--text-secondary)' 
              }}>
                Aside
              </aside>
            </div>
            <footer style={{ 
              padding: '1rem', 
              background: 'var(--accent-green)', 
              color: 'var(--bg-primary)' 
            }}>
              Footer
            </footer>
          </div>
        </div>
      </section>

      <section style={{ marginTop: '3rem' }}>
        <h2 style={{ marginBottom: '1.5rem' }}>Flexbox Properties</h2>
        
        <div className="concept-grid">
          <div className="concept-card">
            <h3>Container Properties</h3>
            <p>
              display: flex, flex-direction, flex-wrap, justify-content, align-items, 
              align-content, gap
            </p>
          </div>
          
          <div className="concept-card">
            <h3>Item Properties</h3>
            <p>
              flex-grow, flex-shrink, flex-basis, flex (shorthand), align-self, order
            </p>
          </div>
          
          <div className="concept-card">
            <h3>Alignment</h3>
            <p>
              Main axis (justify-content), Cross axis (align-items), Multi-line (align-content)
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}

export default FlexboxPage