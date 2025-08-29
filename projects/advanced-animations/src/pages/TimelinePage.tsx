import React, { useState } from 'react';
import { Clock, Play, Pause } from 'lucide-react';

const TimelinePage: React.FC = () => {
  const [progress, setProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">
          <Clock size={32} />
          Timeline Controls
        </h1>
        <p className="page-subtitle">Sequence and control complex animation timelines.</p>
      </div>
      <div className="timeline-container">
        <div className="timeline-controls">
          <button onClick={() => setIsPlaying(!isPlaying)} className="control-button">
            {isPlaying ? <Pause size={16} /> : <Play size={16} />}
            {isPlaying ? 'Pause' : 'Play'}
          </button>
          <div className="timeline-progress">
            <div className="timeline-bar" style={{ width: `${progress}%` }} />
          </div>
        </div>
        <div className="animation-area">
          <div className="animated-circle pulse" />
        </div>
      </div>
    </div>
  );
};

export default TimelinePage;