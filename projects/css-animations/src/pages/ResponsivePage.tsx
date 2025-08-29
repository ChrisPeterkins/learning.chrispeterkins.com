import React from 'react'

const ResponsivePage: React.FC = () => {
  return (
    <div className="responsive-page">
      <header className="page-header">
        <h1>Responsive Design</h1>
        <p className="page-description">
          Build layouts that adapt beautifully to any screen size. Master media queries, 
          fluid typography, and modern responsive techniques.
        </p>
      </header>

      <section>
        <h2 style={{ marginBottom: '2rem' }}>Responsive Grid Example</h2>
        
        <div className="demo-container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '1rem'
          }}>
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-primary)',
                padding: '2rem',
                textAlign: 'center',
                color: 'var(--text-secondary)'
              }}>
                <h3 style={{ color: 'var(--accent-green-bright)', marginBottom: '0.5rem' }}>
                  Card {i}
                </h3>
                <p>Resize the window to see responsive behavior</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ marginTop: '3rem' }}>
        <h2 style={{ marginBottom: '1.5rem' }}>Breakpoint Strategy</h2>
        
        <div className="code-container">
          <div className="code-header">
            <span className="code-title">Mobile-First Media Queries</span>
          </div>
          <div className="code-content">
            <pre>{`/* Mobile First Approach */
.container {
  /* Base mobile styles */
  padding: 1rem;
  font-size: 1rem;
}

/* Tablet */
@media (min-width: 768px) {
  .container {
    padding: 2rem;
    font-size: 1.1rem;
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .container {
    padding: 3rem;
    font-size: 1.2rem;
    max-width: 1200px;
    margin: 0 auto;
  }
}

/* Large Desktop */
@media (min-width: 1440px) {
  .container {
    max-width: 1400px;
  }
}`}</pre>
          </div>
        </div>
        
        <div className="code-container">
          <div className="code-header">
            <span className="code-title">Fluid Typography</span>
          </div>
          <div className="code-content">
            <pre>{`/* Fluid Typography with clamp() */
h1 {
  font-size: clamp(1.5rem, 4vw, 3rem);
}

p {
  font-size: clamp(0.875rem, 2vw, 1.125rem);
}

/* Container Query Units */
.card h2 {
  font-size: clamp(1rem, 5cqi, 1.5rem);
}`}</pre>
          </div>
        </div>
      </section>

      <section style={{ marginTop: '3rem' }}>
        <h2 style={{ marginBottom: '1.5rem' }}>Modern Responsive Techniques</h2>
        
        <div className="concept-grid">
          <div className="concept-card">
            <h3>Container Queries</h3>
            <p>
              Style elements based on their container size, not viewport. Perfect for 
              component-based design systems.
            </p>
          </div>
          
          <div className="concept-card">
            <h3>Aspect Ratio</h3>
            <p>
              Maintain consistent proportions with the aspect-ratio property. Great for 
              images and video containers.
            </p>
          </div>
          
          <div className="concept-card">
            <h3>Logical Properties</h3>
            <p>
              Use logical properties (inline/block) instead of physical (left/right) for 
              better internationalization.
            </p>
          </div>
          
          <div className="concept-card">
            <h3>Min/Max Functions</h3>
            <p>
              Use min(), max(), and clamp() for fluid sizing without media queries.
            </p>
          </div>
          
          <div className="concept-card">
            <h3>Grid Auto-Fit</h3>
            <p>
              Create responsive grids that automatically adjust columns with auto-fit 
              and minmax().
            </p>
          </div>
          
          <div className="concept-card">
            <h3>Viewport Units</h3>
            <p>
              Use vw, vh, vmin, vmax, and new units like dvh for dynamic sizing based 
              on viewport.
            </p>
          </div>
        </div>
      </section>

      <section style={{ marginTop: '3rem' }}>
        <h2 style={{ marginBottom: '1.5rem' }}>Testing Checklist</h2>
        
        <div style={{ 
          background: 'var(--bg-secondary)', 
          padding: '2rem', 
          border: '1px solid var(--border-primary)'
        }}>
          <ul style={{ 
            listStyle: 'none', 
            padding: 0,
            display: 'grid',
            gap: '0.75rem'
          }}>
            {[
              'Test on real devices, not just browser DevTools',
              'Check landscape and portrait orientations',
              'Verify touch targets are at least 44x44px',
              'Ensure text remains readable when zoomed to 200%',
              'Test with slow network connections',
              'Validate keyboard navigation works properly',
              'Check high contrast mode compatibility',
              'Test with different font size preferences'
            ].map((item, i) => (
              <li key={i} style={{ 
                display: 'flex', 
                alignItems: 'center',
                color: 'var(--text-secondary)'
              }}>
                <span style={{ 
                  color: 'var(--accent-green-bright)', 
                  marginRight: '0.75rem',
                  fontSize: '1.2rem'
                }}>
                  ✓
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  )
}

export default ResponsivePage