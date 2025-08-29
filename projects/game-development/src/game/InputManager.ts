export interface MouseState {
  x: number;
  y: number;
  leftButton: boolean;
  rightButton: boolean;
  middleButton: boolean;
  wheelDelta: number;
}

export interface TouchState {
  id: number;
  x: number;
  y: number;
  startX: number;
  startY: number;
  pressure: number;
}

export class InputManager {
  // Keyboard state
  private keys: Map<string, boolean> = new Map();
  private keysPressed: Map<string, boolean> = new Map();
  private keysReleased: Map<string, boolean> = new Map();

  // Mouse state
  private mouse: MouseState = {
    x: 0,
    y: 0,
    leftButton: false,
    rightButton: false,
    middleButton: false,
    wheelDelta: 0
  };
  
  private mousePressed = {
    left: false,
    right: false,
    middle: false
  };

  private mouseReleased = {
    left: false,
    right: false,
    middle: false
  };

  // Touch state
  private touches: Map<number, TouchState> = new Map();
  private canvas: HTMLCanvasElement;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    // Keyboard events
    document.addEventListener('keydown', this.onKeyDown.bind(this));
    document.addEventListener('keyup', this.onKeyUp.bind(this));

    // Mouse events
    this.canvas.addEventListener('mousemove', this.onMouseMove.bind(this));
    this.canvas.addEventListener('mousedown', this.onMouseDown.bind(this));
    this.canvas.addEventListener('mouseup', this.onMouseUp.bind(this));
    this.canvas.addEventListener('wheel', this.onMouseWheel.bind(this));
    this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());

    // Touch events
    this.canvas.addEventListener('touchstart', this.onTouchStart.bind(this));
    this.canvas.addEventListener('touchmove', this.onTouchMove.bind(this));
    this.canvas.addEventListener('touchend', this.onTouchEnd.bind(this));
    this.canvas.addEventListener('touchcancel', this.onTouchEnd.bind(this));
  }

  // Update method to be called each frame
  update(): void {
    // Clear per-frame states
    this.keysPressed.clear();
    this.keysReleased.clear();
    this.mousePressed = { left: false, right: false, middle: false };
    this.mouseReleased = { left: false, right: false, middle: false };
    this.mouse.wheelDelta = 0;
  }

  // Keyboard methods
  private onKeyDown(event: KeyboardEvent): void {
    const key = event.code;
    if (!this.keys.get(key)) {
      this.keysPressed.set(key, true);
    }
    this.keys.set(key, true);
  }

  private onKeyUp(event: KeyboardEvent): void {
    const key = event.code;
    this.keys.set(key, false);
    this.keysReleased.set(key, true);
  }

  isKeyDown(key: string): boolean {
    return this.keys.get(key) || false;
  }

  isKeyPressed(key: string): boolean {
    return this.keysPressed.get(key) || false;
  }

  isKeyReleased(key: string): boolean {
    return this.keysReleased.get(key) || false;
  }

  // Mouse methods
  private onMouseMove(event: MouseEvent): void {
    const rect = this.canvas.getBoundingClientRect();
    this.mouse.x = event.clientX - rect.left;
    this.mouse.y = event.clientY - rect.top;
  }

  private onMouseDown(event: MouseEvent): void {
    switch (event.button) {
      case 0: // Left button
        if (!this.mouse.leftButton) {
          this.mousePressed.left = true;
        }
        this.mouse.leftButton = true;
        break;
      case 1: // Middle button
        if (!this.mouse.middleButton) {
          this.mousePressed.middle = true;
        }
        this.mouse.middleButton = true;
        break;
      case 2: // Right button
        if (!this.mouse.rightButton) {
          this.mousePressed.right = true;
        }
        this.mouse.rightButton = true;
        break;
    }
  }

  private onMouseUp(event: MouseEvent): void {
    switch (event.button) {
      case 0: // Left button
        this.mouse.leftButton = false;
        this.mouseReleased.left = true;
        break;
      case 1: // Middle button
        this.mouse.middleButton = false;
        this.mouseReleased.middle = true;
        break;
      case 2: // Right button
        this.mouse.rightButton = false;
        this.mouseReleased.right = true;
        break;
    }
  }

  private onMouseWheel(event: WheelEvent): void {
    this.mouse.wheelDelta = event.deltaY;
    event.preventDefault();
  }

  getMousePosition(): { x: number; y: number } {
    return { x: this.mouse.x, y: this.mouse.y };
  }

  isMouseDown(button: 'left' | 'right' | 'middle'): boolean {
    switch (button) {
      case 'left': return this.mouse.leftButton;
      case 'right': return this.mouse.rightButton;
      case 'middle': return this.mouse.middleButton;
      default: return false;
    }
  }

  isMousePressed(button: 'left' | 'right' | 'middle'): boolean {
    switch (button) {
      case 'left': return this.mousePressed.left;
      case 'right': return this.mousePressed.right;
      case 'middle': return this.mousePressed.middle;
      default: return false;
    }
  }

  isMouseReleased(button: 'left' | 'right' | 'middle'): boolean {
    switch (button) {
      case 'left': return this.mouseReleased.left;
      case 'right': return this.mouseReleased.right;
      case 'middle': return this.mouseReleased.middle;
      default: return false;
    }
  }

  getMouseWheelDelta(): number {
    return this.mouse.wheelDelta;
  }

  // Touch methods
  private onTouchStart(event: TouchEvent): void {
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

  private onTouchMove(event: TouchEvent): void {
    event.preventDefault();
    const rect = this.canvas.getBoundingClientRect();
    
    for (let i = 0; i < event.changedTouches.length; i++) {
      const touch = event.changedTouches[i];
      const touchState = this.touches.get(touch.identifier);
      
      if (touchState) {
        touchState.x = touch.clientX - rect.left;
        touchState.y = touch.clientY - rect.top;
        touchState.pressure = touch.force || 1;
      }
    }
  }

  private onTouchEnd(event: TouchEvent): void {
    event.preventDefault();
    
    for (let i = 0; i < event.changedTouches.length; i++) {
      const touch = event.changedTouches[i];
      this.touches.delete(touch.identifier);
    }
  }

  getTouches(): TouchState[] {
    return Array.from(this.touches.values());
  }

  getTouchCount(): number {
    return this.touches.size;
  }

  // Utility methods
  getMovementVector(): { x: number; y: number } {
    let x = 0;
    let y = 0;

    // WASD or Arrow keys
    if (this.isKeyDown('KeyW') || this.isKeyDown('ArrowUp')) y -= 1;
    if (this.isKeyDown('KeyS') || this.isKeyDown('ArrowDown')) y += 1;
    if (this.isKeyDown('KeyA') || this.isKeyDown('ArrowLeft')) x -= 1;
    if (this.isKeyDown('KeyD') || this.isKeyDown('ArrowRight')) x += 1;

    return { x, y };
  }

  isActionPressed(): boolean {
    return this.isKeyPressed('Space') || 
           this.isKeyPressed('Enter') || 
           this.isMousePressed('left');
  }

  isJumpPressed(): boolean {
    return this.isKeyPressed('Space') || 
           this.isKeyPressed('KeyW') || 
           this.isKeyPressed('ArrowUp');
  }

  // Clean up event listeners
  destroy(): void {
    document.removeEventListener('keydown', this.onKeyDown.bind(this));
    document.removeEventListener('keyup', this.onKeyUp.bind(this));
    
    this.canvas.removeEventListener('mousemove', this.onMouseMove.bind(this));
    this.canvas.removeEventListener('mousedown', this.onMouseDown.bind(this));
    this.canvas.removeEventListener('mouseup', this.onMouseUp.bind(this));
    this.canvas.removeEventListener('wheel', this.onMouseWheel.bind(this));
    
    this.canvas.removeEventListener('touchstart', this.onTouchStart.bind(this));
    this.canvas.removeEventListener('touchmove', this.onTouchMove.bind(this));
    this.canvas.removeEventListener('touchend', this.onTouchEnd.bind(this));
    this.canvas.removeEventListener('touchcancel', this.onTouchEnd.bind(this));
  }
}