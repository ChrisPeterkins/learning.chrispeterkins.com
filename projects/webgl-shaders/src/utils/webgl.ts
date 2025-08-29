export function createShader(gl: WebGLRenderingContext, type: number, source: string): WebGLShader | null {
  const shader = gl.createShader(type)
  if (!shader) return null

  gl.shaderSource(shader, source)
  gl.compileShader(shader)

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const shaderType = type === gl.VERTEX_SHADER ? 'Vertex' : 'Fragment'
    console.error(`${shaderType} shader compilation error:`, gl.getShaderInfoLog(shader))
    console.error('Shader source:', source)
    gl.deleteShader(shader)
    return null
  }

  return shader
}

export function createProgram(
  gl: WebGLRenderingContext,
  vertexShader: WebGLShader,
  fragmentShader: WebGLShader
): WebGLProgram | null {
  const program = gl.createProgram()
  if (!program) return null

  gl.attachShader(program, vertexShader)
  gl.attachShader(program, fragmentShader)
  gl.linkProgram(program)

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error('Program linking error:', gl.getProgramInfoLog(program))
    console.error('Make sure varying variables match between vertex and fragment shaders')
    gl.deleteProgram(program)
    return null
  }

  return program
}

export function resizeCanvas(canvas: HTMLCanvasElement, multiplier = 1) {
  const width = canvas.clientWidth * multiplier
  const height = canvas.clientHeight * multiplier
  
  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width
    canvas.height = height
    return true
  }
  
  return false
}

export const defaultVertexShader = `
attribute vec2 a_position;
attribute vec2 a_texCoord;
varying vec2 v_texCoord;

void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
  v_texCoord = a_texCoord;
}
`

export const defaultFragmentShader = `
precision mediump float;
varying vec2 v_texCoord;
uniform float u_time;

void main() {
  vec2 uv = v_texCoord;
  vec3 col = 0.5 + 0.5 * cos(u_time + uv.xyx + vec3(0, 2, 4));
  gl_FragColor = vec4(col, 1.0);
}
`

export function setupCanvas(canvas: HTMLCanvasElement): WebGLRenderingContext | null {
  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
  
  if (!gl) {
    console.error('WebGL not supported')
    return null
  }

  // Create a full-screen quad
  const positions = new Float32Array([
    -1, -1,
     1, -1,
    -1,  1,
    -1,  1,
     1, -1,
     1,  1,
  ])

  const texCoords = new Float32Array([
    0, 0,
    1, 0,
    0, 1,
    0, 1,
    1, 0,
    1, 1,
  ])

  // Create position buffer
  const positionBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW)

  // Create texture coordinate buffer
  const texCoordBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, texCoords, gl.STATIC_DRAW)

  return gl as WebGLRenderingContext
}

export interface ShaderUniforms {
  [key: string]: {
    type: 'float' | 'vec2' | 'vec3' | 'vec4' | 'mat4' | 'sampler2D'
    value: number | number[] | WebGLTexture
  }
}

export function setUniforms(
  gl: WebGLRenderingContext,
  program: WebGLProgram,
  uniforms: ShaderUniforms
) {
  Object.entries(uniforms).forEach(([name, uniform]) => {
    const location = gl.getUniformLocation(program, name)
    if (!location) return

    switch (uniform.type) {
      case 'float':
        gl.uniform1f(location, uniform.value as number)
        break
      case 'vec2':
        gl.uniform2fv(location, uniform.value as number[])
        break
      case 'vec3':
        gl.uniform3fv(location, uniform.value as number[])
        break
      case 'vec4':
        gl.uniform4fv(location, uniform.value as number[])
        break
      case 'mat4':
        gl.uniformMatrix4fv(location, false, uniform.value as number[])
        break
      case 'sampler2D':
        // Handle texture binding
        break
    }
  })
}