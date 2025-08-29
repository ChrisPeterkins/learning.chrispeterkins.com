import React, { useState, useEffect, useRef } from 'react';
import { Palette, Download, RefreshCw } from 'lucide-react';

const PaintAPIPage: React.FC = () => {
  const [checkerboardSize, setCheckerboardSize] = useState(30);
  const [checkerboardColor1, setCheckerboardColor1] = useState('#667eea');
  const [checkerboardColor2, setCheckerboardColor2] = useState('#ffffff');
  
  const [rippleX, setRippleX] = useState(150);
  const [rippleY, setRippleY] = useState(100);
  const [rippleSize, setRippleSize] = useState(50);
  const [rippleColor, setRippleColor] = useState('#764ba2');
  const [isAnimating, setIsAnimating] = useState(false);
  
  const [noiseScale, setNoiseScale] = useState(0.01);
  const [noiseSeed, setNoiseSeed] = useState(0);
  const [noiseColors, setNoiseColors] = useState('#ff6b6b,#4ecdc4,#45b7d1,#96ceb4');
  
  const rippleRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();

  // Handle ripple click animation
  const handleRippleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!rippleRef.current) return;
    
    const rect = rippleRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setRippleX(x);
    setRippleY(y);
    setRippleSize(0);
    setIsAnimating(true);
    
    // Animate ripple expansion
    let size = 0;
    const maxSize = Math.sqrt(rect.width * rect.width + rect.height * rect.height);
    
    const animate = () => {
      size += maxSize * 0.05;
      if (size >= maxSize) {
        size = 0;
        setIsAnimating(false);
      }
      setRippleSize(size);
      
      if (isAnimating && size < maxSize) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };
    
    animate();
  };

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  const generateRandomNoise = () => {
    setNoiseSeed(Math.random());
  };

  const paintAPICode = `// CSS Paint Worklet Example
class CheckerboardPainter {
  static get inputProperties() {
    return ['--checkerboard-size', '--checkerboard-color1', '--checkerboard-color2'];
  }

  paint(ctx, geom, properties) {
    const size = parseInt(properties.get('--checkerboard-size')) || 20;
    const color1 = properties.get('--checkerboard-color1') || '#ffffff';
    const color2 = properties.get('--checkerboard-color2') || '#000000';

    const numX = Math.ceil(geom.width / size);
    const numY = Math.ceil(geom.height / size);

    for (let y = 0; y < numY; y++) {
      for (let x = 0; x < numX; x++) {
        const color = (x + y) % 2 ? color1 : color2;
        ctx.fillStyle = color;
        ctx.fillRect(x * size, y * size, size, size);
      }
    }
  }
}

registerPaint('checkerboard', CheckerboardPainter);`;

  const cssUsageCode = `/* Using the paint worklet in CSS */
.element {
  background: paint(checkerboard);
  --checkerboard-size: 30px;
  --checkerboard-color1: #667eea;
  --checkerboard-color2: #ffffff;
}`;

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">
          <Palette className="inline" size={32} />
          Paint API
        </h1>
        <p className="page-subtitle">
          Create custom CSS backgrounds and images with JavaScript. The Paint API lets you 
          programmatically generate graphics that respond to CSS properties.
        </p>
      </div>

      <div className="section">
        <h2 className="section-title">Interactive Checkerboard</h2>
        <p className="section-description">
          Modify the checkerboard pattern by adjusting size and colors. This demonstrates 
          how paint worklets can respond to CSS custom properties.
        </p>
        
        <div className="controls">
          <div className="control-group">
            <label className="control-label">Size: {checkerboardSize}px</label>
            <input
              type="range"
              min="10"
              max="100"
              value={checkerboardSize}
              onChange={(e) => setCheckerboardSize(Number(e.target.value))}
              className="control-input"
            />
          </div>
          <div className="control-group">
            <label className="control-label">Color 1</label>
            <input
              type="color"
              value={checkerboardColor1}
              onChange={(e) => setCheckerboardColor1(e.target.value)}
              className="control-input"
            />
          </div>
          <div className="control-group">
            <label className="control-label">Color 2</label>
            <input
              type="color"
              value={checkerboardColor2}
              onChange={(e) => setCheckerboardColor2(e.target.value)}
              className="control-input"
            />
          </div>
        </div>
        
        <div className="demo-card">
          <div
            className="demo-preview"
            style={{
              background: 'paint(checkerboard)',
              '--checkerboard-size': `${checkerboardSize}px`,
              '--checkerboard-color1': checkerboardColor1,
              '--checkerboard-color2': checkerboardColor2
            } as any}
          />
          <div className="code-container">
            <div className="code-header">CSS</div>
            <div className="code-content">
              {`background: paint(checkerboard);
--checkerboard-size: ${checkerboardSize}px;
--checkerboard-color1: ${checkerboardColor1};
--checkerboard-color2: ${checkerboardColor2};`}
            </div>
          </div>
        </div>
      </div>

      <div className="section">
        <h2 className="section-title">Interactive Ripple Effect</h2>
        <p className="section-description">
          Click anywhere on the canvas to create ripple effects. This shows how paint worklets 
          can create dynamic, interactive backgrounds.
        </p>
        
        <div className="controls">
          <div className="control-group">
            <label className="control-label">Ripple Color</label>
            <input
              type="color"
              value={rippleColor}
              onChange={(e) => setRippleColor(e.target.value)}
              className="control-input"
            />
          </div>
          <div className="control-group">
            <label className="control-label">Size: {Math.round(rippleSize)}</label>
            <input
              type="range"
              min="0"
              max="200"
              value={rippleSize}
              onChange={(e) => setRippleSize(Number(e.target.value))}
              className="control-input"
            />
          </div>
        </div>
        
        <div className="demo-card">
          <div
            ref={rippleRef}
            className="demo-preview"
            onClick={handleRippleClick}
            style={{
              background: 'paint(ripple)',
              '--ripple-color': rippleColor,
              '--ripple-x': `${rippleX}px`,
              '--ripple-y': `${rippleY}px`,
              '--ripple-size': `${rippleSize}px`,
              '--ripple-opacity': '0.8',
              cursor: 'pointer'
            } as any}
          >
            <div style={{ 
              position: 'absolute', 
              bottom: '10px', 
              left: '10px', 
              color: 'white', 
              fontSize: '0.9rem',
              textShadow: '0 1px 3px rgba(0,0,0,0.5)'
            }}>
              Click to create ripples
            </div>
          </div>
        </div>
      </div>

      <div className="section">
        <h2 className="section-title">Procedural Noise Pattern</h2>
        <p className="section-description">
          Generate complex noise patterns using mathematical functions. Perfect for creating 
          organic textures and backgrounds.
        </p>
        
        <div className="controls">
          <div className="control-group">
            <label className="control-label">Scale: {noiseScale}</label>
            <input
              type="range"
              min="0.005"
              max="0.05"
              step="0.005"
              value={noiseScale}
              onChange={(e) => setNoiseScale(Number(e.target.value))}
              className="control-input"
            />
          </div>
          <div className="control-group">
            <label className="control-label">Colors</label>
            <input
              type="text"
              value={noiseColors}
              onChange={(e) => setNoiseColors(e.target.value)}
              className="control-input"
              placeholder="Comma-separated hex colors"
            />
          </div>
          <button onClick={generateRandomNoise} className="control-button">
            <RefreshCw size={16} />
            Randomize
          </button>
        </div>
        
        <div className="demo-card">
          <div
            className="demo-preview"
            style={{
              background: 'paint(gradient-noise)',
              '--noise-scale': noiseScale.toString(),
              '--noise-seed': noiseSeed.toString(),
              '--noise-colors': noiseColors
            } as any}
          />
        </div>
      </div>

      <div className="section">
        <h2 className="section-title">How Paint API Works</h2>
        <p className="section-description">
          The Paint API allows you to define custom paint functions that generate images 
          programmatically. Here's how to create your own paint worklet:
        </p>
        
        <div className="code-container">
          <div className="code-header">JavaScript (Paint Worklet)</div>
          <div className="code-content">
            <pre>{paintAPICode}</pre>
          </div>
        </div>
        
        <div className="code-container">
          <div className="code-header">CSS Usage</div>
          <div className="code-content">
            <pre>{cssUsageCode}</pre>
          </div>
        </div>
      </div>

      <div className="section">
        <h2 className="section-title">Key Features</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">
              <Palette size={24} />
            </div>
            <h3 className="feature-title">Dynamic Backgrounds</h3>
            <p className="feature-description">
              Generate backgrounds that respond to CSS properties and user interactions
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <RefreshCw size={24} />
            </div>
            <h3 className="feature-title">Real-time Updates</h3>
            <p className="feature-description">
              Paint worklets re-render automatically when CSS properties change
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <Download size={24} />
            </div>
            <h3 className="feature-title">High Performance</h3>
            <p className="feature-description">
              Runs off the main thread for smooth animations and interactions
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaintAPIPage;