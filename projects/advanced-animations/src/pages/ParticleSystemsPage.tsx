import React, { useRef, useEffect, useState } from 'react';
import { Sparkles, Wind, Flame, Cloud, Droplets, Star } from 'lucide-react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  opacity: number;
  rotation?: number;
  rotationSpeed?: number;
}

const ParticleSystemsPage: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fireworksCanvasRef = useRef<HTMLCanvasElement>(null);
  const smokeCanvasRef = useRef<HTMLCanvasElement>(null);
  const starfieldCanvasRef = useRef<HTMLCanvasElement>(null);
  const morphCanvasRef = useRef<HTMLCanvasElement>(null);
  const attractorCanvasRef = useRef<HTMLCanvasElement>(null);
  
  const [particleCount, setParticleCount] = useState(100);
  const [gravity, setGravity] = useState(0.1);
  const [windForce, setWindForce] = useState(0);
  const [emissionRate, setEmissionRate] = useState(5);
  const [particleSize, setParticleSize] = useState(3);
  const [isEmitting, setIsEmitting] = useState(true);

  // Basic particle system
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    
    const particles: Particle[] = [];
    let animationId: number;
    
    const createParticle = (x: number, y: number) => {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 3 + 1;
      
      return {
        x,
        y,
        vx: Math.cos(angle) * speed + windForce,
        vy: Math.sin(angle) * speed - 2,
        life: 100,
        maxLife: 100,
        size: Math.random() * particleSize + 2,
        color: `hsl(${Math.random() * 60 + 200}, 70%, 50%)`,
        opacity: 1
      };
    };
    
    const updateParticles = () => {
      // Emit new particles
      if (isEmitting && particles.length < particleCount) {
        for (let i = 0; i < emissionRate; i++) {
          particles.push(createParticle(canvas.width / 2, canvas.height - 50));
        }
      }
      
      // Update existing particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        
        p.x += p.vx;
        p.y += p.vy;
        p.vy += gravity;
        p.vx += windForce * 0.01;
        p.life--;
        p.opacity = p.life / p.maxLife;
        
        if (p.life <= 0 || p.y > canvas.height) {
          particles.splice(i, 1);
        }
      }
    };
    
    const render = () => {
      ctx.fillStyle = 'rgba(10, 15, 13, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach(p => {
        ctx.save();
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = p.color;
        
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });
      
      updateParticles();
      animationId = requestAnimationFrame(render);
    };
    
    render();
    
    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [particleCount, gravity, windForce, emissionRate, particleSize, isEmitting]);

  // Fireworks system
  useEffect(() => {
    const canvas = fireworksCanvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    
    const fireworks: any[] = [];
    const particles: Particle[] = [];
    let animationId: number;
    
    const createFirework = () => {
      return {
        x: Math.random() * canvas.width,
        y: canvas.height,
        vx: (Math.random() - 0.5) * 2,
        vy: -Math.random() * 5 - 10,
        color: `hsl(${Math.random() * 360}, 100%, 50%)`,
        exploded: false
      };
    };
    
    const createExplosion = (x: number, y: number, color: string) => {
      const particleCount = 50;
      for (let i = 0; i < particleCount; i++) {
        const angle = (Math.PI * 2 * i) / particleCount;
        const speed = Math.random() * 5 + 2;
        
        particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 60,
          maxLife: 60,
          size: Math.random() * 3 + 1,
          color,
          opacity: 1
        });
      }
    };
    
    const update = () => {
      // Launch new firework occasionally
      if (Math.random() < 0.02) {
        fireworks.push(createFirework());
      }
      
      // Update fireworks
      for (let i = fireworks.length - 1; i >= 0; i--) {
        const fw = fireworks[i];
        fw.x += fw.vx;
        fw.y += fw.vy;
        fw.vy += 0.1;
        
        if (fw.vy > 0 && !fw.exploded) {
          createExplosion(fw.x, fw.y, fw.color);
          fireworks.splice(i, 1);
        }
        
        if (fw.y > canvas.height) {
          fireworks.splice(i, 1);
        }
      }
      
      // Update particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.1;
        p.vx *= 0.99;
        p.life--;
        p.opacity = p.life / p.maxLife;
        
        if (p.life <= 0) {
          particles.splice(i, 1);
        }
      }
    };
    
    const render = () => {
      ctx.fillStyle = 'rgba(10, 15, 13, 0.2)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw fireworks
      fireworks.forEach(fw => {
        ctx.fillStyle = fw.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = fw.color;
        ctx.fillRect(fw.x - 2, fw.y - 2, 4, 4);
      });
      
      // Draw particles
      particles.forEach(p => {
        ctx.save();
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = p.color;
        
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });
      
      update();
      animationId = requestAnimationFrame(render);
    };
    
    render();
    
    return () => {
      cancelAnimationFrame(animationId);
    };
  }, []);

  // Smoke/fog effect
  useEffect(() => {
    const canvas = smokeCanvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    
    const particles: any[] = [];
    let animationId: number;
    
    const createSmokeParticle = () => {
      return {
        x: canvas.width / 2 + (Math.random() - 0.5) * 50,
        y: canvas.height - 20,
        vx: (Math.random() - 0.5) * 0.5,
        vy: -Math.random() * 0.5 - 0.2,
        size: Math.random() * 20 + 10,
        life: 100,
        maxLife: 100,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.02
      };
    };
    
    const update = () => {
      if (particles.length < 20) {
        particles.push(createSmokeParticle());
      }
      
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx + Math.sin(p.y * 0.01) * 0.5;
        p.y += p.vy;
        p.size += 0.3;
        p.rotation += p.rotationSpeed;
        p.life--;
        
        if (p.life <= 0) {
          particles.splice(i, 1);
        }
      }
    };
    
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach(p => {
        const opacity = (p.life / p.maxLife) * 0.3;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.globalAlpha = opacity;
        
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, p.size);
        gradient.addColorStop(0, 'rgba(150, 150, 150, 0.3)');
        gradient.addColorStop(0.5, 'rgba(150, 150, 150, 0.1)');
        gradient.addColorStop(1, 'rgba(150, 150, 150, 0)');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(-p.size, -p.size, p.size * 2, p.size * 2);
        ctx.restore();
      });
      
      update();
      animationId = requestAnimationFrame(render);
    };
    
    render();
    
    return () => {
      cancelAnimationFrame(animationId);
    };
  }, []);

  // Starfield with depth
  useEffect(() => {
    const canvas = starfieldCanvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    
    const stars: any[] = [];
    const starCount = 200;
    let animationId: number;
    
    // Initialize stars
    for (let i = 0; i < starCount; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        z: Math.random() * 1000,
        size: Math.random() * 2
      });
    }
    
    const render = () => {
      ctx.fillStyle = 'rgba(10, 15, 20, 0.2)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      
      stars.forEach(star => {
        star.z -= 5;
        
        if (star.z <= 0) {
          star.x = Math.random() * canvas.width;
          star.y = Math.random() * canvas.height;
          star.z = 1000;
        }
        
        const x = (star.x - centerX) * (1000 / star.z) + centerX;
        const y = (star.y - centerY) * (1000 / star.z) + centerY;
        const size = (1 - star.z / 1000) * star.size * 3;
        const opacity = 1 - star.z / 1000;
        
        ctx.save();
        ctx.globalAlpha = opacity;
        ctx.fillStyle = '#ffffff';
        ctx.shadowBlur = size * 2;
        ctx.shadowColor = '#ffffff';
        
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });
      
      animationId = requestAnimationFrame(render);
    };
    
    render();
    
    return () => {
      cancelAnimationFrame(animationId);
    };
  }, []);

  // Morphing particles
  useEffect(() => {
    const canvas = morphCanvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    
    const particles: any[] = [];
    let shape = 'circle';
    let animationId: number;
    let time = 0;
    
    const shapes = {
      circle: (i: number, total: number) => {
        const angle = (Math.PI * 2 * i) / total;
        const radius = 100;
        return {
          x: canvas.width / 2 + Math.cos(angle) * radius,
          y: canvas.height / 2 + Math.sin(angle) * radius
        };
      },
      square: (i: number, total: number) => {
        const perSide = Math.floor(total / 4);
        const side = i / perSide | 0;
        const t = (i % perSide) / perSide;
        const size = 100;
        
        switch(side) {
          case 0: return { x: canvas.width / 2 - size + t * size * 2, y: canvas.height / 2 - size };
          case 1: return { x: canvas.width / 2 + size, y: canvas.height / 2 - size + t * size * 2 };
          case 2: return { x: canvas.width / 2 + size - t * size * 2, y: canvas.height / 2 + size };
          default: return { x: canvas.width / 2 - size, y: canvas.height / 2 + size - t * size * 2 };
        }
      },
      heart: (i: number, total: number) => {
        const t = (Math.PI * 2 * i) / total;
        const scale = 80;
        const x = 16 * Math.pow(Math.sin(t), 3);
        const y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
        
        return {
          x: canvas.width / 2 + x * scale / 16,
          y: canvas.height / 2 + y * scale / 16
        };
      }
    };
    
    // Initialize particles
    for (let i = 0; i < 100; i++) {
      const pos = shapes.circle(i, 100);
      particles.push({
        x: pos.x,
        y: pos.y,
        targetX: pos.x,
        targetY: pos.y,
        color: `hsl(${i * 3.6}, 70%, 50%)`
      });
    }
    
    const updateShape = () => {
      const shapeKeys = Object.keys(shapes) as Array<keyof typeof shapes>;
      const currentIndex = shapeKeys.indexOf(shape as keyof typeof shapes);
      shape = shapeKeys[(currentIndex + 1) % shapeKeys.length];
      
      particles.forEach((p, i) => {
        const pos = shapes[shape as keyof typeof shapes](i, particles.length);
        p.targetX = pos.x;
        p.targetY = pos.y;
      });
    };
    
    // Change shape every 3 seconds
    const shapeInterval = setInterval(updateShape, 3000);
    
    const render = () => {
      ctx.fillStyle = 'rgba(10, 15, 13, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      time += 0.01;
      
      particles.forEach((p, i) => {
        // Smooth interpolation to target
        p.x += (p.targetX - p.x) * 0.1;
        p.y += (p.targetY - p.y) * 0.1;
        
        // Add some floating motion
        const floatX = Math.sin(time + i * 0.1) * 2;
        const floatY = Math.cos(time + i * 0.1) * 2;
        
        ctx.save();
        ctx.fillStyle = p.color;
        ctx.shadowBlur = 15;
        ctx.shadowColor = p.color;
        
        ctx.beginPath();
        ctx.arc(p.x + floatX, p.y + floatY, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });
      
      animationId = requestAnimationFrame(render);
    };
    
    render();
    
    return () => {
      cancelAnimationFrame(animationId);
      clearInterval(shapeInterval);
    };
  }, []);

  // Attractor system
  useEffect(() => {
    const canvas = attractorCanvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    
    const particles: any[] = [];
    const attractors: any[] = [
      { x: canvas.width * 0.3, y: canvas.height * 0.5, strength: 100 },
      { x: canvas.width * 0.7, y: canvas.height * 0.5, strength: -50 }
    ];
    let animationId: number;
    let mouseX = canvas.width / 2;
    let mouseY = canvas.height / 2;
    
    // Initialize particles
    for (let i = 0; i < 200; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: 0,
        vy: 0,
        color: `hsl(${Math.random() * 60 + 200}, 70%, 50%)`
      });
    }
    
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
    };
    
    canvas.addEventListener('mousemove', handleMouseMove);
    
    const update = () => {
      particles.forEach(p => {
        // Apply forces from attractors
        attractors.forEach(a => {
          const dx = a.x - p.x;
          const dy = a.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist > 5) {
            const force = a.strength / (dist * dist);
            p.vx += (dx / dist) * force;
            p.vy += (dy / dist) * force;
          }
        });
        
        // Mouse attraction
        const mdx = mouseX - p.x;
        const mdy = mouseY - p.y;
        const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
        
        if (mdist > 5 && mdist < 150) {
          const mforce = 50 / (mdist * mdist);
          p.vx += (mdx / mdist) * mforce;
          p.vy += (mdy / mdist) * mforce;
        }
        
        // Apply damping
        p.vx *= 0.95;
        p.vy *= 0.95;
        
        // Update position
        p.x += p.vx;
        p.y += p.vy;
        
        // Boundary check
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
        
        p.x = Math.max(0, Math.min(canvas.width, p.x));
        p.y = Math.max(0, Math.min(canvas.height, p.y));
      });
    };
    
    const render = () => {
      ctx.fillStyle = 'rgba(10, 15, 13, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw attractors
      attractors.forEach(a => {
        ctx.save();
        ctx.strokeStyle = a.strength > 0 ? '#4ade80' : '#dc2626';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.arc(a.x, a.y, 30, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      });
      
      // Draw particles
      particles.forEach(p => {
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x - 1, p.y - 1, 2, 2);
      });
      
      update();
      animationId = requestAnimationFrame(render);
    };
    
    render();
    
    return () => {
      cancelAnimationFrame(animationId);
      canvas.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">
          <Sparkles size={32} />
          Particle Systems
        </h1>
        <p className="page-subtitle">
          Interactive particle effects, physics simulations, and visual effects
        </p>
      </div>

      {/* Basic Particle System */}
      <div className="section">
        <h2 className="section-title">Configurable Particle System</h2>
        <div className="controls">
          <div className="control-group">
            <label className="control-label">
              <Sparkles size={16} />
              Particles: {particleCount}
            </label>
            <input
              type="range"
              min="50"
              max="500"
              value={particleCount}
              onChange={(e) => setParticleCount(Number(e.target.value))}
              className="control-input"
            />
          </div>
          <div className="control-group">
            <label className="control-label">
              <Droplets size={16} />
              Gravity: {gravity.toFixed(2)}
            </label>
            <input
              type="range"
              min="-0.5"
              max="0.5"
              step="0.01"
              value={gravity}
              onChange={(e) => setGravity(Number(e.target.value))}
              className="control-input"
            />
          </div>
          <div className="control-group">
            <label className="control-label">
              <Wind size={16} />
              Wind: {windForce.toFixed(1)}
            </label>
            <input
              type="range"
              min="-5"
              max="5"
              step="0.1"
              value={windForce}
              onChange={(e) => setWindForce(Number(e.target.value))}
              className="control-input"
            />
          </div>
          <div className="control-group">
            <label className="control-label">Emission Rate: {emissionRate}</label>
            <input
              type="range"
              min="1"
              max="20"
              value={emissionRate}
              onChange={(e) => setEmissionRate(Number(e.target.value))}
              className="control-input"
            />
          </div>
          <button 
            onClick={() => setIsEmitting(!isEmitting)}
            className="control-button"
          >
            {isEmitting ? 'Stop' : 'Start'} Emission
          </button>
        </div>
        <canvas ref={canvasRef} className="particle-canvas" />
      </div>

      {/* Fireworks */}
      <div className="section">
        <h2 className="section-title">
          <Flame size={24} />
          Fireworks Display
        </h2>
        <canvas ref={fireworksCanvasRef} className="particle-canvas" />
      </div>

      {/* Smoke Effect */}
      <div className="section">
        <h2 className="section-title">
          <Cloud size={24} />
          Smoke & Fog Effect
        </h2>
        <canvas ref={smokeCanvasRef} className="particle-canvas smoke-canvas" />
      </div>

      {/* Starfield */}
      <div className="section">
        <h2 className="section-title">
          <Star size={24} />
          3D Starfield
        </h2>
        <canvas ref={starfieldCanvasRef} className="particle-canvas" />
      </div>

      {/* Morphing Particles */}
      <div className="section">
        <h2 className="section-title">Morphing Particle Shapes</h2>
        <p className="section-description">
          Watch particles smoothly transition between different formations
        </p>
        <canvas ref={morphCanvasRef} className="particle-canvas" />
      </div>

      {/* Attractor System */}
      <div className="section">
        <h2 className="section-title">Force Field Simulation</h2>
        <p className="section-description">
          Move your mouse to attract particles. Green attracts, red repels.
        </p>
        <canvas ref={attractorCanvasRef} className="particle-canvas" />
      </div>

      <style>{`
        .particle-canvas {
          width: 100%;
          height: 400px;
          background: var(--bg-primary);
          border-radius: 1rem;
          margin-top: 2rem;
        }

        .smoke-canvas {
          background: linear-gradient(180deg, #87CEEB, #E0F6FF);
        }

        .controls {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
          padding: 1.5rem;
          background: var(--bg-secondary);
          border-radius: 1rem;
          box-shadow: 0 4px 6px rgba(0,0,0,0.05);
        }

        .control-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          min-width: 200px;
        }

        .control-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        .control-input {
          width: 100%;
        }

        .control-button {
          padding: 0.75rem 1.5rem;
          background: linear-gradient(135deg, #1a5d3a, #0a2f1d);
          color: var(--text-primary);
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.2s;
        }

        .control-button:hover {
          transform: translateY(-2px);
        }

        .section {
          margin-bottom: 4rem;
        }

        .section-title {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 2rem;
          margin-bottom: 1rem;
          color: var(--text-primary);
        }

        .section-description {
          color: var(--text-secondary);
          margin-bottom: 1rem;
        }
      `}</style>
    </div>
  );
};

export default ParticleSystemsPage;