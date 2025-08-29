import React, { useEffect, useRef, useState } from 'react';
import { GameEngine } from '../game/GameEngine';
import { AnimatedSprite, SpriteAnimation } from '../game/SpriteAnimation';

const SpriteAnimationPage: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [currentAnimation, setCurrentAnimation] = useState('walk');
  const [frameRate, setFrameRate] = useState(8);
  const [animationScale, setAnimationScale] = useState(2);
  
  const spriteRef = useRef<AnimatedSprite | null>(null);
  const [animationState, setAnimationState] = useState({
    currentFrame: 0,
    totalFrames: 4,
    isPlaying: false,
    isLooping: true
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

    // Create animated sprite
    const sprite = new AnimatedSprite(400, 250);
    
    // Create different animations
    const walkAnimation = SpriteAnimation.createWalkCycle(64, 64);
    walkAnimation.frameRate = frameRate;
    
    const idleAnimation = SpriteAnimation.createIdleAnimation(64, 64);
    idleAnimation.frameRate = 2;
    
    const jumpAnimation = SpriteAnimation.createJumpAnimation(64, 64);
    jumpAnimation.frameRate = 10;

    // Add animations to sprite
    sprite.addAnimation('walk', walkAnimation);
    sprite.addAnimation('idle', idleAnimation);
    sprite.addAnimation('jump', jumpAnimation);
    
    sprite.scale = { x: animationScale, y: animationScale };
    sprite.playAnimation(currentAnimation);

    spriteRef.current = sprite;

    // Update callback
    engine.onUpdate((deltaTime: number) => {
      sprite.update(deltaTime);
      
      // Update animation state for UI
      const currentAnim = sprite.animations.get(currentAnimation);
      if (currentAnim) {
        setAnimationState({
          currentFrame: currentAnim.currentFrame || 0,
          totalFrames: currentAnim.frames.length,
          isPlaying: currentAnim.playing,
          isLooping: currentAnim.loop || false
        });
      }

      // Animate sprite movement for walk animation
      if (currentAnimation === 'walk') {
        sprite.position.x += Math.sin(Date.now() * 0.001) * 2;
        sprite.position.y += Math.cos(Date.now() * 0.002) * 1;
        
        // Keep sprite on screen
        sprite.position.x = Math.max(100, Math.min(sprite.position.x, canvas.width - 100));
        sprite.position.y = Math.max(100, Math.min(sprite.position.y, canvas.height - 100));
      }
    });

    // Render callback
    engine.onRender((ctx: CanvasRenderingContext2D) => {
      // Clear with dark background
      ctx.fillStyle = '#0a0f0d';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw grid for reference
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 1;
      for (let x = 0; x < canvas.width; x += 50) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += 50) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Render sprite
      sprite.render(ctx);

      // Draw sprite sheet preview
      drawSpriteSheetPreview(ctx, canvas.width - 200, 20);

      // Draw animation info
      ctx.fillStyle = '#a8bdb2';
      ctx.font = '14px monospace';
      ctx.fillText(`Animation: ${currentAnimation}`, 10, canvas.height - 60);
      ctx.fillText(`Frame: ${animationState.currentFrame + 1}/${animationState.totalFrames}`, 10, canvas.height - 40);
      ctx.fillText(`Frame Rate: ${frameRate} FPS`, 10, canvas.height - 20);
    });

    engineRef.current = engine;

    return () => {
      if (engineRef.current) {
        engineRef.current.stop();
      }
    };
  }, [currentAnimation, frameRate, animationScale]);

  // Helper function to draw sprite sheet preview
  const drawSpriteSheetPreview = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    const frameWidth = 32;
    const frameHeight = 32;
    const spacing = 2;

    // Draw background
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.fillRect(x - 10, y - 10, 180, 130);

    ctx.fillStyle = '#a8bdb2';
    ctx.font = '12px monospace';
    ctx.fillText('Sprite Sheet Preview', x, y - 15);

    // Walk cycle (top row)
    ctx.fillStyle = '#4ade80';
    for (let i = 0; i < 4; i++) {
      const frameX = x + i * (frameWidth + spacing);
      ctx.fillRect(frameX, y, frameWidth, frameHeight);
      
      // Highlight current frame if in walk animation
      if (currentAnimation === 'walk' && i === animationState.currentFrame) {
        ctx.strokeStyle = '#ffd93d';
        ctx.lineWidth = 2;
        ctx.strokeRect(frameX, y, frameWidth, frameHeight);
      }
      
      ctx.fillStyle = '#000';
      ctx.font = '10px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`W${i + 1}`, frameX + frameWidth/2, y + frameHeight/2 + 3);
      ctx.fillStyle = '#4ade80';
    }

    // Idle animation (middle row)
    ctx.fillStyle = '#f59e0b';
    for (let i = 0; i < 2; i++) {
      const frameX = x + i * (frameWidth + spacing);
      const frameY = y + frameHeight + spacing;
      ctx.fillRect(frameX, frameY, frameWidth, frameHeight);
      
      if (currentAnimation === 'idle' && i === animationState.currentFrame) {
        ctx.strokeStyle = '#ffd93d';
        ctx.lineWidth = 2;
        ctx.strokeRect(frameX, frameY, frameWidth, frameHeight);
      }
      
      ctx.fillStyle = '#000';
      ctx.fillText(`I${i + 1}`, frameX + frameWidth/2, frameY + frameHeight/2 + 3);
      ctx.fillStyle = '#f59e0b';
    }

    // Jump animation (bottom row)
    ctx.fillStyle = '#ef4444';
    for (let i = 0; i < 3; i++) {
      const frameX = x + i * (frameWidth + spacing);
      const frameY = y + (frameHeight + spacing) * 2;
      ctx.fillRect(frameX, frameY, frameWidth, frameHeight);
      
      if (currentAnimation === 'jump' && i === animationState.currentFrame) {
        ctx.strokeStyle = '#ffd93d';
        ctx.lineWidth = 2;
        ctx.strokeRect(frameX, frameY, frameWidth, frameHeight);
      }
      
      ctx.fillStyle = '#000';
      ctx.fillText(`J${i + 1}`, frameX + frameWidth/2, frameY + frameHeight/2 + 3);
      ctx.fillStyle = '#ef4444';
    }

    // Reset text alignment
    ctx.textAlign = 'left';
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

  const changeAnimation = (animationType: string) => {
    setCurrentAnimation(animationType);
    if (spriteRef.current) {
      spriteRef.current.playAnimation(animationType);
    }
  };

  const updateFrameRate = (newFrameRate: number) => {
    setFrameRate(newFrameRate);
    if (spriteRef.current) {
      const anim = spriteRef.current.animations.get(currentAnimation);
      if (anim) {
        anim.frameRate = newFrameRate;
        anim.timePerFrame = 1 / newFrameRate;
      }
    }
  };

  const updateScale = (newScale: number) => {
    setAnimationScale(newScale);
    if (spriteRef.current) {
      spriteRef.current.scale = { x: newScale, y: newScale };
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Sprite Animation</h1>
        <p className="page-description">
          Bring characters and objects to life with frame-based sprite animations. 
          Learn how to manage sprite sheets, timing, and state transitions for smooth character movement.
        </p>
      </div>

      <div className="demo-container">
        <div className="demo-controls">
          <button className="demo-button" onClick={toggleEngine}>
            {isRunning ? 'Pause' : 'Start'} Animation
          </button>
          
          <div className="control-group">
            <label>Animation Type:</label>
            <select
              value={currentAnimation}
              onChange={(e) => changeAnimation(e.target.value)}
              className="demo-select"
            >
              <option value="walk">Walk Cycle</option>
              <option value="idle">Idle</option>
              <option value="jump">Jump</option>
            </select>
          </div>
        </div>

        <div className="demo-controls">
          <div className="control-group">
            <label htmlFor="frame-rate">Frame Rate:</label>
            <input
              id="frame-rate"
              type="range"
              min="1"
              max="20"
              step="1"
              value={frameRate}
              onChange={(e) => updateFrameRate(Number(e.target.value))}
              className="demo-input"
              style={{ width: '120px' }}
            />
            <span>{frameRate} FPS</span>
          </div>

          <div className="control-group">
            <label htmlFor="scale">Scale:</label>
            <input
              id="scale"
              type="range"
              min="0.5"
              max="4"
              step="0.25"
              value={animationScale}
              onChange={(e) => updateScale(Number(e.target.value))}
              className="demo-input"
              style={{ width: '120px' }}
            />
            <span>{animationScale}x</span>
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
            <div className="metric-value">{animationState.currentFrame + 1}</div>
            <div className="metric-label">Current Frame</div>
          </div>
          <div className="metric-card">
            <div className="metric-value">{animationState.totalFrames}</div>
            <div className="metric-label">Total Frames</div>
          </div>
          <div className="metric-card">
            <div className="metric-value">{animationState.isPlaying ? 'Playing' : 'Stopped'}</div>
            <div className="metric-label">Animation State</div>
          </div>
          <div className="metric-card">
            <div className="metric-value">{animationState.isLooping ? 'Loop' : 'Once'}</div>
            <div className="metric-label">Playback Mode</div>
          </div>
        </div>
      </div>

      <div className="concept-section">
        <h2>Animation Concepts</h2>
        <div className="concept-grid">
          <div className="info-card">
            <h3>Sprite Sheets</h3>
            <p>
              Combine multiple animation frames into a single image for efficient loading and rendering. 
              Define frame boundaries and organize animations in rows or grids.
            </p>
          </div>
          
          <div className="info-card">
            <h3>Frame-Based Animation</h3>
            <p>
              Display different frames in sequence to create the illusion of movement. 
              Control timing with frame rates and use keyframes for important poses.
            </p>
          </div>
          
          <div className="info-card">
            <h3>Animation States</h3>
            <p>
              Manage different character states like walking, jumping, attacking with separate animations. 
              Handle transitions between states smoothly.
            </p>
          </div>
          
          <div className="info-card">
            <h3>Timing & Interpolation</h3>
            <p>
              Use delta time for consistent animation speed across different frame rates. 
              Consider easing and interpolation for smoother motion.
            </p>
          </div>
        </div>
      </div>

      <div className="code-example">
        <h2>Basic Sprite Animation</h2>
        <div className="code-container">
          <div className="code-header">
            <span className="code-title">SpriteAnimation.ts - Animation Class</span>
          </div>
          <div className="code-content">
            <pre>{`class SpriteAnimation {
  frames: AnimationFrame[];
  frameRate: number;
  currentFrame: number = 0;
  timeAccumulator: number = 0;

  update(deltaTime: number): void {
    if (!this.isPlaying) return;

    this.timeAccumulator += deltaTime;
    const timePerFrame = 1 / this.frameRate;

    if (this.timeAccumulator >= timePerFrame) {
      this.timeAccumulator -= timePerFrame;
      this.currentFrame++;

      if (this.currentFrame >= this.frames.length) {
        if (this.loop) {
          this.currentFrame = 0;
        } else {
          this.currentFrame = this.frames.length - 1;
          this.isFinished = true;
        }
      }
    }
  }

  getCurrentFrame(): AnimationFrame {
    return this.frames[this.currentFrame];
  }
}`}</pre>
          </div>
        </div>
      </div>

      <div className="code-example">
        <h2>Sprite Sheet Rendering</h2>
        <div className="code-container">
          <div className="code-header">
            <span className="code-title">AnimatedSprite.ts - Rendering</span>
          </div>
          <div className="code-content">
            <pre>{`render(ctx: CanvasRenderingContext2D, spriteSheet: HTMLImageElement): void {
  const animation = this.animations.get(this.currentAnimation);
  if (!animation) return;

  const frame = animation.getCurrentFrame();
  
  ctx.save();
  ctx.translate(this.position.x, this.position.y);
  ctx.rotate(this.rotation);
  ctx.scale(this.scale.x, this.scale.y);

  // Draw the specific frame from the sprite sheet
  ctx.drawImage(
    spriteSheet,
    frame.x, frame.y, frame.width, frame.height,  // Source rectangle
    -frame.width / 2, -frame.height / 2,          // Destination position
    frame.width, frame.height                     // Destination size
  );
  
  ctx.restore();
}`}</pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpriteAnimationPage;