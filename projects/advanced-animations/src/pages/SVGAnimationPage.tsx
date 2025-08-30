import React from 'react';
import { Waves } from 'lucide-react';

const SVGAnimationPage: React.FC = () => {
  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">
          <Waves size={32} />
          SVG Animations
        </h1>
        <p className="page-subtitle">Path morphing, stroke animations, and complex SVG transitions.</p>
      </div>
      <div className="section">
        <div className="demo-preview">
          <svg width="200" height="100" viewBox="0 0 200 100">
            <path d="M10 50 Q 100 10 190 50" stroke="#1a5d3a" strokeWidth="3" fill="none">
              <animate attributeName="d" values="M10 50 Q 100 10 190 50;M10 50 Q 100 90 190 50;M10 50 Q 100 10 190 50" dur="2s" repeatCount="indefinite"/>
            </path>
          </svg>
        </div>
      </div>
    </div>
  );
};

export default SVGAnimationPage;