/**
 * WebGL utility functions for shader compilation, program creation, and error handling
 */

export interface ShaderProgram {
  program: WebGLProgram;
  uniforms: { [name: string]: WebGLUniformLocation };
  attributes: { [name: string]: number };
}

export interface WebGLContext {
  gl: WebGLRenderingContext;
  canvas: HTMLCanvasElement;
  isSupported: boolean;
}

/**
 * Initialize WebGL context with proper error handling
 */
export function initWebGL(canvas: HTMLCanvasElement): WebGLContext {
  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  
  if (!gl) {
    console.warn('WebGL not supported');
    return { gl: null as any, canvas, isSupported: false };
  }
  
  // Enable required extensions
  const extensions = [
    'OES_texture_float',
    'OES_texture_half_float',
    'WEBGL_depth_texture'
  ];
  
  extensions.forEach(name => {
    const ext = (gl as WebGLRenderingContext).getExtension(name);
    if (!ext) {
      console.warn(`Extension ${name} not supported`);
    }
  });
  
  return { gl: gl as WebGLRenderingContext, canvas, isSupported: true };
}

/**
 * Compile a shader from source code
 */
export function compileShader(gl: WebGLRenderingContext, source: string, type: number): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;
  
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const info = gl.getShaderInfoLog(shader);
    console.error(`Shader compilation error: ${info}`);
    gl.deleteShader(shader);
    return null;
  }
  
  return shader;
}

/**
 * Create and link a shader program
 */
export function createShaderProgram(
  gl: WebGLRenderingContext,
  vertexSource: string,
  fragmentSource: string,
  uniforms: string[] = [],
  attributes: string[] = []
): ShaderProgram | null {
  const vertexShader = compileShader(gl, vertexSource, gl.VERTEX_SHADER);
  const fragmentShader = compileShader(gl, fragmentSource, gl.FRAGMENT_SHADER);
  
  if (!vertexShader || !fragmentShader) return null;
  
  const program = gl.createProgram();
  if (!program) return null;
  
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const info = gl.getProgramInfoLog(program);
    console.error(`Program linking error: ${info}`);
    gl.deleteProgram(program);
    return null;
  }
  
  // Clean up shaders
  gl.deleteShader(vertexShader);
  gl.deleteShader(fragmentShader);
  
  // Get uniform locations
  const uniformLocations: { [name: string]: WebGLUniformLocation } = {};
  uniforms.forEach(name => {
    const location = gl.getUniformLocation(program, name);
    if (location) {
      uniformLocations[name] = location;
    }
  });
  
  // Get attribute locations
  const attributeLocations: { [name: string]: number } = {};
  attributes.forEach(name => {
    const location = gl.getAttribLocation(program, name);
    if (location !== -1) {
      attributeLocations[name] = location;
    }
  });
  
  return {
    program,
    uniforms: uniformLocations,
    attributes: attributeLocations
  };
}

/**
 * Create a full-screen quad for fragment shader rendering
 */
export function createFullscreenQuad(gl: WebGLRenderingContext): WebGLBuffer {
  const vertices = new Float32Array([
    -1, -1,
     1, -1,
    -1,  1,
     1,  1,
  ]);
  
  const buffer = gl.createBuffer();
  if (!buffer) throw new Error('Failed to create buffer');
  
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
  
  return buffer;
}

/**
 * Resize canvas and viewport to match display size
 */
export function resizeCanvas(canvas: HTMLCanvasElement, gl: WebGLRenderingContext): boolean {
  const displayWidth = canvas.clientWidth;
  const displayHeight = canvas.clientHeight;
  
  if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
    canvas.width = displayWidth;
    canvas.height = displayHeight;
    gl.viewport(0, 0, displayWidth, displayHeight);
    return true;
  }
  
  return false;
}

/**
 * Performance monitoring utilities
 */
export class PerformanceMonitor {
  private frameCount = 0;
  private lastTime = 0;
  private fps = 0;
  private frameTime = 0;
  
  update(currentTime: number): { fps: number; frameTime: number } {
    this.frameCount++;
    
    if (currentTime - this.lastTime >= 1000) {
      this.fps = this.frameCount;
      this.frameTime = (currentTime - this.lastTime) / this.frameCount;
      this.frameCount = 0;
      this.lastTime = currentTime;
    }
    
    return { fps: this.fps, frameTime: this.frameTime };
  }
}

/**
 * Error handling wrapper for WebGL operations
 */
export function withErrorHandling<T>(
  operation: () => T,
  errorMessage: string = 'WebGL operation failed'
): T | null {
  try {
    return operation();
  } catch (error) {
    console.error(`${errorMessage}:`, error);
    return null;
  }
}

/**
 * Common vertex shader for full-screen effects
 */
export const fullscreenVertexShader = `
  attribute vec2 a_position;
  varying vec2 v_texCoord;
  
  void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
    v_texCoord = a_position * 0.5 + 0.5;
  }
`;

/**
 * Load texture from ImageData or HTMLImageElement
 */
export function createTexture(
  gl: WebGLRenderingContext,
  source: ImageData | HTMLImageElement | HTMLCanvasElement,
  format: number = gl.RGBA,
  type: number = gl.UNSIGNED_BYTE
): WebGLTexture | null {
  const texture = gl.createTexture();
  if (!texture) return null;
  
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, format, format, type, source as any);
  
  // Set texture parameters
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  
  return texture;
}

/**
 * Create a framebuffer with texture attachment
 */
export function createFramebuffer(
  gl: WebGLRenderingContext,
  width: number,
  height: number,
  format: number = gl.RGBA,
  type: number = gl.UNSIGNED_BYTE
): { framebuffer: WebGLFramebuffer; texture: WebGLTexture } | null {
  const framebuffer = gl.createFramebuffer();
  const texture = gl.createTexture();
  
  if (!framebuffer || !texture) return null;
  
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, format, width, height, 0, format, type, null);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  
  gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
  
  if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) {
    console.error('Framebuffer not complete');
    return null;
  }
  
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  return { framebuffer, texture };
}

/**
 * Matrix utilities for camera transforms
 */
export class Mat4 {
  static identity(): number[] {
    return [
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1
    ];
  }
  
  static perspective(fovy: number, aspect: number, near: number, far: number): number[] {
    const f = Math.tan(Math.PI * 0.5 - 0.5 * fovy);
    const rangeInv = 1.0 / (near - far);
    
    return [
      f / aspect, 0, 0, 0,
      0, f, 0, 0,
      0, 0, (near + far) * rangeInv, -1,
      0, 0, near * far * rangeInv * 2, 0
    ];
  }
  
  static lookAt(eye: number[], target: number[], up: number[]): number[] {
    const zAxis = normalize(subtract(eye, target));
    const xAxis = normalize(cross(up, zAxis));
    const yAxis = normalize(cross(zAxis, xAxis));
    
    return [
      xAxis[0], xAxis[1], xAxis[2], 0,
      yAxis[0], yAxis[1], yAxis[2], 0,
      zAxis[0], zAxis[1], zAxis[2], 0,
      eye[0], eye[1], eye[2], 1,
    ];
  }
}

function normalize(v: number[]): number[] {
  const length = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
  return length > 0 ? [v[0] / length, v[1] / length, v[2] / length] : [0, 0, 0];
}

function cross(a: number[], b: number[]): number[] {
  return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
}

function subtract(a: number[], b: number[]): number[] {
  return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}