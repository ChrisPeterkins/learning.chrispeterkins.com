import { Vector2 } from './Vector2';

export interface ParticleOptions {
  position: Vector2;
  velocity?: Vector2;
  acceleration?: Vector2;
  color?: string;
  size?: number;
  life?: number;
  maxLife?: number;
  alpha?: number;
}

export class Particle {
  position: Vector2;
  velocity: Vector2;
  acceleration: Vector2;
  color: string;
  size: number;
  life: number;
  maxLife: number;
  alpha: number;
  isDead: boolean = false;

  constructor(options: ParticleOptions) {
    this.position = options.position.copy();
    this.velocity = options.velocity?.copy() || new Vector2();
    this.acceleration = options.acceleration?.copy() || new Vector2();
    this.color = options.color || '#4ade80';
    this.size = options.size || 3;
    this.life = options.life || 1;
    this.maxLife = options.maxLife || 1;
    this.alpha = options.alpha || 1;
  }

  update(deltaTime: number): void {
    // Apply physics
    this.velocity.add(Vector2.multiply(this.acceleration, deltaTime));
    this.position.add(Vector2.multiply(this.velocity, deltaTime));
    
    // Update life
    this.life -= deltaTime;
    
    // Update alpha based on life remaining
    this.alpha = Math.max(0, this.life / this.maxLife);
    
    // Mark as dead if life is over
    if (this.life <= 0) {
      this.isDead = true;
    }
  }

  render(ctx: CanvasRenderingContext2D): void {
    if (this.isDead) return;

    const previousAlpha = ctx.globalAlpha;
    ctx.globalAlpha = this.alpha;
    
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.position.x, this.position.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.globalAlpha = previousAlpha;
  }
}

export class ParticleSystem {
  particles: Particle[] = [];
  position: Vector2;
  emissionRate: number;
  maxParticles: number;
  private timeSinceLastEmission: number = 0;

  constructor(
    position: Vector2,
    emissionRate: number = 50,
    maxParticles: number = 200
  ) {
    this.position = position;
    this.emissionRate = emissionRate;
    this.maxParticles = maxParticles;
  }

  emit(options: Partial<ParticleOptions> = {}): void {
    if (this.particles.length >= this.maxParticles) return;

    const particle = new Particle({
      position: this.position,
      ...options
    });
    
    this.particles.push(particle);
  }

  update(deltaTime: number): void {
    // Update existing particles
    this.particles.forEach(particle => particle.update(deltaTime));
    
    // Remove dead particles
    this.particles = this.particles.filter(particle => !particle.isDead);
    
    // Emit new particles
    this.timeSinceLastEmission += deltaTime;
    const timeBetweenEmissions = 1 / this.emissionRate;
    
    while (this.timeSinceLastEmission >= timeBetweenEmissions) {
      this.emit();
      this.timeSinceLastEmission -= timeBetweenEmissions;
    }
  }

  render(ctx: CanvasRenderingContext2D): void {
    this.particles.forEach(particle => particle.render(ctx));
  }

  // Preset effects
  static createFirework(position: Vector2, color: string = '#ffd700'): ParticleSystem {
    const system = new ParticleSystem(position, 0, 50);
    
    // Create explosion particles
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
  }

  static createFountain(position: Vector2): ParticleSystem {
    const system = new ParticleSystem(position, 100, 300);
    
    // Override emit to create fountain effect
    const originalEmit = system.emit.bind(system);
    system.emit = (options = {}) => {
      const angle = -Math.PI/2 + (Math.random() - 0.5) * 0.5; // Upward cone
      const speed = 150 + Math.random() * 100;
      
      originalEmit({
        velocity: new Vector2(
          Math.cos(angle) * speed,
          Math.sin(angle) * speed
        ),
        acceleration: new Vector2(0, 300), // gravity
        color: `hsl(${200 + Math.random() * 60}, 70%, 60%)`,
        size: 2 + Math.random() * 2,
        life: 2 + Math.random(),
        maxLife: 2 + Math.random(),
        ...options
      });
    };
    
    return system;
  }

  static createSmoke(position: Vector2): ParticleSystem {
    const system = new ParticleSystem(position, 30, 100);
    
    const originalEmit = system.emit.bind(system);
    system.emit = (options = {}) => {
      const velocity = new Vector2(
        (Math.random() - 0.5) * 50,
        -50 - Math.random() * 50
      );
      
      originalEmit({
        velocity,
        acceleration: new Vector2(0, -20), // slight upward drift
        color: `rgba(150, 150, 150, ${0.3 + Math.random() * 0.4})`,
        size: 5 + Math.random() * 10,
        life: 3 + Math.random() * 2,
        maxLife: 3 + Math.random() * 2,
        ...options
      });
    };
    
    return system;
  }
}