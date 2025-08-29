import React, { useState } from 'react'
import ShaderCanvas from '../components/ShaderCanvas'

const FragmentShadersPage: React.FC = () => {
  const [activeExample, setActiveExample] = useState(0)

  const examples = [
    {
      title: 'Procedural Patterns',
      description: 'Creating patterns with mathematical functions',
      fragmentShader: `
precision mediump float;
varying vec2 v_texCoord;
uniform float u_time;

void main() {
  vec2 uv = v_texCoord * 10.0;
  
  float pattern = sin(uv.x) * sin(uv.y);
  pattern = abs(pattern);
  pattern = step(0.2, pattern);
  
  vec3 color = vec3(pattern);
  color *= vec3(0.5, 0.8, 1.0);
  
  gl_FragColor = vec4(color, 1.0);
}`,
    },
    {
      title: 'Noise Patterns',
      description: 'Pseudo-random noise generation',
      fragmentShader: `
precision mediump float;
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
  vec2 uv = v_texCoord;
  
  float n = noise(uv * 10.0 + u_time);
  n += noise(uv * 20.0 + u_time * 0.5) * 0.5;
  n += noise(uv * 40.0 + u_time * 0.25) * 0.25;
  n /= 1.75;
  
  vec3 color = vec3(n);
  color *= vec3(0.8, 0.6, 1.0);
  
  gl_FragColor = vec4(color, 1.0);
}`,
    },
    {
      title: 'Ray Marching',
      description: 'Creating 3D shapes in 2D',
      fragmentShader: `
precision mediump float;
varying vec2 v_texCoord;
uniform float u_time;

float sdSphere(vec3 p, float r) {
  return length(p) - r;
}

float sdBox(vec3 p, vec3 b) {
  vec3 q = abs(p) - b;
  return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0);
}

float map(vec3 p) {
  float sphere = sdSphere(p - vec3(sin(u_time), 0.0, 0.0), 0.3);
  float box = sdBox(p - vec3(-sin(u_time), 0.0, 0.0), vec3(0.2));
  return min(sphere, box);
}

void main() {
  vec2 uv = (v_texCoord - 0.5) * 2.0;
  
  vec3 ro = vec3(0.0, 0.0, 2.0); // Ray origin
  vec3 rd = normalize(vec3(uv, -1.0)); // Ray direction
  
  float t = 0.0;
  for(int i = 0; i < 100; i++) {
    vec3 p = ro + rd * t;
    float d = map(p);
    if(d < 0.001) break;
    t += d;
    if(t > 10.0) break;
  }
  
  vec3 color = vec3(0.0);
  if(t < 10.0) {
    color = vec3(1.0 - t * 0.1);
  }
  
  gl_FragColor = vec4(color, 1.0);
}`,
    },
    {
      title: 'Fractals',
      description: 'Mandelbrot set visualization',
      fragmentShader: `
precision mediump float;
varying vec2 v_texCoord;
uniform float u_time;

vec3 hsv2rgb(vec3 c) {
  vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

void main() {
  vec2 uv = (v_texCoord - 0.5) * 3.0;
  float zoom = sin(u_time * 0.5) * 0.5 + 1.5;
  uv *= zoom;
  
  vec2 c = uv;
  vec2 z = vec2(0.0);
  
  int iterations = 0;
  const int maxIterations = 100;
  
  for(int i = 0; i < maxIterations; i++) {
    if(length(z) > 2.0) break;
    
    float x = z.x * z.x - z.y * z.y + c.x;
    float y = 2.0 * z.x * z.y + c.y;
    z = vec2(x, y);
    iterations++;
  }
  
  float value = float(iterations) / float(maxIterations);
  vec3 color = hsv2rgb(vec3(value * 0.5 + u_time * 0.1, 0.8, value));
  
  gl_FragColor = vec4(color, 1.0);
}`,
    },
    {
      title: 'Metaballs',
      description: 'Organic blob shapes',
      fragmentShader: `
precision mediump float;
varying vec2 v_texCoord;
uniform float u_time;

float metaball(vec2 uv, vec2 center, float radius) {
  return radius / length(uv - center);
}

void main() {
  vec2 uv = v_texCoord - 0.5;
  
  float m = 0.0;
  m += metaball(uv, vec2(sin(u_time) * 0.3, cos(u_time) * 0.3), 0.05);
  m += metaball(uv, vec2(cos(u_time * 1.3) * 0.2, sin(u_time * 0.9) * 0.2), 0.04);
  m += metaball(uv, vec2(sin(u_time * 0.7) * 0.25, cos(u_time * 1.1) * 0.25), 0.06);
  m += metaball(uv, vec2(cos(u_time * 0.5) * 0.15, sin(u_time * 1.5) * 0.15), 0.03);
  
  vec3 color = vec3(0.0);
  if(m > 1.0) {
    color = vec3(m - 1.0) * 2.0;
    color *= vec3(0.7, 0.9, 1.0);
  }
  
  gl_FragColor = vec4(color, 1.0);
}`,
    },
  ]

  return (
    <div className="fragment-page">
      <header className="page-header">
        <h1>Fragment Shaders</h1>
        <p className="page-description">
          Fragment shaders determine the color of each pixel on the screen. Learn to create 
          stunning visual effects, patterns, and procedural graphics using per-pixel operations.
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
            <div className="code-header">Fragment Shader Code</div>
            <pre className="code-block">
              <code>{examples[activeExample].fragmentShader}</code>
            </pre>
          </div>
        </div>
      </section>

      <section className="techniques-section">
        <h2>Fragment Shader Techniques</h2>
        <div className="concept-grid">
          <div className="concept-card">
            <h3>Distance Fields</h3>
            <p>
              SDFs (Signed Distance Fields) allow you to create complex shapes and effects 
              by defining the distance to the nearest surface.
            </p>
          </div>
          <div className="concept-card">
            <h3>Noise Functions</h3>
            <p>
              Procedural noise like Perlin noise and Simplex noise create organic, 
              natural-looking patterns and textures.
            </p>
          </div>
          <div className="concept-card">
            <h3>Ray Marching</h3>
            <p>
              A technique for rendering 3D scenes by stepping along rays and checking 
              for intersections with objects.
            </p>
          </div>
          <div className="concept-card">
            <h3>Color Spaces</h3>
            <p>
              Converting between RGB, HSV, and other color spaces allows for more 
              intuitive color manipulation.
            </p>
          </div>
        </div>
      </section>

      <style jsx>{`
        .fragment-page {
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

        .techniques-section {
          margin: 3rem 0;
        }

        .techniques-section h2 {
          color: var(--text-primary);
          margin-bottom: 2rem;
        }
      `}</style>
    </div>
  )
}

export default FragmentShadersPage