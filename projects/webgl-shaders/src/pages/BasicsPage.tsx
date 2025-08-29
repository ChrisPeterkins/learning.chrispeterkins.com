import React, { useState } from 'react'
import ShaderCanvas from '../components/ShaderCanvas'

const BasicsPage: React.FC = () => {
  const [activeExample, setActiveExample] = useState(0)

  const examples = [
    {
      title: 'Hello World - Gradient',
      description: 'The simplest shader - a gradient based on UV coordinates',
      fragmentShader: `
precision mediump float;
varying vec2 v_texCoord;

void main() {
  vec2 uv = v_texCoord;
  vec3 color = vec3(uv.x, uv.y, 0.5);
  gl_FragColor = vec4(color, 1.0);
}`,
    },
    {
      title: 'Time Animation',
      description: 'Using time uniform to create animation',
      fragmentShader: `
precision mediump float;
varying vec2 v_texCoord;
uniform float u_time;

void main() {
  vec2 uv = v_texCoord;
  float r = sin(uv.x * 10.0 + u_time) * 0.5 + 0.5;
  float g = sin(uv.y * 10.0 + u_time * 1.3) * 0.5 + 0.5;
  float b = sin((uv.x + uv.y) * 10.0 + u_time * 0.7) * 0.5 + 0.5;
  gl_FragColor = vec4(r, g, b, 1.0);
}`,
    },
    {
      title: 'Distance Fields',
      description: 'Creating shapes with distance functions',
      fragmentShader: `
precision mediump float;
varying vec2 v_texCoord;
uniform float u_time;

float circle(vec2 uv, vec2 center, float radius) {
  return length(uv - center) - radius;
}

void main() {
  vec2 uv = v_texCoord - 0.5; // Center coordinates
  
  float d = circle(uv, vec2(0.0), 0.2);
  float c = smoothstep(0.01, 0.0, d);
  
  vec3 color = vec3(c);
  gl_FragColor = vec4(color, 1.0);
}`,
    },
    {
      title: 'Color Mixing',
      description: 'Blending colors with mix() function',
      fragmentShader: `
precision mediump float;
varying vec2 v_texCoord;
uniform float u_time;

void main() {
  vec2 uv = v_texCoord;
  
  vec3 colorA = vec3(1.0, 0.0, 0.5);
  vec3 colorB = vec3(0.0, 0.5, 1.0);
  
  float mixValue = (sin(u_time * 2.0) + 1.0) * 0.5;
  vec3 color = mix(colorA, colorB, mixValue);
  
  color *= uv.y; // Vertical gradient
  
  gl_FragColor = vec4(color, 1.0);
}`,
    },
    {
      title: 'Step Functions',
      description: 'Creating sharp transitions with step()',
      fragmentShader: `
precision mediump float;
varying vec2 v_texCoord;
uniform float u_time;

void main() {
  vec2 uv = v_texCoord;
  
  float stripes = step(0.5, fract(uv.x * 10.0));
  float movingLine = step(0.5, fract(uv.y * 10.0 + u_time));
  
  vec3 color = vec3(stripes * movingLine);
  color.r += step(0.8, uv.x);
  color.b += step(0.8, uv.y);
  
  gl_FragColor = vec4(color, 1.0);
}`,
    },
    {
      title: 'Smoothstep Magic',
      description: 'Smooth transitions and anti-aliasing',
      fragmentShader: `
precision mediump float;
varying vec2 v_texCoord;
uniform float u_time;

void main() {
  vec2 uv = v_texCoord;
  vec2 center = vec2(0.5);
  
  float d = distance(uv, center);
  float ring = smoothstep(0.2, 0.21, d) - smoothstep(0.3, 0.31, d);
  
  vec3 color = vec3(ring);
  color.r *= sin(u_time) * 0.5 + 0.5;
  color.g *= cos(u_time * 1.3) * 0.5 + 0.5;
  color.b *= sin(u_time * 0.7) * 0.5 + 0.5;
  
  gl_FragColor = vec4(color, 1.0);
}`,
    },
  ]

  return (
    <div className="basics-page">
      <header className="page-header">
        <h1>GLSL Basics</h1>
        <p className="page-description">
          Learn the fundamentals of GLSL programming. Start with simple concepts and 
          gradually build your understanding of shader mathematics and built-in functions.
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
            fragmentShader={examples[activeExample].fragmentShader}
            animate={true}
          />
          <div className="shader-code">
            <div className="code-header">Fragment Shader</div>
            <pre className="code-block">
              <code>{examples[activeExample].fragmentShader}</code>
            </pre>
          </div>
        </div>
      </section>

      <section className="concepts-section">
        <h2>Key Concepts</h2>
        <div className="concept-grid">
          <div className="concept-card">
            <h3>Coordinates</h3>
            <p>
              UV coordinates (v_texCoord) range from 0 to 1, with (0,0) at the bottom-left 
              and (1,1) at the top-right of the screen.
            </p>
          </div>
          <div className="concept-card">
            <h3>Built-in Functions</h3>
            <p>
              GLSL provides many useful functions like sin(), cos(), mix(), step(), 
              smoothstep(), distance(), and length() for mathematical operations.
            </p>
          </div>
          <div className="concept-card">
            <h3>Uniforms</h3>
            <p>
              Uniforms are variables passed from JavaScript to the shader, like u_time 
              for animations or u_resolution for screen dimensions.
            </p>
          </div>
          <div className="concept-card">
            <h3>Precision</h3>
            <p>
              'precision mediump float' sets the floating-point precision. Use highp for 
              more accuracy or lowp for better performance.
            </p>
          </div>
        </div>
      </section>

      <style jsx>{`
        .basics-page {
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
          padding: 1.5rem;
          overflow-x: auto;
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.9rem;
          line-height: 1.6;
          color: var(--text-primary);
        }

        .concepts-section {
          margin: 3rem 0;
        }

        .concepts-section h2 {
          color: var(--text-primary);
          margin-bottom: 2rem;
        }
      `}</style>
    </div>
  )
}

export default BasicsPage