import React from 'react';
import { Sun } from 'lucide-react';

const ShadowsPage: React.FC = () => {
  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">
          <Sun size={32} />
          Soft Shadows & Ambient Occlusion
        </h1>
        <p className="page-subtitle">Advanced lighting techniques for realistic ray marched scenes.</p>
      </div>
      <div className="section">
        <canvas className="shader-canvas loading-shader">
          Soft Shadow Demo
        </canvas>
      </div>
    </div>
  );
};

export default ShadowsPage;