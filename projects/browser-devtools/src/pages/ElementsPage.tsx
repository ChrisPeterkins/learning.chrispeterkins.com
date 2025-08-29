import React, { useState } from 'react';

const ElementsPage: React.FC = () => {
  const [selectedProperty, setSelectedProperty] = useState('color');
  const [propertyValue, setPropertyValue] = useState('#4ade80');
  const [boxModel, setBoxModel] = useState({
    margin: 20,
    padding: 15,
    border: 2,
    width: 200,
    height: 100
  });

  const cssProperties = [
    { name: 'color', value: '#4ade80', description: 'Text color' },
    { name: 'background', value: 'rgba(26, 93, 58, 0.2)', description: 'Background color' },
    { name: 'font-size', value: '16px', description: 'Font size' },
    { name: 'padding', value: '15px', description: 'Inner spacing' },
    { name: 'margin', value: '20px', description: 'Outer spacing' },
    { name: 'border', value: '2px solid #1a5d3a', description: 'Border style' },
    { name: 'display', value: 'flex', description: 'Display type' },
    { name: 'position', value: 'relative', description: 'Position type' }
  ];

  return (
    <div className="page">
      <header className="page-header">
        <h1>Elements & Styles</h1>
        <p className="page-description">
          Inspect and modify the DOM in real-time. Edit CSS properties, understand the box model,
          and learn how styles cascade through the document.
        </p>
      </header>

      <section className="demo-container">
        <h2>DOM Inspector</h2>
        <div className="code-container">
          <div className="code-header">
            <span className="code-title">HTML Structure</span>
          </div>
          <div className="code-content">
            <pre>{`<div class="container">
  <header class="header">
    <h1 class="title">Page Title</h1>
    <nav class="navigation">
      <a href="#" class="nav-link">Home</a>
      <a href="#" class="nav-link active">About</a>
      <a href="#" class="nav-link">Contact</a>
    </nav>
  </header>
  
  <main class="content">
    <article class="post">
      <h2 class="post-title">Article Title</h2>
      <p class="post-content">
        Lorem ipsum dolor sit amet...
      </p>
    </article>
  </main>
  
  <footer class="footer">
    <p>© 2024 Website</p>
  </footer>
</div>`}</pre>
          </div>
        </div>
      </section>

      <section className="demo-container">
        <h2>CSS Properties Inspector</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          <div>
            <h3 style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>
              Computed Styles
            </h3>
            <div className="code-container">
              <div className="code-content">
                {cssProperties.map((prop, index) => (
                  <div 
                    key={index}
                    style={{ 
                      padding: '0.5rem',
                      borderBottom: '1px solid var(--code-border)',
                      cursor: 'pointer',
                      transition: 'background 0.3s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(26, 93, 58, 0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                    }}
                    onClick={() => {
                      setSelectedProperty(prop.name);
                      setPropertyValue(prop.value);
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--accent-green-bright)' }}>{prop.name}:</span>
                      <span style={{ color: 'var(--text-primary)' }}>{prop.value}</span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                      {prop.description}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div>
            <h3 style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>
              Live Preview
            </h3>
            <div 
              style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-primary)',
                padding: '2rem',
                minHeight: '300px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <div
                style={{
                  color: selectedProperty === 'color' ? propertyValue : '#4ade80',
                  background: selectedProperty === 'background' ? propertyValue : 'rgba(26, 93, 58, 0.2)',
                  fontSize: selectedProperty === 'font-size' ? propertyValue : '16px',
                  padding: selectedProperty === 'padding' ? propertyValue : '15px',
                  margin: selectedProperty === 'margin' ? propertyValue : '20px',
                  border: selectedProperty === 'border' ? propertyValue : '2px solid #1a5d3a',
                  transition: 'all 0.3s ease'
                }}
              >
                Sample Element
              </div>
            </div>
            <div style={{ marginTop: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>
                Edit {selectedProperty}:
              </label>
              <input
                type="text"
                value={propertyValue}
                onChange={(e) => setPropertyValue(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  background: 'var(--code-bg)',
                  border: '1px solid var(--code-border)',
                  color: 'var(--text-primary)',
                  fontFamily: 'JetBrains Mono, monospace'
                }}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="demo-container">
        <h2>Box Model Visualization</h2>
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
          <div style={{ flex: 1 }}>
            <div 
              style={{
                background: 'rgba(26, 93, 58, 0.1)',
                padding: '2rem',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                border: '1px dashed var(--border-primary)'
              }}
            >
              <div
                style={{
                  position: 'relative',
                  background: 'rgba(26, 93, 58, 0.1)',
                  padding: `${boxModel.margin}px`,
                  border: '2px dashed var(--warning-yellow)'
                }}
              >
                <div style={{ 
                  position: 'absolute', 
                  top: '0', 
                  left: '50%', 
                  transform: 'translateX(-50%) translateY(-20px)',
                  fontSize: '0.8rem',
                  color: 'var(--warning-yellow)'
                }}>
                  margin: {boxModel.margin}px
                </div>
                <div
                  style={{
                    background: 'rgba(26, 93, 58, 0.2)',
                    border: `${boxModel.border}px solid var(--accent-green)`,
                    padding: `${boxModel.padding}px`,
                    position: 'relative'
                  }}
                >
                  <div style={{ 
                    position: 'absolute', 
                    top: '0', 
                    left: '50%', 
                    transform: 'translateX(-50%)',
                    fontSize: '0.8rem',
                    color: 'var(--text-muted)'
                  }}>
                    padding: {boxModel.padding}px
                  </div>
                  <div
                    style={{
                      background: 'var(--accent-green)',
                      width: `${boxModel.width}px`,
                      height: `${boxModel.height}px`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--bg-primary)',
                      fontWeight: 'bold'
                    }}
                  >
                    {boxModel.width} × {boxModel.height}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div style={{ flex: 1 }}>
            <h3 style={{ marginBottom: '1rem' }}>Box Model Properties</h3>
            {Object.entries(boxModel).map(([key, value]) => (
              <div key={key} style={{ marginBottom: '1rem' }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '0.25rem', 
                  color: 'var(--text-muted)',
                  fontSize: '0.9rem'
                }}>
                  {key.charAt(0).toUpperCase() + key.slice(1)}:
                </label>
                <input
                  type="range"
                  min={key === 'width' || key === 'height' ? 50 : 0}
                  max={key === 'width' || key === 'height' ? 300 : 50}
                  value={value}
                  onChange={(e) => setBoxModel(prev => ({
                    ...prev,
                    [key]: parseInt(e.target.value)
                  }))}
                  style={{ width: '100%' }}
                />
                <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  {value}px
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="concept-grid">
        <div className="info-card">
          <h3>CSS Specificity</h3>
          <p>
            Understand how browsers calculate specificity: inline styles (1000),
            IDs (100), classes (10), elements (1). Higher specificity wins.
          </p>
        </div>

        <div className="info-card">
          <h3>Computed Styles</h3>
          <p>
            See the final computed values after all CSS rules are applied.
            Trace which rules are overridden and why.
          </p>
        </div>

        <div className="info-card">
          <h3>Layout Shifts</h3>
          <p>
            Identify and debug layout shifts using the rendering panel.
            Monitor reflows and repaints for performance optimization.
          </p>
        </div>
      </section>
    </div>
  );
};

export default ElementsPage;