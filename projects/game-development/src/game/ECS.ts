import { Vector2 } from './Vector2';

// Component base class
export abstract class Component {
  abstract type: string;
}

// Position Component
export class PositionComponent extends Component {
  type = 'position';
  x: number;
  y: number;

  constructor(x: number = 0, y: number = 0) {
    super();
    this.x = x;
    this.y = y;
  }

  get position(): Vector2 {
    return new Vector2(this.x, this.y);
  }

  set position(pos: Vector2) {
    this.x = pos.x;
    this.y = pos.y;
  }
}

// Velocity Component
export class VelocityComponent extends Component {
  type = 'velocity';
  vx: number;
  vy: number;

  constructor(vx: number = 0, vy: number = 0) {
    super();
    this.vx = vx;
    this.vy = vy;
  }

  get velocity(): Vector2 {
    return new Vector2(this.vx, this.vy);
  }

  set velocity(vel: Vector2) {
    this.vx = vel.x;
    this.vy = vel.y;
  }
}

// Render Component
export class RenderComponent extends Component {
  type = 'render';
  width: number;
  height: number;
  color: string;

  constructor(width: number = 20, height: number = 20, color: string = '#4ade80') {
    super();
    this.width = width;
    this.height = height;
    this.color = color;
  }
}

// Health Component
export class HealthComponent extends Component {
  type = 'health';
  current: number;
  maximum: number;

  constructor(health: number = 100) {
    super();
    this.current = health;
    this.maximum = health;
  }

  get percentage(): number {
    return this.current / this.maximum;
  }

  takeDamage(amount: number): void {
    this.current = Math.max(0, this.current - amount);
  }

  heal(amount: number): void {
    this.current = Math.min(this.maximum, this.current + amount);
  }

  get isDead(): boolean {
    return this.current <= 0;
  }
}

// AI Component
export class AIComponent extends Component {
  type = 'ai';
  target: number | null = null; // Target entity ID
  state: 'idle' | 'seeking' | 'fleeing' | 'attacking' = 'idle';
  viewRange: number = 100;
  speed: number = 50;

  constructor(viewRange: number = 100, speed: number = 50) {
    super();
    this.viewRange = viewRange;
    this.speed = speed;
  }
}

// Entity class
export class ECSEntity {
  id: number;
  components: Map<string, Component> = new Map();
  static nextId: number = 1;

  constructor() {
    this.id = ECSEntity.nextId++;
  }

  addComponent(component: Component): void {
    this.components.set(component.type, component);
  }

  removeComponent(type: string): void {
    this.components.delete(type);
  }

  getComponent<T extends Component>(type: string): T | undefined {
    return this.components.get(type) as T | undefined;
  }

  hasComponent(type: string): boolean {
    return this.components.has(type);
  }

  hasComponents(...types: string[]): boolean {
    return types.every(type => this.hasComponent(type));
  }
}

// System base class
export abstract class System {
  abstract requiredComponents: string[];
  entities: Set<ECSEntity> = new Set();

  addEntity(entity: ECSEntity): void {
    if (this.matchesEntity(entity)) {
      this.entities.add(entity);
    }
  }

  removeEntity(entity: ECSEntity): void {
    this.entities.delete(entity);
  }

  private matchesEntity(entity: ECSEntity): boolean {
    return this.requiredComponents.every(component => 
      entity.hasComponent(component)
    );
  }

  abstract update(deltaTime: number): void;
}

// Movement System
export class MovementSystem extends System {
  requiredComponents = ['position', 'velocity'];

  update(deltaTime: number): void {
    this.entities.forEach(entity => {
      const position = entity.getComponent<PositionComponent>('position')!;
      const velocity = entity.getComponent<VelocityComponent>('velocity')!;

      position.x += velocity.vx * deltaTime;
      position.y += velocity.vy * deltaTime;
    });
  }
}

// Render System
export class RenderSystem extends System {
  requiredComponents = ['position', 'render'];
  ctx: CanvasRenderingContext2D;

  constructor(ctx: CanvasRenderingContext2D) {
    super();
    this.ctx = ctx;
  }

