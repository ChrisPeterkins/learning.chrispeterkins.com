import React, { useState, useEffect } from 'react';
import { Settings, Check, AlertCircle, Info } from 'lucide-react';

const PropertiesAPIPage: React.FC = () => {
  const [customLength, setCustomLength] = useState(100);
  const [customColor, setCustomColor] = useState('#667eea');
  const [customNumber, setCustomNumber] = useState(0.5);
  const [animationProgress, setAnimationProgress] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    let animationFrame: number;
    
    if (isAnimating) {
      const animate = () => {
        setAnimationProgress((prev) => {
          const next = (prev + 0.01) % 1;
          if (next < prev) {
            setIsAnimating(false);
            return 0;
          }
          return next;
        });
        if (isAnimating) {
          animationFrame = requestAnimationFrame(animate);
        }
      };
      animationFrame = requestAnimationFrame(animate);
    }
    
    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [isAnimating]);

  const startAnimation = () => {
    setAnimationProgress(0);
    setIsAnimating(true);
  };

  // Check if CSS.registerProperty is supported
  const isSupported = 'CSS' in window && 'registerProperty' in (window as any).CSS;

  const registrationCode = `// Register a custom CSS property
CSS.registerProperty({
  name: '--my-length',
  syntax: '<length>',
  inherits: false,
  initialValue: '100px'
});

CSS.registerProperty({
  name: '--my-color',
  syntax: '<color>',
  inherits: false,
  initialValue: '#000000'
});

CSS.registerProperty({
  name: '--my-number',
  syntax: '<number>',
  inherits: false,
  initialValue: '0'
});`;

  const usageCode = `/* Use registered properties in CSS */
.element {
  width: var(--my-length);
  background-color: var(--my-color);
  opacity: var(--my-number);
  
  /* These properties can now be animated! */
  transition: all 0.3s ease;
}

.element:hover {
  --my-length: 200px;
  --my-color: #ff6b6b;
  --my-number: 1;
}`;

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">
          <Settings className="inline" size={32} />
          Properties & Values API
        </h1>
        <p className="page-subtitle">
          Register custom CSS properties with type definitions, default values, and inheritance behavior. 
          This enables smooth animations and better developer experience.
        </p>
      </div>

      {!isSupported && (
        <div className="section">
          <div style={{
            background: '#fff3cd',
            border: '1px solid #ffeaa7',
            borderRadius: '0.5rem',
            padding: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '2rem'
          }}>
            <AlertCircle size={20} color="#856404" />
            <div>
              <strong>Limited Support:</strong> The Properties & Values API is not fully supported in your browser. 
              Some features may not work as expected.
            </div>
          </div>
        </div>
      )}

      <div className="section">
        <h2 className="section-title">Registered Length Property</h2>
        <p className="section-description">
          This demonstrates a custom length property that can be smoothly animated. 
          Regular CSS variables can't animate between different length values.
        </p>
        
        <div className="controls">
          <div className="control-group">
            <label className="control-label">Length: {customLength}px</label>
            <input
              type="range"
              min="50"
              max="300"
              value={customLength}
              onChange={(e) => setCustomLength(Number(e.target.value))}
              className="control-input"
            />
          </div>
        </div>
        
        <div className="demo-card">
          <div className="demo-preview">
            <div
              style={{
                '--my-length': `${customLength}px`,
                width: 'var(--my-length)',
                height: '60px',
                background: 'linear-gradient(90deg, #667eea, #764ba2)',
                borderRadius: '8px',
                transition: 'width 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '0.9rem',
                fontWeight: 'bold'
              } as any}
            >
              {customLength}px wide
            </div>
          </div>
          <div className="code-container">
            <div className="code-header">CSS</div>
            <div className="code-content">
              {`--my-length: ${customLength}px;
width: var(--my-length);
transition: width 0.3s ease;`}
            </div>
          </div>
        </div>
      </div>

      <div className="section">
        <h2 className="section-title">Registered Color Property</h2>
        <p className="section-description">
          Color properties can be animated smoothly when registered with proper syntax.
        </p>
        
        <div className="controls">
          <div className="control-group">
            <label className="control-label">Custom Color</label>
            <input
              type="color"
              value={customColor}
              onChange={(e) => setCustomColor(e.target.value)}
              className="control-input"
            />
          </div>
        </div>
        
        <div className="demo-card">
          <div className="demo-preview">
            <div
              style={{
                '--my-color': customColor,
                width: '120px',
                height: '120px',
                backgroundColor: 'var(--my-color)',
                borderRadius: '50%',
                transition: 'background-color 0.5s ease',
                boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '0.9rem',
                fontWeight: 'bold',
                textShadow: '0 1px 3px rgba(0,0,0,0.5)'
              } as any}
            >
              {customColor}
            </div>
          </div>
        </div>
      </div>

      <div className="section">
        <h2 className="section-title">Registered Number Property</h2>
        <p className="section-description">
          Number properties enable precise mathematical operations and smooth numeric animations.
        </p>
        
        <div className="controls">
          <div className="control-group">
            <label className="control-label">Number: {customNumber.toFixed(2)}</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={customNumber}
              onChange={(e) => setCustomNumber(Number(e.target.value))}
              className="control-input"
            />
          </div>
        </div>
        
        <div className="demo-card">
          <div className="demo-preview">
            <div
              style={{
                '--my-number': customNumber.toString(),
                opacity: 'var(--my-number)',
                transform: `scale(${0.5 + customNumber * 0.5})`,
                width: '100px',
                height: '100px',
                background: 'linear-gradient(45deg, #667eea, #764ba2)',
                borderRadius: '8px',
                transition: 'opacity 0.3s ease, transform 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '0.9rem',
                fontWeight: 'bold'
              } as any}
            >
              {Math.round(customNumber * 100)}%
            </div>
          </div>
        </div>
      </div>

      <div className="section">
        <h2 className="section-title">Animation Progress Property</h2>
        <p className="section-description">
          This shows how registered properties can be used to create complex animations 
          that respond to a single progress value.
        </p>
        
        <div className="controls">
          <button 
            onClick={startAnimation}
            disabled={isAnimating}
            className="control-button"
          >
            {isAnimating ? 'Animating...' : 'Start Animation'}
          </button>
          <div className="control-group">
            <label className="control-label">Progress: {Math.round(animationProgress * 100)}%</label>
            <div className="animation-timeline">
              <div 
                className="timeline-progress"
                style={{ width: `${animationProgress * 100}%` }}
              />
            </div>
          </div>
        </div>
        
        <div className="demo-card">
          <div className="demo-preview">
            <div
              style={{
                '--animation-progress': animationProgress.toString(),
                position: 'relative',
                width: '100%',
                height: '100%',
                overflow: 'hidden'
              } as any}
            >
              {/* Moving circle */}
              <div
                style={{
                  position: 'absolute',
                  left: `calc(var(--animation-progress) * (100% - 40px))`,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '40px',
                  height: '40px',
                  backgroundColor: '#667eea',
                  borderRadius: '50%',
                  transition: isAnimating ? 'none' : 'left 0.3s ease'
                } as any}
              />
              
              {/* Progress bar */}
              <div
                style={{
                  position: 'absolute',
                  bottom: '20px',
                  left: '20px',
                  right: '20px',
                  height: '4px',
                  backgroundColor: '#e0e0e0',
                  borderRadius: '2px',
                  overflow: 'hidden'
                }}
              >
                <div
                  style={{
                    width: `calc(var(--animation-progress) * 100%)`,
                    height: '100%',
                    backgroundColor: '#764ba2',
                    borderRadius: '2px',
                    transition: isAnimating ? 'none' : 'width 0.3s ease'
                  } as any}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="section">
        <h2 className="section-title">Property Registration</h2>
        <p className="section-description">
          Here's how to register custom CSS properties with type definitions and default values:
        </p>
        
        <div className="code-container">
          <div className="code-header">JavaScript Registration</div>
          <div className="code-content">
            <pre>{registrationCode}</pre>
          </div>
        </div>
        
        <div className="code-container">
          <div className="code-header">CSS Usage</div>
          <div className="code-content">
            <pre>{usageCode}</pre>
          </div>
        </div>
      </div>

      <div className="section">
        <h2 className="section-title">Property Syntax Types</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">
              <Check size={24} />
            </div>
            <h3 className="feature-title">&lt;length&gt;</h3>
            <p className="feature-description">
              Pixel, em, rem, percentages, and other length units
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <Check size={24} />
            </div>
            <h3 className="feature-title">&lt;color&gt;</h3>
            <p className="feature-description">
              Any valid CSS color value including hex, rgb, hsl, and named colors
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <Check size={24} />
            </div>
            <h3 className="feature-title">&lt;number&gt;</h3>
            <p className="feature-description">
              Floating-point numbers for mathematical operations
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <Check size={24} />
            </div>
            <h3 className="feature-title">&lt;percentage&gt;</h3>
            <p className="feature-description">
              Percentage values that can be animated smoothly
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <Info size={24} />
            </div>
            <h3 className="feature-title">&lt;angle&gt;</h3>
            <p className="feature-description">
              Degree, radian, and other angle units for rotations
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <Info size={24} />
            </div>
            <h3 className="feature-title">Custom Syntax</h3>
            <p className="feature-description">
              Define enums and complex value types with validation
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertiesAPIPage;