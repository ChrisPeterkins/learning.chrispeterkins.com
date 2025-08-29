import React from 'react';
import { Zap } from 'lucide-react';

const RayMarchingPage: React.FC = () => {
  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">
          <Zap size={32} />
          Ray Marching Algorithm
        </h1>
        <p className="page-subtitle">
          Learn the sphere tracing technique for rendering implicit surfaces defined by SDFs.
        </p>
      </div>
      <div className="section">
        <canvas className="shader-canvas loading-shader">
          Ray Marching Visualization
        </canvas>
      </div>
    </div>
  );
};

export default RayMarchingPage;