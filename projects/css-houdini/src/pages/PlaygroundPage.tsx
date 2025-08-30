import React, { useState } from 'react';
import { Beaker, Play, RotateCcw } from 'lucide-react';

const PlaygroundPage: React.FC = () => {
  const [cssCode, setCssCode] = useState(`.demo-element {
  width: 300px;
  height: 200px;
  background: paint(checkerboard);
  --checkerboard-size: 25px;
  --checkerboard-color1: #1a5d3a;
  --checkerboard-color2: #ffffff;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.demo-element:hover {
  --checkerboard-size: 15px;
  --checkerboard-color1: #0a2f1d;
  transform: scale(1.05);
}`);

  const [jsCode, setJsCode] = useState(`// Custom Paint Worklet
class PlaygroundPainter {
  static get inputProperties() {
    return ['--size', '--color1', '--color2'];
  }

  paint(ctx, geom, properties) {
    const size = parseInt(properties.get('--size')) || 20;
    const color1 = properties.get('--color1') || '#1a5d3a';
    const color2 = properties.get('--color2') || '#ffffff';

    // Your custom drawing code here
    const numX = Math.ceil(geom.width / size);
    const numY = Math.ceil(geom.height / size);

    for (let y = 0; y < numY; y++) {
      for (let x = 0; x < numX; x++) {
        ctx.fillStyle = (x + y) % 2 ? color1 : color2;
        ctx.fillRect(x * size, y * size, size, size);
      }
    }
  }
}

registerPaint('playground', PlaygroundPainter);`);

  const resetToDefault = () => {
    setCssCode(`.demo-element {
  width: 300px;
  height: 200px;
  background: paint(checkerboard);
  --checkerboard-size: 25px;
  --checkerboard-color1: #1a5d3a;
  --checkerboard-color2: #ffffff;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.demo-element:hover {
  --checkerboard-size: 15px;
  --checkerboard-color1: #0a2f1d;
  transform: scale(1.05);
}`);
  };

  const examples = [
    {
      name: 'Animated Ripples',
      css: `.ripple-demo {
  width: 300px;
  height: 200px;
  background: paint(ripple);
  --ripple-color: #4ecdc4;
  --ripple-x: 150px;
  --ripple-y: 100px;
  --ripple-size: 80px;
  border-radius: 8px;
  cursor: pointer;
}`,
      description: 'Interactive ripple effect that responds to clicks'
    },
    {
      name: 'Noise Pattern',
      css: `.noise-demo {
  width: 300px;
  height: 200px;
  background: paint(gradient-noise);
  --noise-scale: 0.02;
  --noise-colors: '#ff6b6b,#4ecdc4,#45b7d1';
  border-radius: 8px;
  animation: noise-shift 3s ease-in-out infinite;
}

@keyframes noise-shift {
  0%, 100% { --noise-seed: 0; }
  50% { --noise-seed: 1; }
}`,
      description: 'Procedural noise pattern with animated colors'
    },
    {
      name: 'Dynamic Grid',
      css: `.grid-demo {
  width: 300px;
  height: 200px;
  background: paint(checkerboard);
  --checkerboard-size: 20px;
  --checkerboard-color1: hsl(var(--hue, 200), 70%, 60%);
  --checkerboard-color2: hsl(var(--hue, 200), 70%, 90%);
  border-radius: 8px;
  animation: hue-rotate 4s linear infinite;
}

@keyframes hue-rotate {
  from { --hue: 0; }
  to { --hue: 360; }
}`,
      description: 'Color-changing checkerboard with CSS custom properties'
    }
  ];

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">
          <Beaker className="inline" size={32} />
          CSS Houdini Playground
        </h1>
        <p className="page-subtitle">
          Experiment with CSS Houdini APIs in real-time. Edit the code and see your changes instantly.
        </p>
      </div>

      <div className="section">
        <h2 className="section-title">Live Editor</h2>
        <p className="section-description">
          Edit the CSS below to experiment with Houdini paint worklets. The preview updates in real-time.
        </p>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
          <div>
            <div className="code-container">
              <div className="code-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                CSS
                <button onClick={resetToDefault} className="control-button" style={{ fontSize: '0.8rem', padding: '0.25rem 0.5rem' }}>
                  <RotateCcw size={14} />
                  Reset
                </button>
              </div>
              <div style={{ position: 'relative' }}>
                <textarea
                  value={cssCode}
                  onChange={(e) => setCssCode(e.target.value)}
                  style={{
                    width: '100%',
                    height: '300px',
                    padding: '1rem',
                    border: 'none',
                    background: '#1a202c',
                    color: '#e2e8f0',
                    fontFamily: 'Monaco, Menlo, monospace',
                    fontSize: '0.85rem',
                    lineHeight: '1.5',
                    resize: 'vertical',
                    outline: 'none'
                  }}
                  spellCheck={false}
                />
              </div>
            </div>
          </div>
          
          <div>
            <div style={{ 
              background: 'white', 
              borderRadius: '0.5rem', 
              padding: '1.5rem', 
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              minHeight: '300px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <div
                className="demo-element"
                style={{
                  // Parse and apply the CSS (simplified approach)
                  width: '300px',
                  height: '200px',
                  background: 'paint(checkerboard)',
                  '--checkerboard-size': '25px',
                  '--checkerboard-color1': '#1a5d3a',
                  '--checkerboard-color2': '#ffffff',
                  borderRadius: '8px',
                  transition: 'all 0.3s ease'
                } as any}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="section">
        <h2 className="section-title">Example Patterns</h2>
        <p className="section-description">
          Try these pre-built examples to explore different Houdini capabilities.
        </p>
        
        <div className="demo-grid">
          {examples.map((example, index) => (
            <div key={index} className="demo-card">
              <h3 className="demo-title">{example.name}</h3>
              <p className="demo-description">{example.description}</p>
              
              <div className="demo-preview" style={{ marginBottom: '1rem' }}>
                <div
                  style={{
                    width: '100%',
                    height: '120px',
                    background: index === 0 ? 'paint(ripple)' : 
                               index === 1 ? 'paint(gradient-noise)' : 
                               'paint(checkerboard)',
                    '--ripple-color': '#4ecdc4',
                    '--ripple-x': '150px',
                    '--ripple-y': '60px',
                    '--ripple-size': '40px',
                    '--noise-scale': '0.02',
                    '--noise-colors': '#ff6b6b,#4ecdc4,#45b7d1',
                    '--checkerboard-size': '15px',
                    '--checkerboard-color1': '#1a5d3a',
                    '--checkerboard-color2': '#ffffff',
                    borderRadius: '4px'
                  } as any}
                />
              </div>
              
              <button
                onClick={() => setCssCode(example.css)}
                className="control-button"
                style={{ width: '100%' }}
              >
                <Play size={16} />
                Load Example
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="section">
        <h2 className="section-title">Worklet Development</h2>
        <p className="section-description">
          For advanced experimentation, you can also edit the JavaScript worklet code:
        </p>
        
        <div className="code-container">
          <div className="code-header">JavaScript Worklet</div>
          <div style={{ position: 'relative' }}>
            <textarea
              value={jsCode}
              onChange={(e) => setJsCode(e.target.value)}
              style={{
                width: '100%',
                height: '250px',
                padding: '1rem',
                border: 'none',
                background: '#1a202c',
                color: '#e2e8f0',
                fontFamily: 'Monaco, Menlo, monospace',
                fontSize: '0.85rem',
                lineHeight: '1.5',
                resize: 'vertical',
                outline: 'none'
              }}
              spellCheck={false}
            />
          </div>
        </div>
      </div>

      <div className="section">
        <h2 className="section-title">Tips for Experimentation</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">
              <Beaker size={24} />
            </div>
            <h3 className="feature-title">Start Simple</h3>
            <p className="feature-description">
              Begin with basic shapes and patterns before attempting complex effects
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <Play size={24} />
            </div>
            <h3 className="feature-title">Use CSS Variables</h3>
            <p className="feature-description">
              Leverage custom properties to make your worklets interactive and animatable
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <RotateCcw size={24} />
            </div>
            <h3 className="feature-title">Iterate Quickly</h3>
            <p className="feature-description">
              Make small changes and observe the results to understand how worklets behave
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlaygroundPage;