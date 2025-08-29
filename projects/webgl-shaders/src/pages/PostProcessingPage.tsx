import React, { useState } from 'react'
import ShaderCanvas from '../components/ShaderCanvas'

const PostProcessingPage: React.FC = () => {
  const [activeExample, setActiveExample] = useState(0)

  const examples = [
    {
      title: 'Gaussian Blur',
      description: 'Smoothing images with Gaussian blur',
      fragmentShader: `
precision mediump float;
varying vec2 v_texCoord;
uniform float u_time;

vec3 getColor(vec2 uv) {
  // Generate a test pattern
  vec3 col = vec3(0.0);
  col += step(0.5, fract(uv.x * 10.0)) * step(0.5, fract(uv.y * 10.0));
  col *= vec3(0.3, 0.8, 0.6);
  
  // Add some animated circles
  float d = length(uv - vec2(0.5 + sin(u_time) * 0.2, 0.5 + cos(u_time) * 0.2));
  col += (1.0 - step(0.1, d)) * vec3(1.0, 0.5, 0.2);
  
  return col;
}

void main() {
  vec2 uv = v_texCoord;
  vec2 texelSize = 1.0 / vec2(800.0, 600.0); // Assumed resolution
  
  vec3 color = vec3(0.0);
  float kernel[9];
  
  // Gaussian kernel
  kernel[0] = 1.0; kernel[1] = 2.0; kernel[2] = 1.0;
  kernel[3] = 2.0; kernel[4] = 4.0; kernel[5] = 2.0;
  kernel[6] = 1.0; kernel[7] = 2.0; kernel[8] = 1.0;
  
  float kernelSum = 16.0;
  
  // Apply blur
  for(int i = -1; i <= 1; i++) {
    for(int j = -1; j <= 1; j++) {
      vec2 offset = vec2(float(i), float(j)) * texelSize * 2.0;
      int index = (i + 1) * 3 + (j + 1);
      color += getColor(uv + offset) * kernel[index];
    }
  }
  
  color /= kernelSum;
  gl_FragColor = vec4(color, 1.0);
}`
    },
    {
      title: 'Bloom Effect',
      description: 'Glowing bright areas',
      fragmentShader: `
precision mediump float;
varying vec2 v_texCoord;
uniform float u_time;

vec3 getScene(vec2 uv) {
  vec3 col = vec3(0.0);
  
  // Create some bright spots
  for(int i = 0; i < 3; i++) {
    float fi = float(i);
    vec2 pos = vec2(
      0.5 + sin(u_time + fi) * 0.3,
      0.5 + cos(u_time * 1.3 + fi * 2.0) * 0.3
    );
    float d = length(uv - pos);
    float brightness = 1.0 - smoothstep(0.0, 0.05, d);
    col += brightness * vec3(0.3 + fi * 0.3, 0.8, 0.6);
  }
  
  return col;
}

vec3 blur(vec2 uv, float amount) {
  vec3 col = vec3(0.0);
  float total = 0.0;
  
  for(float x = -4.0; x <= 4.0; x++) {
    for(float y = -4.0; y <= 4.0; y++) {
      vec2 offset = vec2(x, y) * amount * 0.001;
      float weight = 1.0 - length(vec2(x, y)) * 0.1;
      col += getScene(uv + offset) * weight;
      total += weight;
    }
  }
  
  return col / total;
}

void main() {
  vec2 uv = v_texCoord;
  
  vec3 scene = getScene(uv);
  
  // Extract bright areas
  vec3 bright = max(scene - 0.8, 0.0);
  
  // Blur bright areas
  vec3 bloom = blur(uv, 3.0) * 2.0;
  bloom = max(bloom - 0.5, 0.0);
  
  // Combine
  vec3 color = scene + bloom * 0.5;
  
  gl_FragColor = vec4(color, 1.0);
}`
    },
    {
      title: 'Chromatic Aberration',
      description: 'RGB channel separation effect',
      fragmentShader: `
precision mediump float;
varying vec2 v_texCoord;
uniform float u_time;

vec3 getScene(vec2 uv) {
  // Create test pattern
  vec3 col = vec3(0.0);
  
  // Circles pattern
  float d = length(uv - 0.5);
  col += (1.0 - smoothstep(0.2, 0.21, d)) * vec3(1.0);
  col += (1.0 - smoothstep(0.3, 0.31, d)) * vec3(0.8);
  col += (1.0 - smoothstep(0.4, 0.41, d)) * vec3(0.6);
  
  // Add some detail
  col *= 1.0 + sin(d * 50.0 - u_time * 3.0) * 0.1;
  
  return col;
}

void main() {
  vec2 uv = v_texCoord;
  vec2 center = vec2(0.5);
  vec2 offset = (uv - center);
  
  float aberration = length(offset) * 0.01;
  aberration *= (1.0 + sin(u_time) * 0.5);
  
  // Sample each color channel with different offsets
  float r = getScene(uv + offset * aberration).r;
  float g = getScene(uv).g;
  float b = getScene(uv - offset * aberration).b;
  
  vec3 color = vec3(r, g, b);
  
  // Add vignette
  float vignette = 1.0 - length(offset) * 0.7;
  color *= vignette;
  
  gl_FragColor = vec4(color, 1.0);
}`
    },
    {
      title: 'Color Grading',
      description: 'Cinematic color correction',
      fragmentShader: `
precision mediump float;
varying vec2 v_texCoord;
uniform float u_time;

vec3 getScene(vec2 uv) {
  // Create colorful test scene
  vec3 col = vec3(uv.x, uv.y, sin(u_time) * 0.5 + 0.5);
  
  // Add some variation
  col *= 1.0 + sin(uv.x * 10.0 + u_time) * 0.2;
  col *= 1.0 + cos(uv.y * 10.0 - u_time * 1.3) * 0.2;
  
  return col;
}

vec3 colorGrade(vec3 color) {
  // Lift (shadows)
  vec3 lift = vec3(0.0, 0.05, 0.1);
  
  // Gamma (midtones)
  vec3 gamma = vec3(1.0, 0.95, 0.85);
  
  // Gain (highlights)
  vec3 gain = vec3(1.0, 0.95, 0.9);
  
  // Apply color grading
  color = color * gain + lift;
  color = pow(color, 1.0 / gamma);
  
  // Contrast adjustment
  color = (color - 0.5) * 1.2 + 0.5;
  
  // Saturation adjustment
  float gray = dot(color, vec3(0.299, 0.587, 0.114));
  color = mix(vec3(gray), color, 1.2);
  
  return clamp(color, 0.0, 1.0);
}

void main() {
  vec2 uv = v_texCoord;
  
  vec3 color = getScene(uv);
  
  // Apply color grading
  color = colorGrade(color);
  
  // Film grain
  float grain = (fract(sin(dot(uv, vec2(12.9898, 78.233) * u_time)) * 43758.5453) - 0.5) * 0.03;
  color += grain;
  
  // Vignette
  float vignette = 1.0 - length(uv - 0.5) * 0.5;
  color *= vignette;
  
  gl_FragColor = vec4(color, 1.0);
}`
    },
    {
      title: 'Edge Detection',
      description: 'Sobel edge detection filter',
      fragmentShader: `
precision mediump float;
varying vec2 v_texCoord;
uniform float u_time;

float getIntensity(vec2 uv) {
  // Create test pattern with edges
  float pattern = 0.0;
  
  // Moving squares
  vec2 pos1 = vec2(0.3 + sin(u_time) * 0.1, 0.5);
  vec2 pos2 = vec2(0.7 - sin(u_time * 1.3) * 0.1, 0.5);
  
  float d1 = max(abs(uv.x - pos1.x), abs(uv.y - pos1.y));
  float d2 = max(abs(uv.x - pos2.x), abs(uv.y - pos2.y));
  
  pattern += 1.0 - step(0.1, d1);
  pattern += 1.0 - step(0.15, d2);
  
  // Circle
  float d3 = length(uv - vec2(0.5, 0.5 + sin(u_time * 0.7) * 0.2));
  pattern += 1.0 - step(0.2, d3);
  
  return pattern;
}

void main() {
  vec2 uv = v_texCoord;
  vec2 texelSize = vec2(0.002);
  
  // Sobel X kernel
  float sobelX = 0.0;
  sobelX += getIntensity(uv + vec2(-texelSize.x, -texelSize.y)) * -1.0;
  sobelX += getIntensity(uv + vec2(-texelSize.x, 0.0)) * -2.0;
  sobelX += getIntensity(uv + vec2(-texelSize.x, texelSize.y)) * -1.0;
  sobelX += getIntensity(uv + vec2(texelSize.x, -texelSize.y)) * 1.0;
  sobelX += getIntensity(uv + vec2(texelSize.x, 0.0)) * 2.0;
  sobelX += getIntensity(uv + vec2(texelSize.x, texelSize.y)) * 1.0;
  
  // Sobel Y kernel
  float sobelY = 0.0;
  sobelY += getIntensity(uv + vec2(-texelSize.x, -texelSize.y)) * -1.0;
  sobelY += getIntensity(uv + vec2(0.0, -texelSize.y)) * -2.0;
  sobelY += getIntensity(uv + vec2(texelSize.x, -texelSize.y)) * -1.0;
  sobelY += getIntensity(uv + vec2(-texelSize.x, texelSize.y)) * 1.0;
  sobelY += getIntensity(uv + vec2(0.0, texelSize.y)) * 2.0;
  sobelY += getIntensity(uv + vec2(texelSize.x, texelSize.y)) * 1.0;
  
  float edge = sqrt(sobelX * sobelX + sobelY * sobelY);
  
  vec3 color = vec3(edge) * vec3(0.3, 0.8, 0.6);
  
  gl_FragColor = vec4(color, 1.0);
}`
    },
    {
      title: 'Pixelation & Dithering',
      description: 'Retro pixel art effect',
      fragmentShader: `
precision mediump float;
varying vec2 v_texCoord;
uniform float u_time;

float dither4x4(vec2 position, float brightness) {
  int x = int(mod(position.x, 4.0));
  int y = int(mod(position.y, 4.0));
  
  float DITHER_MATRIX[16];
  DITHER_MATRIX[0] = 0.0;   DITHER_MATRIX[1] = 8.0;   DITHER_MATRIX[2] = 2.0;   DITHER_MATRIX[3] = 10.0;
  DITHER_MATRIX[4] = 12.0;  DITHER_MATRIX[5] = 4.0;   DITHER_MATRIX[6] = 14.0;  DITHER_MATRIX[7] = 6.0;
  DITHER_MATRIX[8] = 3.0;   DITHER_MATRIX[9] = 11.0;  DITHER_MATRIX[10] = 1.0;  DITHER_MATRIX[11] = 9.0;
  DITHER_MATRIX[12] = 15.0; DITHER_MATRIX[13] = 7.0;  DITHER_MATRIX[14] = 13.0; DITHER_MATRIX[15] = 5.0;
  
  int index = y * 4 + x;
  float threshold = DITHER_MATRIX[index] / 16.0;
  
  return step(threshold, brightness);
}

vec3 getScene(vec2 uv) {
  vec3 col = vec3(0.0);
  
  // Gradient
  col = vec3(uv.x, uv.y, sin(u_time) * 0.5 + 0.5);
  
  // Add circles
  float d = length(uv - vec2(0.5 + sin(u_time) * 0.2, 0.5));
  col += (1.0 - smoothstep(0.2, 0.3, d)) * vec3(0.5, 0.8, 0.3);
  
  return col;
}

void main() {
  vec2 uv = v_texCoord;
  
  // Pixelate
  float pixelSize = 4.0;
  vec2 pixelatedUV = floor(uv * 100.0 / pixelSize) * pixelSize / 100.0;
  
  vec3 color = getScene(pixelatedUV);
  
  // Convert to grayscale for dithering
  float gray = dot(color, vec3(0.299, 0.587, 0.114));
  
  // Apply dithering
  vec2 ditherCoord = floor(uv * 400.0);
  float dithered = dither4x4(ditherCoord, gray);
  
  // Apply palette (2-color for simplicity)
  vec3 darkColor = vec3(0.1, 0.2, 0.15);
  vec3 lightColor = vec3(0.3, 0.8, 0.6);
  
  vec3 finalColor = mix(darkColor, lightColor, dithered);
  
  gl_FragColor = vec4(finalColor, 1.0);
}`
    }
  ]

  return (
    <div className="post-page">
      <header className="page-header">
        <h1>Post-Processing Effects</h1>
        <p className="page-description">
          Apply screen-space effects to enhance your renders. Learn bloom, blur, 
          chromatic aberration, and cinematic color grading techniques.
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
            <div className="code-header">Post-Processing Shader</div>
            <pre className="code-block">
              <code>{examples[activeExample].fragmentShader}</code>
            </pre>
          </div>
        </div>
      </section>

      <section className="techniques-section">
        <h2>Post-Processing Pipeline</h2>
        <div className="concept-grid">
          <div className="concept-card">
            <h3>Screen-Space Effects</h3>
            <p>
              Post-processing operates on the final rendered image, applying effects 
              in screen space rather than 3D space.
            </p>
          </div>
          <div className="concept-card">
            <h3>Render Targets</h3>
            <p>
              Use framebuffers to render scenes to textures, then apply multiple 
              post-processing passes for complex effects.
            </p>
          </div>
          <div className="concept-card">
            <h3>Performance</h3>
            <p>
              Post-processing can be expensive. Use lower resolution buffers for 
              effects like blur, then upsample for final output.
            </p>
          </div>
          <div className="concept-card">
            <h3>Combining Effects</h3>
            <p>
              Chain multiple post-processing effects together. Order matters - 
              apply color grading last for consistent results.
            </p>
          </div>
        </div>
      </section>

      <style jsx>{`
        .post-page {
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

export default PostProcessingPage