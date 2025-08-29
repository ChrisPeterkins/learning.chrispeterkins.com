import { Vector2 } from './Vector2';
import { Entity } from './Entity';

export interface Rectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Circle {
  x: number;
  y: number;
  radius: number;
}

export class Collision {
  // AABB (Axis-Aligned Bounding Box) collision detection
  static rectangleRectangle(rect1: Rectangle, rect2: Rectangle): boolean {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
  }

  // Circle collision detection
  static circleCircle(circle1: Circle, circle2: Circle): boolean {
    const distance = Vector2.distance(
      new Vector2(circle1.x, circle1.y),
      new Vector2(circle2.x, circle2.y)
    );
    return distance <= circle1.radius + circle2.radius;
  }

  // Circle vs Rectangle collision
  static circleRectangle(circle: Circle, rect: Rectangle): boolean {
    // Find the closest point on the rectangle to the circle center
    const closestX = Math.max(rect.x, Math.min(circle.x, rect.x + rect.width));
    const closestY = Math.max(rect.y, Math.min(circle.y, rect.y + rect.height));

    // Calculate distance between circle center and closest point
    const distanceX = circle.x - closestX;
    const distanceY = circle.y - closestY;
    const distanceSquared = distanceX * distanceX + distanceY * distanceY;

    return distanceSquared <= circle.radius * circle.radius;
  }

  // Point in rectangle
  static pointInRectangle(point: Vector2, rect: Rectangle): boolean {
    return point.x >= rect.x &&
           point.x <= rect.x + rect.width &&
           point.y >= rect.y &&
           point.y <= rect.y + rect.height;
  }

  // Point in circle
  static pointInCircle(point: Vector2, circle: Circle): boolean {
    const distance = Vector2.distance(point, new Vector2(circle.x, circle.y));
    return distance <= circle.radius;
  }

  // Entity collision detection
  static entityEntity(entity1: Entity, entity2: Entity): boolean {
    return Collision.rectangleRectangle(
      {
        x: entity1.position.x,
        y: entity1.position.y,
        width: entity1.width,
        height: entity1.height
      },
      {
        x: entity2.position.x,
        y: entity2.position.y,
        width: entity2.width,
        height: entity2.height
      }
    );
  }

  // Resolve collision between two entities (simple elastic collision)
  static resolveCollision(entity1: Entity, entity2: Entity): void {
    // Calculate collision normal
    const center1 = entity1.getCenter();
    const center2 = entity2.getCenter();
    const normal = Vector2.subtract(center1, center2).normalize();

    // Relative velocity
    const relativeVelocity = Vector2.subtract(entity1.velocity, entity2.velocity);
    const velAlongNormal = Vector2.dot(relativeVelocity, normal);

    // Don't resolve if velocities are separating
    if (velAlongNormal > 0) return;

    // Calculate restitution (bounciness)
    const restitution = 0.8;

    // Calculate impulse scalar
    let impulse = -(1 + restitution) * velAlongNormal;
    impulse /= (1 / entity1.mass) + (1 / entity2.mass);

    // Apply impulse
    const impulseVector = Vector2.multiply(normal, impulse);
    
    entity1.velocity.add(Vector2.multiply(impulseVector, 1 / entity1.mass));
    entity2.velocity.subtract(Vector2.multiply(impulseVector, 1 / entity2.mass));
  }

  // Separate overlapping entities
  static separateEntities(entity1: Entity, entity2: Entity): void {
    const center1 = entity1.getCenter();
    const center2 = entity2.getCenter();
    const overlap = Vector2.subtract(center1, center2);
    const distance = overlap.magnitude();

    if (distance > 0) {
      const minDistance = (entity1.width + entity2.width) / 2;
      const separation = (minDistance - distance) / 2;
      
      const separationVector = overlap.normalize().multiply(separation);
      
      entity1.position.add(separationVector);
      entity2.position.subtract(separationVector);
    }
  }
}