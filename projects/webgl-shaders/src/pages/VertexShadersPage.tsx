import React, { useState } from 'react'
import ShaderCanvas from '../components/ShaderCanvas'

const VertexShadersPage: React.FC = () => {
  const [activeExample, setActiveExample] = useState(0)

  const examples = [
    {
      title: 'Wave Animation',
      description: 'Displacing vertices to create wave effects',
      vertexShader: `
attribute vec2 a_position;
attribute vec2 a_texCoord;
varying vec2 v_texCoord;
uniform float u_time;

void main() {
  v_texCoord = a_texCoord;
  vec2 pos = a_position;
  
  // Create wave effect
  float wave = sin(a_position.x * 5.0 + u_time * 2.0) * 0.1;
  pos.y += wave;
  
  gl_Position = vec4(pos, 0.0, 1.0);
}`,
      fragmentShader: `
precision mediump float;
varying vec2 v_texCoord;
uniform float u_time;

void main() {
  vec2 uv = v_texCoord;
  vec3 color = vec3(uv.x, uv.y, sin(u_time) * 0.5 + 0.5);
  gl_FragColor = vec4(color, 1.0);
}`
    },
    {
      title: 'Vertex Displacement',
      description: 'Morphing geometry with vertex manipulation',
      vertexShader: `
attribute vec2 a_position;
attribute vec2 a_texCoord;
varying vec2 v_texCoord;
uniform float u_time;

void main() {
  v_texCoord = a_texCoord;
  vec2 pos = a_position;
  
  // Circular displacement
  float dist = length(a_position);
  float displacement = sin(dist * 10.0 - u_time * 3.0) * 0.1;
  pos *= 1.0 + displacement;
  
  gl_Position = vec4(pos, 0.0, 1.0);
}`,
      fragmentShader: `
precision mediump float;
varying vec2 v_texCoord;

void main() {
  vec2 uv = v_texCoord;
  float d = length(uv - 0.5);
  vec3 color = mix(vec3(0.1, 0.8, 0.5), vec3(0.2, 0.3, 0.8), d);
  gl_FragColor = vec4(color, 1.0);
}`
    },
    {
      title: 'Twist Effect',
      description: 'Rotating vertices based on distance',
      vertexShader: `
attribute vec2 a_position;
attribute vec2 a_texCoord;
varying vec2 v_texCoord;
uniform float u_time;

mat2 rotate2d(float angle) {
  return mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
}

void main() {
  v_texCoord = a_texCoord;
  vec2 pos = a_position;
  
  // Twist based on distance from center
  float dist = length(pos);
  float angle = dist * 3.0 + u_time;
  pos = rotate2d(angle) * pos;
  
  gl_Position = vec4(pos, 0.0, 1.0);
}`,
      fragmentShader: `
precision mediump float;
varying vec2 v_texCoord;

void main() {
  vec2 uv = v_texCoord;
  vec3 color = vec3(fract(uv * 5.0), 0.5);
  gl_FragColor = vec4(color, 1.0);
}`
    },
    {
      title: 'Ripple Effect',
      description: 'Concentric ripples from center',
      vertexShader: `
attribute vec2 a_position;
attribute vec2 a_texCoord;
varying vec2 v_texCoord;
uniform float u_time;

void main() {
  v_texCoord = a_texCoord;
  vec2 pos = a_position;
  
  // Ripple effect
  float dist = length(pos);
  float ripple = sin(dist * 20.0 - u_time * 5.0) * 0.05;
  ripple *= max(0.0, 1.0 - dist);
  pos.y += ripple;
  
  gl_Position = vec4(pos, 0.0, 1.0);
}`,
      fragmentShader: `
precision mediump float;
varying vec2 v_texCoord;
uniform float u_time;

void main() {
  vec2 uv = v_texCoord;
  float rings = sin(length(uv - 0.5) * 30.0 - u_time * 3.0);
  vec3 color = vec3(rings * 0.5 + 0.5) * vec3(0.3, 0.8, 0.6);
  gl_FragColor = vec4(color, 1.0);
}`
    },
    {
      title: 'Noise Displacement',
      description: 'Using noise for organic vertex animation',
      vertexShader: `
attribute vec2 a_position;
attribute vec2 a_texCoord;
varying vec2 v_texCoord;
uniform float u_time;

float random(vec2 st) {
  return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

float noise(vec2 st) {
  vec2 i = floor(st);
  vec2 f = fract(st);
  float a = random(i);
  float b = random(i + vec2(1.0, 0.0));
  float c = random(i + vec2(0.0, 1.0));
  float d = random(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

void main() {
  v_texCoord = a_texCoord;
  vec2 pos = a_position;
  
  // Noise displacement
  float n = noise(pos * 5.0 + u_time * 0.5);
  pos += vec2(n * 0.1 - 0.05);
  
  gl_Position = vec4(pos, 0.0, 1.0);
}`,
      fragmentShader: `
precision mediump float;
varying vec2 v_texCoord;

void main() {
  vec2 uv = v_texCoord;
  vec3 color = vec3(uv, 0.5 + uv.x * uv.y);
  gl_FragColor = vec4(color, 1.0);
}`
    }
  ]

  return (
    <div className="vertex-page">
      <header className="page-header">
        <h1>Vertex Shaders</h1>
        <p className="page-description">
          Vertex shaders transform the position of vertices in 3D space. Learn to create 
          waves, morphing effects, and dynamic geometry transformations.
        </p>
      </header>

      <section className="examples-section">
        <div className="example-tabs">
          {examples.map((example, index) => (
            <button
              key={index}
              className={`example-tab ${activeExample === index ? 'active' : ''}`}
              onClick={() => setActiveExample(index)}
            >
              {example.title}
            </button>
          ))}
        </div>

        <div className="shader-container">
          <div className="shader-header">
            <span className="shader-title">{examples[activeExample].title}</span>
            <span className="shader-description">{examples[activeExample].description}</span>
          </div>
          <ShaderCanvas 
            vertexShader={examples[activeExample].vertexShader}
            fragmentShader={examples[activeExample].fragmentShader}
            animate={true}
          />
          <div className="shader-code">
            <div className="code-tabs">
              <div className="code-panel">
                <div className="code-header">Vertex Shader</div>
                <pre className="code-block">
                  <code>{examples[activeExample].vertexShader}</code>
                </pre>
              </div>
              <div className="code-panel">
                <div className="code-header">Fragment Shader</div>
                <pre className="code-block">
                  <code>{examples[activeExample].fragmentShader}</code>
                </pre>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="concepts-section">
        <h2>Vertex Shader Concepts</h2>
        <div className="concept-grid">
          <div className="concept-card">
            <h3>Vertex Attributes</h3>
            <p>
              Attributes like position, texture coordinates, and normals are per-vertex 
              data passed from the CPU to the GPU.
            </p>
          </div>
          <div className="concept-card">
            <h3>Transformation Matrices</h3>
            <p>
              Use matrices for rotation, scaling, and translation. Combine multiple 
              transformations by multiplying matrices.
            </p>
          </div>
          <div className="concept-card">
            <h3>Varying Variables</h3>
            <p>
              Variables passed from vertex to fragment shader are interpolated across 
              the surface of the triangle.
            </p>
          </div>
          <div className="concept-card">
            <h3>Performance</h3>
            <p>
              Vertex shaders run once per vertex, so complex meshes with many vertices 
              will be more expensive to transform.
            </p>
          </div>
        </div>
      </section>

      <style jsx>{`
        .vertex-page {
          max-width: 1200px;
        }

        .examples-section {
          margin: 3rem 0;
        }

        .example-tabs {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
          margin-bottom: 2rem;
        }

        .example-tab {
          padding: 0.75rem 1.5rem;
          background: rgba(26, 93, 58, 0.1);
          border: 1px solid rgba(26, 93, 58, 0.3);
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 0.9rem;
        }

        .example-tab:hover {
          background: rgba(26, 93, 58, 0.2);
          color: var(--text-primary);
        }

        .example-tab.active {
          background: rgba(26, 93, 58, 0.3);
          border-color: var(--accent-green);
          color: var(--accent-green-bright);
        }

        .shader-description {
          color: var(--text-secondary);
          font-size: 0.9rem;
        }

        .shader-code {
          background: rgba(0, 0, 0, 0.3);
          border-top: 1px solid var(--border-primary);
        }

        .code-tabs {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1px;
          background: var(--border-primary);
        }

        .code-panel {
          background: var(--code-bg);
        }

        .code-header {
          padding: 0.75rem 1rem;
          background: rgba(0, 0, 0, 0.2);
          color: var(--text-muted);
          font-size: 0.85rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          border-bottom: 1px solid var(--border-primary);
        }

        .code-block {
          padding: 1rem;
          overflow-x: auto;
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.85rem;
          line-height: 1.5;
          color: var(--text-primary);
          max-height: 300px;
          overflow-y: auto;
        }

        .concepts-section {
          margin: 3rem 0;
        }

        .concepts-section h2 {
          color: var(--text-primary);
          margin-bottom: 2rem;
        }

        @media (max-width: 768px) {
          .code-tabs {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  )
}

export default VertexShadersPage