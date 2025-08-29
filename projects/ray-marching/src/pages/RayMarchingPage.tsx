import React, { useState, useCallback } from 'react';
import { Zap, Eye, Camera, Settings } from 'lucide-react';
import WebGLCanvas from '../components/WebGLCanvas';
import ShaderControls, { ControlParam, BooleanParam, ColorParam } from '../components/ShaderControls';

const rayMarchingShader = `
#ifdef GL_ES
precision highp float;
#endif

uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_mouse;
uniform vec3 u_cameraPos;
uniform vec3 u_cameraTarget;
uniform bool u_showSteps;
uniform float u_stepSize;
uniform int u_maxSteps;
uniform float u_surfaceDistance;
uniform vec3 u_lightPos;
uniform vec3 u_objectColor;
uniform float u_objectScale;

varying vec2 v_texCoord;

#define PI 3.14159265359
#define MAX_DIST 100.0

// SDF for a sphere
float sdSphere(vec3 p, float r) {
    return length(p) - r;
}

// SDF for a box
float sdBox(vec3 p, vec3 b) {
    vec3 q = abs(p) - b;
    return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0);
}

// SDF for a torus
float sdTorus(vec3 p, vec2 t) {
    vec2 q = vec2(length(p.xz) - t.x, p.y);
    return length(q) - t.y;
}

// SDF for the scene
float map(vec3 p) {
    // Animate objects
    vec3 p1 = p - vec3(sin(u_time) * 0.5, 0.0, 0.0);
    vec3 p2 = p - vec3(2.0 + cos(u_time * 0.7) * 0.3, sin(u_time * 1.3) * 0.2, 0.0);
    vec3 p3 = p - vec3(-2.0, 0.0, sin(u_time * 0.5) * 0.5);
    
    float sphere1 = sdSphere(p1, u_objectScale);
    float box1 = sdBox(p2, vec3(u_objectScale * 0.8));
    float torus1 = sdTorus(p3, vec2(u_objectScale * 1.2, u_objectScale * 0.4));
    
    // Ground plane
    float ground = p.y + 1.5;
    
    return min(min(min(sphere1, box1), torus1), ground);
}

// Calculate normal using finite differences
vec3 calcNormal(vec3 p) {
    const float h = 0.0001;
    const vec2 k = vec2(1, -1);
    return normalize(
        k.xyy * map(p + k.xyy * h) +
        k.yyx * map(p + k.yyx * h) +
        k.yxy * map(p + k.yxy * h) +
        k.xxx * map(p + k.xxx * h)
    );
}

// Ray marching with step visualization
vec4 rayMarch(vec3 ro, vec3 rd) {
    float t = 0.0;
    int steps = 0;
    
    for (int i = 0; i < 200; i++) {
        if (i >= u_maxSteps) break;
        
        vec3 p = ro + t * rd;
        float d = map(p);
        
        steps = i;
        
        if (d < u_surfaceDistance) {
            return vec4(t, float(steps), 1.0, d);
        }
        
        if (t > MAX_DIST) {
            return vec4(MAX_DIST, float(steps), 0.0, d);
        }
        
        t += d * u_stepSize;
    }
    
    return vec4(MAX_DIST, float(steps), 0.0, 0.0);
}

// Soft shadows
float calcShadow(vec3 ro, vec3 rd, float mint, float maxt) {
    float res = 1.0;
    float t = mint;
    
    for (int i = 0; i < 50; i++) {
        float h = map(ro + rd * t);
        res = min(res, 8.0 * h / t);
        t += clamp(h, 0.02, 0.10);
        if (res < 0.005 || t > maxt) break;
    }
    
    return clamp(res, 0.0, 1.0);
}

// Ambient occlusion
float calcAO(vec3 p, vec3 n) {
    float occ = 0.0;
    float sca = 1.0;
    
    for (int i = 0; i < 5; i++) {
        float hr = 0.01 + 0.12 * float(i) / 4.0;
        vec3 aopos = n * hr + p;
        float dd = map(aopos);
        occ += -(dd - hr) * sca;
        sca *= 0.95;
    }
    
    return clamp(1.0 - 3.0 * occ, 0.0, 1.0);
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
    
    // Interactive camera controls
    float cameraDistance = 5.0;
    float cameraAngle = u_time * 0.2 + u_mouse.x * PI * 2.0;
    float cameraHeight = u_mouse.y * 3.0 - 1.0;
    
    vec3 ro = vec3(
        cos(cameraAngle) * cameraDistance,
        cameraHeight,
        sin(cameraAngle) * cameraDistance
    );
    vec3 ta = vec3(0.0, 0.0, 0.0);
    
    // Use custom camera if provided
    if (length(u_cameraPos) > 0.1) {
        ro = u_cameraPos;
        ta = u_cameraTarget;
    }
    
    mat3 ca = camera(ro, ta, vec3(0.0, 1.0, 0.0));
    vec3 rd = ca * normalize(vec3(uv, 2.0));
    
    // Ray marching
    vec4 result = rayMarch(ro, rd);
    float t = result.x;
    float steps = result.y;
    float hit = result.z;
    
    vec3 col = vec3(0.05, 0.1, 0.2); // Background color
    
    if (hit > 0.5) {
        vec3 p = ro + t * rd;
        vec3 n = calcNormal(p);
        
        // Lighting
        vec3 lightPos = u_lightPos + vec3(sin(u_time) * 2.0, 0.0, cos(u_time) * 2.0);
        vec3 lightDir = normalize(lightPos - p);
        float diffuse = max(dot(n, lightDir), 0.0);
        
        // Shadows
        float shadow = calcShadow(p + n * 0.01, lightDir, 0.02, length(lightPos - p));
        
        // Ambient occlusion
        float ao = calcAO(p, n);
        
        // Final lighting
        vec3 lighting = vec3(0.15) + diffuse * shadow * vec3(1.0);
        lighting *= ao;
        
        // Material color based on object type
        vec3 materialColor;
        if (p.y > -1.4) {
            // Objects above ground
            float objId = mod(floor(p.x + 2.5), 3.0);
            if (objId < 0.5) {
                materialColor = u_objectColor; // Sphere
            } else if (objId < 1.5) {
                materialColor = vec3(0.8, 0.3, 0.3); // Box
            } else {
                materialColor = vec3(0.3, 0.8, 0.8); // Torus
            }
        } else {
            // Ground plane
            vec2 checker = floor(p.xz);
            float checkerPattern = mod(checker.x + checker.y, 2.0);
            materialColor = mix(vec3(0.2, 0.3, 0.2), vec3(0.4, 0.5, 0.4), checkerPattern);
        }
        
        col = materialColor * lighting;
        
        // Show step visualization if enabled
        if (u_showSteps) {
            float stepRatio = steps / float(u_maxSteps);
            vec3 stepColor = mix(vec3(0.0, 1.0, 0.0), vec3(1.0, 0.0, 0.0), stepRatio);
            col = mix(col, stepColor, 0.4);
        }
    } else {
        // Background with step visualization
        if (u_showSteps) {
            float stepRatio = steps / float(u_maxSteps);
            col = mix(col, vec3(0.2, 0.1, 0.0), stepRatio * 0.3);
        }
    }
    
    // Gamma correction
    col = pow(col, vec3(0.4545));
    
    gl_FragColor = vec4(col, 1.0);
}
`;

