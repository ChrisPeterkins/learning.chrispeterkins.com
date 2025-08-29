import React from 'react';
import ShaderEditor from '../components/ShaderEditor';
import { shaderPresets } from '../shaders/presets';

const PlaygroundPage: React.FC = () => {
  const defaultFragmentShader = `precision mediump float;

uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_mouse;

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    
    // Create animated gradient
    vec3 color = 0.5 + 0.5 * cos(u_time + st.xyx + vec3(0, 2, 4));
    
    // Add mouse interaction
    float dist = distance(st, u_mouse * 0.5 + 0.5);
    color *= 1.0 - dist;
    
    gl_FragColor = vec4(color, 1.0);
}`;

  return (
    <div className="playground-page">
      <header className="page-header">
        <h1>Shader Playground</h1>
        <p className="page-description">
          Experiment with GLSL shaders in real-time. Edit the code, see instant results, 
          and explore a gallery of preset effects. Perfect for learning and prototyping.
        </p>
      </header>

      <div className="playground-container">
        <ShaderEditor
          initialFragmentShader={defaultFragmentShader}
          presets={shaderPresets}
        />
      </div>

      <section className="shader-reference">
        <h2>GLSL Quick Reference</h2>
        
        <div className="reference-grid">
          <div className="reference-card">
            <h3>Built-in Variables</h3>
            <div className="reference-content">
              <code className="code-block">
{`// Fragment Shader
gl_FragCoord   // Fragment position
gl_FragColor   // Output color

// Vertex Shader  
gl_Position    // Vertex position
gl_PointSize   // Point size`}
              </code>
            </div>
          </div>

          <div className="reference-card">
            <h3>Common Functions</h3>
            <div className="reference-content">
              <code className="code-block">
{`// Math
abs(), sign(), floor(), ceil()
min(), max(), clamp()
mix(), step(), smoothstep()

// Trigonometry
sin(), cos(), tan()
asin(), acos(), atan()

// Exponential
pow(), exp(), log(), sqrt()

// Geometric
length(), distance()
dot(), cross(), normalize()
reflect(), refract()`}
              </code>
            </div>
          </div>

          <div className="reference-card">
            <h3>Data Types</h3>
            <div className="reference-content">
              <code className="code-block">
{`float a = 1.0;
vec2 b = vec2(1.0, 2.0);
vec3 c = vec3(1.0, 2.0, 3.0);
vec4 d = vec4(1.0, 2.0, 3.0, 4.0);

mat2 m2 = mat2(1.0);
mat3 m3 = mat3(1.0);
mat4 m4 = mat4(1.0);

sampler2D texture;
samplerCube cubemap;`}
              </code>
            </div>
          </div>

          <div className="reference-card">
            <h3>Noise Functions</h3>
            <div className="reference-content">
              <code className="code-block">
{`// Simple random
float random(vec2 st) {
    return fract(sin(dot(st.xy,
        vec2(12.9898,78.233)))
        * 43758.5453123);
}

// Value noise
float noise(vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);
    
    // Smooth interpolation
    vec2 u = f * f * (3.0 - 2.0 * f);
    
    return mix(a, b, u.x) +
           (c - a) * u.y * (1.0 - u.x) +
           (d - b) * u.x * u.y;
}`}
              </code>
            </div>
          </div>

          <div className="reference-card">
            <h3>Distance Fields</h3>
            <div className="reference-content">
              <code className="code-block">
{`// Circle/Sphere
float sdCircle(vec2 p, float r) {
    return length(p) - r;
}

// Box
float sdBox(vec2 p, vec2 b) {
    vec2 d = abs(p) - b;
    return length(max(d, 0.0)) +
           min(max(d.x, d.y), 0.0);
}

// Line segment
float sdSegment(vec2 p, vec2 a, vec2 b) {
    vec2 pa = p - a;
    vec2 ba = b - a;
    float h = clamp(dot(pa, ba) /
                   dot(ba, ba), 0.0, 1.0);
    return length(pa - ba * h);
}`}
              </code>
            </div>
          </div>

          <div className="reference-card">
            <h3>Color Operations</h3>
            <div className="reference-content">
              <code className="code-block">
{`// RGB to HSV
vec3 rgb2hsv(vec3 c) {
    vec4 K = vec4(0.0, -1.0/3.0, 2.0/3.0, -1.0);
    vec4 p = mix(vec4(c.bg, K.wz),
                 vec4(c.gb, K.xy),
                 step(c.b, c.g));
    vec4 q = mix(vec4(p.xyw, c.r),
                 vec4(c.r, p.yzx),
                 step(p.x, c.r));
    float d = q.x - min(q.w, q.y);
    float e = 1.0e-10;
    return vec3(abs(q.z + (q.w - q.y) /
                   (6.0 * d + e)),
                d / (q.x + e), q.x);
}

// HSV to RGB
vec3 hsv2rgb(vec3 c) {
    vec4 K = vec4(1.0, 2.0/3.0, 1.0/3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) *
                6.0 - K.www);
    return c.z * mix(K.xxx,
                    clamp(p - K.xxx, 0.0, 1.0),
                    c.y);
}`}
              </code>
            </div>
          </div>
        </div>

        <div className="tips-section">
          <h3>Performance Tips</h3>
          <ul className="tips-list">
            <li>
              <strong>Avoid branching:</strong> Use step() and smoothstep() instead of if/else
            </li>
            <li>
              <strong>Minimize texture fetches:</strong> Cache texture lookups in variables
            </li>
            <li>
              <strong>Use built-in functions:</strong> They're optimized at the GPU level
            </li>
            <li>
              <strong>Reduce precision when possible:</strong> Use mediump instead of highp
            </li>
            <li>
              <strong>Vectorize operations:</strong> Process multiple components at once
            </li>
            <li>
              <strong>Avoid dependent texture reads:</strong> Don't use one texture to index another
            </li>
          </ul>
        </div>
      </section>
    </div>
  );
};

export default PlaygroundPage;