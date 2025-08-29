import React from 'react';
import { Box } from 'lucide-react';

const CSS3DPage: React.FC = () => {
  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">
          <Box size={32} />
          3D CSS Transforms
        </h1>
        <p className="page-subtitle">Create depth with 3D transforms and perspective.</p>
      </div>
      <div className="section">
        <div className="demo-preview">
          <div className="animated-box" style={{ 
            transform: 'perspective(400px) rotateY(45deg) rotateX(15deg)',
            animation: 'rotate 4s linear infinite'
          }} />
        </div>
      </div>
    </div>
  );
};

export default CSS3DPage;