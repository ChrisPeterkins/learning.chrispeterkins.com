import React, { useState } from 'react';
import { Play, AlertTriangle } from 'lucide-react';

const AnimationWorkletPage: React.FC = () => {
  const [stiffness, setStiffness] = useState(100);
  const [damping, setDamping] = useState(10);
  const [mass, setMass] = useState(1);

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">
          <Play className="inline" size={32} />
          Animation Worklet
        </h1>
        <p className="page-subtitle">
          Create high-performance custom animations that run off the main thread.
          Define physics-based timing functions and complex animation behaviors.
        </p>
      </div>

      <div className="section">
        <div style={{
          background: '#fff3cd',
          border: '1px solid #ffeaa7',
          borderRadius: '0.5rem',
          padding: '1.5rem',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '1rem',
          marginBottom: '2rem'
        }}>
          <AlertTriangle size={24} color="#856404" />
          <div>
            <h3 style={{ margin: '0 0 0.5rem 0', color: '#856404' }}>Experimental Feature</h3>
            <p style={{ margin: 0, color: '#856404', lineHeight: 1.5 }}>
              Animation Worklets are experimental and only supported in Chrome behind a flag. 
              The examples show the concept using JavaScript animations.
            </p>
          </div>
        </div>
      </div>

      <div className="section">
        <h2 className="section-title">Spring Physics Animation</h2>
        <p className="section-description">
          Customize spring physics parameters to create natural-feeling animations.
        </p>
        
        <div className="controls">
          <div className="control-group">
            <label className="control-label">Stiffness: {stiffness}</label>
            <input
              type="range"
              min="50"
              max="300"
              value={stiffness}
              onChange={(e) => setStiffness(Number(e.target.value))}
              className="control-input"
            />
          </div>
          <div className="control-group">
            <label className="control-label">Damping: {damping}</label>
            <input
              type="range"
              min="5"
              max="50"
              value={damping}
              onChange={(e) => setDamping(Number(e.target.value))}
              className="control-input"
            />
          </div>
          <div className="control-group">
            <label className="control-label">Mass: {mass}</label>
            <input
              type="range"
              min="0.5"
              max="3"
              step="0.1"
              value={mass}
              onChange={(e) => setMass(Number(e.target.value))}
              className="control-input"
            />
          </div>
        </div>
        
        <div className="demo-card">
          <div className="demo-preview">
            <div
              style={{
                width: '60px',
                height: '60px',
                background: 'linear-gradient(45deg, #667eea, #764ba2)',
                borderRadius: '50%',
                animation: `spring-bounce 2s ease-out infinite`,
                '--spring-stiffness': stiffness,
                '--spring-damping': damping,
                '--spring-mass': mass
              } as any}
            />
          </div>
        </div>
      </div>

      <div className="section">
        <h2 className="section-title">Performance Benefits</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">
              <Play size={24} />
            </div>
            <h3 className="feature-title">Off-Main-Thread</h3>
            <p className="feature-description">
              Animations run without blocking the main JavaScript thread
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <Play size={24} />
            </div>
            <h3 className="feature-title">60 FPS</h3>
            <p className="feature-description">
              Smooth animations that maintain consistent frame rates
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <Play size={24} />
            </div>
            <h3 className="feature-title">Custom Timing</h3>
            <p className="feature-description">
              Physics-based and mathematical timing functions
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spring-bounce {
          0% { transform: translateY(0) scale(1); }
          30% { transform: translateY(-40px) scale(1.1); }
          60% { transform: translateY(-10px) scale(0.95); }
          80% { transform: translateY(-20px) scale(1.05); }
          100% { transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
};

export default AnimationWorkletPage;