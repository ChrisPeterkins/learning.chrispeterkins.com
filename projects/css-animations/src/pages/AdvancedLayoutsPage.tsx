import React from 'react'

const AdvancedLayoutsPage: React.FC = () => {
  return (
    <div className="advanced-layouts-page">
      <header className="page-header">
        <h1>Advanced Layouts</h1>
        <p className="page-description">
          Combine Grid, Flexbox, and modern CSS features to create complex, responsive layouts. 
          Master container queries, subgrid, and advanced positioning techniques.
        </p>
      </header>

      <section>
        <h2 style={{ marginBottom: '2rem' }}>Magazine Layout</h2>
        
        <div className="demo-container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(6, 1fr)',
            gridTemplateRows: 'repeat(4, 100px)',
            gap: '1rem'
          }}>
            <div style={{
              gridColumn: 'span 4',
              gridRow: 'span 2',
              background: 'linear-gradient(135deg, var(--accent-green), var(--accent-green-bright))',
              padding: '1.5rem',
              display: 'flex',
              alignItems: 'end',
              color: 'var(--bg-primary)'
            }}>
              <h3>Featured Article</h3>
            </div>
            
            <div style={{
              gridColumn: 'span 2',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-primary)',
              padding: '1rem',
              color: 'var(--text-secondary)'
            }}>
              Side Story 1
            </div>
            
            <div style={{
              gridColumn: 'span 2',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-primary)',
              padding: '1rem',
              color: 'var(--text-secondary)'
            }}>
              Side Story 2
            </div>
            
            <div style={{
              gridColumn: 'span 2',
              gridRow: 'span 2',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--accent-green)',
              padding: '1rem',
              color: 'var(--text-secondary)'
            }}>
              Tall Article
            </div>
            
            {[1, 2, 3, 4].map(i => (
              <div key={i} style={{
                gridColumn: 'span 1',
                background: 'var(--code-bg)',
                border: '1px solid var(--border-primary)',
                padding: '1rem',
                color: 'var(--text-muted)',
                fontSize: '0.9rem'
              }}>
                Item {i}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ marginTop: '3rem' }}>
        <h2 style={{ marginBottom: '1.5rem' }}>Masonry Layout</h2>
        
        <div className="demo-container">
          <div style={{
            columns: '3 200px',
            columnGap: '1rem'
          }}>
            {[150, 200, 120, 180, 250, 140, 190, 160].map((height, i) => (
              <div key={i} style={{
                background: `linear-gradient(135deg, var(--accent-green) ${i * 10}%, var(--accent-green-bright))`,
                marginBottom: '1rem',
                padding: '1rem',
                height: `${height}px`,
                breakInside: 'avoid',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--bg-primary)',
                fontWeight: 'bold'
              }}>
                Card {i + 1}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ marginTop: '3rem' }}>
        <h2 style={{ marginBottom: '1.5rem' }}>CSS Techniques</h2>
        
        <div className="code-container">
          <div className="code-header">
            <span className="code-title">Container Queries</span>
          </div>
          <div className="code-content">
            <pre>{`/* Container queries for component-based responsive design */
.card-container {
  container-type: inline-size;
}

@container (min-width: 400px) {
  .card {
    display: grid;
    grid-template-columns: 1fr 2fr;
  }
}`}</pre>
          </div>
        </div>
        
        <div className="code-container">
          <div className="code-header">
            <span className="code-title">Subgrid</span>
          </div>
          <div className="code-content">
            <pre>{`/* Align nested grid items with parent grid */
.parent {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
}

.child {
  display: grid;
  grid-template-columns: subgrid;
  grid-column: span 2;
}`}</pre>
          </div>
        </div>
      </section>

      <section style={{ marginTop: '3rem' }}>
        <h2 style={{ marginBottom: '1.5rem' }}>Layout Patterns</h2>
        
        <div className="concept-grid">
          <div className="concept-card">
            <h3>Holy Grail</h3>
            <p>Header, footer, main content with two sidebars. Perfect for dashboards.</p>
          </div>
          
          <div className="concept-card">
            <h3>Masonry</h3>
            <p>Pinterest-style layout with items of varying heights arranged optimally.</p>
          </div>
          
          <div className="concept-card">
            <h3>Bento Box</h3>
            <p>Grid-based layout with different sized boxes creating visual hierarchy.</p>
          </div>
        </div>
      </section>
    </div>
  )
}

export default AdvancedLayoutsPage