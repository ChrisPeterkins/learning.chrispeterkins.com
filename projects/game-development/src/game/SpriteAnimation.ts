export interface AnimationFrame {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface AnimationOptions {
  frames: AnimationFrame[];
  frameRate: number;
  loop?: boolean;
  autoStart?: boolean;
}

export class SpriteAnimation {
  frames: AnimationFrame[];
  frameRate: number;
  loop: boolean;
  
  public currentFrame: number = 0;
  public timePerFrame: number;
  private timeAccumulator: number = 0;
  private isPlaying: boolean = false;
  private isFinished: boolean = false;

  constructor(options: AnimationOptions) {
    this.frames = options.frames;
    this.frameRate = options.frameRate;
    this.loop = options.loop ?? true;
    this.timePerFrame = 1 / this.frameRate;
    
    if (options.autoStart ?? true) {
      this.play();
    }
  }

  play(): void {
    this.isPlaying = true;
    this.isFinished = false;
  }

  pause(): void {
    this.isPlaying = false;
  }

  stop(): void {
    this.isPlaying = false;
    this.currentFrame = 0;
    this.timeAccumulator = 0;
    this.isFinished = false;
  }

  update(deltaTime: number): void {
    if (!this.isPlaying || this.isFinished) return;

    this.timeAccumulator += deltaTime;

    if (this.timeAccumulator >= this.timePerFrame) {
      this.timeAccumulator -= this.timePerFrame;
      this.currentFrame++;

      if (this.currentFrame >= this.frames.length) {
        if (this.loop) {
          this.currentFrame = 0;
        } else {
          this.currentFrame = this.frames.length - 1;
          this.isFinished = true;
          this.isPlaying = false;
        }
      }
    }
  }

  getCurrentFrame(): AnimationFrame {
    return this.frames[this.currentFrame];
  }

  setFrame(frameIndex: number): void {
    this.currentFrame = Math.max(0, Math.min(frameIndex, this.frames.length - 1));
  }

  get playing(): boolean {
    return this.isPlaying;
  }

  get finished(): boolean {
    return this.isFinished;
  }

  get progress(): number {
    return this.currentFrame / (this.frames.length - 1);
  }
}

export class AnimatedSprite {
  position: { x: number; y: number };
  scale: { x: number; y: number };
  rotation: number = 0;
  animations: Map<string, SpriteAnimation> = new Map();
  currentAnimation: string | null = null;
  
  constructor(x: number = 0, y: number = 0) {
    this.position = { x, y };
    this.scale = { x: 1, y: 1 };
  }

  addAnimation(name: string, animation: SpriteAnimation): void {
    this.animations.set(name, animation);
  }

  playAnimation(name: string): boolean {
    const animation = this.animations.get(name);
    if (!animation) return false;

    // Stop current animation
    if (this.currentAnimation) {
      const currentAnim = this.animations.get(this.currentAnimation);
      currentAnim?.stop();
    }

    this.currentAnimation = name;
    animation.play();
    return true;
  }

  update(deltaTime: number): void {
    if (this.currentAnimation) {
      const animation = this.animations.get(this.currentAnimation);
      animation?.update(deltaTime);
    }
  }

  render(ctx: CanvasRenderingContext2D, spriteSheet?: HTMLCanvasElement): void {
    if (!this.currentAnimation) return;
    
    const animation = this.animations.get(this.currentAnimation);
    if (!animation) return;

    const frame = animation.getCurrentFrame();
    
    ctx.save();
    ctx.translate(this.position.x, this.position.y);
    ctx.rotate(this.rotation);
    ctx.scale(this.scale.x, this.scale.y);

    if (spriteSheet) {
      // If we have a sprite sheet, draw from it
      ctx.drawImage(
        spriteSheet,
        frame.x, frame.y, frame.width, frame.height,
        -frame.width / 2, -frame.height / 2, frame.width, frame.height
      );
    } else {
      // Draw a placeholder rectangle
      ctx.fillStyle = '#4ade80';
      ctx.fillRect(
        -frame.width / 2, 
        -frame.height / 2, 
        frame.width, 
        frame.height
      );
      
      // Add frame number for debugging
      ctx.fillStyle = '#000';
      ctx.font = '12px monospace';
      ctx.textAlign = 'center';
      const frameIndex = animation.frames.indexOf(animation.getCurrentFrame());
      ctx.fillText(
        `${this.currentAnimation?.slice(0, 1).toUpperCase()}${frameIndex + 1}`,
        0, 4
      );
    }
    
    ctx.restore();
  }

  // Static helper to create common animation patterns
  static createWalkCycle(frameWidth: number, frameHeight: number): SpriteAnimation {
    const frames: AnimationFrame[] = [
      { x: 0, y: 0, width: frameWidth, height: frameHeight },
      { x: frameWidth, y: 0, width: frameWidth, height: frameHeight },
      { x: frameWidth * 2, y: 0, width: frameWidth, height: frameHeight },
      { x: frameWidth * 3, y: 0, width: frameWidth, height: frameHeight }
    ];
    
    return new SpriteAnimation({
      frames,
      frameRate: 8,
      loop: true
    });
  }

  static createIdleAnimation(frameWidth: number, frameHeight: number): SpriteAnimation {
    const frames: AnimationFrame[] = [
      { x: 0, y: frameHeight, width: frameWidth, height: frameHeight },
      { x: frameWidth, y: frameHeight, width: frameWidth, height: frameHeight }
    ];
    
    return new SpriteAnimation({
      frames,
      frameRate: 2,
      loop: true
    });
  }

  static createJumpAnimation(frameWidth: number, frameHeight: number): SpriteAnimation {
    const frames: AnimationFrame[] = [
      { x: 0, y: frameHeight * 2, width: frameWidth, height: frameHeight },
      { x: frameWidth, y: frameHeight * 2, width: frameWidth, height: frameHeight },
      { x: frameWidth * 2, y: frameHeight * 2, width: frameWidth, height: frameHeight }
    ];
    
    return new SpriteAnimation({
      frames,
      frameRate: 10,
      loop: false
    });
  }
}