import React, { useState } from 'react';
import { Circle, Play, RotateCcw } from 'lucide-react';

const SDFBasicsPage: React.FC = () => {
  const [selectedSDF, setSelectedSDF] = useState('sphere');
  const [radius, setRadius] = useState(0.5);
  const [boxSize, setBoxSize] = useState(0.4);

  const sdfExamples = [
    {
      id: 'sphere',
      name: 'Sphere',
      code: `float sdSphere(vec3 p, float r) {
    return length(p) - r;
}`,
      description: 'The simplest SDF - distance from point to sphere surface'
    },
    {
      id: 'box',
      name: 'Box',
      code: `float sdBox(vec3 p, vec3 b) {
    vec3 q = abs(p) - b;
    return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0);
}`,
      description: 'A cube defined by its half-extents'
    },
    {
      id: 'torus',
      name: 'Torus',
      code: `float sdTorus(vec3 p, vec2 t) {
    vec2 q = vec2(length(p.xz) - t.x, p.y);
    return length(q) - t.y;
}`,
      description: 'A donut shape with major and minor radius'
    }
  ];

  const booleanOps = [
    {
      name: 'Union',
      code: `float opUnion(float d1, float d2) {
    return min(d1, d2);
}`,
      description: 'Combine two shapes'
    },
    {
      name: 'Subtraction',
      code: `float opSubtraction(float d1, float d2) {
    return max(-d1, d2);
}`,
      description: 'Cut one shape from another'
    },
    {
      name: 'Intersection',
      code: `float opIntersection(float d1, float d2) {
    return max(d1, d2);
}`,
      description: 'Keep only overlapping parts'
    }
  ];

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">
          <Circle size={32} />
          Signed Distance Fields Basics
        </h1>
        <p className="page-subtitle">
          Learn the mathematical foundations of 3D shape definition using distance functions. 
          SDFs describe geometry implicitly through distance calculations.
        </p>
      </div>

      <div className="section">
        <h2 className="section-title">What is an SDF?</h2>
        <p className="section-description">
          A Signed Distance Field is a function that takes a 3D point and returns the shortest distance 
          to the surface of a shape. Negative values indicate points inside the shape, positive values 
          indicate points outside.
        </p>
        
        <div className="demo-card">
          <canvas 
            className="shader-canvas"
            width={800}
            height={400}
            style={{ 
              background: 'linear-gradient(45deg, #000428, #004e92)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#00ffff',
              fontSize: '1.2rem'
            }}
          >
            Interactive SDF Visualization
            <br />
            <small style={{ opacity: 0.7 }}>WebGL implementation would render here</small>
          </canvas>
        </div>
      </div>

      <div className="section">
        <h2 className="section-title">Primitive SDFs</h2>
        <p className="section-description">
          Start with basic shapes - the building blocks of complex scenes.
        </p>
        
        <div className="controls">
          <div className="control-group">
            <label className="control-label">Shape</label>
            <select
              value={selectedSDF}
              onChange={(e) => setSelectedSDF(e.target.value)}
              className="control-input"
            >
              {sdfExamples.map(sdf => (
                <option key={sdf.id} value={sdf.id}>{sdf.name}</option>
              ))}
            </select>
          </div>
          {selectedSDF === 'sphere' && (
            <div className="control-group">
              <label className="control-label">Radius: {radius.toFixed(2)}</label>
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.05"
                value={radius}
                onChange={(e) => setRadius(Number(e.target.value))}
                className="control-input"
              />
            </div>
          )}
          {selectedSDF === 'box' && (
            <div className="control-group">
              <label className="control-label">Size: {boxSize.toFixed(2)}</label>
              <input
                type="range"
                min="0.1"
                max="0.8"
                step="0.05"
                value={boxSize}
                onChange={(e) => setBoxSize(Number(e.target.value))}
                className="control-input"
              />
            </div>
          )}
        </div>
        
        <div className="demo-grid">
          {sdfExamples.map((sdf, index) => (
            <div key={index} className="demo-card">
              <h3 className="demo-title">{sdf.name}</h3>
              <p className="demo-description">{sdf.description}</p>
              
              <div className="demo-preview">
                <div style={{
                  width: sdf.name === 'Sphere' ? '100px' : sdf.name === 'Box' ? '80px' : '90px',
                  height: sdf.name === 'Sphere' ? '100px' : sdf.name === 'Box' ? '80px' : '90px',
                  background: 'linear-gradient(135deg, #00ffff, #ff00ff)',
                  borderRadius: sdf.name === 'Sphere' ? '50%' : sdf.name === 'Box' ? '8px' : '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#000',
                  fontWeight: 'bold',
                  fontSize: '0.8rem',
                  boxShadow: '0 0 20px rgba(0, 255, 255, 0.5)'
                }}>
                  {sdf.name}
                </div>
              </div>
              
              <div className="code-container">
                <div className="code-header">GLSL Code</div>
                <div className="code-content">
                  <pre>{sdf.code}</pre>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="section">
        <h2 className="section-title">Boolean Operations</h2>
        <p className="section-description">
          Combine multiple SDFs to create complex shapes using boolean operations.
        </p>
        
        <div className="demo-grid">
          {booleanOps.map((op, index) => (
            <div key={index} className="demo-card">
              <h3 className="demo-title">{op.name}</h3>
              <p className="demo-description">{op.description}</p>
              
              <div className="demo-preview">
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px'
                }}>
                  <div style={{
                    width: '60px',
                    height: '60px',
                    background: '#00ffff',
                    borderRadius: '50%',
                    opacity: 0.8
                  }} />
                  <div style={{
                    width: '60px',
                    height: '60px',
                    background: '#ff00ff',
                    borderRadius: '8px',
                    opacity: 0.8,
                    marginLeft: op.name === 'Union' ? '0' : op.name === 'Subtraction' ? '-30px' : '-20px'
                  }} />
                </div>
              </div>
              
              <div className="code-container">
                <div className="code-header">GLSL Code</div>
                <div className="code-content">
                  <pre>{op.code}</pre>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="section">
        <h2 className="section-title">Key Concepts</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">
              <Circle size={24} />
            </div>
            <h3 className="feature-title">Distance Fields</h3>
            <p className="feature-description">
              Functions that return the distance from any point to the nearest surface
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <Play size={24} />
            </div>
            <h3 className="feature-title">Implicit Surfaces</h3>
            <p className="feature-description">
              Surfaces defined by mathematical equations rather than explicit vertices
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <RotateCcw size={24} />
            </div>
            <h3 className="feature-title">Transformations</h3>
            <p className="feature-description">
              Move, rotate, and scale shapes by transforming the input coordinates
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SDFBasicsPage;