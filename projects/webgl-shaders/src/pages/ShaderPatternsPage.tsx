import React, { useState } from 'react'
import ShaderCanvas from '../components/ShaderCanvas'

const ShaderPatternsPage: React.FC = () => {
  const [activeExample, setActiveExample] = useState(0)

  const examples = [
    {
      title: 'Perlin Noise',
      description: 'Smooth organic noise patterns',
      fragmentShader: `
precision mediump float;
varying vec2 v_texCoord;
uniform float u_time;

vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1;
  i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod289(i);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
  m = m*m;
  m = m*m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

void main() {
  vec2 uv = v_texCoord;
  float n = snoise(uv * 3.0 + u_time * 0.3);
  n = (n + 1.0) * 0.5;
  vec3 color = vec3(n) * vec3(0.3, 0.8, 0.6);
  gl_FragColor = vec4(color, 1.0);
}`
    },
    {
      title: 'Fractal Patterns',
      description: 'Julia set fractal visualization',
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
  vec2 c = vec2(0.285, 0.01) + vec2(sin(u_time * 0.5), cos(u_time * 0.3)) * 0.1;
  vec2 z = uv;
  
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
  vec3 color = hsv2rgb(vec3(value * 0.6 + 0.4, 0.8, value));
  gl_FragColor = vec4(color, 1.0);
}`
    },
    {
      title: 'Domain Warping',
      description: 'Distorting space with noise functions',
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

float fbm(vec2 st) {
  float value = 0.0;
  float amplitude = 0.5;
  for(int i = 0; i < 5; i++) {
    value += amplitude * noise(st);
    st *= 2.0;
    amplitude *= 0.5;
  }
  return value;
}

void main() {
  vec2 uv = v_texCoord;
  
  vec2 q = vec2(0.0);
  q.x = fbm(uv + 0.00 * u_time);
  q.y = fbm(uv + vec2(1.0));
  
  vec2 r = vec2(0.0);
  r.x = fbm(uv + 1.0 * q + vec2(1.7, 9.2) + 0.15 * u_time);
  r.y = fbm(uv + 1.0 * q + vec2(8.3, 2.8) + 0.126 * u_time);
  
  float f = fbm(uv + r);
  
  vec3 color = mix(
    vec3(0.1, 0.2, 0.3),
    vec3(0.3, 0.6, 0.4),
    clamp(f * f * 4.0, 0.0, 1.0)
  );
  
  color = mix(
    color,
    vec3(0.0, 0.8, 0.5),
    clamp(length(q), 0.0, 1.0)
  );
  
  color = mix(
    color,
    vec3(0.2, 0.9, 0.6),
    clamp(length(r.x), 0.0, 1.0)
  );
  
  gl_FragColor = vec4(color, 1.0);
}`
    },
    {
      title: 'Reaction Diffusion',
      description: 'Simulating chemical reactions',
      fragmentShader: `
precision mediump float;
varying vec2 v_texCoord;
uniform float u_time;

float random(vec2 st) {
  return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

void main() {
  vec2 uv = v_texCoord;
  vec2 center = vec2(0.5);
  
  // Simplified reaction-diffusion pattern
  float d = length(uv - center);
  float pattern = sin(d * 30.0 - u_time * 2.0);
  pattern *= sin(uv.x * 20.0 + u_time);
  pattern *= sin(uv.y * 20.0 - u_time * 1.3);
  
  // Add some noise
  float n = random(uv * 100.0 + u_time);
  pattern += n * 0.1;
  
  // Create organic look
  pattern = smoothstep(0.0, 0.1, pattern);
  
  vec3 color = vec3(pattern);
  color *= vec3(0.2, 0.9, 0.6);
  
  gl_FragColor = vec4(color, 1.0);
}`
    },
    {
      title: 'Cellular Automata',
      description: 'Conway\'s Game of Life inspired pattern',
      fragmentShader: `
precision mediump float;
varying vec2 v_texCoord;
uniform float u_time;

float random(vec2 st) {
  return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

float cell(vec2 coord, float time) {
  return step(0.5, random(floor(coord) + floor(time)));
}

void main() {
  vec2 uv = v_texCoord;
  vec2 grid = uv * 20.0;
  
  float c = cell(grid, u_time * 2.0);
  
  // Add neighboring cells influence
  c += cell(grid + vec2(1.0, 0.0), u_time * 2.0) * 0.3;
  c += cell(grid + vec2(-1.0, 0.0), u_time * 2.0) * 0.3;
  c += cell(grid + vec2(0.0, 1.0), u_time * 2.0) * 0.3;
  c += cell(grid + vec2(0.0, -1.0), u_time * 2.0) * 0.3;
  
  c = step(0.5, c / 2.2);
  
  vec3 color = vec3(c);
  color *= vec3(0.3, 0.8, 0.6);
  
  // Grid lines
  vec2 gridLines = fract(grid);
  float lines = step(0.98, max(gridLines.x, gridLines.y));
  color = mix(color, vec3(0.1, 0.2, 0.15), lines * 0.3);
  
  gl_FragColor = vec4(color, 1.0);
}`
    },
    {
      title: 'Raymarching SDF',
      description: 'Complex 3D shapes with distance fields',
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

float sdTorus(vec3 p, vec2 t) {
  vec2 q = vec2(length(p.xz) - t.x, p.y);
  return length(q) - t.y;
}

float opUnion(float d1, float d2) {
  return min(d1, d2);
}

float opSmoothUnion(float d1, float d2, float k) {
  float h = clamp(0.5 + 0.5 * (d2 - d1) / k, 0.0, 1.0);
  return mix(d2, d1, h) - k * h * (1.0 - h);
}

mat3 rotateY(float theta) {
  float c = cos(theta);
  float s = sin(theta);
  return mat3(c, 0, s, 0, 1, 0, -s, 0, c);
}

float map(vec3 p) {
  p = rotateY(u_time) * p;
  
  float sphere = sdSphere(p, 0.3);
  float box = sdBox(p - vec3(0.0, 0.0, 0.0), vec3(0.2));
  float torus = sdTorus(p, vec2(0.25, 0.1));
  
  return opSmoothUnion(opSmoothUnion(sphere, box, 0.1), torus, 0.1);
}

vec3 getNormal(vec3 p) {
  float e = 0.001;
  return normalize(vec3(
    map(p + vec3(e, 0, 0)) - map(p - vec3(e, 0, 0)),
    map(p + vec3(0, e, 0)) - map(p - vec3(0, e, 0)),
    map(p + vec3(0, 0, e)) - map(p - vec3(0, 0, e))
  ));
}

void main() {
  vec2 uv = (v_texCoord - 0.5) * 2.0;
  
  vec3 ro = vec3(0.0, 0.0, 2.0);
  vec3 rd = normalize(vec3(uv, -1.0));
  
  float t = 0.0;
  vec3 col = vec3(0.0);
  
  for(int i = 0; i < 100; i++) {
    vec3 p = ro + rd * t;
    float d = map(p);
    
    if(d < 0.001) {
      vec3 n = getNormal(p);
      vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));
      float diff = max(dot(n, lightDir), 0.0);
      col = vec3(0.3, 0.8, 0.6) * diff;
      break;
    }
    
    t += d;
    if(t > 10.0) break;
  }
  
  gl_FragColor = vec4(col, 1.0);
}`
    }
  ]

  return (
    <div className="patterns-page">
      <header className="page-header">
        <h1>Shader Patterns</h1>
        <p className="page-description">
          Master advanced shader patterns including noise functions, fractals, raymarching, 
          and complex mathematical visualizations.
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
        <h2>Advanced Techniques</h2>
        <div className="concept-grid">
          <div className="concept-card">
            <h3>Noise Functions</h3>
            <p>
              Perlin, Simplex, and Value noise create organic patterns. Layer multiple 
              octaves for fractal Brownian motion (fBm).
            </p>
          </div>
          <div className="concept-card">
            <h3>Distance Fields</h3>
            <p>
              Signed Distance Functions (SDFs) describe shapes implicitly, enabling 
              complex boolean operations and smooth blending.
            </p>
          </div>
          <div className="concept-card">
            <h3>Fractals</h3>
            <p>
              Self-similar patterns like Mandelbrot and Julia sets reveal infinite 
              complexity through recursive mathematical functions.
            </p>
          </div>
          <div className="concept-card">
            <h3>Domain Warping</h3>
            <p>
              Distort coordinate space using noise or other functions to create 
              organic, flowing patterns and textures.
            </p>
          </div>
        </div>
      </section>

      <style jsx>{`
        .patterns-page {
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
          max-height: 400px;
          overflow-y: auto;
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

export default ShaderPatternsPage