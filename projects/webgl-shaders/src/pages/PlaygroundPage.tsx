import React, { useState, useCallback } from 'react'
import ShaderCanvas from '../components/ShaderCanvas'

const PlaygroundPage: React.FC = () => {
  const presets = [
    {
      name: 'Rainbow Waves',
      code: `precision mediump float;
varying vec2 v_texCoord;
uniform float u_time;

void main() {
  vec2 uv = v_texCoord;
  vec3 col = 0.5 + 0.5 * cos(u_time + uv.xyx + vec3(0, 2, 4));
  gl_FragColor = vec4(col, 1.0);
}`
    },
    {
      name: 'Plasma',
      code: `precision mediump float;
varying vec2 v_texCoord;
uniform float u_time;

void main() {
  vec2 uv = v_texCoord;
  float v = 0.0;
  v += sin((uv.x + u_time));
  v += sin((uv.y + u_time) / 2.0);
  v += sin((uv.x + uv.y + u_time) / 2.0);
  vec3 col = vec3(sin(v), sin(v + 2.0), sin(v + 4.0)) * 0.5 + 0.5;
  gl_FragColor = vec4(col, 1.0);
}`
    },
    {
      name: 'Spiral',
      code: `precision mediump float;
varying vec2 v_texCoord;
uniform float u_time;

void main() {
  vec2 uv = v_texCoord - 0.5;
  float angle = atan(uv.y, uv.x);
  float radius = length(uv);
  float spiral = sin(angle * 5.0 + radius * 20.0 - u_time * 3.0);
  vec3 color = vec3(spiral) * 0.5 + 0.5;
  color *= 1.0 - radius * 2.0;
  gl_FragColor = vec4(color, 1.0);
}`
    },
    {
      name: 'Matrix Rain',
      code: `precision mediump float;
varying vec2 v_texCoord;
uniform float u_time;

float random(vec2 st) {
  return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

void main() {
  vec2 uv = v_texCoord;
  float cols = 40.0;
  float x = floor(uv.x * cols) / cols;
  float speed = random(vec2(x)) * 0.5 + 0.5;
  float y = fract(uv.y - u_time * speed);
  float val = random(vec2(x, floor(y * 20.0)));
  val *= 1.0 - y;
  vec3 color = vec3(0.0, val, val * 0.5);
  gl_FragColor = vec4(color, 1.0);
}`
    },
    {
      name: 'Voronoi',
      code: `precision mediump float;
varying vec2 v_texCoord;
uniform float u_time;

vec2 random2(vec2 st) {
  st = vec2(dot(st, vec2(127.1, 311.7)), dot(st, vec2(269.5, 183.3)));
  return -1.0 + 2.0 * fract(sin(st) * 43758.5453123);
}

void main() {
  vec2 uv = v_texCoord * 5.0;
  vec2 i_st = floor(uv);
  vec2 f_st = fract(uv);
  
  float m_dist = 1.0;
  
  for(int y = -1; y <= 1; y++) {
    for(int x = -1; x <= 1; x++) {
      vec2 neighbor = vec2(float(x), float(y));
      vec2 point = random2(i_st + neighbor);
      point = 0.5 + 0.5 * sin(u_time + 6.2831 * point);
      vec2 diff = neighbor + point - f_st;
      float dist = length(diff);
      m_dist = min(m_dist, dist);
    }
  }
  
  vec3 color = vec3(m_dist);
  color *= vec3(0.9, 0.6, 1.0);
  gl_FragColor = vec4(color, 1.0);
}`
    }
  ]

  const [code, setCode] = useState(presets[0].code)
  const [activePreset, setActivePreset] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const handlePresetClick = useCallback((index: number) => {
    setActivePreset(index)
    setCode(presets[index].code)
    setError(null)
  }, [])

  const handleCodeChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCode(e.target.value)
    setActivePreset(-1) // Deselect preset when custom code is entered
  }, [])

  const handleError = useCallback((errorMsg: string) => {
    setError(errorMsg)
  }, [])

  return (
    <div className="playground-page">
      <header className="page-header">
        <h1>Shader Playground</h1>
        <p className="page-description">
          Experiment with GLSL shaders in real-time. Edit the code on the left and see 
          your changes instantly rendered on the right. Try the presets or create your own!
        </p>
      </header>

      <div className="playground-layout">
        <div className="editor-section">
          <div className="editor-header">
            <h3>Fragment Shader Editor</h3>
            <div className="editor-controls">
              <button 
                className="copy-button"
                onClick={() => navigator.clipboard.writeText(code)}
              >
                Copy Code
              </button>
            </div>
          </div>
          <textarea
            className="code-editor"
            value={code}
            onChange={handleCodeChange}
            spellCheck={false}
            placeholder="Enter your GLSL code here..."
          />
          {error && (
            <div className="error-message">
              <strong>Shader Error:</strong> {error}
            </div>
          )}
        </div>

        <div className="preview-section">
          <div className="preview-header">
            <h3>Live Preview</h3>
          </div>
          <ShaderCanvas 
            fragmentShader={code}
            animate={true}
            onError={handleError}
            className="playground-canvas"
          />
          
          <div className="presets-section">
            <h4>Presets</h4>
            <div className="preset-buttons">
              {presets.map((preset, index) => (
                <button
                  key={index}
                  className={`preset-button ${activePreset === index ? 'active' : ''}`}
                  onClick={() => handlePresetClick(index)}
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <section className="tips-section">
        <h2>Shader Tips</h2>
        <div className="tips-grid">
          <div className="tip-card">
            <h3>Available Uniforms</h3>
            <ul>
              <li><code>u_time</code> - Time in seconds</li>
              <li><code>u_resolution</code> - Canvas resolution</li>
              <li><code>v_texCoord</code> - UV coordinates (0-1)</li>
            </ul>
          </div>
          <div className="tip-card">
            <h3>Useful Functions</h3>
            <ul>
              <li><code>sin(), cos(), tan()</code> - Trigonometry</li>
              <li><code>mix(), step(), smoothstep()</code> - Interpolation</li>
              <li><code>length(), distance(), dot()</code> - Vector math</li>
            </ul>
          </div>
          <div className="tip-card">
            <h3>Performance Tips</h3>
            <ul>
              <li>Avoid branching (if/else) when possible</li>
              <li>Use built-in functions over custom implementations</li>
              <li>Minimize texture lookups in loops</li>
            </ul>
          </div>
        </div>
      </section>

      <style jsx>{`
        .playground-page {
          max-width: 1400px;
        }

        .playground-layout {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
          margin: 3rem 0;
        }

        .editor-section,
        .preview-section {
          background: var(--bg-secondary);
          border: 1px solid var(--border-primary);
          border-radius: 8px;
          overflow: hidden;
        }

        .editor-header,
        .preview-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 1.5rem;
          background: rgba(0, 0, 0, 0.2);
          border-bottom: 1px solid var(--border-primary);
        }

        .editor-header h3,
        .preview-header h3 {
          color: var(--text-primary);
          font-size: 1.1rem;
        }

        .copy-button {
          padding: 0.5rem 1rem;
          background: rgba(26, 93, 58, 0.1);
          border: 1px solid rgba(26, 93, 58, 0.3);
          color: var(--accent-green-bright);
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 0.85rem;
        }

        .copy-button:hover {
          background: rgba(26, 93, 58, 0.2);
        }

        .code-editor {
          width: 100%;
          height: 500px;
          padding: 1.5rem;
          background: var(--code-bg);
          border: none;
          outline: none;
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.9rem;
          line-height: 1.6;
          color: var(--text-primary);
          resize: vertical;
        }

        .playground-canvas {
          width: 100%;
          height: 400px;
        }

        .presets-section {
          padding: 1.5rem;
          border-top: 1px solid var(--border-primary);
        }

        .presets-section h4 {
          color: var(--text-secondary);
          margin-bottom: 1rem;
          font-size: 0.95rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .tips-section {
          margin: 3rem 0;
        }

        .tips-section h2 {
          color: var(--text-primary);
          margin-bottom: 2rem;
        }

        .tips-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1.5rem;
        }

        .tip-card {
          background: var(--bg-secondary);
          border: 1px solid var(--border-primary);
          padding: 1.5rem;
          border-radius: 8px;
        }

        .tip-card h3 {
          color: var(--accent-green-bright);
          margin-bottom: 1rem;
          font-size: 1.1rem;
        }

        .tip-card ul {
          list-style: none;
          padding: 0;
        }

        .tip-card li {
          color: var(--text-secondary);
          margin: 0.5rem 0;
          padding-left: 1rem;
          position: relative;
        }

        .tip-card li::before {
          content: "→";
          position: absolute;
          left: 0;
          color: var(--accent-green-bright);
        }

        .tip-card code {
          background: rgba(26, 93, 58, 0.1);
          padding: 0.2rem 0.4rem;
          border-radius: 3px;
          font-size: 0.9em;
        }

        @media (max-width: 1024px) {
          .playground-layout {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  )
}

export default PlaygroundPage