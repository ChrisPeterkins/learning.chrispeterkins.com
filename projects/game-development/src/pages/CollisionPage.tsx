import React, { useEffect, useRef, useState } from 'react';
import { GameEngine } from '../game/GameEngine';
import { Entity } from '../game/Entity';
import { Vector2 } from '../game/Vector2';
import { Collision } from '../game/Collision';

const CollisionPage: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [detectionMethod, setDetectionMethod] = useState<'aabb' | 'circle'>('aabb');
  const [showBounds, setShowBounds] = useState(true);
  const [collisionCount, setCollisionCount] = useState(0);
  
  const entitiesRef = useRef<Entity[]>([]);
  const mouseEntityRef = useRef<Entity | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    canvas.width = 800;
    canvas.height = 500;

    const engine = GameEngine.create(canvas, {
      targetFPS: 60,
      showFPS: false
    });

    // Create demo entities
    entitiesRef.current = [
      new Entity({ x: 100, y: 100, width: 40, height: 40, color: '#4ade80' }),
      new Entity({ x: 300, y: 200, width: 50, height: 30, color: '#f59e0b' }),
      new Entity({ x: 500, y: 150, width: 35, height: 35, color: '#ef4444' }),
      new Entity({ x: 200, y: 300, width: 60, height: 25, color: '#8b5cf6' }),
      new Entity({ x: 600, y: 300, width: 45, height: 45, color: '#06b6d4' })
    ];

    // Add some movement
    entitiesRef.current[0].velocity.set(50, 30);
    entitiesRef.current[1].velocity.set(-40, 50);
    entitiesRef.current[2].velocity.set(60, -40);
    entitiesRef.current[3].velocity.set(-30, -35);
    entitiesRef.current[4].velocity.set(25, 45);

    // Mouse-controlled entity
    mouseEntityRef.current = new Entity({
      x: 0,
      y: 0,
      width: 30,
      height: 30,
      color: '#ffffff'
    });

    // Mouse move handler
    const handleMouseMove = (event: MouseEvent) => {
      if (!mouseEntityRef.current) return;
      const rect = canvas.getBoundingClientRect();
      mouseEntityRef.current.position.set(
        event.clientX - rect.left - 15,
        event.clientY - rect.top - 15
      );
    };

    canvas.addEventListener('mousemove', handleMouseMove);

    // Update callback
    engine.onUpdate((deltaTime: number) => {
      let collisions = 0;

      entitiesRef.current.forEach(entity => {
        entity.update(deltaTime);

        // Bounce off walls
        if (entity.position.x <= 0 || entity.position.x + entity.width >= canvas.width) {
          entity.velocity.x *= -1;
          entity.position.x = Math.max(0, Math.min(entity.position.x, canvas.width - entity.width));
        }
        if (entity.position.y <= 0 || entity.position.y + entity.height >= canvas.height) {
          entity.velocity.y *= -1;
          entity.position.y = Math.max(0, Math.min(entity.position.y, canvas.height - entity.height));
        }

        // Reset color
        entity.color = entity.id === entitiesRef.current[0].id ? '#4ade80' :
                      entity.id === entitiesRef.current[1].id ? '#f59e0b' :
                      entity.id === entitiesRef.current[2].id ? '#ef4444' :
                      entity.id === entitiesRef.current[3].id ? '#8b5cf6' : '#06b6d4';
      });

      // Check collisions between entities
      for (let i = 0; i < entitiesRef.current.length; i++) {
        for (let j = i + 1; j < entitiesRef.current.length; j++) {
          const entity1 = entitiesRef.current[i];
          const entity2 = entitiesRef.current[j];

          let isColliding = false;
          
          if (detectionMethod === 'aabb') {
            isColliding = Collision.entityEntity(entity1, entity2);
          } else {
            // Treat as circles for circle collision detection
            const center1 = entity1.getCenter();
            const center2 = entity2.getCenter();
            const radius1 = Math.max(entity1.width, entity1.height) / 2;
            const radius2 = Math.max(entity2.width, entity2.height) / 2;
            
            isColliding = Collision.circleCircle(
              { x: center1.x, y: center1.y, radius: radius1 },
              { x: center2.x, y: center2.y, radius: radius2 }
            );
          }

          if (isColliding) {
            entity1.color = '#ff6b6b';
            entity2.color = '#ff6b6b';
            collisions++;
          }
        }

        // Check collision with mouse entity
        if (mouseEntityRef.current) {
          const entity = entitiesRef.current[i];
          let isCollidingWithMouse = false;

          if (detectionMethod === 'aabb') {
            isCollidingWithMouse = Collision.entityEntity(entity, mouseEntityRef.current);
          } else {
            const center1 = entity.getCenter();
            const center2 = mouseEntityRef.current.getCenter();
            const radius1 = Math.max(entity.width, entity.height) / 2;
            const radius2 = Math.max(mouseEntityRef.current.width, mouseEntityRef.current.height) / 2;
            
            isCollidingWithMouse = Collision.circleCircle(
              { x: center1.x, y: center1.y, radius: radius1 },
              { x: center2.x, y: center2.y, radius: radius2 }
            );
          }

          if (isCollidingWithMouse) {
            entity.color = '#ffd93d';
            mouseEntityRef.current.color = '#ffd93d';
            collisions++;
          } else {
            mouseEntityRef.current.color = '#ffffff';
          }
        }
      }

      setCollisionCount(collisions);
    });

    // Render callback
    engine.onRender((ctx: CanvasRenderingContext2D) => {
      // Clear with dark background
      ctx.fillStyle = '#0a0f0d';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Render entities
      entitiesRef.current.forEach(entity => {
        if (detectionMethod === 'circle') {
          // Render as circle
          const center = entity.getCenter();
          const radius = Math.max(entity.width, entity.height) / 2;
          
          ctx.fillStyle = entity.color;
          ctx.beginPath();
          ctx.arc(center.x, center.y, radius, 0, Math.PI * 2);
          ctx.fill();

          if (showBounds) {
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        } else {
          // Render as rectangle
          entity.render(ctx);
          
          if (showBounds) {
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.lineWidth = 1;
            ctx.strokeRect(entity.position.x, entity.position.y, entity.width, entity.height);
          }
        }
      });

      // Render mouse entity
      if (mouseEntityRef.current) {
        if (detectionMethod === 'circle') {
          const center = mouseEntityRef.current.getCenter();
          const radius = Math.max(mouseEntityRef.current.width, mouseEntityRef.current.height) / 2;
          
          ctx.fillStyle = mouseEntityRef.current.color;
          ctx.beginPath();
          ctx.arc(center.x, center.y, radius, 0, Math.PI * 2);
          ctx.fill();

          if (showBounds) {
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.lineWidth = 2;
            ctx.stroke();
          }
        } else {
          mouseEntityRef.current.render(ctx);
          
          if (showBounds) {
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.lineWidth = 2;
            ctx.strokeRect(
              mouseEntityRef.current.position.x, 
              mouseEntityRef.current.position.y, 
              mouseEntityRef.current.width, 
              mouseEntityRef.current.height
            );
          }
        }
      }

      // Render info
      ctx.fillStyle = '#a8bdb2';
      ctx.font = '14px monospace';
      ctx.fillText(`Detection: ${detectionMethod.toUpperCase()}`, 10, canvas.height - 40);
      ctx.fillText(`Move mouse to test collision`, 10, canvas.height - 20);
    });

    engineRef.current = engine;

    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove);
      if (engineRef.current) {
        engineRef.current.stop();
      }
    };
  }, [detectionMethod, showBounds]);

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

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Collision Detection</h1>
        <p className="page-description">
          Collision detection is essential for interactive games. Learn different algorithms 
          for detecting when game objects intersect, from simple bounding boxes to more complex shapes.
        </p>
      </div>

      <div className="demo-container">
        <div className="demo-controls">
          <button className="demo-button" onClick={toggleEngine}>
            {isRunning ? 'Pause' : 'Start'} Demo
          </button>
          
          <div className="control-group">
            <label htmlFor="detection-method">Method:</label>
            <select
              id="detection-method"
              value={detectionMethod}
              onChange={(e) => setDetectionMethod(e.target.value as 'aabb' | 'circle')}
              className="demo-select"
            >
              <option value="aabb">AABB (Rectangle)</option>
              <option value="circle">Circle</option>
            </select>
          </div>

          <div className="control-group">
            <label>
              <input
                type="checkbox"
                checked={showBounds}
                onChange={(e) => setShowBounds(e.target.checked)}
              />
              Show Bounds
            </label>
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
            <div className="metric-value">{collisionCount}</div>
            <div className="metric-label">Active Collisions</div>
          </div>
          <div className="metric-card">
            <div className="metric-value">{detectionMethod.toUpperCase()}</div>
            <div className="metric-label">Detection Method</div>
          </div>
          <div className="metric-card">
            <div className="metric-value">{entitiesRef.current.length + 1}</div>
            <div className="metric-label">Total Objects</div>
          </div>
          <div className="metric-card">
            <div className="metric-value">{isRunning ? 'Active' : 'Paused'}</div>
            <div className="metric-label">Demo Status</div>
          </div>
        </div>
      </div>

      <div className="concept-section">
        <h2>Collision Detection Methods</h2>
        <div className="concept-grid">
          <div className="info-card">
            <h3>AABB (Axis-Aligned Bounding Box)</h3>
            <p>
              The simplest and fastest collision detection method. Works by checking if rectangles 
              overlap on both X and Y axes. Perfect for most 2D games with rectangular objects.
            </p>
          </div>
          
          <div className="info-card">
            <h3>Circle Collision</h3>
            <p>
              Checks if the distance between two circle centers is less than the sum of their radii. 
              More accurate for round objects and often used in physics simulations.
            </p>
          </div>
          
          <div className="info-card">
            <h3>Point-in-Shape</h3>
            <p>
              Determines if a point lies within a shape. Useful for mouse interactions, 
              bullet hits, and determining if objects are inside boundaries.
            </p>
          </div>
          
          <div className="info-card">
            <h3>SAT (Separating Axis Theorem)</h3>
            <p>
              Advanced method for detecting collisions between convex polygons. 
              More complex but handles rotated rectangles and irregular shapes accurately.
            </p>
          </div>
        </div>
      </div>

      <div className="code-example">
        <h2>AABB Collision Detection</h2>
        <div className="code-container">
          <div className="code-header">
            <span className="code-title">Collision.ts - Rectangle Collision</span>
          </div>
          <div className="code-content">
            <pre>{`static rectangleRectangle(rect1: Rectangle, rect2: Rectangle): boolean {
  return rect1.x < rect2.x + rect2.width &&
         rect1.x + rect1.width > rect2.x &&
         rect1.y < rect2.y + rect2.height &&
         rect1.y + rect1.height > rect2.y;
}

// Usage in game loop
entities.forEach((entity1, i) => {
  entities.slice(i + 1).forEach(entity2 => {
    if (Collision.entityEntity(entity1, entity2)) {
      // Handle collision
      entity1.color = '#ff6b6b';
      entity2.color = '#ff6b6b';
    }
  });
});`}</pre>
          </div>
        </div>
      </div>

      <div className="code-example">
        <h2>Circle Collision Detection</h2>
        <div className="code-container">
          <div className="code-header">
            <span className="code-title">Collision.ts - Circle Collision</span>
          </div>
          <div className="code-content">
            <pre>{`static circleCircle(circle1: Circle, circle2: Circle): boolean {
  const distance = Vector2.distance(
    new Vector2(circle1.x, circle1.y),
    new Vector2(circle2.x, circle2.y)
  );
  return distance <= circle1.radius + circle2.radius;
}

// Convert rectangles to circles for collision
const center1 = entity1.getCenter();
const center2 = entity2.getCenter();
const radius1 = Math.max(entity1.width, entity1.height) / 2;
const radius2 = Math.max(entity2.width, entity2.height) / 2;

const isColliding = Collision.circleCircle(
  { x: center1.x, y: center1.y, radius: radius1 },
  { x: center2.x, y: center2.y, radius: radius2 }
);`}</pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollisionPage;