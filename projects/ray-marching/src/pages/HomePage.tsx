import React from 'react';
import { Link } from 'react-router-dom';
import { Layers, Circle, Zap, Sparkles, Sun, Cloud, Code, ArrowRight } from 'lucide-react';

const HomePage: React.FC = () => {
  const techniques = [
    {
      icon: <Circle size={24} />,
      title: 'Signed Distance Fields',
      description: 'Mathematical functions that define 3D shapes and volumes',
      link: '/sdf-basics',
      features: ['Primitive Shapes', 'Boolean Operations', 'Distance Blending', 'Deformations']
    },
    {
      icon: <Zap size={24} />,
      title: 'Ray Marching Algorithm',
      description: 'Step-by-step ray traversal through implicit surfaces',
      link: '/ray-marching',
      features: ['Sphere Tracing', 'Lighting Models', 'Normal Calculation', 'Optimization']
    },
    {
      icon: <Sparkles size={24} />,
      title: '3D Fractals',
      description: 'Complex recursive structures rendered in real-time',
      link: '/fractals',
      features: ['Mandelbulb', 'Julia Sets', 'Menger Sponge', 'Kleinian Groups']
    },
    {
      icon: <Sun size={24} />,
      title: 'Soft Shadows',
      description: 'Realistic shadowing with penumbra and ambient occlusion',
      link: '/shadows',
      features: ['Soft Shadows', 'Ambient Occlusion', 'Global Illumination', 'Light Scattering']
    },
    {
      icon: <Cloud size={24} />,
      title: 'Volumetric Rendering',
      description: 'Clouds, fog, and participating media effects',
      link: '/volumetric',
      features: ['Volume Rendering', 'Fog Effects', 'Subsurface Scattering', 'Density Fields']
    },
    {
      icon: <Code size={24} />,
      title: 'Interactive Editor',
      description: 'Live GLSL shader editor with real-time preview',
      link: '/shader-editor',
      features: ['Live Editing', 'Error Highlighting', 'Code Templates', 'Export Options']
    }
  ];

  const examples = [
    { name: 'Sphere', code: 'length(p) - radius' },
    { name: 'Box', code: 'max(abs(p) - size)' },
    { name: 'Torus', code: 'length(vec2(length(p.xz) - R, p.y)) - r' },
    { name: 'Mandelbulb', code: 'Iterative fractal formula' }
  ];

  return (
    <div className="page fade-in">
      <div className="page-header">
        <h1 className="page-title glow-text">
          <Layers size={40} />
          Ray Marching & SDF Laboratory
        </h1>
        <p className="page-subtitle">
          Explore the mathematical beauty of signed distance fields and ray marching algorithms. 
          Create complex 3D scenes, fractals, and volumetric effects using pure mathematics and shaders.
        </p>
      </div>

      <div className="section">
        <h2 className="section-title">Live SDF Examples</h2>
        <p className="section-description">
          These shapes are defined entirely by mathematical functions - no vertices or polygons required.
        </p>
        
        <div className="fractal-gallery">
          {examples.map((example, index) => (
            <div key={index} className="fractal-item">
              <div className="fractal-preview">
                <div style={{
                  width: '80px',
                  height: '80px',
                  background: 'linear-gradient(45deg, #00ffff, #ff00ff)',
                  borderRadius: example.name === 'Sphere' ? '50%' : example.name === 'Box' ? '0' : '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#000',
                  fontWeight: 'bold',
                  fontSize: '0.8rem'
                }}>
                  {example.name}
                </div>
              </div>
              <div className="fractal-info">
                <h3 className="fractal-title">{example.name}</h3>
                <code className="fractal-description">{example.code}</code>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="section">
        <h2 className="section-title">
          <Zap size={24} />
          Techniques & Applications
        </h2>
        <p className="section-description">
          Master the art of mathematical 3D rendering with these comprehensive guides and interactive examples.
        </p>
        
        <div className="demo-grid">
          {techniques.map((technique, index) => (
            <div key={index} className="demo-card">
              <div className="demo-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {technique.icon}
                {technique.title}
              </div>
              <p className="demo-description">{technique.description}</p>
              
              <div className="demo-preview loading-shader">
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '0.5rem',
                  justifyContent: 'center',
                  padding: '1rem'
                }}>
                  {technique.features.map((feature, i) => (
                    <span
                      key={i}
                      style={{
                        background: 'rgba(0, 255, 255, 0.2)',
                        color: '#00ffff',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '0.25rem',
                        fontSize: '0.8rem',
                        fontWeight: '500',
                        border: '1px solid rgba(0, 255, 255, 0.3)'
                      }}
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
              
              <Link
                to={technique.link}
                className="control-button"
                style={{ textDecoration: 'none', justifyContent: 'center', marginTop: '1rem' }}
              >
                Explore {technique.title}
                <ArrowRight size={16} />
              </Link>
            </div>
          ))}
        </div>
      </div>

      <div className="section">
        <h2 className="section-title">Why Ray Marching?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">
              <Circle size={24} />
            </div>
            <h3 className="feature-title">Mathematical Precision</h3>
            <p className="feature-description">
              Define complex shapes with simple mathematical formulas instead of polygon meshes
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <Sparkles size={24} />
            </div>
            <h3 className="feature-title">Infinite Detail</h3>
            <p className="feature-description">
              Zoom into fractals and complex shapes without losing detail or quality
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <Zap size={24} />
            </div>
            <h3 className="feature-title">Real-time Rendering</h3>
            <p className="feature-description">
              GPU shaders enable interactive frame rates for complex 3D scenes
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <Sun size={24} />
            </div>
            <h3 className="feature-title">Advanced Lighting</h3>
            <p className="feature-description">
              Natural soft shadows, ambient occlusion, and global illumination effects
            </p>
          </div>
        </div>
      </div>

      <div className="section">
        <h2 className="section-title">Performance Metrics</h2>
        <p className="section-description">
          Modern GPUs can render complex ray marched scenes in real-time with these targets:
        </p>
        
        <div className="performance-grid">
          <div className="performance-card">
            <span className="performance-value">60</span>
            <span className="performance-label">FPS Target</span>
          </div>
          <div className="performance-card">
            <span className="performance-value">1K+</span>
            <span className="performance-label">Ray Steps/Frame</span>
          </div>
          <div className="performance-card">
            <span className="performance-value">GPU</span>
            <span className="performance-label">Parallel Processing</span>
          </div>
          <div className="performance-card">
            <span className="performance-value">∞</span>
            <span className="performance-label">Geometric Detail</span>
          </div>
        </div>
      </div>

      <div className="section">
        <h2 className="section-title">Learning Path</h2>
        <p className="section-description">
          Master ray marching and SDFs with this structured approach:
        </p>
        
        <div style={{ display: 'grid', gap: '1rem', marginTop: '2rem' }}>
          {[
            { step: 1, title: 'Understand SDFs', desc: 'Learn how distance functions define 3D shapes mathematically' },
            { step: 2, title: 'Ray Marching Basics', desc: 'Implement the core algorithm for sphere tracing' },
            { step: 3, title: 'Add Lighting', desc: 'Calculate normals and implement Phong shading' },
            { step: 4, title: 'Explore Fractals', desc: 'Render complex recursive mathematical structures' },
            { step: 5, title: 'Master Performance', desc: 'Optimize shaders for real-time rendering' }
          ].map((item, index) => (
            <div key={index} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              padding: '1rem',
              background: 'rgba(0, 255, 255, 0.1)',
              borderRadius: '0.5rem',
              borderLeft: '4px solid #00ffff',
              border: '1px solid rgba(0, 255, 255, 0.2)'
            }}>
              <div style={{
                width: '32px',
                height: '32px',
                background: 'linear-gradient(135deg, #00ffff, #0080ff)',
                color: '#000',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.9rem',
                fontWeight: 'bold'
              }}>
                {item.step}
              </div>
              <div>
                <strong style={{ color: '#ffffff' }}>{item.title}</strong>
                <div style={{ color: '#a0a0a0', fontSize: '0.9rem' }}>{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="section">
        <h2 className="section-title">Start Exploring</h2>
        <p className="section-description">
          Ready to dive into the world of mathematical 3D rendering? Start with SDF basics or jump into the interactive editor.
        </p>
        
        <div style={{ 
          display: 'flex', 
          gap: '1rem', 
          justifyContent: 'center', 
          flexWrap: 'wrap',
          marginTop: '2rem' 
        }}>
          <Link to="/sdf-basics" className="control-button">
            <Circle size={16} />
            Learn SDF Basics
          </Link>
          <Link to="/shader-editor" className="control-button">
            <Code size={16} />
            Open Shader Editor
          </Link>
          <Link to="/fractals" className="control-button">
            <Sparkles size={16} />
            Explore Fractals
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HomePage;