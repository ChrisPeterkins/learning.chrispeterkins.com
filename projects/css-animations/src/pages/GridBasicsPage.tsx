import React, { useState } from 'react'

const GridBasicsPage: React.FC = () => {
  const [columns, setColumns] = useState('1fr 1fr 1fr')
  const [rows, setRows] = useState('100px 100px')
  const [gap, setGap] = useState('10')
  const [itemCount, setItemCount] = useState(6)
  const [selectedItem, setSelectedItem] = useState<number | null>(null)
  const [spanCols, setSpanCols] = useState('1')
  const [spanRows, setSpanRows] = useState('1')

  const presets = {
    basic: { columns: '1fr 1fr 1fr', rows: '100px 100px', gap: '10' },
    magazine: { columns: '2fr 1fr', rows: 'repeat(3, 150px)', gap: '20' },
    gallery: { columns: 'repeat(auto-fit, minmax(150px, 1fr))', rows: 'auto', gap: '15' },
    holy: { columns: '200px 1fr 200px', rows: '60px 1fr 60px', gap: '0' }
  }

  const applyPreset = (preset: keyof typeof presets) => {
    setColumns(presets[preset].columns)
    setRows(presets[preset].rows)
    setGap(presets[preset].gap)
  }

  return (
    <div className="grid-basics-page">
      <header className="page-header">
        <h1>CSS Grid Basics</h1>
        <p className="page-description">
          CSS Grid is a two-dimensional layout system that allows you to create complex layouts 
          with rows and columns. Control placement, sizing, and alignment with precision.
        </p>
      </header>

      <section>
        <h2 style={{ marginBottom: '2rem' }}>Interactive Grid Playground</h2>
        
        <div className="demo-container">
          <div className="demo-controls">
            <div className="control-group">
              <label>Grid Template Columns</label>
              <input 
                className="control-input"
                type="text" 
                value={columns} 
                onChange={(e) => setColumns(e.target.value)}
                placeholder="e.g., 1fr 1fr 1fr"
              />
            </div>
            
            <div className="control-group">
              <label>Grid Template Rows</label>
              <input 
                className="control-input"
                type="text" 
                value={rows} 
                onChange={(e) => setRows(e.target.value)}
                placeholder="e.g., 100px 100px"
              />
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
                max="12" 
                value={itemCount}
                onChange={(e) => setItemCount(Number(e.target.value))}
                style={{ width: '150px' }}
              />
            </div>
          </div>
          
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ marginRight: '1rem', color: 'var(--text-muted)' }}>Presets:</label>
            {Object.keys(presets).map(preset => (
              <button 
                key={preset}
                className="demo-button" 
                onClick={() => applyPreset(preset as keyof typeof presets)}
                style={{ marginRight: '0.5rem' }}
              >
                {preset.charAt(0).toUpperCase() + preset.slice(1)}
              </button>
            ))}
          </div>
          
          {selectedItem !== null && (
            <div className="demo-controls" style={{ 
              background: 'var(--code-bg)', 
              padding: '1rem',
              marginBottom: '1rem',
              border: '1px solid var(--accent-green)'
            }}>
              <h4 style={{ color: 'var(--accent-green-bright)', marginBottom: '0.5rem' }}>
                Item {selectedItem + 1} Span Controls
              </h4>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div className="control-group">
                  <label>Column Span: {spanCols}</label>
                  <input 
                    type="range" 
                    min="1" 
                    max="4" 
                    value={spanCols}
                    onChange={(e) => setSpanCols(e.target.value)}
                    style={{ width: '100px' }}
                  />
                </div>
                <div className="control-group">
                  <label>Row Span: {spanRows}</label>
                  <input 
                    type="range" 
                    min="1" 
                    max="4" 
                    value={spanRows}
                    onChange={(e) => setSpanRows(e.target.value)}
                    style={{ width: '100px' }}
                  />
                </div>
              </div>
            </div>
          )}
          
          <div 
            className="grid-demo"
            style={{
              display: 'grid',
              gridTemplateColumns: columns,
              gridTemplateRows: rows,
              gap: `${gap}px`
            }}
          >
            {Array.from({ length: itemCount }, (_, i) => (
              <div 
                key={i}
                className="grid-item"
                onClick={() => setSelectedItem(i === selectedItem ? null : i)}
                style={{
                  gridColumn: selectedItem === i ? `span ${spanCols}` : 'auto',
                  gridRow: selectedItem === i ? `span ${spanRows}` : 'auto',
                  cursor: 'pointer',
                  background: selectedItem === i ? 'var(--accent-green-bright)' : 'var(--accent-green)'
                }}
              >
                {i + 1}
              </div>
            ))}
          </div>
          
          <p style={{ 
            marginTop: '1rem', 
            color: 'var(--text-muted)', 
            fontSize: '0.9rem',
            textAlign: 'center'
          }}>
            Click any item to control its span properties
          </p>
        </div>
      </section>

      <section style={{ marginTop: '3rem' }}>
        <h2 style={{ marginBottom: '1.5rem' }}>Generated CSS</h2>
        
        <div className="code-container">
          <div className="code-header">
            <span className="code-title">Current Grid CSS</span>
          </div>
          <div className="code-content">
            <pre>{`.container {
  display: grid;
  grid-template-columns: ${columns};
  grid-template-rows: ${rows};
  gap: ${gap}px;
}${selectedItem !== null ? `

.item-${selectedItem + 1} {
  grid-column: span ${spanCols};
  grid-row: span ${spanRows};
}` : ''}`}</pre>
          </div>
        </div>
      </section>

      <section style={{ marginTop: '3rem' }}>
        <h2 style={{ marginBottom: '1.5rem' }}>Grid Properties</h2>
        
        <div className="concept-grid">
          <div className="concept-card">
            <h3>Grid Container</h3>
            <p>
              display: grid, grid-template-columns/rows, gap, justify-items, align-items, 
              grid-auto-flow
            </p>
          </div>
          
          <div className="concept-card">
            <h3>Grid Items</h3>
            <p>
              grid-column/row, grid-area, justify-self, align-self, order, z-index for 
              overlapping
            </p>
          </div>
          
          <div className="concept-card">
            <h3>Sizing Units</h3>
            <p>
              fr (fraction), minmax(), repeat(), auto-fit/auto-fill, min-content, max-content
            </p>
          </div>
        </div>
      </section>

      <section style={{ marginTop: '3rem' }}>
        <h2 style={{ marginBottom: '1.5rem' }}>Common Grid Patterns</h2>
        
        <div className="code-container">
          <div className="code-header">
            <span className="code-title">Responsive Grid</span>
          </div>
          <div className="code-content">
            <pre>{`/* Auto-responsive grid */
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

/* Fixed + Flexible columns */
.layout {
  display: grid;
  grid-template-columns: 200px 1fr 200px; /* Sidebar - Content - Sidebar */
}

/* Grid Areas */
.page {
  display: grid;
  grid-template-areas:
    "header header header"
    "sidebar content ads"
    "footer footer footer";
  grid-template-columns: 200px 1fr 150px;
}`}</pre>
          </div>
        </div>
      </section>
    </div>
  )
}

export default GridBasicsPage