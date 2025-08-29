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
        <p className="page-subtitle">Techniques for smooth 60fps animations.</p>
      </div>
      <div className="performance-metrics">
        <div className="metric-card">
          <span className="metric-value">60</span>
          <span className="metric-label">Target FPS</span>
        </div>
        <div className="metric-card">
          <span className="metric-value">16.67</span>
          <span className="metric-label">ms Budget</span>
        </div>
      </div>
    </div>
  );
};

export default PerformancePage;