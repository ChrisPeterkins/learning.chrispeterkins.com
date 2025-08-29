import React, { useEffect, useRef, useState } from 'react';
import { GameEngine } from '../game/GameEngine';
import { Entity } from '../game/Entity';
import { Vector2 } from '../game/Vector2';
import { Physics } from '../game/Physics';

const PhysicsPage: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [gravityEnabled, setGravityEnabled] = useState(true);
  const [gravityStrength, setGravityStrength] = useState(980);
  const [restitution, setRestitution] = useState(0.8);
  const [airResistance, setAirResistance] = useState(0.999);
  
  const entitiesRef = useRef<Entity[]>([]);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    canvas.width = 800;
    canvas.height = 500;

    const engine = GameEngine.create(canvas, {
      targetFPS: 60,
      showFPS: false
    });

    // Create bouncing balls with different properties
    entitiesRef.current = [
      new Entity({ 
        x: 100, y: 50, width: 30, height: 30, 
        color: '#4ade80', mass: 1 
      }),
      new Entity({ 
        x: 200, y: 80, width: 40, height: 40, 
        color: '#f59e0b', mass: 2 
      }),
      new Entity({ 
        x: 300, y: 30, width: 25, height: 25, 
        color: '#ef4444', mass: 0.5 
      }),
      new Entity({ 
        x: 450, y: 100, width: 50, height: 50, 
        color: '#8b5cf6', mass: 3 
      }),
      new Entity({ 
        x: 600, y: 60, width: 35, height: 35, 
        color: '#06b6d4', mass: 1.5 
      })
    ];

    // Add initial horizontal velocities
    entitiesRef.current[0].velocity.set(150, 0);
    entitiesRef.current[1].velocity.set(-100, 50);
    entitiesRef.current[2].velocity.set(200, -100);
    entitiesRef.current[3].velocity.set(-80, 0);
    entitiesRef.current[4].velocity.set(120, -50);

    // Mouse click handler to add force
    const handleClick = (event: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;

      // Find closest entity and apply force towards mouse
      let closestEntity: Entity | null = null;
      let minDistance = Infinity;

      entitiesRef.current.forEach(entity => {
        const center = entity.getCenter();
        const distance = Vector2.distance(center, new Vector2(mouseX, mouseY));
        
        if (distance < minDistance) {
          minDistance = distance;
          closestEntity = entity;
        }
      });

      if (closestEntity && minDistance < 100) {
        const force = Vector2.subtract(
          new Vector2(mouseX, mouseY),
          closestEntity.getCenter()
        ).normalize().multiply(500);
        
        closestEntity.applyForce(force);
      }
    };

    canvas.addEventListener('click', handleClick);

    // Update callback
    engine.onUpdate((deltaTime: number) => {
      entitiesRef.current.forEach(entity => {
        // Apply gravity
        if (gravityEnabled) {
          const gravity = new Vector2(0, gravityStrength * entity.mass);
          entity.applyForce(gravity);
        }

        // Apply air resistance
        if (airResistance < 1) {
          entity.velocity.multiply(airResistance);
        }

        entity.update(deltaTime);

        // Bounce off walls with restitution
        Physics.bounceOffBoundaries(entity, canvas.width, canvas.height, restitution);
      });

      // Simple collision response between entities
      for (let i = 0; i < entitiesRef.current.length; i++) {
        for (let j = i + 1; j < entitiesRef.current.length; j++) {
          const entity1 = entitiesRef.current[i];
          const entity2 = entitiesRef.current[j];
          
          // Simple distance-based collision
          const center1 = entity1.getCenter();
          const center2 = entity2.getCenter();
          const distance = Vector2.distance(center1, center2);
          const minDistance = (Math.max(entity1.width, entity1.height) + 
                              Math.max(entity2.width, entity2.height)) / 2;

          if (distance < minDistance) {
            // Separate entities
            const separation = Vector2.subtract(center1, center2).normalize();
            const overlap = minDistance - distance;
            
            entity1.position.add(Vector2.multiply(separation, overlap * 0.5));
            entity2.position.subtract(Vector2.multiply(separation, overlap * 0.5));

            // Simple elastic collision
            const relativeVelocity = Vector2.subtract(entity1.velocity, entity2.velocity);
            const separationNormal = separation.copy();
            const speed = Vector2.dot(relativeVelocity, separationNormal);
            
            if (speed > 0) continue; // Objects separating
            
            const impulse = 2 * speed / (entity1.mass + entity2.mass);
            entity1.velocity.subtract(Vector2.multiply(separationNormal, impulse * entity2.mass));
            entity2.velocity.add(Vector2.multiply(separationNormal, impulse * entity1.mass));
            
            // Apply restitution
            entity1.velocity.multiply(restitution);
            entity2.velocity.multiply(restitution);
          }
        }
      }
    });

    // Render callback
    engine.onRender((ctx: CanvasRenderingContext2D) => {
      // Clear with dark background
      ctx.fillStyle = '#0a0f0d';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw velocity vectors
      entitiesRef.current.forEach(entity => {
        const center = entity.getCenter();
        const velocityScale = 0.1;
        
        // Draw velocity vector
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(center.x, center.y);
        ctx.lineTo(
          center.x + entity.velocity.x * velocityScale,
          center.y + entity.velocity.y * velocityScale
        );
        ctx.stroke();

        // Draw entity as circle with mass-based size
        const radius = Math.max(entity.width, entity.height) / 2;
        ctx.fillStyle = entity.color;
        ctx.beginPath();
        ctx.arc(center.x, center.y, radius, 0, Math.PI * 2);
        ctx.fill();

        // Draw mass label
        ctx.fillStyle = '#ffffff';
        ctx.font = '12px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(
          `${entity.mass}kg`,
          center.x,
          center.y + 4
        );
      });

      // Draw ground line
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, canvas.height - 1);
      ctx.lineTo(canvas.width, canvas.height - 1);
      ctx.stroke();

      // Instructions
      ctx.fillStyle = '#a8bdb2';
      ctx.font = '14px monospace';
      ctx.textAlign = 'left';
      ctx.fillText('Click near objects to apply force', 10, canvas.height - 40);
      ctx.fillText('White lines show velocity vectors', 10, canvas.height - 20);
    });

    engineRef.current = engine;

    return () => {
      canvas.removeEventListener('click', handleClick);
      if (engineRef.current) {
        engineRef.current.stop();
      }
    };
  }, [gravityEnabled, gravityStrength, restitution, airResistance]);

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

  const resetDemo = () => {
    // Reset positions and velocities
    const startPositions = [
      { x: 100, y: 50, vx: 150, vy: 0 },
      { x: 200, y: 80, vx: -100, vy: 50 },
      { x: 300, y: 30, vx: 200, vy: -100 },
      { x: 450, y: 100, vx: -80, vy: 0 },
      { x: 600, y: 60, vx: 120, vy: -50 }
    ];

    entitiesRef.current.forEach((entity, index) => {
      const start = startPositions[index];
      entity.position.set(start.x, start.y);
      entity.velocity.set(start.vx, start.vy);
    });
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Physics & Movement</h1>
        <p className="page-description">
          Realistic physics brings games to life. Learn how to implement gravity, forces, 
          collisions, and natural movement patterns that create believable game worlds.
        </p>
      </div>

      <div className="demo-container">
        <div className="demo-controls">
          <button className="demo-button" onClick={toggleEngine}>
            {isRunning ? 'Pause' : 'Start'} Physics
          </button>
          
          <button className="demo-button" onClick={resetDemo}>
            Reset Demo
          </button>

          <div className="control-group">
            <label>
              <input
                type="checkbox"
                checked={gravityEnabled}
                onChange={(e) => setGravityEnabled(e.target.checked)}
              />
              Enable Gravity
            </label>
          </div>
        </div>

        <div className="demo-controls">
          <div className="control-group">
            <label htmlFor="gravity">Gravity:</label>
            <input
              id="gravity"
              type="range"
              min="0"
              max="2000"
              step="50"
              value={gravityStrength}
              onChange={(e) => setGravityStrength(Number(e.target.value))}
              className="demo-input"
              style={{ width: '120px' }}
            />
            <span>{gravityStrength}</span>
          </div>

          <div className="control-group">
            <label htmlFor="restitution">Bounciness:</label>
            <input
              id="restitution"
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={restitution}
              onChange={(e) => setRestitution(Number(e.target.value))}
              className="demo-input"
              style={{ width: '120px' }}
            />
            <span>{restitution}</span>
          </div>

          <div className="control-group">
            <label htmlFor="air-resistance">Air Resistance:</label>
            <input
              id="air-resistance"
              type="range"
              min="0.9"
              max="1"
              step="0.001"
              value={airResistance}
              onChange={(e) => setAirResistance(Number(e.target.value))}
              className="demo-input"
              style={{ width: '120px' }}
            />
            <span>{airResistance.toFixed(3)}</span>
          </div>
        </div>

        <canvas
          ref={canvasRef}
          className="game-canvas"
          style={{
            border: '1px solid var(--border-primary)',
            backgroundColor: '#0a0f0d',
            cursor: 'pointer'
          }}
        />

        <div className="metrics-grid">
          <div className="metric-card">
            <div className="metric-value">{gravityEnabled ? 'ON' : 'OFF'}</div>
            <div className="metric-label">Gravity</div>
          </div>
          <div className="metric-card">
            <div className="metric-value">{gravityStrength}</div>
            <div className="metric-label">Gravity Strength</div>
          </div>
          <div className="metric-card">
            <div className="metric-value">{restitution}</div>
            <div className="metric-label">Restitution</div>
          </div>
          <div className="metric-card">
            <div className="metric-value">{entitiesRef.current.length}</div>
            <div className="metric-label">Objects</div>
          </div>
        </div>
      </div>

      <div className="concept-section">
        <h2>Physics Concepts</h2>
        <div className="concept-grid">
          <div className="info-card">
            <h3>Forces & Acceleration</h3>
            <p>
              F = ma. Forces cause acceleration, which changes velocity over time. 
              Apply forces like gravity, wind, or user input to create realistic movement.
            </p>
          </div>
          
          <div className="info-card">
            <h3>Velocity & Position</h3>
            <p>
              Velocity is the rate of change of position. Use delta time to ensure 
              frame-rate independent movement: position += velocity * deltaTime.
            </p>
          </div>
          
          <div className="info-card">
            <h3>Mass & Momentum</h3>
            <p>
              Mass affects how objects respond to forces and collisions. 
              Heavier objects are harder to move and carry more momentum when they do.
            </p>
          </div>
          
          <div className="info-card">
            <h3>Restitution (Bounciness)</h3>
            <p>
              Controls how much energy is preserved during collisions. 
              0 = no bounce (perfectly inelastic), 1 = perfect bounce (perfectly elastic).
            </p>
          </div>
        </div>
      </div>

      <div className="code-example">
        <h2>Basic Physics Integration</h2>
        <div className="code-container">
          <div className="code-header">
            <span className="code-title">Entity.ts - Physics Update</span>
          </div>
          <div className="code-content">
            <pre>{`class Entity {
  update(deltaTime: number): void {
    // Apply acceleration to velocity
    this.velocity.add(Vector2.multiply(this.acceleration, deltaTime));
    
    // Apply velocity to position
    this.position.add(Vector2.multiply(this.velocity, deltaTime));
    
    // Reset acceleration for next frame
    this.acceleration.set(0, 0);
  }

  applyForce(force: Vector2): void {
    // F = ma, so a = F/m
    const acceleration = Vector2.multiply(force, 1 / this.mass);
    this.acceleration.add(acceleration);
  }
}`}</pre>
          </div>
        </div>
      </div>

      <div className="code-example">
        <h2>Collision Response</h2>
        <div className="code-container">
          <div className="code-header">
            <span className="code-title">Physics.ts - Elastic Collision</span>
          </div>
          <div className="code-content">
            <pre>{`static resolveCollision(entity1: Entity, entity2: Entity): void {
  // Calculate collision normal
  const normal = Vector2.subtract(entity1.getCenter(), entity2.getCenter()).normalize();
  
  // Relative velocity
  const relativeVelocity = Vector2.subtract(entity1.velocity, entity2.velocity);
  const velocityAlongNormal = Vector2.dot(relativeVelocity, normal);
  
  // Don't resolve if velocities are separating
  if (velocityAlongNormal > 0) return;
  
  // Calculate impulse
  const restitution = 0.8;
  let impulse = -(1 + restitution) * velocityAlongNormal;
  impulse /= (1 / entity1.mass) + (1 / entity2.mass);
  
  // Apply impulse
  const impulseVector = Vector2.multiply(normal, impulse);
  entity1.velocity.add(Vector2.multiply(impulseVector, 1 / entity1.mass));
  entity2.velocity.subtract(Vector2.multiply(impulseVector, 1 / entity2.mass));
}`}</pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhysicsPage;