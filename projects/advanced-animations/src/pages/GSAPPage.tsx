import React, { useRef, useEffect, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Zap, Play, RotateCcw, Settings } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const GSAPPage: React.FC = () => {
  const boxRef = useRef<HTMLDivElement>(null);
  const scrollBoxRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<gsap.core.Timeline>();
  
  const [duration, setDuration] = useState(1);
  const [ease, setEase] = useState('power2.out');
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    // Create timeline animation
    timelineRef.current = gsap.timeline({ paused: true });
    
    if (boxRef.current) {
      timelineRef.current
        .to(boxRef.current, { x: 200, rotation: 360, duration: 1, ease: "power2.out" })
        .to(boxRef.current, { scale: 1.5, duration: 0.5, ease: "back.out" })
        .to(boxRef.current, { scale: 1, x: 0, rotation: 0, duration: 1, ease: "elastic.out" });
    }

    // ScrollTrigger animation
    if (scrollBoxRef.current) {
      gsap.fromTo(scrollBoxRef.current, 
        { x: -200, opacity: 0 },
        { 
          x: 0, 
          opacity: 1, 
          duration: 1,
          scrollTrigger: {
            trigger: scrollBoxRef.current,
            start: "top 80%",
            end: "bottom 20%",
            scrub: 1
          }
        }
      );
    }

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  const playAnimation = () => {
    if (timelineRef.current) {
      setIsPlaying(true);
      timelineRef.current.restart().then(() => setIsPlaying(false));
    }
  };

  const resetAnimation = () => {
    if (timelineRef.current) {
      timelineRef.current.progress(0).pause();
      setIsPlaying(false);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">
          <Zap size={32} />
          GSAP - GreenSock Animation Platform
        </h1>
        <p className="page-subtitle">
          Professional-grade animation library with timeline control, ScrollTrigger, 
          and advanced easing. The industry standard for web animations.
        </p>
      </div>

      <div className="section">
        <h2 className="section-title">Basic GSAP Animation</h2>
        <p className="section-description">
          Control duration, easing, and properties with GSAP's intuitive API.
        </p>
        
        <div className="controls">
          <div className="control-group">
            <label className="control-label">Duration: {duration}s</label>
            <input
              type="range"
              min="0.5"
              max="3"
              step="0.1"
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="control-input"
            />
          </div>
          <div className="control-group">
            <label className="control-label">Easing</label>
            <select
              value={ease}
              onChange={(e) => setEase(e.target.value)}
              className="control-input"
            >
              <option value="none">Linear</option>
              <option value="power2.out">Power 2 Out</option>
              <option value="back.out">Back Out</option>
              <option value="elastic.out">Elastic Out</option>
              <option value="bounce.out">Bounce Out</option>
            </select>
          </div>
          <button onClick={playAnimation} disabled={isPlaying} className="control-button">
            <Play size={16} />
            Play Animation
          </button>
          <button onClick={resetAnimation} className="control-button">
            <RotateCcw size={16} />
            Reset
          </button>
        </div>
        
        <div className="demo-card">
          <div className="demo-preview">
            <div
              ref={boxRef}
              className="animated-box"
              style={{ margin: 0 }}
            />
          </div>
        </div>
      </div>

      <div className="section">
        <h2 className="section-title">ScrollTrigger Animation</h2>
        <p className="section-description">
          Animations that respond to scroll position. Scroll down to see the effect.
        </p>
        
        <div style={{ height: '400px', overflow: 'auto', border: '2px solid #e0e0e0', borderRadius: '0.5rem', padding: '2rem' }}>
          <div style={{ height: '200px' }}>
            <p>Scroll down to trigger the animation...</p>
          </div>
          <div className="demo-preview">
            <div
              ref={scrollBoxRef}
              className="animated-box"
              style={{ background: 'linear-gradient(45deg, #764ba2, #667eea)' }}
            />
          </div>
          <div style={{ height: '200px' }}>
            <p>Continue scrolling...</p>
          </div>
        </div>
      </div>

      <div className="section">
        <h2 className="section-title">GSAP Features</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">
              <Zap size={24} />
            </div>
            <h3 className="feature-title">Timeline Control</h3>
            <p className="feature-description">
              Sequence animations with precise timing and control
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <Settings size={24} />
            </div>
            <h3 className="feature-title">Advanced Easing</h3>
            <p className="feature-description">
              Custom easing functions for natural-feeling animations
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <Play size={24} />
            </div>
            <h3 className="feature-title">ScrollTrigger</h3>
            <p className="feature-description">
              Trigger animations based on scroll position
            </p>
          </div>
        </div>
      </div>

      <div className="section">
        <h2 className="section-title">Code Examples</h2>
        <div className="code-container">
          <div className="code-header">Basic Animation</div>
          <div className="code-content">
            <pre>{`// Basic GSAP animation
gsap.to(".element", {
  x: 200,
  rotation: 360,
  duration: 2,
  ease: "power2.out"
});

// Timeline sequence
const tl = gsap.timeline();
tl.to(".box", { x: 200, duration: 1 })
  .to(".box", { y: 100, duration: 0.5 })
  .to(".box", { rotation: 360, duration: 1 });`}</pre>
          </div>
        </div>

        <div className="code-container">
          <div className="code-header">ScrollTrigger</div>
          <div className="code-content">
            <pre>{`// ScrollTrigger animation
gsap.fromTo(".element", 
  { x: -200, opacity: 0 },
  { 
    x: 0, 
    opacity: 1,
    scrollTrigger: {
      trigger: ".element",
      start: "top 80%",
      end: "bottom 20%",
      scrub: 1
    }
  }
);`}</pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GSAPPage;