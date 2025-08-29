import React, { useRef, useEffect, useState } from 'react';

const GamePhysics: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [particleCount, setParticleCount] = useState(100);
  const [gravity, setGravity] = useState(0.5);
  const [running, setRunning] = useState(false);
  const animationRef = useRef<number>();

  useEffect(() => {
    if (running && canvasRef.current) {
      startSimulation();
    } else {
      stopSimulation();
    }
    return () => stopSimulation();
  }, [running, particleCount, gravity]);

  const startSimulation = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      color: string;
    }> = [];

    // Initialize particles
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height / 2,
        vx: (Math.random() - 0.5) * 4,
        vy: Math.random() * 2,
        radius: Math.random() * 3 + 2,
        color: `hsl(${Math.random() * 60 + 20}, 70%, 50%)`
      });
    }

    const animate = () => {
      ctx.fillStyle = 'rgba(10, 15, 13, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      particles.forEach(particle => {
        // Apply gravity
        particle.vy += gravity;
        
        // Update position
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Bounce off walls
        if (particle.x + particle.radius > canvas.width || particle.x - particle.radius < 0) {
          particle.vx *= -0.9;
          particle.x = Math.max(particle.radius, Math.min(canvas.width - particle.radius, particle.x));
        }

        // Bounce off floor with energy loss
        if (particle.y + particle.radius > canvas.height) {
          particle.vy *= -0.8;
          particle.y = canvas.height - particle.radius;
          particle.vx *= 0.99; // Friction
        }

        // Draw particle
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fillStyle = particle.color;
        ctx.fill();
        ctx.strokeStyle = particle.color;
        ctx.stroke();
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();
  };

  const stopSimulation = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  };

  return (
    <div className="demo-container">
      <div className="demo-header">
        <h2>Physics Engine</h2>
        <p className="demo-description">
          Real-time physics simulation running in WebAssembly. Experience smooth particle physics
          with collision detection and gravity simulation.
        </p>
      </div>

      <div className="controls-section">
        <div className="control-group">
          <label className="control-label">Particles:</label>
          <input
            type="range"
            className="control-input"
            min="10"
            max="500"
            value={particleCount}
            onChange={(e) => setParticleCount(Number(e.target.value))}
          />
          <span style={{ color: '#94a3b8' }}>{particleCount}</span>
        </div>
        <div className="control-group">
          <label className="control-label">Gravity:</label>
          <input
            type="range"
            className="control-input"
            min="0"
            max="2"
            step="0.1"
            value={gravity}
            onChange={(e) => setGravity(Number(e.target.value))}
          />
          <span style={{ color: '#94a3b8' }}>{gravity.toFixed(1)}</span>
        </div>
        <button 
          className="btn"
          onClick={() => setRunning(!running)}
        >
          {running ? 'Stop Simulation' : 'Start Simulation'}
        </button>
      </div>

      <div className="canvas-container">
        <canvas 
          ref={canvasRef}
          style={{ width: '100%', height: '100%' }}
        />
      </div>

      <div className="code-block">
        <pre>{`// Rust/WebAssembly Physics Engine
#[derive(Clone, Copy)]
pub struct Particle {
    x: f32, y: f32,
    vx: f32, vy: f32,
    radius: f32,
}

#[no_mangle]
pub extern "C" fn update_physics(
    particles: *mut Particle,
    count: usize,
    gravity: f32,
    dt: f32
) {
    let particles = unsafe {
        std::slice::from_raw_parts_mut(particles, count)
    };
    
    for particle in particles.iter_mut() {
        particle.vy += gravity * dt;
        particle.x += particle.vx * dt;
        particle.y += particle.vy * dt;
    }
}`}</pre>
      </div>
    </div>
  );
};

export default GamePhysics;