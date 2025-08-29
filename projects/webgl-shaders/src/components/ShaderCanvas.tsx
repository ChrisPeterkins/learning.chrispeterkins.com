import React, { useRef, useEffect, useState } from 'react'
import { 
  createShader, 
  createProgram, 
  resizeCanvas, 
  setupCanvas,
  setUniforms,
  ShaderUniforms,
  defaultVertexShader 
} from '../utils/webgl'

interface ShaderCanvasProps {
  vertexShader?: string
  fragmentShader: string
  uniforms?: ShaderUniforms
  animate?: boolean
  className?: string
  onError?: (error: string) => void
}

const ShaderCanvas: React.FC<ShaderCanvasProps> = ({
  vertexShader = defaultVertexShader,
  fragmentShader,
  uniforms = {},
  animate = true,
  className = '',
  onError
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()
  const startTimeRef = useRef<number>(Date.now())
  const mouseRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 })
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const gl = setupCanvas(canvas)
    if (!gl) {
      const errorMsg = 'WebGL not supported'
      setError(errorMsg)
      onError?.(errorMsg)
      return
    }

    // Create shaders
    const vShader = createShader(gl, gl.VERTEX_SHADER, vertexShader)
    const fShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShader)

    if (!vShader || !fShader) {
      const errorMsg = 'Shader compilation failed'
      setError(errorMsg)
      onError?.(errorMsg)
      return
    }

    // Create program
    const program = createProgram(gl, vShader, fShader)
    if (!program) {
      const errorMsg = 'Program linking failed'
      setError(errorMsg)
      onError?.(errorMsg)
      return
    }

    gl.useProgram(program)
    setError(null)

    // Set up attributes
    const positionLocation = gl.getAttribLocation(program, 'a_position')
    const texCoordLocation = gl.getAttribLocation(program, 'a_texCoord')

    // Create buffers
    const positionBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      -1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1
    ]), gl.STATIC_DRAW)

    const texCoordBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1
    ]), gl.STATIC_DRAW)

    // Render function
    const render = (time: number = 0) => {
      if (!canvas || !gl || !program) return

      resizeCanvas(canvas)
      gl.viewport(0, 0, canvas.width, canvas.height)

      // Clear canvas
      gl.clearColor(0, 0, 0, 1)
      gl.clear(gl.COLOR_BUFFER_BIT)

      // Use program
      gl.useProgram(program)

      // Set uniforms
      const timeUniform = gl.getUniformLocation(program, 'u_time')
      if (timeUniform) {
        gl.uniform1f(timeUniform, (Date.now() - startTimeRef.current) / 1000)
      }

      const resolutionUniform = gl.getUniformLocation(program, 'u_resolution')
      if (resolutionUniform) {
        gl.uniform2f(resolutionUniform, canvas.width, canvas.height)
      }

      const mouseUniform = gl.getUniformLocation(program, 'u_mouse')
      if (mouseUniform) {
        gl.uniform2f(mouseUniform, mouseRef.current.x, mouseRef.current.y)
      }

      // Apply custom uniforms
      setUniforms(gl, program, uniforms)

      // Bind position buffer
      if (positionLocation >= 0) {
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
        gl.enableVertexAttribArray(positionLocation)
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0)
      }

      // Bind texCoord buffer
      if (texCoordLocation >= 0) {
        gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer)
        gl.enableVertexAttribArray(texCoordLocation)
        gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0)
      }

      // Draw
      gl.drawArrays(gl.TRIANGLES, 0, 6)

      if (animate) {
        animationRef.current = requestAnimationFrame(render)
      }
    }

    // Mouse tracking
    const handleMouseMove = (event: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      mouseRef.current = {
        x: ((event.clientX - rect.left) / rect.width) * 2 - 1,
        y: -((event.clientY - rect.top) / rect.height) * 2 + 1
      }
    }

    const handleMouseLeave = () => {
      mouseRef.current = { x: 0, y: 0 }
    }

    canvas.addEventListener('mousemove', handleMouseMove)
    canvas.addEventListener('mouseleave', handleMouseLeave)

    render()

    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove)
      canvas.removeEventListener('mouseleave', handleMouseLeave)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      gl.deleteProgram(program)
      gl.deleteShader(vShader)
      gl.deleteShader(fShader)
    }
  }, [vertexShader, fragmentShader, uniforms, animate, onError])

  return (
    <>
      <canvas 
        ref={canvasRef} 
        className={`shader-canvas ${className}`}
        style={{ display: error ? 'none' : 'block' }}
      />
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
    </>
  )
}

export default ShaderCanvas