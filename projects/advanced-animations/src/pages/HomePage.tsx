import React from 'react';
import { Link } from 'react-router-dom';
import { Zap, Wind, Sparkles, Waves, Box, Gauge, Clock, ArrowRight } from 'lucide-react';

const HomePage: React.FC = () => {
  const libraries = [
    {
      icon: <Zap size={24} />,
      title: 'GSAP',
      description: 'Professional-grade animation library with timeline control and plugins',
      link: '/gsap',
      features: ['ScrollTrigger', 'Morphing SVG', 'Physics', 'Timeline Control']
    },
    {
      icon: <Wind size={24} />,
      title: 'Framer Motion',
      description: 'Declarative animations for React with gesture support',
      link: '/framer-motion',
      features: ['Layout Animations', 'Gestures', 'Page Transitions', 'Spring Physics']
    },
    {
      icon: <Sparkles size={24} />,
      title: 'Lottie',
      description: 'Render After Effects animations natively on web',
      link: '/lottie',
      features: ['Vector Animation', 'Interactive Control', 'Small File Size', 'Cross Platform']
    },
    {
      icon: <Waves size={24} />,
      title: 'SVG Animation',
      description: 'Path morphing, stroke animations, and complex SVG transitions',
      link: '/svg-animation',
      features: ['Path Morphing', 'Draw-on Animation', 'Interactive SVG', 'CSS Integration']
    },
    {
      icon: <Box size={24} />,
      title: '3D CSS',
      description: 'Transform your interfaces with 3D transforms and perspectives',
      link: '/css-3d',
      features: ['3D Transforms', 'Perspective', 'Flip Cards', '3D Carousels']
    },
    {
      icon: <Gauge size={24} />,
      title: 'Performance',
      description: 'Optimization techniques for smooth 60fps animations',
      link: '/performance',
      features: ['GPU Acceleration', 'Animation Layers', 'Profiling Tools', 'Best Practices']
    }
  ];

  const showcaseAnimations = [
    { name: 'Floating', className: 'float' },
    { name: 'Bouncing', className: 'bounce' },
    { name: 'Pulsing', className: 'pulse' },
    { name: 'Rotating', className: 'rotate' }
  ];

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">
          <Zap size={40} />
          Advanced Animations Laboratory
        </h1>
        <p className="page-subtitle">
          Master modern animation techniques with GSAP, Framer Motion, Lottie, and more. 
          Create smooth, performant animations that enhance user experience.
        </p>
      </div>

      <div className="section">
        <h2 className="section-title">Animation Showcase</h2>
        <p className="section-description">
          Experience the power of modern animation libraries with these interactive examples.
        </p>
        
        <div className="animation-showcase">
          {showcaseAnimations.map((anim, index) => (
            <div key={index} className="animation-demo">
              <h3>{anim.name}</h3>
              <div className="animation-area">
                <div className={`animated-box ${anim.className}`} />
              </div>
              <p>Pure CSS animation with optimized performance</p>
            </div>
          ))}
        </div>
      </div>

      <div className="section">
        <h2 className="section-title">
          <Clock size={24} />
          Animation Libraries & Techniques
        </h2>
        <p className="section-description">
          Explore comprehensive guides and interactive examples for each animation approach.
        </p>
        
        <div className="demo-grid">
          {libraries.map((library, index) => (
            <div key={index} className="demo-card">
              <div className="demo-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {library.icon}
                {library.title}
              </div>
              <p className="demo-description">{library.description}</p>
              
              <div className="demo-preview">
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '0.5rem',
                  justifyContent: 'center',
                  padding: '1rem'
                }}>
                  {library.features.map((feature, i) => (
                    <span
                      key={i}
                      style={{
                        background: 'rgba(102, 126, 234, 0.1)',
                        color: '#667eea',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '0.25rem',
                        fontSize: '0.8rem',
                        fontWeight: '500'
                      }}
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
              
              <Link
                to={library.link}
                className="control-button"
                style={{ textDecoration: 'none', justifyContent: 'center', marginTop: '1rem' }}
              >
                Explore {library.title}
                <ArrowRight size={16} />
              </Link>
            </div>
          ))}
        </div>
      </div>

      <div className="section">
        <h2 className="section-title">Why Advanced Animations Matter</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">
              <Zap size={24} />
            </div>
            <h3 className="feature-title">User Engagement</h3>
            <p className="feature-description">
              Well-crafted animations guide users, provide feedback, and create memorable experiences
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <Wind size={24} />
            </div>
            <h3 className="feature-title">Visual Hierarchy</h3>
            <p className="feature-description">
              Motion helps establish relationships between elements and draws attention to important content
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <Gauge size={24} />
            </div>
            <h3 className="feature-title">Performance</h3>
            <p className="feature-description">
              Modern animation techniques leverage GPU acceleration for smooth 60fps experiences
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <Sparkles size={24} />
            </div>
            <h3 className="feature-title">Brand Expression</h3>
            <p className="feature-description">
              Custom animations reflect brand personality and set your product apart from competitors
            </p>
          </div>
        </div>
      </div>

      <div className="section">
        <h2 className="section-title">Performance Metrics</h2>
        <p className="section-description">
          Modern animation libraries are designed for performance. Here's what you can achieve:
        </p>
        
        <div className="performance-metrics">
          <div className="metric-card">
            <span className="metric-value">60</span>
            <span className="metric-label">FPS Target</span>
          </div>
          <div className="metric-card">
            <span className="metric-value">16.67</span>
            <span className="metric-label">ms Budget</span>
          </div>
          <div className="metric-card">
            <span className="metric-value">GPU</span>
            <span className="metric-label">Acceleration</span>
          </div>
          <div className="metric-card">
            <span className="metric-value">0</span>
            <span className="metric-label">Layout Thrashing</span>
          </div>
        </div>
      </div>

      <div className="section">
        <h2 className="section-title">Learning Path</h2>
        <p className="section-description">
          Start your animation journey with these recommended steps:
        </p>
        
        <div style={{ display: 'grid', gap: '1rem', marginTop: '2rem' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            padding: '1rem',
            background: 'rgba(102, 126, 234, 0.1)',
            borderRadius: '0.5rem',
            borderLeft: '4px solid #667eea'
          }}>
            <div style={{
              width: '24px',
              height: '24px',
              background: '#667eea',
              color: 'white',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.8rem',
              fontWeight: 'bold'
            }}>
              1
            </div>
            <div>
              <strong>Start with CSS Animations</strong> - Master the fundamentals with CSS transitions and keyframes
            </div>
          </div>
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            padding: '1rem',
            background: 'rgba(102, 126, 234, 0.1)',
            borderRadius: '0.5rem',
            borderLeft: '4px solid #667eea'
          }}>
            <div style={{
              width: '24px',
              height: '24px',
              background: '#667eea',
              color: 'white',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.8rem',
              fontWeight: 'bold'
            }}>
              2
            </div>
            <div>
              <strong>Explore GSAP</strong> - Learn the industry standard for professional animations
            </div>
          </div>
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            padding: '1rem',
            background: 'rgba(102, 126, 234, 0.1)',
            borderRadius: '0.5rem',
            borderLeft: '4px solid #667eea'
          }}>
            <div style={{
              width: '24px',
              height: '24px',
              background: '#667eea',
              color: 'white',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.8rem',
              fontWeight: 'bold'
            }}>
              3
            </div>
            <div>
              <strong>Master Performance</strong> - Learn optimization techniques for smooth animations
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;