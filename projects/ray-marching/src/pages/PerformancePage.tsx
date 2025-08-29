import React from 'react';
import { Gauge } from 'lucide-react';

const PerformancePage: React.FC = () => {
  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">
          <Gauge size={32} />
          Performance Optimization
        </h1>
        <p className="page-subtitle">Techniques for real-time ray marching on modern GPUs.</p>
      </div>
      
      <div className="performance-grid">
        <div className="performance-card">
          <span className="performance-value">60</span>
          <span className="performance-label">Target FPS</span>
        </div>
        <div className="performance-card">
          <span className="performance-value">128</span>
          <span className="performance-label">Max Ray Steps</span>
        </div>
        <div className="performance-card">
          <span className="performance-value">0.001</span>
          <span className="performance-label">Distance Threshold</span>
        </div>
        <div className="performance-card">
          <span className="performance-value">LOD</span>
          <span className="performance-label">Level of Detail</span>
        </div>
      </div>

      <div className="features-grid">
        <div className="feature-card">
          <div className="feature-icon">
            <Gauge size={24} />
          </div>
          <h3 className="feature-title">Early Ray Termination</h3>
          <p className="feature-description">
            Stop ray marching when objects are far away or contribution is minimal
          </p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">
            <Gauge size={24} />
          </div>
          <h3 className="feature-title">Adaptive Step Size</h3>
          <p className="feature-description">
            Use larger steps in empty space, smaller steps near surfaces
          </p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">
            <Gauge size={24} />
          </div>
          <h3 className="feature-title">Level of Detail</h3>
          <p className="feature-description">
            Reduce complexity based on distance from camera
          </p>
        </div>
      </div>
    </div>
  );
};

export default PerformancePage;