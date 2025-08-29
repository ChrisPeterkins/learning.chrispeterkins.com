import React from 'react';
import { Link } from 'react-router-dom';
import { Palette, Layout, Settings, Play, Code, Monitor, Beaker, ExternalLink } from 'lucide-react';

const HomePage: React.FC = () => {
  const features = [
    {
      icon: <Palette size={24} />,
      title: 'Paint API',
      description: 'Create custom CSS backgrounds and images with JavaScript',
      link: '/paint-api'
    },
    {
      icon: <Layout size={24} />,
      title: 'Layout API',
      description: 'Define custom layout algorithms and behavior',
      link: '/layout-api'
    },
    {
      icon: <Settings size={24} />,
      title: 'Properties API',
      description: 'Register custom CSS properties with type checking',
      link: '/properties-api'
    },
    {
      icon: <Play size={24} />,
      title: 'Animation Worklet',
      description: 'Create high-performance custom animations',
      link: '/animation-worklet'
    },
    {
      icon: <Code size={24} />,
      title: 'Typed OM',
      description: 'Work with CSS values as JavaScript objects',
      link: '/typed-om'
    },
    {
      icon: <Monitor size={24} />,
      title: 'Browser Support',
      description: 'Check compatibility and implementation status',
      link: '/compatibility'
    }
  ];

  const browserSupport = [
    { name: 'Chrome', version: '65+', status: 'supported' },
    { name: 'Firefox', version: '72+', status: 'partial' },
    { name: 'Safari', version: '16+', status: 'partial' },
    { name: 'Edge', version: '79+', status: 'supported' }
  ];

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">CSS Houdini Laboratory</h1>
        <p className="page-subtitle">
          Explore the future of CSS with Houdini APIs. Create custom paint effects, 
          layout algorithms, and animations that run at native browser speeds.
        </p>
      </div>

      <div className="section">
        <h2 className="section-title">
          <Beaker size={24} />
          Interactive Demos
        </h2>
        <p className="section-description">
          Discover the power of CSS Houdini through hands-on examples and live code editing.
        </p>
        
        <div className="features-grid">
          {features.map((feature, index) => (
            <Link
              key={index}
              to={feature.link}
              className="feature-card"
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <div className="feature-icon">
                {feature.icon}
              </div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-description">{feature.description}</p>
            </Link>
          ))}
        </div>
      </div>

      <div className="section">
        <h2 className="section-title">
          <Monitor size={24} />
          Browser Compatibility
        </h2>
        <p className="section-description">
          CSS Houdini support varies across browsers. Here's the current status:
        </p>
        
        <div className="browser-support">
          {browserSupport.map((browser, index) => (
            <div
              key={index}
              className={`browser-item browser-item--${browser.status}`}
            >
              <strong>{browser.name}</strong>
              <span>{browser.version}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="section">
        <h2 className="section-title">What is CSS Houdini?</h2>
        <p className="section-description">
          CSS Houdini is a collection of APIs that expose the CSS engine's internals to developers. 
          This allows you to extend CSS by hooking into the styling and layout process of a browser's 
          rendering engine.
        </p>
        
        <div className="demo-grid">
          <div className="demo-card">
            <h3 className="demo-title">Paint Worklets</h3>
            <div 
              className="demo-preview"
              style={{
                background: 'paint(checkerboard)',
                '--checkerboard-size': '25px',
                '--checkerboard-color1': '#667eea',
                '--checkerboard-color2': '#764ba2'
              } as any}
            />
            <p className="demo-description">
              Generate custom backgrounds and images programmatically
            </p>
          </div>
          
          <div className="demo-card">
            <h3 className="demo-title">Custom Properties</h3>
            <div className="demo-preview">
              <div
                style={{
                  width: '80%',
                  height: '60%',
                  background: 'linear-gradient(45deg, var(--demo-color, #667eea), var(--demo-color-2, #764ba2))',
                  borderRadius: '8px',
                  animation: 'pulse 2s ease-in-out infinite'
                } as any}
              />
            </div>
            <p className="demo-description">
              Define typed CSS properties with validation and default values
            </p>
          </div>
          
          <div className="demo-card">
            <h3 className="demo-title">Animation Worklets</h3>
            <div className="demo-preview">
              <div
                style={{
                  width: '60px',
                  height: '60px',
                  background: '#667eea',
                  borderRadius: '50%',
                  animation: 'bounce 1.5s ease-in-out infinite'
                }}
              />
            </div>
            <p className="demo-description">
              Create smooth, high-performance custom animations
            </p>
          </div>
        </div>
      </div>

      <div className="section">
        <h2 className="section-title">Getting Started</h2>
        <p className="section-description">
          Ready to dive deeper? Start with the Paint API to create your first custom CSS background, 
          or explore the Properties API to define typed CSS variables.
        </p>
        
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center', marginTop: '2rem' }}>
          <Link to="/paint-api" className="control-button">
            Start with Paint API
          </Link>
          <Link to="/playground" className="control-button">
            Open Playground
          </Link>
          <a
            href="https://developer.mozilla.org/en-US/docs/Web/Houdini"
            target="_blank"
            rel="noopener noreferrer"
            className="control-button"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}
          >
            MDN Documentation
            <ExternalLink size={16} />
          </a>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
      `}</style>
    </div>
  );
};

export default HomePage;