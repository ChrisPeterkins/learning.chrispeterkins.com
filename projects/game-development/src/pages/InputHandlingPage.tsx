import React, { useEffect, useRef, useState } from 'react';
import { GameEngine } from '../game/GameEngine';
import { Entity } from '../game/Entity';
import { Vector2 } from '../game/Vector2';
import { InputManager } from '../game/InputManager';

const InputHandlingPage: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const inputManagerRef = useRef<InputManager | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  
  const playerRef = useRef<Entity | null>(null);
  const [inputState, setInputState] = useState({
    keysPressed: [] as string[],
    mousePosition: { x: 0, y: 0 },
    mouseButtons: { left: false, right: false, middle: false },
    touchCount: 0,
    movementVector: { x: 0, y: 0 }
  });

  const [gameState, setGameState] = useState({
    score: 0,
    playerSpeed: 200,
    collectibles: 0
  });

  const collectiblesRef = useRef<Entity[]>([]);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    canvas.width = 800;
    canvas.height = 500;

    const engine = GameEngine.create(canvas, {
      targetFPS: 60,
      showFPS: false
    });

    // Create input manager
    const inputManager = new InputManager(canvas);
    inputManagerRef.current = inputManager;

    // Create player entity
    const player = new Entity({
      x: canvas.width / 2 - 15,
      y: canvas.height / 2 - 15,
      width: 30,
      height: 30,
      color: '#4ade80'
    });
    playerRef.current = player;

    // Create collectible entities
    collectiblesRef.current = [];
    createCollectibles(canvas);

    // Update callback
    engine.onUpdate((deltaTime: number) => {
      // Update input manager
      inputManager.update();

      // Handle player movement
      const movement = inputManager.getMovementVector();
      const speed = gameState.playerSpeed;
      
      player.velocity.set(movement.x * speed, movement.y * speed);
      
      // Handle mouse attraction
      if (inputManager.isMouseDown('left')) {
        const mousePos = inputManager.getMousePosition();
        const playerCenter = player.getCenter();
        const direction = Vector2.subtract(
          new Vector2(mousePos.x, mousePos.y),
          playerCenter
        ).normalize();
        
        player.velocity.add(Vector2.multiply(direction, speed * 0.5));
      }

      // Handle jump with space (increase speed temporarily)
      if (inputManager.isJumpPressed()) {
        player.velocity.multiply(2);
      }

      // Update player
      player.update(deltaTime);

      // Keep player on screen
      player.position.x = Math.max(0, Math.min(player.position.x, canvas.width - player.width));
      player.position.y = Math.max(0, Math.min(player.position.y, canvas.height - player.height));

      // Handle collectibles
      collectiblesRef.current.forEach((collectible, index) => {
        collectible.update(deltaTime);
        
        // Check collision with player
        const distance = Vector2.distance(player.getCenter(), collectible.getCenter());
        if (distance < 25) {
          // Collect item
          collectiblesRef.current.splice(index, 1);
          setGameState(prev => ({ ...prev, score: prev.score + 10, collectibles: prev.collectibles + 1 }));
          
          // Create new collectible
          createNewCollectible(canvas);
        }
      });

      // Handle special actions
      if (inputManager.isKeyPressed('KeyR')) {
        // Reset game
        player.position.set(canvas.width / 2 - 15, canvas.height / 2 - 15);
        player.velocity.set(0, 0);
        setGameState(prev => ({ ...prev, score: 0, collectibles: 0 }));
        createCollectibles(canvas);
      }

      // Update input state for display
      const activeKeys: string[] = [];
      ['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowLeft', 'ArrowDown', 'ArrowRight', 'Space'].forEach(key => {
        if (inputManager.isKeyDown(key)) {
          activeKeys.push(key.replace('Key', '').replace('Arrow', ''));
        }
      });

      setInputState({
        keysPressed: activeKeys,
        mousePosition: inputManager.getMousePosition(),
        mouseButtons: {
          left: inputManager.isMouseDown('left'),
          right: inputManager.isMouseDown('right'),
          middle: inputManager.isMouseDown('middle')
        },
        touchCount: inputManager.getTouchCount(),
        movementVector: movement
      });
    });

    // Render callback
    engine.onRender((ctx: CanvasRenderingContext2D) => {
      // Clear with dark background
      ctx.fillStyle = '#0a0f0d';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw grid
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.lineWidth = 1;
      for (let x = 0; x < canvas.width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Render collectibles
      collectiblesRef.current.forEach(collectible => {
        collectible.render(ctx);
        
        // Add glow effect
        const center = collectible.getCenter();
        ctx.save();
        ctx.globalAlpha = 0.3;
        ctx.fillStyle = collectible.color;
        ctx.beginPath();
        ctx.arc(center.x, center.y, 20, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // Render player
      player.render(ctx);
      
      // Add player glow
      const playerCenter = player.getCenter();
      ctx.save();
      ctx.globalAlpha = 0.2;
      ctx.fillStyle = '#4ade80';
      ctx.beginPath();
      ctx.arc(playerCenter.x, playerCenter.y, 25, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Draw velocity vector
      if (player.velocity.magnitude() > 10) {
        ctx.strokeStyle = '#ffd93d';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(playerCenter.x, playerCenter.y);
        ctx.lineTo(
          playerCenter.x + player.velocity.x * 0.1,
          playerCenter.y + player.velocity.y * 0.1
        );
        ctx.stroke();
      }

      // Draw mouse line if left button is down
      if (inputManager.isMouseDown('left')) {
        const mousePos = inputManager.getMousePosition();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(playerCenter.x, playerCenter.y);
        ctx.lineTo(mousePos.x, mousePos.y);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Draw touch points
      const touches = inputManager.getTouches();
      touches.forEach(touch => {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.beginPath();
        ctx.arc(touch.x, touch.y, 20, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#000';
        ctx.font = '12px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`T${touch.id}`, touch.x, touch.y + 4);
      });

      // Draw instructions
      ctx.fillStyle = '#a8bdb2';
      ctx.font = '14px monospace';
      ctx.textAlign = 'left';
      ctx.fillText('WASD/Arrows: Move', 10, canvas.height - 100);
      ctx.fillText('Space: Speed Boost', 10, canvas.height - 85);
      ctx.fillText('Left Click: Mouse Attraction', 10, canvas.height - 70);
      ctx.fillText('R: Reset Game', 10, canvas.height - 55);
      ctx.fillText('Touch: Multi-touch support', 10, canvas.height - 40);
      ctx.fillText(`Score: ${gameState.score} | Collected: ${gameState.collectibles}`, 10, canvas.height - 20);
    });

    engineRef.current = engine;

    return () => {
      inputManager.destroy();
      if (engineRef.current) {
        engineRef.current.stop();
      }
    };
  }, [gameState.playerSpeed]);

  const createCollectibles = (canvas: HTMLCanvasElement) => {
    collectiblesRef.current = [];
    const colors = ['#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899'];
    
    for (let i = 0; i < 5; i++) {
      createNewCollectible(canvas);
    }
  };

  const createNewCollectible = (canvas: HTMLCanvasElement) => {
    const colors = ['#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899'];
    const collectible = new Entity({
      x: Math.random() * (canvas.width - 40) + 20,
      y: Math.random() * (canvas.height - 40) + 20,
      width: 15,
      height: 15,
      color: colors[Math.floor(Math.random() * colors.length)]
    });
    
    // Add some random movement
    collectible.velocity.set(
      (Math.random() - 0.5) * 50,
      (Math.random() - 0.5) * 50
    );
    
    collectiblesRef.current.push(collectible);
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

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Input Handling</h1>
        <p className="page-description">
          Master keyboard, mouse, and touch input handling for responsive gameplay. 
          Learn to create intuitive controls that feel natural and responsive to players.
        </p>
      </div>

      <div className="demo-container">
        <div className="demo-controls">
          <button className="demo-button" onClick={toggleEngine}>
            {isRunning ? 'Pause' : 'Start'} Game
          </button>
          
          <div className="control-group">
            <label htmlFor="player-speed">Player Speed:</label>
            <input
              id="player-speed"
              type="range"
              min="50"
              max="400"
              step="25"
              value={gameState.playerSpeed}
              onChange={(e) => setGameState(prev => ({ ...prev, playerSpeed: Number(e.target.value) }))}
              className="demo-input"
              style={{ width: '120px' }}
            />
            <span>{gameState.playerSpeed}</span>
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
            <div className="metric-value">{inputState.keysPressed.join(', ') || 'None'}</div>
            <div className="metric-label">Active Keys</div>
          </div>
          <div className="metric-card">
            <div className="metric-value">{inputState.mousePosition.x}, {inputState.mousePosition.y}</div>
            <div className="metric-label">Mouse Position</div>
          </div>
          <div className="metric-card">
            <div className="metric-value">
              {Object.entries(inputState.mouseButtons)
                .filter(([_, pressed]) => pressed)
                .map(([button]) => button)
                .join(', ') || 'None'}
            </div>
            <div className="metric-label">Mouse Buttons</div>
          </div>
          <div className="metric-card">
            <div className="metric-value">{inputState.touchCount}</div>
            <div className="metric-label">Active Touches</div>
          </div>
        </div>
      </div>

      <div className="concept-section">
        <h2>Input Handling Concepts</h2>
        <div className="concept-grid">
          <div className="info-card">
            <h3>Event-Driven Input</h3>
            <p>
              Listen to DOM events (keydown, keyup, mousemove) and maintain input state. 
              Track pressed, held, and released states for responsive controls.
            </p>
          </div>
          
          <div className="info-card">
            <h3>Input Polling</h3>
            <p>
              Check input state during each game update cycle. This ensures consistent 
              behavior and allows for complex input combinations and timing.
            </p>
          </div>
          
          <div className="info-card">
            <h3>Multi-Touch Support</h3>
            <p>
              Handle multiple simultaneous touch inputs on mobile devices. 
              Track individual touch points with unique identifiers and gestures.
            </p>
          </div>
          
          <div className="info-card">
            <h3>Input Mapping</h3>
            <p>
              Abstract raw input into game actions. Map multiple keys to the same action 
              (WASD + Arrow keys) for better accessibility and user preference.
            </p>
          </div>
        </div>
      </div>

      <div className="code-example">
        <h2>Input Manager Implementation</h2>
        <div className="code-container">
          <div className="code-header">
            <span className="code-title">InputManager.ts - Core Input</span>
          </div>
          <div className="code-content">
            <pre>{`export class InputManager {
  private keys: Map<string, boolean> = new Map();
  private keysPressed: Map<string, boolean> = new Map();
  
  constructor(canvas: HTMLCanvasElement) {
    document.addEventListener('keydown', this.onKeyDown.bind(this));
    document.addEventListener('keyup', this.onKeyUp.bind(this));
    canvas.addEventListener('mousemove', this.onMouseMove.bind(this));
  }

  private onKeyDown(event: KeyboardEvent): void {
    const key = event.code;
    if (!this.keys.get(key)) {
      this.keysPressed.set(key, true); // First frame pressed
    }
    this.keys.set(key, true); // Held down
  }

  isKeyDown(key: string): boolean {
    return this.keys.get(key) || false;
  }

  isKeyPressed(key: string): boolean {
    return this.keysPressed.get(key) || false;
  }

  update(): void {
    // Clear per-frame states
    this.keysPressed.clear();
  }
}`}</pre>
          </div>
        </div>
      </div>

      <div className="code-example">
        <h2>Touch Input Handling</h2>
        <div className="code-container">
          <div className="code-header">
            <span className="code-title">InputManager.ts - Touch Events</span>
          </div>
          <div className="code-content">
            <pre>{`private onTouchStart(event: TouchEvent): void {
  event.preventDefault();
  const rect = this.canvas.getBoundingClientRect();
  
  for (let i = 0; i < event.changedTouches.length; i++) {
    const touch = event.changedTouches[i];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    
    this.touches.set(touch.identifier, {
      id: touch.identifier,
      x: x,
      y: y,
      startX: x,
      startY: y,
      pressure: touch.force || 1
    });
  }
}

getTouches(): TouchState[] {
  return Array.from(this.touches.values());
}

// Usage in game loop
const touches = inputManager.getTouches();
touches.forEach(touch => {
  // Handle each touch point
  console.log(\`Touch \${touch.id} at (\${touch.x}, \${touch.y})\`);
});`}</pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InputHandlingPage;