import React, { useEffect, useRef, useState } from 'react';
import { GameEngine } from '../game/GameEngine';
import { 
  World, 
  ECSEntity, 
  PositionComponent, 
  VelocityComponent, 
  RenderComponent, 
  HealthComponent, 
  AIComponent,
  MovementSystem,
  RenderSystem,
  AISystem,
  BoundarySystem
} from '../game/ECS';

const EntitySystemPage: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [entityCount, setEntityCount] = useState(0);
  const [systemCount, setSystemCount] = useState(0);
  
  const worldRef = useRef<World | null>(null);
  const [selectedEntity, setSelectedEntity] = useState<number | null>(null);
  const [entityStats, setEntityStats] = useState({
    withAI: 0,
    withHealth: 0,
    alive: 0
  });

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    canvas.width = 800;
    canvas.height = 500;

    const engine = GameEngine.create(canvas, {
      targetFPS: 60,
      showFPS: false
    });

    // Create ECS World
    const world = new World();
    worldRef.current = world;

    // Create systems
    const movementSystem = new MovementSystem();
    const renderSystem = new RenderSystem(canvas.getContext('2d')!);
    const aiSystem = new AISystem();
    const boundarySystem = new BoundarySystem(canvas.width, canvas.height);

    world.addSystem(movementSystem);
    world.addSystem(renderSystem);
    world.addSystem(aiSystem);
    world.addSystem(boundarySystem);

    setSystemCount(4);

    // Create some entities
    createInitialEntities(world, canvas.width, canvas.height);

    // Click handler to select entities
    const handleClick = (event: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;

      // Find clicked entity
      const entities = world.getEntitiesWith('position', 'render');
      let clickedEntity: ECSEntity | null = null;

      entities.forEach(entity => {
        const pos = entity.getComponent<PositionComponent>('position')!;
        const render = entity.getComponent<RenderComponent>('render')!;
        
        if (mouseX >= pos.x && mouseX <= pos.x + render.width &&
            mouseY >= pos.y && mouseY <= pos.y + render.height) {
          clickedEntity = entity;
        }
      });

      setSelectedEntity(clickedEntity ? clickedEntity.id : null);

      // If clicked entity has health, damage it
      if (clickedEntity) {
        const health = clickedEntity.getComponent<HealthComponent>('health');
        if (health) {
          health.takeDamage(20);
        }
      }
    };

    canvas.addEventListener('click', handleClick);

    // Update callback
    engine.onUpdate((deltaTime: number) => {
      world.update(deltaTime);
      
      // Update stats
      const allEntities = Array.from(world.entities.values());
      setEntityCount(allEntities.length);
      
      const withAI = allEntities.filter(e => e.hasComponent('ai')).length;
      const withHealth = allEntities.filter(e => e.hasComponent('health')).length;
      const alive = allEntities.filter(e => {
        const health = e.getComponent<HealthComponent>('health');
        return !health || !health.isDead;
      }).length;
      
      setEntityStats({ withAI, withHealth, alive });

      // Remove dead entities
      allEntities.forEach(entity => {
        const health = entity.getComponent<HealthComponent>('health');
        if (health && health.isDead) {
          world.removeEntity(entity.id);
        }
      });
    });

    // Render callback
    engine.onRender((ctx: CanvasRenderingContext2D) => {
      // Clear with dark background
      ctx.fillStyle = '#0a0f0d';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Systems handle their own rendering via the update call
      
      // Highlight selected entity
      if (selectedEntity) {
        const entity = world.entities.get(selectedEntity);
        if (entity) {
          const pos = entity.getComponent<PositionComponent>('position');
          const render = entity.getComponent<RenderComponent>('render');
          
          if (pos && render) {
            ctx.strokeStyle = '#ffd93d';
            ctx.lineWidth = 2;
            ctx.strokeRect(pos.x - 2, pos.y - 2, render.width + 4, render.height + 4);
            
            // Show entity info
            ctx.fillStyle = '#ffd93d';
            ctx.font = '12px monospace';
            ctx.fillText(`Entity ${entity.id}`, pos.x, pos.y - 10);
            
            // Show components
            let yOffset = 0;
            const components = Array.from(entity.components.keys());
            components.forEach(componentType => {
              ctx.fillText(`- ${componentType}`, pos.x, pos.y - 25 - yOffset);
              yOffset += 15;
            });
          }
        }
      }

      // Draw system info
      ctx.fillStyle = '#a8bdb2';
      ctx.font = '14px monospace';
      ctx.fillText('ECS Systems Active:', 10, canvas.height - 80);
      ctx.fillText('• Movement System', 10, canvas.height - 65);
      ctx.fillText('• Render System', 10, canvas.height - 50);
      ctx.fillText('• AI System', 10, canvas.height - 35);
      ctx.fillText('• Boundary System', 10, canvas.height - 20);

      ctx.fillText('Click entities to select/damage them', canvas.width - 250, canvas.height - 20);
    });

    engineRef.current = engine;

    return () => {
      canvas.removeEventListener('click', handleClick);
      if (engineRef.current) {
        engineRef.current.stop();
      }
    };
  }, []);

  const createInitialEntities = (world: World, canvasWidth: number, canvasHeight: number) => {
    // Create different types of entities
    
    // Basic moving entities
    for (let i = 0; i < 3; i++) {
      const entity = new ECSEntity();
      entity.addComponent(new PositionComponent(
        Math.random() * (canvasWidth - 50),
        Math.random() * (canvasHeight - 50)
      ));
      entity.addComponent(new VelocityComponent(
        (Math.random() - 0.5) * 200,
        (Math.random() - 0.5) * 200
      ));
      entity.addComponent(new RenderComponent(30, 30, '#4ade80'));
      world.addEntity(entity);
    }

    // AI entities with health
    for (let i = 0; i < 4; i++) {
      const entity = new ECSEntity();
      entity.addComponent(new PositionComponent(
        Math.random() * (canvasWidth - 50),
        Math.random() * (canvasHeight - 50)
      ));
      entity.addComponent(new VelocityComponent(0, 0));
      entity.addComponent(new RenderComponent(25, 25, '#f59e0b'));
      entity.addComponent(new HealthComponent(100));
      entity.addComponent(new AIComponent(150, 80));
      world.addEntity(entity);
    }

    // Large stationary entities with health
    for (let i = 0; i < 2; i++) {
      const entity = new ECSEntity();
      entity.addComponent(new PositionComponent(
        Math.random() * (canvasWidth - 100),
        Math.random() * (canvasHeight - 100)
      ));
      entity.addComponent(new VelocityComponent(0, 0));
      entity.addComponent(new RenderComponent(50, 50, '#ef4444'));
      entity.addComponent(new HealthComponent(200));
      world.addEntity(entity);
    }
  };

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

  const addRandomEntity = () => {
    if (!worldRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const world = worldRef.current;

    const entityTypes = ['basic', 'ai', 'tank'];
    const type = entityTypes[Math.floor(Math.random() * entityTypes.length)];

    const entity = new ECSEntity();
    entity.addComponent(new PositionComponent(
      Math.random() * (canvas.width - 50),
      Math.random() * (canvas.height - 50)
    ));

    switch (type) {
      case 'basic':
        entity.addComponent(new VelocityComponent(
          (Math.random() - 0.5) * 200,
          (Math.random() - 0.5) * 200
        ));
        entity.addComponent(new RenderComponent(20, 20, '#4ade80'));
        break;
      case 'ai':
        entity.addComponent(new VelocityComponent(0, 0));
        entity.addComponent(new RenderComponent(25, 25, '#f59e0b'));
        entity.addComponent(new HealthComponent(100));
        entity.addComponent(new AIComponent(120, 60));
        break;
      case 'tank':
        entity.addComponent(new VelocityComponent(0, 0));
        entity.addComponent(new RenderComponent(40, 40, '#8b5cf6'));
        entity.addComponent(new HealthComponent(300));
        break;
    }

    world.addEntity(entity);
  };

  const clearEntities = () => {
    if (!worldRef.current) return;

    const entityIds = Array.from(worldRef.current.entities.keys());
    entityIds.forEach(id => worldRef.current!.removeEntity(id));
    setSelectedEntity(null);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Entity Component System</h1>
        <p className="page-description">
          Learn the ECS architecture pattern used in modern game engines. 
          Separate data (Components) from behavior (Systems) for flexible, performant game design.
        </p>
      </div>

      <div className="demo-container">
        <div className="demo-controls">
          <button className="demo-button" onClick={toggleEngine}>
            {isRunning ? 'Pause' : 'Start'} ECS
          </button>
          
          <button className="demo-button" onClick={addRandomEntity}>
            Add Entity
          </button>
          
          <button className="demo-button" onClick={clearEntities}>
            Clear All
          </button>
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
            <div className="metric-value">{entityCount}</div>
            <div className="metric-label">Total Entities</div>
          </div>
          <div className="metric-card">
            <div className="metric-value">{systemCount}</div>
            <div className="metric-label">Active Systems</div>
          </div>
          <div className="metric-card">
            <div className="metric-value">{entityStats.withAI}</div>
            <div className="metric-label">AI Entities</div>
          </div>
          <div className="metric-card">
            <div className="metric-value">{entityStats.alive}</div>
            <div className="metric-label">Alive Entities</div>
          </div>
        </div>
      </div>

      <div className="concept-section">
        <h2>ECS Architecture</h2>
        <div className="concept-grid">
          <div className="info-card">
            <h3>Entities</h3>
            <p>
              Simple containers that hold components. They have an ID and manage component lifecycle, 
              but contain no game logic themselves. Think of them as game objects.
            </p>
          </div>
          
          <div className="info-card">
            <h3>Components</h3>
            <p>
              Pure data structures that define what an entity has. Position, Health, AI, Render - 
              each component stores specific data without behavior.
            </p>
          </div>
          
          <div className="info-card">
            <h3>Systems</h3>
            <p>
              Contain the game logic and operate on entities with specific component combinations. 
              Movement System processes entities with Position + Velocity components.
            </p>
          </div>
          
          <div className="info-card">
            <h3>World Manager</h3>
            <p>
              Coordinates entities and systems, manages the game loop, and handles entity creation/destruction. 
              The central hub of the ECS architecture.
            </p>
          </div>
        </div>
      </div>

      <div className="code-example">
        <h2>Component Definition</h2>
        <div className="code-container">
          <div className="code-header">
            <span className="code-title">ECS.ts - Components</span>
          </div>
          <div className="code-content">
            <pre>{`// Base Component class
export abstract class Component {
  abstract type: string;
}

// Specific Components store only data
export class PositionComponent extends Component {
  type = 'position';
  x: number;
  y: number;

  constructor(x: number = 0, y: number = 0) {
    super();
    this.x = x;
    this.y = y;
  }
}

export class HealthComponent extends Component {
  type = 'health';
  current: number;
  maximum: number;

  constructor(health: number = 100) {
    super();
    this.current = health;
    this.maximum = health;
  }

  takeDamage(amount: number): void {
    this.current = Math.max(0, this.current - amount);
  }
}`}</pre>
          </div>
        </div>
      </div>

      <div className="code-example">
        <h2>System Implementation</h2>
        <div className="code-container">
          <div className="code-header">
            <span className="code-title">ECS.ts - Systems</span>
          </div>
          <div className="code-content">
            <pre>{`// Systems contain logic and operate on entities
export class MovementSystem extends System {
  requiredComponents = ['position', 'velocity'];

  update(deltaTime: number): void {
    // Process all entities with position AND velocity components
    this.entities.forEach(entity => {
      const position = entity.getComponent<PositionComponent>('position')!;
      const velocity = entity.getComponent<VelocityComponent>('velocity')!;

      // Apply movement
      position.x += velocity.vx * deltaTime;
      position.y += velocity.vy * deltaTime;
    });
  }
}

// AI System processes entities with position, velocity, and ai components
export class AISystem extends System {
  requiredComponents = ['position', 'velocity', 'ai'];

  update(deltaTime: number): void {
    this.entities.forEach(entity => {
      // AI logic here - seek targets, flee when low health, etc.
      const ai = entity.getComponent<AIComponent>('ai')!;
      // ... AI behavior implementation
    });
  }
}`}</pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EntitySystemPage;