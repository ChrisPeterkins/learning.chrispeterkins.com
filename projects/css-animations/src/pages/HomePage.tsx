import React from 'react'

const HomePage: React.FC = () => {
  return (
    <div className="home-page">
      <header className="page-header">
        <h1>CSS Grid & Animations</h1>
        <p className="page-description">
          Master modern CSS layout techniques and create stunning animations. From Grid and Flexbox 
          to keyframe animations and 3D transforms, build beautiful and responsive interfaces.
        </p>
      </header>

      <section>
        <h2 style={{ marginBottom: '2rem', color: 'var(--text-primary)' }}>What You'll Master</h2>
        
        <div className="concept-grid">
          <div className="concept-card">
            <h3>CSS Grid</h3>
            <p>
              Create complex two-dimensional layouts with ease. Master grid containers, items, 
              areas, and responsive grid systems.
            </p>
          </div>
          
          <div className="concept-card">
            <h3>Flexbox</h3>
            <p>
              Build flexible one-dimensional layouts. Perfect for navigation bars, card layouts, 
              and centering content.
            </p>
          </div>
          
          <div className="concept-card">
            <h3>CSS Animations</h3>
            <p>
              Create engaging keyframe animations. Control timing, easing, and complex 
              multi-step animations.
            </p>
          </div>
          
          <div className="concept-card">
            <h3>Transitions</h3>
            <p>
              Smooth state changes with CSS transitions. Perfect for hover effects, 
              interactive elements, and micro-interactions.
            </p>
          </div>
          
          <div className="concept-card">
            <h3>3D Transforms</h3>
            <p>
              Add depth with 3D transformations. Create card flips, perspective effects, 
              and immersive experiences.
            </p>
          </div>
          
          <div className="concept-card">
            <h3>Responsive Design</h3>
            <p>
              Build layouts that adapt to any screen size. Master media queries, container 
              queries, and fluid typography.
            </p>
          </div>
        </div>
      </section>

      <section style={{ marginTop: '3rem' }}>
        <h2 style={{ marginBottom: '2rem', color: 'var(--text-primary)' }}>Live Preview</h2>
        
        <div className="demo-container">
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
            gap: '1rem',
            marginBottom: '2rem'
          }}>
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div
                key={i}
                style={{
                  aspectRatio: '1',
                  background: `linear-gradient(135deg, var(--accent-green) ${i * 15}%, var(--accent-green-bright))`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--bg-primary)',
                  fontWeight: 600,
                  fontSize: '1.5rem',
                  animation: `float ${2 + i * 0.5}s ease-in-out infinite`,
                  animationDelay: `${i * 0.2}s`
                }}
              >
                {i}
              </div>
            ))}
          </div>
          
          <p style={{ color: 'var(--text-secondary)', textAlign: 'center' }}>
            Interactive examples throughout the course - modify and see results in real-time!
          </p>
        </div>
      </section>

      <section style={{ marginTop: '3rem' }}>
        <h2 style={{ marginBottom: '1.5rem', color: 'var(--text-primary)' }}>Key Features</h2>
        
        <div style={{ 
          background: 'var(--bg-secondary)', 
          padding: '2rem', 
          border: '1px solid var(--border-primary)',
          borderLeft: '3px solid var(--accent-green-bright)'
        }}>
          <ul style={{ 
            listStyle: 'none', 
            padding: 0,
            display: 'grid',
            gap: '1rem'
          }}>
            {[
              'Live, editable examples with instant visual feedback',
              'Interactive controls to manipulate CSS properties',
              'Comprehensive code snippets for every concept',
              'Real-world layout patterns and solutions',
              'Performance tips and best practices',
              'Browser compatibility notes',
              'Responsive design patterns',
              'Animation performance optimization'
            ].map((feature, index) => (
              <li key={index} style={{ 
                display: 'flex',
                alignItems: 'center',
                color: 'var(--text-secondary)'
              }}>
                <span style={{
                  display: 'inline-block',
                  width: '8px',
                  height: '8px',
                  background: 'var(--accent-green-bright)',
                  marginRight: '1rem',
                  flexShrink: 0
                }} />
                {feature}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
      `}</style>
    </div>
  )
}

export default HomePage