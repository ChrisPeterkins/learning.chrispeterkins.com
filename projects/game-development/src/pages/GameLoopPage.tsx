import React, { useEffect, useRef, useState } from 'react';
import { GameEngine } from '../game/GameEngine';
import { Entity } from '../game/Entity';
import { Vector2 } from '../game/Vector2';

const GameLoopPage: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [fps, setFps] = useState(0);
  const [deltaTime, setDeltaTime] = useState(0);
  const [frameCount, setFrameCount] = useState(0);
  const [targetFPS, setTargetFPS] = useState(60);
  
  // Demo entities
  const entitiesRef = useRef<Entity[]>([]);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    canvas.width = 800;
    canvas.height = 400;

    const engine = GameEngine.create(canvas, {
      targetFPS: targetFPS,
      showFPS: true
    });

    // Create some demo entities
    entitiesRef.current = [
      new Entity({
        x: 50,
        y: 50,
        width: 30,
        height: 30,
        color: '#4ade80'
      }),
      new Entity({
        x: 200,
        y: 100,
        width: 25,
        height: 25,
        color: '#f59e0b'
      }),
      new Entity({
        x: 400,
        y: 150,
        width: 40,
        height: 40,
        color: '#ef4444'
      })
    ];

    // Set up initial velocities
    entitiesRef.current[0].velocity.set(100, 50);
    entitiesRef.current[1].velocity.set(-150, 75);
    entitiesRef.current[2].velocity.set(80, -100);

    // Update callback
    engine.onUpdate((deltaTime: number) => {
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
      });

      // Update React state
      setFps(engine.currentFPS);
      setDeltaTime(engine.deltaTimeMs);
      setFrameCount(prev => prev + 1);
    });

    // Render callback
    engine.onRender((ctx: CanvasRenderingContext2D) => {
      // Clear with dark background
      ctx.fillStyle = '#0a0f0d';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Render entities
      entitiesRef.current.forEach(entity => {
        entity.render(ctx);
      });

      // Render additional info
      ctx.fillStyle = '#a8bdb2';
      ctx.font = '14px monospace';
      ctx.fillText(`Frame Count: ${frameCount}`, 10, canvas.height - 60);
      ctx.fillText(`Target FPS: ${targetFPS}`, 10, canvas.height - 40);
      ctx.fillText(`Canvas: ${canvas.width}x${canvas.height}`, 10, canvas.height - 20);
    });

    engineRef.current = engine;

    return () => {
      if (engineRef.current) {
        engineRef.current.stop();
      }
    };
  }, [targetFPS]);

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
    setFrameCount(0);
    
    // Reset entity positions
    if (entitiesRef.current.length > 0) {
      entitiesRef.current[0].position.set(50, 50);
      entitiesRef.current[0].velocity.set(100, 50);
      
      entitiesRef.current[1].position.set(200, 100);
      entitiesRef.current[1].velocity.set(-150, 75);
      
      entitiesRef.current[2].position.set(400, 150);
      entitiesRef.current[2].velocity.set(80, -100);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Game Loop & Timing</h1>
        <p className="page-description">
          The game loop is the heartbeat of every game. It continuously updates game state, 
          renders graphics, and manages timing to create smooth, interactive experiences.
        </p>
      </div>

      <div className="demo-container">
        <div className="demo-controls">
          <button className="demo-button" onClick={toggleEngine}>
            {isRunning ? 'Pause' : 'Start'} Game Loop
          </button>
          <button className="demo-button" onClick={resetDemo}>
            Reset Demo
          </button>
          <div className="control-group">
            <label htmlFor="target-fps">Target FPS:</label>
            <select 
              id="target-fps"
              value={targetFPS} 
              onChange={(e) => setTargetFPS(Number(e.target.value))}
              className="demo-select"
            >
              <option value={30}>30 FPS</option>
              <option value={60}>60 FPS</option>
              <option value={120}>120 FPS</option>
            </select>
          </div>
        </div>

        <canvas
          ref={canvasRef}
          className="game-canvas"
          style={{
            border: '1px solid var(--border-primary)',
            backgroundColor: '#0a0f0d'
          }}
        />

        <div className="metrics-grid">
          <div className="metric-card">
            <div className="metric-value">{fps}</div>
            <div className="metric-label">Current FPS</div>
          </div>
          <div className="metric-card">
            <div className="metric-value">{deltaTime.toFixed(2)}</div>
            <div className="metric-label">Delta Time (ms)</div>
          </div>
          <div className="metric-card">
            <div className="metric-value">{frameCount}</div>
            <div className="metric-label">Frame Count</div>
          </div>
          <div className="metric-card">
            <div className="metric-value">{isRunning ? 'Running' : 'Stopped'}</div>
            <div className="metric-label">Engine Status</div>
          </div>
        </div>
      </div>

      <div className="concept-section">
        <h2>Core Concepts</h2>
        <div className="concept-grid">
          <div className="info-card">
            <h3>requestAnimationFrame</h3>
            <p>
              The modern way to create smooth animations. It syncs with the browser's refresh rate 
              and pauses when the tab isn't visible, improving performance and battery life.
            </p>
          </div>
          
          <div className="info-card">
            <h3>Delta Time</h3>
            <p>
              The time elapsed between frames, crucial for frame-rate independent movement. 
              Multiply velocities by delta time to ensure consistent movement regardless of FPS.
            </p>
          </div>
          
          <div className="info-card">
            <h3>Frame Rate</h3>
            <p>
              Frames per second (FPS) indicates how many times per second the game updates and renders. 
              Higher FPS provides smoother gameplay but requires more processing power.
            </p>
          </div>
          
          <div className="info-card">
            <h3>Game State</h3>
            <p>
              The current condition of all game objects, including positions, velocities, health, scores, etc. 
              The game loop continuously updates this state based on game logic and player input.
            </p>
          </div>
        </div>
      </div>

      <div className="code-example">
        <h2>Basic Game Loop Structure</h2>
        <div className="code-container">
          <div className="code-header">
            <span className="code-title">GameEngine.ts - Main Loop</span>
          </div>
          <div className="code-content">
            <pre>{`class GameEngine {
  private gameLoop(currentTime: number): void {
    // Calculate delta time
    this.deltaTime = (currentTime - this.lastTime) / 1000;
    this.lastTime = currentTime;

    // Update game state
    if (this.updateCallback) {
      this.updateCallback(this.deltaTime);
    }

    // Render graphics
    if (this.renderCallback) {
      this.renderCallback(this.ctx, this.deltaTime);
    }

    // Continue the loop
    this.animationId = requestAnimationFrame(this.gameLoop);
  }
}`}</pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameLoopPage;