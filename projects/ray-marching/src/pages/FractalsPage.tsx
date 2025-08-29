import React from 'react';
import { Sparkles } from 'lucide-react';

const FractalsPage: React.FC = () => {
  const fractals = ['Mandelbulb', 'Julia Set', 'Menger Sponge', 'Kleinian Group'];
  
  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">
          <Sparkles size={32} />
          3D Fractals
        </h1>
        <p className="page-subtitle">Explore infinite complexity through recursive mathematical structures.</p>
      </div>
      <div className="fractal-gallery">
        {fractals.map((name, i) => (
          <div key={i} className="fractal-item">
            <div className="fractal-preview loading-shader" />
            <div className="fractal-info">
              <h3 className="fractal-title">{name}</h3>
              <p className="fractal-description">Interactive {name} fractal</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FractalsPage;