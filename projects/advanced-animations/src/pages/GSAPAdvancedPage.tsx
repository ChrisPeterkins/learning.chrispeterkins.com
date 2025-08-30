import React, { useRef, useEffect, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Draggable } from 'gsap/Draggable';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
import { TextPlugin } from 'gsap/TextPlugin';
import { Play, Pause, RotateCcw, Layers, Move, Type, Sparkles } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger, Draggable, MotionPathPlugin, TextPlugin);

const GSAPAdvancedPage: React.FC = () => {
  // Refs for complex timeline
  const staggerContainerRef = useRef<HTMLDivElement>(null);
  const morphRef = useRef<SVGPathElement>(null);
  const pathFollowerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const parallaxContainerRef = useRef<HTMLDivElement>(null);
  const magneticRef = useRef<HTMLDivElement>(null);
  const infiniteRef = useRef<HTMLDivElement>(null);
  
  // Timeline controls
  const masterTimelineRef = useRef<gsap.core.Timeline>();
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [speed, setSpeed] = useState(1);

  // Initialize complex animations
  useEffect(() => {
    // Master Timeline with labels
    const tl = gsap.timeline({
      paused: true,
      onUpdate: () => {
        setProgress(tl.progress() * 100);
      },
      onComplete: () => {
        setIsPlaying(false);
      }
    });
    
    masterTimelineRef.current = tl;

    // Staggered animation with custom easing
    if (staggerContainerRef.current) {
      const boxes = staggerContainerRef.current.querySelectorAll('.stagger-box');
      tl.fromTo(boxes, 
        {
          scale: 0,
          rotation: -180,
          opacity: 0,
          y: 100
        },
        {
          scale: 1,
          rotation: 0,
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: {
            amount: 1.5,
            from: "center",
            grid: "auto",
            ease: "power2.inOut"
          },
          ease: "back.out(1.7)"
        },
        "start"
      );
    }

    // SVG Morph animation
    if (morphRef.current) {
      const shapes = [
        "M50,10 L90,40 L90,90 L50,90 L10,90 L10,40 Z",
        "M50,10 L90,50 L50,90 L10,50 Z",
        "M25,25 L75,25 L75,75 L25,75 Z",
        "M50,10 A40,40 0 1,1 49.9,10 Z"
      ];
      
      shapes.forEach((shape, index) => {
        tl.to(morphRef.current, {
          duration: 0.5,
          attr: { d: shape },
          ease: "power2.inOut"
        }, `start+=${index * 0.3}`);
      });
    }

    // Motion Path animation
    if (pathFollowerRef.current) {
      tl.to(pathFollowerRef.current, {
        duration: 3,
        motionPath: {
          path: "#motionPath",
          align: "#motionPath",
          alignOrigin: [0.5, 0.5],
          autoRotate: true
        },
        ease: "none"
      }, "start+=1");
    }

    // Text animation with TypeWriter effect
    if (textRef.current) {
      tl.to(textRef.current, {
        duration: 2,
        text: "Advanced GSAP Animations",
        ease: "none"
      }, "start+=2");
    }

    return () => {
      tl.kill();
      ScrollTrigger.getAll().forEach(st => st.kill());
    };
  }, []);

  // Parallax scroll effect
  useEffect(() => {
    if (parallaxContainerRef.current) {
      const layers = parallaxContainerRef.current.querySelectorAll('.parallax-layer');
      
      layers.forEach((layer, index) => {
        gsap.to(layer, {
          yPercent: -50 * (index + 1),
          ease: "none",
          scrollTrigger: {
            trigger: parallaxContainerRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: 1
          }
        });
      });
    }
  }, []);

  // Magnetic button effect
  useEffect(() => {
    if (magneticRef.current) {
      const magnetic = magneticRef.current;
      
      const handleMouseMove = (e: MouseEvent) => {
        const rect = magnetic.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        
        gsap.to(magnetic, {
          x: x * 0.3,
          y: y * 0.3,
          duration: 0.3,
          ease: "power2.out"
        });
      };
      
      const handleMouseLeave = () => {
        gsap.to(magnetic, {
          x: 0,
          y: 0,
          duration: 0.5,
          ease: "elastic.out(1, 0.3)"
        });
      };
      
      magnetic.addEventListener('mousemove', handleMouseMove);
      magnetic.addEventListener('mouseleave', handleMouseLeave);
      
      return () => {
        magnetic.removeEventListener('mousemove', handleMouseMove);
        magnetic.removeEventListener('mouseleave', handleMouseLeave);
      };
    }
  }, []);

  // Infinite loop animation
  useEffect(() => {
    if (infiniteRef.current) {
      const items = infiniteRef.current.querySelectorAll('.infinite-item');
      
      gsap.timeline({ repeat: -1 })
        .to(items, {
          xPercent: -100,
          duration: 10,
          ease: "none",
          stagger: {
            amount: 10
          }
        })
        .set(items, { xPercent: 100 });
    }
  }, []);

  // Draggable elements
  useEffect(() => {
    const draggables = document.querySelectorAll('.draggable-box');
    draggables.forEach(element => {
      Draggable.create(element, {
        type: "x,y",
        bounds: ".drag-container",
        inertia: true,
        throwProps: true,
        edgeResistance: 0.65,
        onDrag: function() {
          gsap.to(this.target, {
            scale: 1.1,
            duration: 0.2
          });
        },
        onDragEnd: function() {
          gsap.to(this.target, {
            scale: 1,
            duration: 0.2
          });
        }
      });
    });
  }, []);

  const playTimeline = () => {
    if (masterTimelineRef.current) {
      setIsPlaying(true);
      masterTimelineRef.current.timeScale(speed).play();
    }
  };

  const pauseTimeline = () => {
    if (masterTimelineRef.current) {
      setIsPlaying(false);
      masterTimelineRef.current.pause();
    }
  };

  const resetTimeline = () => {
    if (masterTimelineRef.current) {
      setIsPlaying(false);
      masterTimelineRef.current.progress(0).pause();
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">
          <Sparkles size={32} />
          Advanced GSAP Animations
        </h1>
        <p className="page-subtitle">
          Complex timelines, morphing, motion paths, parallax, and interactive animations
        </p>
      </div>

      {/* Master Timeline Controls */}
      <div className="section">
        <h2 className="section-title">Master Timeline Orchestration</h2>
        <div className="controls">
          <button 
            onClick={isPlaying ? pauseTimeline : playTimeline}
            className="control-button"
          >
            {isPlaying ? <Pause size={16} /> : <Play size={16} />}
            {isPlaying ? 'Pause' : 'Play'}
          </button>
          <button onClick={resetTimeline} className="control-button">
            <RotateCcw size={16} />
            Reset
          </button>
          <div className="control-group">
            <label className="control-label">Speed: {speed}x</label>
            <input
              type="range"
              min="0.25"
              max="2"
              step="0.25"
              value={speed}
              onChange={(e) => {
                const newSpeed = Number(e.target.value);
                setSpeed(newSpeed);
                if (masterTimelineRef.current) {
                  masterTimelineRef.current.timeScale(newSpeed);
                }
              }}
              className="control-input"
            />
          </div>
          <div className="control-group">
            <label className="control-label">Progress: {progress.toFixed(0)}%</label>
            <input
              type="range"
              min="0"
              max="100"
              value={progress}
              onChange={(e) => {
                const newProgress = Number(e.target.value) / 100;
                if (masterTimelineRef.current) {
                  masterTimelineRef.current.progress(newProgress);
                }
              }}
              className="control-input"
            />
          </div>
        </div>

        {/* Staggered Grid Animation */}
        <div className="demo-card">
          <h3 className="demo-title">
            <Layers size={20} />
            Staggered Grid Animation
          </h3>
          <div ref={staggerContainerRef} className="stagger-container">
            {Array.from({ length: 16 }).map((_, i) => (
              <div key={i} className="stagger-box" style={{
                background: `linear-gradient(135deg, 
                  hsl(${220 + i * 10}, 70%, 50%), 
                  hsl(${240 + i * 10}, 70%, 60%))`
              }} />
            ))}
          </div>
        </div>

        {/* SVG Morphing */}
        <div className="demo-card">
          <h3 className="demo-title">SVG Morphing</h3>
          <svg width="100" height="100" viewBox="0 0 100 100" className="morph-svg">
            <path
              ref={morphRef}
              d="M50,10 L90,40 L90,90 L50,90 L10,90 L10,40 Z"
              fill="url(#morphGradient)"
            />
            <defs>
              <linearGradient id="morphGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1a5d3a" />
                <stop offset="100%" stopColor="#0f4d2a" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Motion Path */}
        <div className="demo-card">
          <h3 className="demo-title">
            <Move size={20} />
            Motion Path Animation
          </h3>
          <div className="motion-path-container">
            <svg width="400" height="200" viewBox="0 0 400 200">
              <path
                id="motionPath"
                d="M 50 100 Q 150 20 200 100 T 350 100"
                stroke="#1a5d3a"
                strokeWidth="2"
                fill="none"
                strokeDasharray="5,5"
              />
            </svg>
            <div ref={pathFollowerRef} className="path-follower">
              <Sparkles size={24} />
            </div>
          </div>
        </div>

        {/* Text Animation */}
        <div className="demo-card">
          <h3 className="demo-title">
            <Type size={20} />
            Text Animation
          </h3>
          <div ref={textRef} className="animated-text"></div>
        </div>
      </div>

      {/* Parallax Scrolling */}
      <div className="section">
        <h2 className="section-title">Parallax Scroll Effect</h2>
        <div ref={parallaxContainerRef} className="parallax-container">
          <div className="parallax-layer" data-speed="0.5">
            <div className="parallax-element bg-layer">Background</div>
          </div>
          <div className="parallax-layer" data-speed="0.8">
            <div className="parallax-element mid-layer">Midground</div>
          </div>
          <div className="parallax-layer" data-speed="1.2">
            <div className="parallax-element front-layer">Foreground</div>
          </div>
        </div>
      </div>

      {/* Interactive Elements */}
      <div className="section">
        <h2 className="section-title">Interactive Animations</h2>
        
        {/* Magnetic Button */}
        <div className="demo-card">
          <h3 className="demo-title">Magnetic Button (Hover Me)</h3>
          <div className="magnetic-container">
            <div ref={magneticRef} className="magnetic-button">
              Magnetic Effect
            </div>
          </div>
        </div>

        {/* Draggable Elements */}
        <div className="demo-card">
          <h3 className="demo-title">Draggable Elements</h3>
          <div className="drag-container">
            <div className="draggable-box" style={{ background: '#1a5d3a' }}>
              Drag Me
            </div>
            <div className="draggable-box" style={{ background: '#0f4d2a', left: '100px' }}>
              Drag Me Too
            </div>
          </div>
        </div>

        {/* Infinite Loop */}
        <div className="demo-card">
          <h3 className="demo-title">Infinite Loop Animation</h3>
          <div ref={infiniteRef} className="infinite-container">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="infinite-item">
                Item {i + 1}
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .stagger-container {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1rem;
          padding: 2rem;
        }

        .stagger-box {
          width: 60px;
          height: 60px;
          border-radius: 8px;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }

        .morph-svg {
          margin: 2rem auto;
          display: block;
        }

        .motion-path-container {
          position: relative;
          height: 200px;
          margin: 2rem 0;
        }

        .path-follower {
          position: absolute;
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #1a5d3a, #0a2f1d);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-primary);
          top: -20px;
          left: -20px;
        }

        .animated-text {
          font-size: 2rem;
          font-weight: bold;
          background: linear-gradient(90deg, #1a5d3a, #0a2f1d);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          min-height: 3rem;
        }

        .parallax-container {
          position: relative;
          height: 400px;
          overflow: hidden;
          background: var(--bg-primary);
          border-radius: 1rem;
        }

        .parallax-layer {
          position: absolute;
          width: 100%;
          height: 100%;
        }

        .parallax-element {
          position: absolute;
          padding: 1rem 2rem;
          border-radius: 8px;
          font-weight: bold;
          color: var(--text-primary);
        }

        .bg-layer {
          background: rgba(26, 93, 58, 0.3);
          top: 20%;
          left: 10%;
        }

        .mid-layer {
          background: rgba(118, 75, 162, 0.5);
          top: 40%;
          right: 20%;
        }

        .front-layer {
          background: rgba(26, 93, 58, 0.8);
          bottom: 20%;
          left: 30%;
        }

        .magnetic-container {
          display: flex;
          justify-content: center;
          padding: 4rem;
        }

        .magnetic-button {
          padding: 1rem 2rem;
          background: linear-gradient(135deg, #1a5d3a, #0a2f1d);
          color: var(--text-primary);
          border: none;
          border-radius: 8px;
          font-size: 1.1rem;
          font-weight: 600;
          cursor: pointer;
          transition: box-shadow 0.3s;
        }

        .magnetic-button:hover {
          box-shadow: 0 10px 30px rgba(26, 93, 58, 0.4);
        }

        .drag-container {
          position: relative;
          height: 300px;
          background: linear-gradient(135deg, #f5f5f5, #e0e0e0);
          border-radius: 1rem;
          overflow: hidden;
        }

        .draggable-box {
          position: absolute;
          width: 100px;
          height: 100px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-primary);
          font-weight: bold;
          cursor: grab;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          user-select: none;
        }

        .draggable-box:active {
          cursor: grabbing;
        }

        .infinite-container {
          display: flex;
          overflow: hidden;
          gap: 2rem;
          padding: 2rem;
          background: linear-gradient(90deg, #f5f5f5, #e0e0e0);
          border-radius: 1rem;
        }

        .infinite-item {
          flex-shrink: 0;
          padding: 1rem 2rem;
          background: linear-gradient(135deg, #1a5d3a, #0a2f1d);
          color: var(--text-primary);
          border-radius: 8px;
          font-weight: bold;
        }

        .demo-card {
          background: var(--bg-secondary);
          border-radius: 1rem;
          padding: 2rem;
          margin: 2rem 0;
          box-shadow: 0 4px 6px rgba(0,0,0,0.05);
        }

        .demo-title {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 1.5rem;
          color: var(--text-primary);
          font-size: 1.2rem;
        }
      `}</style>
    </div>
  );
};

export default GSAPAdvancedPage;