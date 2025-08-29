import React, { useEffect, useRef, useState } from 'react';
import { GameEngine } from '../game/GameEngine';
import { Vector2 } from '../game/Vector2';
import { ParticleSystem } from '../game/Particle';

const ParticleSystemsPage: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [effectType, setEffectType] = useState<'fountain' | 'fireworks' | 'smoke'>('fountain');
  const [particleCount, setParticleCount] = useState(0);
  const [systemCount, setSystemCount] = useState(0);
  
  const systemsRef = useRef<ParticleSystem[]>([]);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    canvas.width = 800;
    canvas.height = 500;

    const engine = GameEngine.create(canvas, {
      targetFPS: 60,
      showFPS: false
    });

    systemsRef.current = [];

    // Create initial effect
    if (effectType === 'fountain') {
      const fountain = ParticleSystem.createFountain(new Vector2(400, 450));
      systemsRef.current.push(fountain);
    }

    // Click handler for creating effects
    const handleClick = (event: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;
      const position = new Vector2(mouseX, mouseY);

      let newSystem: ParticleSystem;
      
      switch (effectType) {
        case 'fireworks':
          newSystem = ParticleSystem.createFirework(position, 
            `hsl(${Math.random() * 360}, 70%, 60%)`);
          break;
        case 'smoke':
          newSystem = ParticleSystem.createSmoke(position);
          break;
        case 'fountain':
        default:
          newSystem = ParticleSystem.createFountain(position);
          break;
      }
      
      systemsRef.current.push(newSystem);
    };

    canvas.addEventListener('click', handleClick);

    // Update callback
    engine.onUpdate((deltaTime: number) => {
      // Update all particle systems
      systemsRef.current.forEach(system => system.update(deltaTime));
      
      // Remove empty systems (for fireworks)
      if (effectType === 'fireworks') {
        systemsRef.current = systemsRef.current.filter(system => system.particles.length > 0);
      }

      // Update metrics
      const totalParticles = systemsRef.current.reduce(
        (sum, system) => sum + system.particles.length, 0
      );
      setParticleCount(totalParticles);
      setSystemCount(systemsRef.current.length);
    });

    // Render callback
    engine.onRender((ctx: CanvasRenderingContext2D) => {
      // Clear with dark background
      ctx.fillStyle = '#0a0f0d';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Render all particle systems
      systemsRef.current.forEach(system => system.render(ctx));

      // Draw instructions
      ctx.fillStyle = '#a8bdb2';
      ctx.font = '14px monospace';
      ctx.fillText(`Click to create ${effectType} effects`, 10, canvas.height - 40);
      ctx.fillText(`Active particles: ${particleCount}`, 10, canvas.height - 20);
    });

    engineRef.current = engine;

    return () => {
      canvas.removeEventListener('click', handleClick);
      if (engineRef.current) {
        engineRef.current.stop();
      }
    };
  }, [effectType]);

  const toggleEngine = () => {
    if (!engineRef.current) return;

    if (isRunning) {
      engineRef.current.stop();
      setIsRunning(false);
    } else {
      engineRef.current.start();
      setIsRunning(true);
    }
  };

  const clearEffects = () => {
    systemsRef.current = [];
    setParticleCount(0);
    setSystemCount(0);
  };

  const createRandomFireworks = () => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        const position = new Vector2(
          100 + Math.random() * (canvas.width - 200),
          50 + Math.random() * 200
        );
        const color = `hsl(${Math.random() * 360}, 70%, 60%)`;
        const firework = ParticleSystem.createFirework(position, color);
        systemsRef.current.push(firework);
      }, i * 200);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Particle Systems</h1>
        <p className="page-description">
          Create stunning visual effects with thousands of small particles. Master the art of 
          simulating fire, smoke, explosions, magic spells, and other dynamic effects.
        </p>
      </div>

      <div className="demo-container">
        <div className="demo-controls">
          <button className="demo-button" onClick={toggleEngine}>
            {isRunning ? 'Pause' : 'Start'} System
          </button>
          
          <button className="demo-button" onClick={clearEffects}>
            Clear All
          </button>
          
          <button className="demo-button" onClick={createRandomFireworks}>
            Random Fireworks
          </button>

          <div className="control-group">
            <label htmlFor="effect-type">Effect Type:</label>
            <select
              id="effect-type"
              value={effectType}
              onChange={(e) => setEffectType(e.target.value as 'fountain' | 'fireworks' | 'smoke')}
              className="demo-select"
            >
              <option value="fountain">Fountain</option>
              <option value="fireworks">Fireworks</option>
              <option value="smoke">Smoke</option>
            </select>
          </div>
        </div>

        <canvas
          ref={canvasRef}
          className="game-canvas"
          style={{
            border: '1px solid var(--border-primary)',
            backgroundColor: '#0a0f0d',
            cursor: 'crosshair'
          }}
        />

        <div className="metrics-grid">
          <div className="metric-card">
            <div className="metric-value">{particleCount}</div>
            <div className="metric-label">Active Particles</div>
          </div>
          <div className="metric-card">
            <div className="metric-value">{systemCount}</div>
            <div className="metric-label">Systems Running</div>
          </div>
          <div className="metric-card">
            <div className="metric-value">{effectType}</div>
            <div className="metric-label">Current Effect</div>
          </div>
          <div className="metric-card">
            <div className="metric-value">{isRunning ? 'Active' : 'Paused'}</div>
            <div className="metric-label">Engine Status</div>
          </div>
        </div>
      </div>

      <div className="concept-section">
        <h2>Particle System Concepts</h2>
        <div className="concept-grid">
          <div className="info-card">
            <h3>Particle Properties</h3>
            <p>
              Each particle has position, velocity, life span, color, and size. 
              These properties change over time to create realistic movement and aging effects.
            </p>
          </div>
          
          <div className="info-card">
            <h3>Emitters</h3>
            <p>
              Control where and how particles are spawned. Set emission rate, direction, 
              spread, and initial properties to create different visual effects.
            </p>
          </div>
          
          <div className="info-card">
            <h3>Forces & Physics</h3>
            <p>
              Apply gravity, wind, and other forces to particles for realistic movement. 
              Each particle can have its own mass and respond differently to forces.
            </p>
          </div>
          
          <div className="info-card">
            <h3>Alpha Blending</h3>
            <p>
              Use transparency and blending modes to create smooth, overlapping effects. 
              Particles fade in and out over their lifetime for natural appearance.
            </p>
          </div>
        </div>
      </div>

      <div className="code-example">
        <h2>Basic Particle Class</h2>
        <div className="code-container">
          <div className="code-header">
            <span className="code-title">Particle.ts - Core Particle</span>
          </div>
          <div className="code-content">
            <pre>{`class Particle {
  position: Vector2;
  velocity: Vector2;
  acceleration: Vector2;
  life: number;
  maxLife: number;
  alpha: number;

  update(deltaTime: number): void {
    // Apply physics
    this.velocity.add(Vector2.multiply(this.acceleration, deltaTime));
    this.position.add(Vector2.multiply(this.velocity, deltaTime));
    
    // Update life and alpha
    this.life -= deltaTime;
    this.alpha = Math.max(0, this.life / this.maxLife);
    
    // Mark as dead if life is over
    if (this.life <= 0) {
      this.isDead = true;
    }
  }

  render(ctx: CanvasRenderingContext2D): void {
    ctx.globalAlpha = this.alpha;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.position.x, this.position.y, this.size, 0, Math.PI * 2);
    ctx.fill();
  }
}`}</pre>
          </div>
        </div>
      </div>

      <div className="code-example">
        <h2>Fireworks Effect</h2>
        <div className="code-container">
          <div className="code-header">
            <span className="code-title">Particle.ts - Firework Creation</span>
          </div>
          <div className="code-content">
            <pre>{`static createFirework(position: Vector2, color: string): ParticleSystem {
  const system = new ParticleSystem(position, 0, 50);
  
  // Create explosion particles in all directions
  for (let i = 0; i < 50; i++) {
    const angle = (i / 50) * Math.PI * 2;
    const speed = 100 + Math.random() * 100;
    const velocity = new Vector2(
      Math.cos(angle) * speed,
      Math.sin(angle) * speed
    );
    
    system.emit({
      velocity,
      acceleration: new Vector2(0, 200), // gravity
      color,
      size: 2 + Math.random() * 3,
      life: 1 + Math.random() * 2,
      maxLife: 1 + Math.random() * 2
    });
  }
  
  return system;
}`}</pre>
          </div>
        </div>
      </div>

      <div className="code-example">
        <h2>Particle System Management</h2>
        <div className="code-container">
          <div className="code-header">
            <span className="code-title">ParticleSystem.ts - Update Loop</span>
          </div>
          <div className="code-content">
            <pre>{`update(deltaTime: number): void {
  // Update existing particles
  this.particles.forEach(particle => particle.update(deltaTime));
  
  // Remove dead particles (performance optimization)
  this.particles = this.particles.filter(particle => !particle.isDead);
  
  // Emit new particles based on emission rate
  this.timeSinceLastEmission += deltaTime;
  const timeBetweenEmissions = 1 / this.emissionRate;
  
  while (this.timeSinceLastEmission >= timeBetweenEmissions) {
    this.emit();
    this.timeSinceLastEmission -= timeBetweenEmissions;
  }
}`}</pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParticleSystemsPage;