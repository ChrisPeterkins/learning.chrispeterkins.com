import React, { useState, useCallback } from 'react';
import { Sparkles, Zap, Star, Layers, Maximize } from 'lucide-react';
import WebGLCanvas from '../components/WebGLCanvas';
import ShaderControls, { ControlParam, SelectParam, ColorParam, BooleanParam } from '../components/ShaderControls';

const fractalsShader = `
#ifdef GL_ES
precision highp float;
#endif

uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_mouse;
uniform int u_fractalType;
uniform float u_power;
uniform int u_iterations;
uniform float u_bailout;
uniform vec3 u_fractalOffset;
uniform float u_fractalScale;
uniform vec3 u_colorA;
uniform vec3 u_colorB;
uniform bool u_enableGlow;

varying vec2 v_texCoord;

#define PI 3.14159265359
#define MAX_STEPS 100
#define MAX_DIST 100.0
#define SURF_DIST 0.001

// Mandelbulb fractal
float mandelbulb(vec3 pos, float power, int iterations, float bailout) {
    vec3 z = pos;
    float dr = 1.0;
    float r = 0.0;
    
    for (int i = 0; i < 50; i++) {
        if (i >= iterations) break;
        
        r = length(z);
        if (r > bailout) break;
        
        // Convert to polar coordinates
        float theta = acos(z.z / r);
        float phi = atan(z.y, z.x);
        dr = pow(r, power - 1.0) * power * dr + 1.0;
        
        // Scale and rotate the point
        float zr = pow(r, power);
        theta = theta * power;
        phi = phi * power;
        
        // Convert back to cartesian coordinates
        z = zr * vec3(
            sin(theta) * cos(phi),
            sin(theta) * sin(phi),
            cos(theta)
        );
        z += pos;
    }
    
    return 0.5 * log(r) * r / dr;
}

// Julia set (3D version)
float julia3D(vec3 pos, vec3 c, int iterations, float bailout) {
    vec3 z = pos;
    float r = 0.0;
    
    for (int i = 0; i < 50; i++) {
        if (i >= iterations) break;
        
        r = length(z);
        if (r > bailout) break;
        
        // z = z^2 + c (generalized for 3D)
        float x = z.x * z.x - z.y * z.y - z.z * z.z + c.x;
        float y = 2.0 * z.x * z.y + c.y;
        float zNew = 2.0 * z.x * z.z + c.z;
        z = vec3(x, y, zNew);
    }
    
    return r - bailout;
}

// Sierpinski tetrahedron
float sierpinski(vec3 p, int iterations) {
    vec3 z = p;
    float scale = 2.0;
    
    for (int i = 0; i < 20; i++) {
        if (i >= iterations) break;
        
        if (z.x + z.y < 0.0) z.xy = -z.yx;
        if (z.x + z.z < 0.0) z.xz = -z.zx;
        if (z.y + z.z < 0.0) z.yz = -z.zy;
        
        z = z * scale - vec3(scale - 1.0);
    }
    
    return (length(z) - 2.0) * pow(scale, -float(iterations));
}

// Menger sponge
float menger(vec3 p, int iterations) {
    vec3 z = p;
    float scale = 3.0;
    
    for (int i = 0; i < 20; i++) {
        if (i >= iterations) break;
        
        z = abs(z);
        if (z.x < z.y) z.xy = z.yx;
        if (z.x < z.z) z.xz = z.zx;
        if (z.y < z.z) z.yz = z.zy;
        
        z = z * scale;
        z -= vec3(scale - 1.0);
        
        if (z.z < -0.5 * (scale - 1.0)) z.z += scale - 1.0;
    }
    
    return (length(z) - 1.5) * pow(scale, -float(iterations));
}

// Kleinian group
float kleinian(vec3 p, int iterations) {
    vec3 z = p;
    float scale = 1.3;
    
    for (int i = 0; i < 20; i++) {
        if (i >= iterations) break;
        
        z = abs(z);
        
        if (z.x - z.y < 0.0) z.xy = z.yx;
        if (z.x - z.z < 0.0) z.xz = z.zx;
        
        z = scale * z - vec3(scale - 1.0);
        
        if (z.z < -0.5 * (scale - 1.0)) z.z += scale - 1.0;
    }
    
    return (length(z) - 1.0) * pow(scale, -float(iterations));
}

// Get fractal SDF based on type
float getFractal(vec3 p, int fractalType) {
    vec3 pos = (p - u_fractalOffset) / u_fractalScale;
    
    if (fractalType == 0) {
        return mandelbulb(pos, u_power, u_iterations, u_bailout) * u_fractalScale;
    } else if (fractalType == 1) {
        return julia3D(pos, vec3(sin(u_time * 0.1), cos(u_time * 0.15), sin(u_time * 0.12)), u_iterations, u_bailout) * u_fractalScale;
    } else if (fractalType == 2) {
        return sierpinski(pos, u_iterations) * u_fractalScale;
    } else if (fractalType == 3) {
        return menger(pos, u_iterations) * u_fractalScale;
    } else if (fractalType == 4) {
        return kleinian(pos, u_iterations) * u_fractalScale;
    }
    
    return mandelbulb(pos, u_power, u_iterations, u_bailout) * u_fractalScale;
}

// Scene SDF
float map(vec3 p) {
    float fractal = getFractal(p, u_fractalType);
    
    // Ground plane
    float ground = p.y + 2.0;
    
    return min(fractal, ground);
}

// Calculate normal
vec3 calcNormal(vec3 p) {
    const float h = 0.001;
    const vec2 k = vec2(1, -1);
    return normalize(
        k.xyy * map(p + k.xyy * h) +
        k.yyx * map(p + k.yyx * h) +
        k.yxy * map(p + k.yxy * h) +
        k.xxx * map(p + k.xxx * h)
    );
}

// Ray marching
vec2 rayMarch(vec3 ro, vec3 rd) {
    float dO = 0.0;
    float minDist = 1.0;
    
    for (int i = 0; i < MAX_STEPS; i++) {
        vec3 p = ro + rd * dO;
        float dS = map(p);
        
        minDist = min(minDist, dS / dO);
        dO += dS;
        
        if (dO > MAX_DIST || abs(dS) < SURF_DIST) break;
    }
    
    return vec2(dO, minDist);
}

// Enhanced lighting with fractal-based coloring
vec3 getColor(vec3 p, vec3 n, vec3 rd, float minDist) {
    vec3 lightPos = vec3(5.0, 10.0, 5.0);
    vec3 lightDir = normalize(lightPos - p);
    
    // Basic lighting
    float diffuse = max(dot(n, lightDir), 0.0);
    float specular = pow(max(dot(reflect(rd, n), lightDir), 0.0), 32.0);
    
    // Fractal-based coloring
    vec3 color;
    if (p.y > -1.9) {
        // Fractal object
        float fractalValue = getFractal(p, u_fractalType);
        float colorMix = sin(fractalValue * 10.0 + u_time) * 0.5 + 0.5;
        color = mix(u_colorA, u_colorB, colorMix);
        
        // Add some iridescence
        color += 0.3 * sin(vec3(1.0, 2.0, 3.0) * fractalValue * 5.0 + u_time);
        color = clamp(color, 0.0, 1.0);
    } else {
        // Ground
        color = vec3(0.3, 0.3, 0.4);
    }
    
    // Apply lighting
    color = color * (0.3 + 0.7 * diffuse) + vec3(0.8, 0.9, 1.0) * specular * 0.3;
    
    // Glow effect
    if (u_enableGlow && p.y > -1.9) {
        float glow = 1.0 / (1.0 + minDist * 50.0);
        color += glow * u_colorA * 0.5;
    }
    
    return color;
}

// Camera matrix
mat3 camera(vec3 ro, vec3 ta, vec3 up) {
    vec3 cw = normalize(ta - ro);
    vec3 cu = normalize(cross(cw, up));
    vec3 cv = normalize(cross(cu, cw));
    return mat3(cu, cv, cw);
}

void main() {
    vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y;
    
    // Dynamic camera
    float cameraDistance = 3.0 + sin(u_time * 0.2) * 0.5;
    float cameraAngle = u_time * 0.1 + u_mouse.x * PI * 2.0;
    float cameraHeight = u_mouse.y * 2.0 - 0.5;
    
    vec3 ro = vec3(
        cos(cameraAngle) * cameraDistance,
        cameraHeight,
        sin(cameraAngle) * cameraDistance
    );
    vec3 ta = vec3(0.0, 0.0, 0.0);
    
    mat3 ca = camera(ro, ta, vec3(0.0, 1.0, 0.0));
    vec3 rd = ca * normalize(vec3(uv, 2.0));
    
    // Ray marching
    vec2 result = rayMarch(ro, rd);
    float t = result.x;
    float minDist = result.y;
    
    // Background gradient
    vec3 bg = mix(vec3(0.05, 0.1, 0.2), vec3(0.1, 0.05, 0.15), uv.y * 0.5 + 0.5);
    vec3 col = bg;
    
    if (t < MAX_DIST) {
        vec3 p = ro + t * rd;
        vec3 n = calcNormal(p);
        
        col = getColor(p, n, rd, minDist);
        
        // Distance fog
        float fogFactor = 1.0 - exp(-0.02 * t);
        col = mix(col, bg, fogFactor);
    }
    
    // Post-processing
    col = pow(col, vec3(0.4545)); // Gamma correction
    col = mix(col, dot(col, vec3(0.299, 0.587, 0.114)) * vec3(1.0), -0.1); // Slight desaturation
    
    gl_FragColor = vec4(col, 1.0);
}
`;

const FractalsPage: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [performance, setPerformance] = useState({ fps: 0, frameTime: 0 });
  
  // Fractal parameters
  const [fractalType, setFractalType] = useState(0);
  const [power, setPower] = useState(8.0);
  const [iterations, setIterations] = useState(15);
  const [bailout, setBailout] = useState(2.0);
  const [fractalScale, setFractalScale] = useState(1.0);
  const [fractalOffset, setFractalOffset] = useState<[number, number, number]>([0, 0, 0]);
  const [colorA, setColorA] = useState<[number, number, number]>([1.0, 0.2, 0.3]);
  const [colorB, setColorB] = useState<[number, number, number]>([0.2, 0.4, 1.0]);
  const [enableGlow, setEnableGlow] = useState(true);

  const handlePerformanceUpdate = useCallback((fps: number, frameTime: number) => {
    setPerformance({ fps, frameTime });
  }, []);

  const handleReset = useCallback(() => {
    setFractalType(0);
    setPower(8.0);
    setIterations(15);
    setBailout(2.0);
    setFractalScale(1.0);
    setFractalOffset([0, 0, 0]);
    setColorA([1.0, 0.2, 0.3]);
    setColorB([0.2, 0.4, 1.0]);
    setEnableGlow(true);
  }, []);

  const fractalTypes = [
    { value: '0', label: 'Mandelbulb' },
    { value: '1', label: 'Julia Set 3D' },
    { value: '2', label: 'Sierpinski Tetrahedron' },
    { value: '3', label: 'Menger Sponge' },
    { value: '4', label: 'Kleinian Group' }
  ];

  const uniforms = {
    u_fractalType: fractalType,
    u_power: power,
    u_iterations: iterations,
    u_bailout: bailout,
    u_fractalScale: fractalScale,
    u_fractalOffset: fractalOffset,
    u_colorA: colorA,
    u_colorB: colorB,
    u_enableGlow: enableGlow,
  };

  const controlParams: ControlParam[] = [
    ...(fractalType === 0 ? [{
      name: 'power',
      label: 'Mandelbulb Power',
      value: power,
      min: 2.0,
      max: 12.0,
      step: 0.5,
      onChange: setPower
    }] : []),
    {
      name: 'iterations',
      label: 'Iterations',
      value: iterations,
      min: 5,
      max: 30,
      step: 1,
      onChange: setIterations
    },
    ...(fractalType === 0 || fractalType === 1 ? [{
      name: 'bailout',
      label: 'Bailout Radius',
      value: bailout,
      min: 1.0,
      max: 4.0,
      step: 0.1,
      onChange: setBailout
    }] : []),
    {
      name: 'fractalScale',
      label: 'Scale',
      value: fractalScale,
      min: 0.1,
      max: 3.0,
      step: 0.1,
      onChange: setFractalScale
    }
  ];

  const selectParams: SelectParam[] = [
    {
      name: 'fractalType',
      label: 'Fractal Type',
      value: fractalType.toString(),
      options: fractalTypes,
      onChange: (value) => setFractalType(parseInt(value))
    }
  ];

  const colorParams: ColorParam[] = [
    {
      name: 'colorA',
      label: 'Primary Color',
      value: colorA,
      onChange: setColorA
    },
    {
      name: 'colorB',
      label: 'Secondary Color',
      value: colorB,
      onChange: setColorB
    }
  ];

  const booleanParams: BooleanParam[] = [
    {
      name: 'enableGlow',
      label: 'Enable Glow Effect',
      value: enableGlow,
      onChange: setEnableGlow
    }
  ];

  const fractalDescriptions = [
    {
      name: 'Mandelbulb',
      icon: <Sparkles size={20} />,
      description: 'A 3D extension of the famous Mandelbrot set, created by applying the Mandelbrot formula to 3D coordinates using spherical coordinates.',
      formula: 'z^n + c in 3D space',
      characteristics: 'Self-similar bulbous structures with infinite detail'
    },
    {
      name: 'Julia Set 3D',
      icon: <Star size={20} />,
      description: 'Three-dimensional version of Julia sets, with animated parameters creating flowing, organic shapes.',
      formula: 'z = z² + c (3D generalization)',
      characteristics: 'Smooth, flowing forms with complex internal structure'
    },
    {
      name: 'Sierpinski Tetrahedron',
      icon: <Zap size={20} />,
      description: 'A 3D version of the Sierpinski triangle, built using iterative geometric transformations.',
      formula: 'Iterative folding operations',
      characteristics: 'Sharp, crystalline structure with triangular holes'
    },
    {
      name: 'Menger Sponge',
      icon: <Layers size={20} />,
      description: 'A fractal cube with square holes at multiple scales, creating infinite surface area.',
      formula: 'Recursive cube subdivision',
      characteristics: 'Cubic structure with square perforations at all scales'
    },
    {
      name: 'Kleinian Group',
      icon: <Maximize size={20} />,
      description: 'Generated by the action of a Kleinian group, creating beautiful geometric patterns.',
      formula: 'Group theory transformations',
      characteristics: 'Complex geometric patterns with hyperbolic structures'
    }
  ];

  const getCurrentDescription = () => {
    return fractalDescriptions[fractalType] || fractalDescriptions[0];
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">
          <Sparkles size={32} />
          3D Fractals
        </h1>
        <p className="page-subtitle">
          Explore infinite complexity through recursive mathematical structures. 
          These fractals reveal the beauty hidden in mathematical equations.
        </p>
      </div>

      <div className="section">
        <h2 className="section-title">Interactive Fractal Explorer</h2>
        <p className="section-description">
          Navigate through infinite detail with mouse controls and experiment with different fractal types. 
          Each fractal has unique parameters that dramatically change its appearance.
        </p>
        
        <WebGLCanvas
          fragmentShader={fractalsShader}
          uniforms={uniforms}
          onPerformanceUpdate={handlePerformanceUpdate}
          isPlaying={isPlaying}
          className="shader-canvas shader-fullscreen"
        />

        <ShaderControls
          isPlaying={isPlaying}
          onPlayPause={() => setIsPlaying(!isPlaying)}
          onReset={handleReset}
          params={controlParams}
          selectParams={selectParams}
          colorParams={colorParams}
          booleanParams={booleanParams}
          performance={performance}
          showPerformance={true}
        />
      </div>

      <div className="section">
        <h2 className="section-title">Current Fractal: {getCurrentDescription().name}</h2>
        <div className="demo-card">
          <div className="demo-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {getCurrentDescription().icon}
            {getCurrentDescription().name}
          </div>
          <p className="demo-description">{getCurrentDescription().description}</p>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
            <div>
              <strong>Formula:</strong> {getCurrentDescription().formula}
            </div>
            <div>
              <strong>Characteristics:</strong> {getCurrentDescription().characteristics}
            </div>
          </div>
        </div>
      </div>

      <div className="section">
        <h2 className="section-title">Fractal Gallery</h2>
        <p className="section-description">
          Each fractal type offers unique mathematical properties and visual characteristics.
        </p>
        
        <div className="fractal-gallery">
          {fractalDescriptions.map((fractal, index) => (
            <div key={index} className={`fractal-item ${fractalType === index ? 'glow' : ''}`}>
              <div className="fractal-preview" style={{
                background: fractalType === index 
                  ? 'linear-gradient(45deg, rgba(74, 222, 128, 0.3), rgba(59, 130, 246, 0.3))'
                  : 'linear-gradient(45deg, var(--bg-primary), var(--bg-secondary))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2rem',
                color: 'var(--accent-green-bright)'
              }}>
                {fractal.icon}
              </div>
              <div className="fractal-info">
                <h3 className="fractal-title">{fractal.name}</h3>
                <p className="fractal-description">{fractal.characteristics}</p>
                <button
                  onClick={() => setFractalType(index)}
                  className="control-button"
                  style={{ marginTop: '0.5rem', fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
                >
                  Load Fractal
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="section">
        <h2 className="section-title">Understanding Fractals</h2>
        
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">
              <Sparkles size={24} />
            </div>
            <h3 className="feature-title">Self-Similarity</h3>
            <p className="feature-description">
              Fractals exhibit the same patterns at every scale - zoom in anywhere and find similar structures.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <Zap size={24} />
            </div>
            <h3 className="feature-title">Infinite Detail</h3>
            <p className="feature-description">
              No matter how closely you examine a fractal, there's always more detail to discover.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <Star size={24} />
            </div>
            <h3 className="feature-title">Mathematical Beauty</h3>
            <p className="feature-description">
              Complex, beautiful structures emerge from surprisingly simple mathematical formulas.
            </p>
          </div>
        </div>
      </div>

      <div className="section">
        <h2 className="section-title">Interactive Features</h2>
        <div className="demo-grid">
          <div className="demo-card">
            <h3 className="demo-title">Dynamic Parameters</h3>
            <p className="demo-description">
              Adjust iterations, power, and scale to see how they affect the fractal structure.
            </p>
          </div>

          <div className="demo-card">
            <h3 className="demo-title">Real-time Coloring</h3>
            <p className="demo-description">
              Colors are calculated based on the fractal's mathematical properties, creating organic gradients.
            </p>
          </div>

          <div className="demo-card">
            <h3 className="demo-title">Glow Effects</h3>
            <p className="demo-description">
              Toggle glow effects to enhance the fractal's otherworldly appearance.
            </p>
          </div>
        </div>
      </div>

      <div className="section">
        <h2 className="section-title">Exploration Tips</h2>
        <div className="section-description">
          <ul style={{ paddingLeft: '1.5rem', lineHeight: '1.8' }}>
            <li><strong>Mouse Navigation:</strong> Move your mouse to orbit around the fractal</li>
            <li><strong>Iterations:</strong> Higher values reveal more detail but reduce performance</li>
            <li><strong>Mandelbulb Power:</strong> Different powers (2-12) create dramatically different shapes</li>
            <li><strong>Colors:</strong> Experiment with different color combinations for unique effects</li>
            <li><strong>Scale:</strong> Adjust the scale to zoom in on interesting fractal regions</li>
            <li><strong>Performance:</strong> Watch the FPS counter and adjust parameters if needed</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default FractalsPage;