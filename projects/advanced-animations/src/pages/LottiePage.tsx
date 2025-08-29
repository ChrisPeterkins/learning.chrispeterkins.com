import React from 'react';
import { Sparkles } from 'lucide-react';

const LottiePage: React.FC = () => {
  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">
          <Sparkles size={32} />
          Lottie Animations
        </h1>
        <p className="page-subtitle">
          Render After Effects animations natively on web with vector precision and small file sizes.
        </p>
      </div>

      <div className="section">
        <h2 className="section-title">Interactive Lottie Player</h2>
        <div className="demo-preview">
          <div className="animated-box pulse" />
          <p style={{ marginTop: '1rem', textAlign: 'center' }}>
            Lottie animation would render here
          </p>
        </div>
      </div>

      <div className="features-grid">
        <div className="feature-card">
          <div className="feature-icon">
            <Sparkles size={24} />
          </div>
          <h3 className="feature-title">Vector Based</h3>
          <p className="feature-description">
            Scalable animations that look crisp at any resolution
          </p>
        </div>
      </div>
    </div>
  );
};

export default LottiePage;