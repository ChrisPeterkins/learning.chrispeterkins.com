export interface GameEngineOptions {
  canvas: HTMLCanvasElement;
  targetFPS?: number;
  showFPS?: boolean;
}

export class GameEngine {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  targetFPS: number;
  showFPS: boolean;
  
  private lastTime: number = 0;
  private deltaTime: number = 0;
  private fps: number = 0;
  private frameCount: number = 0;
  private fpsUpdateTime: number = 0;
  private isRunning: boolean = false;
  private animationId: number = 0;

  // Callbacks
  private updateCallback?: (deltaTime: number) => void;
  private renderCallback?: (ctx: CanvasRenderingContext2D, deltaTime: number) => void;

  constructor(options: GameEngineOptions) {
    this.canvas = options.canvas;
    this.targetFPS = options.targetFPS || 60;
    this.showFPS = options.showFPS || false;

    const context = this.canvas.getContext('2d');
    if (!context) {
      throw new Error('Could not get 2D context from canvas');
    }
    this.ctx = context;

    // Bind methods to preserve context
    this.gameLoop = this.gameLoop.bind(this);
  }

  // Set update callback
  onUpdate(callback: (deltaTime: number) => void): void {
    this.updateCallback = callback;
  }

  // Set render callback
  onRender(callback: (ctx: CanvasRenderingContext2D, deltaTime: number) => void): void {
    this.renderCallback = callback;
  }

  // Start the game loop
  start(): void {
    if (!this.isRunning) {
      this.isRunning = true;
      this.lastTime = performance.now();
      this.animationId = requestAnimationFrame(this.gameLoop);
    }
  }

  // Stop the game loop
  stop(): void {
    if (this.isRunning) {
      this.isRunning = false;
      cancelAnimationFrame(this.animationId);
    }
  }

  // Main game loop
  private gameLoop(currentTime: number): void {
    if (!this.isRunning) return;

    // Calculate delta time (in seconds)
    this.deltaTime = (currentTime - this.lastTime) / 1000;
    this.lastTime = currentTime;

    // Limit delta time to prevent large jumps
    this.deltaTime = Math.min(this.deltaTime, 1 / 30); // Max 30 FPS minimum

    // Update FPS counter
    this.updateFPS(currentTime);

    // Clear canvas
    this.clear();

    // Run update callback
    if (this.updateCallback) {
      this.updateCallback(this.deltaTime);
    }

    // Run render callback
    if (this.renderCallback) {
      this.renderCallback(this.ctx, this.deltaTime);
    }

    // Render FPS if enabled
    if (this.showFPS) {
      this.renderFPS();
    }

    // Continue the loop
    this.animationId = requestAnimationFrame(this.gameLoop);
  }

  // Update FPS calculation
  private updateFPS(currentTime: number): void {
    this.frameCount++;
    
    if (currentTime - this.fpsUpdateTime >= 1000) {
      this.fps = this.frameCount;
      this.frameCount = 0;
      this.fpsUpdateTime = currentTime;
    }
  }

  // Clear the canvas
  clear(color?: string): void {
    if (color) {
      this.ctx.fillStyle = color;
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    } else {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }

  // Render FPS counter
  private renderFPS(): void {
    this.ctx.fillStyle = '#00ff00';
    this.ctx.font = '16px monospace';
    this.ctx.fillText(`FPS: ${this.fps}`, 10, 30);
    this.ctx.fillText(`Delta: ${(this.deltaTime * 1000).toFixed(2)}ms`, 10, 50);
  }

  // Getters
  get deltaTimeMs(): number {
    return this.deltaTime * 1000;
  }

  get currentFPS(): number {
    return this.fps;
  }

  get running(): boolean {
    return this.isRunning;
  }

  // Utility methods
  resizeCanvas(width: number, height: number): void {
    this.canvas.width = width;
    this.canvas.height = height;
  }

  getMousePosition(event: MouseEvent): { x: number; y: number } {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };
  }

  // Static factory method
  static create(canvas: HTMLCanvasElement, options?: Partial<GameEngineOptions>): GameEngine {
    return new GameEngine({
      canvas,
      ...options
    });
  }
}