const RayMarchingPage: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [performance, setPerformance] = useState({ fps: 0, frameTime: 0 });
  
  // Ray marching parameters
  const [showSteps, setShowSteps] = useState(false);
  const [stepSize, setStepSize] = useState(1.0);
  const [maxSteps, setMaxSteps] = useState(100);
  const [surfaceDistance, setSurfaceDistance] = useState(0.01);
  
  // Scene parameters
  const [objectScale, setObjectScale] = useState(0.5);
  const [objectColor, setObjectColor] = useState<[number, number, number]>([0.2, 0.8, 0.3]);
  const [lightPos, setLightPos] = useState<[number, number, number]>([3.0, 4.0, 3.0]);
  
  // Camera parameters
  const [cameraPos, setCameraPos] = useState<[number, number, number]>([0, 0, 0]);
  const [cameraTarget, setCameraTarget] = useState<[number, number, number]>([0, 0, 0]);

  const handlePerformanceUpdate = useCallback((fps: number, frameTime: number) => {
    setPerformance({ fps, frameTime });
  }, []);

  const handleReset = useCallback(() => {
    setShowSteps(false);
    setStepSize(1.0);
    setMaxSteps(100);
    setSurfaceDistance(0.01);
    setObjectScale(0.5);
    setObjectColor([0.2, 0.8, 0.3]);
    setLightPos([3.0, 4.0, 3.0]);
    setCameraPos([0, 0, 0]);
    setCameraTarget([0, 0, 0]);
  }, []);

  const uniforms = {
    u_showSteps: showSteps,
    u_stepSize: stepSize,
    u_maxSteps: maxSteps,
    u_surfaceDistance: surfaceDistance,
    u_objectScale: objectScale,
    u_objectColor: objectColor,
    u_lightPos: lightPos,
    u_cameraPos: cameraPos,
    u_cameraTarget: cameraTarget,
  };

  const controlParams: ControlParam[] = [
    {
      name: 'stepSize',
      label: 'Step Size',
      value: stepSize,
      min: 0.1,
      max: 2.0,
      step: 0.1,
      onChange: setStepSize
    },
    {
      name: 'maxSteps',
      label: 'Max Steps',
      value: maxSteps,
      min: 10,
      max: 200,
      step: 10,
      onChange: setMaxSteps
    },
    {
      name: 'surfaceDistance',
      label: 'Surface Distance',
      value: surfaceDistance,
      min: 0.001,
      max: 0.1,
      step: 0.001,
      onChange: setSurfaceDistance
    },
    {
      name: 'objectScale',
      label: 'Object Scale',
      value: objectScale,
      min: 0.1,
      max: 2.0,
      step: 0.1,
      onChange: setObjectScale
    }
  ];

  const booleanParams: BooleanParam[] = [
    {
      name: 'showSteps',
      label: 'Show Step Visualization',
      value: showSteps,
      onChange: setShowSteps
    }
  ];

  const colorParams: ColorParam[] = [
    {
      name: 'objectColor',
      label: 'Object Color',
      value: objectColor,
      onChange: setObjectColor
    }
  ];

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">
          <Zap size={32} />
          Ray Marching Algorithm
        </h1>
        <p className="page-subtitle">
          Learn the sphere tracing technique for rendering implicit surfaces defined by SDFs. 
          This interactive demo shows how rays march through space, stepping along surfaces.
        </p>
      </div>

      <div className="section">
        <h2 className="section-title">
          <Eye size={24} />
          Interactive Ray Marching Visualization
        </h2>
        <p className="section-description">
          Watch rays march through 3D space, visualizing each step of the sphere tracing algorithm. 
          The scene contains animated objects: a sphere, box, and torus, all rendered using SDFs.
        </p>
        
        <WebGLCanvas
          fragmentShader={rayMarchingShader}
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
          booleanParams={booleanParams}
          colorParams={colorParams}
          performance={performance}
          showPerformance={true}
        />
      </div>

      <div className="section">
        <h2 className="section-title">
          <Settings size={24} />
          How Ray Marching Works
        </h2>
        
        <div className="demo-grid">
          <div className="demo-card">
            <h3 className="demo-title">1. Cast a Ray</h3>
            <p className="demo-description">
              For each pixel, cast a ray from the camera into the scene.
            </p>
            <div className="code-container">
              <div className="code-header">Ray Direction</div>
              <div className="code-content">
                <pre>{`vec3 rd = ca * normalize(vec3(uv, 2.0));`}</pre>
              </div>
            </div>
          </div>

          <div className="demo-card">
            <h3 className="demo-title">2. Step Along Ray</h3>
            <p className="demo-description">
              March along the ray using the distance field to determine step size.
            </p>
            <div className="code-container">
              <div className="code-header">Ray Stepping</div>
              <div className="code-content">
                <pre>{`float d = map(p);  // Get distance to surface
t += d * stepSize; // Step by that distance`}</pre>
              </div>
            </div>
          </div>

          <div className="demo-card">
            <h3 className="demo-title">3. Check for Hit</h3>
            <p className="demo-description">
              Stop when we're close enough to a surface or reach maximum distance.
            </p>
            <div className="code-container">
              <div className="code-header">Surface Detection</div>
              <div className="code-content">
                <pre>{`if (d < surfaceDistance) {
    // Hit! Calculate lighting
    return hitPoint;
}`}</pre>
              </div>
            </div>
          </div>

          <div className="demo-card">
            <h3 className="demo-title">4. Calculate Lighting</h3>
            <p className="demo-description">
              Use surface normals and lighting calculations for realistic shading.
            </p>
            <div className="code-container">
              <div className="code-header">Normal Calculation</div>
              <div className="code-content">
                <pre>{`vec3 n = calcNormal(p);
float diffuse = max(dot(n, lightDir), 0.0);`}</pre>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="section">
        <h2 className="section-title">
          <Camera size={24} />
          Key Concepts
        </h2>
        
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">
              <Zap size={24} />
            </div>
            <h3 className="feature-title">Sphere Tracing</h3>
            <p className="feature-description">
              The core algorithm that steps along rays using distance fields to efficiently find surface intersections.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <Eye size={24} />
            </div>
            <h3 className="feature-title">Step Visualization</h3>
            <p className="feature-description">
              Enable "Show Steps" to see how many iterations each pixel requires, with green indicating fewer steps.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <Settings size={24} />
            </div>
            <h3 className="feature-title">Performance Tuning</h3>
            <p className="feature-description">
              Adjust step size, max steps, and surface distance to balance quality and performance.
            </p>
          </div>
        </div>
      </div>

      <div className="section">
        <h2 className="section-title">Interactive Tips</h2>
        <div className="section-description">
          <ul style={{ paddingLeft: '1.5rem', lineHeight: '1.8' }}>
            <li><strong>Mouse Controls:</strong> Move your mouse to orbit the camera around the scene</li>
            <li><strong>Step Visualization:</strong> Toggle to see the efficiency of the ray marching algorithm</li>
            <li><strong>Step Size:</strong> Lower values give more accuracy but reduce performance</li>
            <li><strong>Max Steps:</strong> Higher values allow longer rays but impact performance</li>
            <li><strong>Surface Distance:</strong> Controls how close to surfaces we need to get before considering a hit</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default RayMarchingPage;