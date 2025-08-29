import { Vector2 } from './Vector2';

export interface EntityOptions {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  color?: string;
  mass?: number;
}

export class Entity {
  position: Vector2;
  velocity: Vector2;
  acceleration: Vector2;
  width: number;
  height: number;
  color: string;
  mass: number;
  id: string;

  constructor(options: EntityOptions = {}) {
    this.position = new Vector2(options.x || 0, options.y || 0);
    this.velocity = new Vector2(0, 0);
    this.acceleration = new Vector2(0, 0);
    this.width = options.width || 20;
    this.height = options.height || 20;
    this.color = options.color || '#4ade80';
    this.mass = options.mass || 1;
    this.id = Math.random().toString(36).substr(2, 9);
  }

  update(deltaTime: number): void {
    // Apply physics
    this.velocity.add(Vector2.multiply(this.acceleration, deltaTime));
    this.position.add(Vector2.multiply(this.velocity, deltaTime));
    
    // Reset acceleration for next frame
    this.acceleration.set(0, 0);
  }

  render(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
  }

  applyForce(force: Vector2): void {
    // F = ma, so a = F/m
    const f = Vector2.multiply(force, 1 / this.mass);
    this.acceleration.add(f);
  }

  // Collision detection helpers
  getBounds() {
    return {
      left: this.position.x,
      right: this.position.x + this.width,
      top: this.position.y,
      bottom: this.position.y + this.height,
      centerX: this.position.x + this.width / 2,
      centerY: this.position.y + this.height / 2,
    };
  }

  getCenter(): Vector2 {
    return new Vector2(
      this.position.x + this.width / 2,
      this.position.y + this.height / 2
    );
  }

  containsPoint(x: number, y: number): boolean {
    return x >= this.position.x && 
           x <= this.position.x + this.width &&
           y >= this.position.y && 
           y <= this.position.y + this.height;
  }
}