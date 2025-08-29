import React, { useEffect, useRef, useCallback } from 'react';
import { initWebGL, createShaderProgram, createFullscreenQuad, resizeCanvas, fullscreenVertexShader, PerformanceMonitor } from '../utils/webgl';

export interface WebGLCanvasProps {
  fragmentShader: string;
  uniforms?: { [name: string]: any };
  onPerformanceUpdate?: (fps: number, frameTime: number, steps?: number) => void;
  className?: string;
  width?: number;
  height?: number;
  isPlaying?: boolean;
}

const WebGLCanvas: React.FC<WebGLCanvasProps> = ({
  fragmentShader,
  uniforms = {},
  onPerformanceUpdate,
  className = 'shader-canvas',
  width,
  height,
  isPlaying = true
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const programRef = useRef<any>(null);
  const animationRef = useRef<number>(0);
  const performanceRef = useRef<PerformanceMonitor>(new PerformanceMonitor());
  const startTimeRef = useRef<number>(Date.now());
  const mouseRef = useRef<[number, number]>([0, 0]);

  // Extract uniform names from shader
  const extractUniforms = useCallback((shader: string): string[] => {
    const matches = shader.match(/uniform\s+\w+\s+(\w+);/g) || [];
    return matches.map(match => {
      const nameMatch = match.match(/uniform\s+\w+\s+(\w+);/);
      return nameMatch ? nameMatch[1] : '';
    }).filter(Boolean);
  }, []);

  // Initialize WebGL
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const { gl, isSupported } = initWebGL(canvas);
    if (!isSupported || !gl) {
      console.error('WebGL not supported');
      return;
    }

    glRef.current = gl;

    // Mouse tracking
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = [
        (e.clientX - rect.left) / rect.width,
        1.0 - (e.clientY - rect.top) / rect.height
      ];
    };

    canvas.addEventListener('mousemove', handleMouseMove);

    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  // Create shader program when fragment shader changes
  useEffect(() => {
    const gl = glRef.current;
    if (!gl || !fragmentShader) return;

    const uniformNames = extractUniforms(fragmentShader);
    const program = createShaderProgram(
      gl,
      fullscreenVertexShader,
      fragmentShader,
      uniformNames,
      ['a_position']
    );

    if (program) {
      programRef.current = program;
      
      // Create quad buffer
      const quadBuffer = createFullscreenQuad(gl);
      
      // Set up vertex attribute
      gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);
      gl.enableVertexAttribArray(program.attributes.a_position);
      gl.vertexAttribPointer(program.attributes.a_position, 2, gl.FLOAT, false, 0, 0);
    }
  }, [fragmentShader, extractUniforms]);

  // Animation loop
  useEffect(() => {
    const render = (currentTime: number) => {
      const gl = glRef.current;
      const program = programRef.current;
      const canvas = canvasRef.current;

      if (!gl || !program || !canvas) {
        if (isPlaying) {
          animationRef.current = requestAnimationFrame(render);
        }
        return;
      }

      // Resize canvas if needed
      resizeCanvas(canvas, gl);

      // Clear canvas
      gl.clearColor(0.0, 0.0, 0.0, 1.0);
      gl.clear(gl.COLOR_BUFFER_BIT);

      // Use shader program
      gl.useProgram(program.program);

      // Set standard uniforms
      const time = (currentTime - startTimeRef.current) / 1000;
      const resolution = [canvas.width, canvas.height];
      const mouse = mouseRef.current;

      if (program.uniforms.u_resolution) {
        gl.uniform2fv(program.uniforms.u_resolution, resolution);
      }
      if (program.uniforms.u_time) {
        gl.uniform1f(program.uniforms.u_time, time);
      }
      if (program.uniforms.u_mouse) {
        gl.uniform2fv(program.uniforms.u_mouse, mouse);
      }

      // Set custom uniforms
      Object.entries(uniforms).forEach(([name, value]) => {
        const location = program.uniforms[name];
        if (!location) return;

        if (typeof value === 'number') {
          gl.uniform1f(location, value);
        } else if (Array.isArray(value)) {
          switch (value.length) {
            case 2:
              gl.uniform2fv(location, value);
              break;
            case 3:
              gl.uniform3fv(location, value);
              break;
            case 4:
              gl.uniform4fv(location, value);
              break;
          }
        } else if (typeof value === 'boolean') {
          gl.uniform1i(location, value ? 1 : 0);
        }
      });

      // Draw
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

      // Update performance
      if (onPerformanceUpdate) {
        const perf = performanceRef.current.update(currentTime);
        onPerformanceUpdate(perf.fps, perf.frameTime);
      }

      if (isPlaying) {
        animationRef.current = requestAnimationFrame(render);
      }
    };

    if (isPlaying) {
      animationRef.current = requestAnimationFrame(render);
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, uniforms, onPerformanceUpdate]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      width={width}
      height={height}
      style={{
        display: 'block',
        width: width ? `${width}px` : '100%',
        height: height ? `${height}px` : '400px'
      }}
    />
  );
};

export default WebGLCanvas;