  update(_deltaTime: number): void {
    this.entities.forEach(entity => {
      const position = entity.getComponent<PositionComponent>('position')!;
      const render = entity.getComponent<RenderComponent>('render')!;

      this.ctx.fillStyle = render.color;
      this.ctx.fillRect(position.x, position.y, render.width, render.height);

      // Draw health bar if entity has health component
      const health = entity.getComponent<HealthComponent>('health');
      if (health) {
        const barWidth = render.width;
        const barHeight = 4;
        
        // Background
        this.ctx.fillStyle = 'rgba(255, 0, 0, 0.8)';
        this.ctx.fillRect(position.x, position.y - 8, barWidth, barHeight);
        
        // Health
        this.ctx.fillStyle = 'rgba(0, 255, 0, 0.8)';
        this.ctx.fillRect(position.x, position.y - 8, barWidth * health.percentage, barHeight);
      }
    });
  }
}

// AI System
export class AISystem extends System {
  requiredComponents = ['position', 'velocity', 'ai'];

  update(deltaTime: number): void {
    const allEntities = Array.from(this.entities);
    
    this.entities.forEach(entity => {
      const position = entity.getComponent<PositionComponent>('position')!;
      const velocity = entity.getComponent<VelocityComponent>('velocity')!;
      const ai = entity.getComponent<AIComponent>('ai')!;

      // Simple AI: seek closest entity
      let closestEntity: ECSEntity | null = null;
      let closestDistance = Infinity;

      allEntities.forEach(other => {
        if (other.id === entity.id) return;
        
        const otherPos = other.getComponent<PositionComponent>('position');
        if (!otherPos) return;

        const distance = Vector2.distance(position.position, otherPos.position);
        
        if (distance < ai.viewRange && distance < closestDistance) {
          closestDistance = distance;
          closestEntity = other;
        }
      });

      if (closestEntity) {
        const targetPos = closestEntity.getComponent<PositionComponent>('position')!;
        const direction = Vector2.subtract(targetPos.position, position.position).normalize();
        
        // Move towards or away from target based on health
        const health = entity.getComponent<HealthComponent>('health');
        const speedMultiplier = health && health.percentage < 0.3 ? -1 : 1; // Flee if low health
        
        velocity.velocity = Vector2.multiply(direction, ai.speed * speedMultiplier);
        ai.state = speedMultiplier > 0 ? 'seeking' : 'fleeing';
      } else {
        // Idle behavior - slow down
        velocity.velocity = Vector2.multiply(velocity.velocity, 0.9);
        ai.state = 'idle';
      }
    });
  }
}

// Boundary System (keep entities on screen)
export class BoundarySystem extends System {
  requiredComponents = ['position', 'velocity'];
  canvasWidth: number;
  canvasHeight: number;

  constructor(canvasWidth: number, canvasHeight: number) {
    super();
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
  }

  update(_deltaTime: number): void {
    this.entities.forEach(entity => {
      const position = entity.getComponent<PositionComponent>('position')!;
      const velocity = entity.getComponent<VelocityComponent>('velocity')!;
      const render = entity.getComponent<RenderComponent>('render');
      
      const width = render?.width || 20;
      const height = render?.height || 20;

      // Bounce off boundaries
      if (position.x <= 0 || position.x + width >= this.canvasWidth) {
        velocity.vx *= -1;
        position.x = Math.max(0, Math.min(position.x, this.canvasWidth - width));
      }
      
      if (position.y <= 0 || position.y + height >= this.canvasHeight) {
        velocity.vy *= -1;
        position.y = Math.max(0, Math.min(position.y, this.canvasHeight - height));
      }
    });
  }
}

// ECS World/Manager
export class World {
  entities: Map<number, ECSEntity> = new Map();
  systems: System[] = [];

  addEntity(entity: ECSEntity): void {
    this.entities.set(entity.id, entity);
    
    // Add to appropriate systems
    this.systems.forEach(system => system.addEntity(entity));
  }

  removeEntity(entityId: number): void {
    const entity = this.entities.get(entityId);
    if (entity) {
      this.systems.forEach(system => system.removeEntity(entity));
      this.entities.delete(entityId);
    }
  }

  addSystem(system: System): void {
    this.systems.push(system);
    
    // Add existing entities to system
    this.entities.forEach(entity => system.addEntity(entity));
  }

  update(deltaTime: number): void {
    this.systems.forEach(system => system.update(deltaTime));
  }

  getEntitiesWith(...componentTypes: string[]): ECSEntity[] {
    return Array.from(this.entities.values()).filter(entity =>
      componentTypes.every(type => entity.hasComponent(type))
    );
  }
}