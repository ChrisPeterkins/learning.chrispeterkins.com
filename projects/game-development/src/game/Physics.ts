import { Vector2 } from './Vector2';
import { Entity } from './Entity';

export class Physics {
  static readonly GRAVITY = new Vector2(0, 9.81 * 100); // 9.81 m/s² scaled for pixels
  static readonly AIR_RESISTANCE = 0.99;
  static readonly FRICTION = 0.95;

  // Apply gravity to an entity
  static applyGravity(entity: Entity, gravity: Vector2 = Physics.GRAVITY): void {
    const gravityForce = Vector2.multiply(gravity, entity.mass);
    entity.applyForce(gravityForce);
  }

  // Apply air resistance (drag)
  static applyAirResistance(entity: Entity, resistance: number = Physics.AIR_RESISTANCE): void {
    entity.velocity.multiply(resistance);
  }

  // Apply friction when entity is on ground
  static applyFriction(entity: Entity, friction: number = Physics.FRICTION): void {
    entity.velocity.x *= friction;
  }

  // Bounce off boundaries
  static bounceOffBoundaries(
    entity: Entity, 
    canvasWidth: number, 
    canvasHeight: number,
    restitution: number = 0.8
  ): void {
    // Left and right boundaries
    if (entity.position.x <= 0) {
      entity.position.x = 0;
      entity.velocity.x *= -restitution;
    } else if (entity.position.x + entity.width >= canvasWidth) {
      entity.position.x = canvasWidth - entity.width;
      entity.velocity.x *= -restitution;
    }

    // Top and bottom boundaries
    if (entity.position.y <= 0) {
      entity.position.y = 0;
      entity.velocity.y *= -restitution;
    } else if (entity.position.y + entity.height >= canvasHeight) {
      entity.position.y = canvasHeight - entity.height;
      entity.velocity.y *= -restitution;
    }
  }

  // Wrap around boundaries (Pac-Man effect)
  static wrapAroundBoundaries(
    entity: Entity, 
    canvasWidth: number, 
    canvasHeight: number
  ): void {
    // Horizontal wrapping
    if (entity.position.x + entity.width < 0) {
      entity.position.x = canvasWidth;
    } else if (entity.position.x > canvasWidth) {
      entity.position.x = -entity.width;
    }

    // Vertical wrapping
    if (entity.position.y + entity.height < 0) {
      entity.position.y = canvasHeight;
    } else if (entity.position.y > canvasHeight) {
      entity.position.y = -entity.height;
    }
  }

  // Spring force between two entities
  static applySpringForce(
    entity1: Entity,
    entity2: Entity,
    restLength: number = 100,
    springConstant: number = 0.1
  ): void {
    const force = Vector2.subtract(entity2.getCenter(), entity1.getCenter());
    const currentLength = force.magnitude();
    const displacement = currentLength - restLength;
    
    force.normalize().multiply(displacement * springConstant);
    
    entity1.applyForce(force);
    entity2.applyForce(Vector2.multiply(force, -1));
  }

  // Attraction force between two entities (like gravity)
  static applyAttractionForce(
    entity1: Entity,
    entity2: Entity,
    gravitationalConstant: number = 1000
  ): void {
    const force = Vector2.subtract(entity2.getCenter(), entity1.getCenter());
    const distance = force.magnitude();
    
    if (distance > 0) {
      // F = G * m1 * m2 / r²
      const strength = (gravitationalConstant * entity1.mass * entity2.mass) / (distance * distance);
      force.normalize().multiply(strength);
      
      entity1.applyForce(force);
      entity2.applyForce(Vector2.multiply(force, -1));
    }
  }

  // Repulsion force between two entities
  static applyRepulsionForce(
    entity1: Entity,
    entity2: Entity,
    repulsionConstant: number = 1000
  ): void {
    const force = Vector2.subtract(entity1.getCenter(), entity2.getCenter());
    const distance = force.magnitude();
    
    if (distance > 0 && distance < 100) { // Only apply when close
      const strength = repulsionConstant / (distance * distance);
      force.normalize().multiply(strength);
      
      entity1.applyForce(force);
      entity2.applyForce(Vector2.multiply(force, -1));
    }
  }

  // Simple verlet integration for more stable physics
  static verletIntegration(entity: Entity, deltaTime: number, previousPosition: Vector2): void {
    const newPosition = Vector2.subtract(
      Vector2.add(
        Vector2.multiply(entity.position, 2),
        Vector2.multiply(previousPosition, -1)
      ),
      Vector2.multiply(entity.acceleration, deltaTime * deltaTime)
    );

    previousPosition.set(entity.position.x, entity.position.y);
    entity.position.set(newPosition.x, newPosition.y);
    
    // Calculate velocity based on position change
    entity.velocity = Vector2.multiply(
      Vector2.subtract(entity.position, previousPosition),
      1 / deltaTime
    );
  }
}