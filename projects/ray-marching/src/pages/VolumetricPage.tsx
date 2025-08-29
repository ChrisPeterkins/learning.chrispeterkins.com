import React from 'react';
import { Cloud } from 'lucide-react';

const VolumetricPage: React.FC = () => {
  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">
          <Cloud size={32} />
          Volumetric Rendering
        </h1>
        <p className="page-subtitle">Clouds, fog, and participating media effects.</p>
      </div>
      <div className="section">
        <canvas className="shader-canvas loading-shader">
          Volumetric Cloud Demo
        </canvas>
      </div>
    </div>
  );
};

export default VolumetricPage;