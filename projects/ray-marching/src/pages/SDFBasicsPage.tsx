import React, { useState, useCallback } from 'react';
import { Circle, Play, Box, Hexagon } from 'lucide-react';
import WebGLCanvas from '../components/WebGLCanvas';
import ShaderControls, { ControlParam, SelectParam } from '../components/ShaderControls';

const sdfBasicsShader = `
#ifdef GL_ES
precision highp float;
#endif

uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_mouse;
uniform int u_sdfType;
uniform vec3 u_sdfParams;
uniform int u_booleanOp;
uniform float u_smoothFactor;
uniform float u_objectDistance;

varying vec2 v_texCoord;

#define PI 3.14159265359
#define MAX_STEPS 100
#define MAX_DIST 100.0
#define SURF_DIST 0.01

// SDF primitives
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

float sdCylinder(vec3 p, float h, float r) {
    vec2 d = abs(vec2(length(p.xz), p.y)) - vec2(r, h);
    return min(max(d.x, d.y), 0.0) + length(max(d, 0.0));
}

float sdCapsule(vec3 p, vec3 a, vec3 b, float r) {
    vec3 pa = p - a, ba = b - a;
    float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
    return length(pa - ba * h) - r;
}

float sdOctahedron(vec3 p, float s) {
    p = abs(p);
    return (p.x + p.y + p.z - s) * 0.57735027;
}

// Boolean operations
float opUnion(float d1, float d2) {
    return min(d1, d2);
}

float opSubtraction(float d1, float d2) {
    return max(-d1, d2);
}

float opIntersection(float d1, float d2) {
    return max(d1, d2);
}

// Smooth boolean operations
float opSmoothUnion(float d1, float d2, float k) {
    float h = clamp(0.5 + 0.5 * (d2 - d1) / k, 0.0, 1.0);
    return mix(d2, d1, h) - k * h * (1.0 - h);
}

float opSmoothSubtraction(float d1, float d2, float k) {
    float h = clamp(0.5 - 0.5 * (d2 + d1) / k, 0.0, 1.0);
    return mix(d2, -d1, h) + k * h * (1.0 - h);
}

float opSmoothIntersection(float d1, float d2, float k) {
    float h = clamp(0.5 - 0.5 * (d2 - d1) / k, 0.0, 1.0);
    return mix(d2, d1, h) + k * h * (1.0 - h);
}

// Get SDF based on type
float getSDF(vec3 p, int sdfType, vec3 params) {
    if (sdfType == 0) {
        return sdSphere(p, params.x);
    } else if (sdfType == 1) {
        return sdBox(p, vec3(params.x));
    } else if (sdfType == 2) {
        return sdTorus(p, params.xy);
    } else if (sdfType == 3) {
        return sdCylinder(p, params.x, params.y);
    } else if (sdfType == 4) {
        return sdCapsule(p, vec3(0, -params.x, 0), vec3(0, params.x, 0), params.y);
    } else if (sdfType == 5) {
        return sdOctahedron(p, params.x);
    }
    return sdSphere(p, 0.5);
}

// Scene SDF
float map(vec3 p) {
    // Two objects for boolean operations demonstration
    vec3 p1 = p - vec3(-u_objectDistance * 0.5, 0.0, 0.0);
    vec3 p2 = p - vec3(u_objectDistance * 0.5, 0.0, 0.0);
    
    // Animate rotation
    float angle = u_time * 0.5;
    mat2 rot = mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
    p2.xz = rot * p2.xz;
    p2.xy = rot * p2.xy;
    
    float d1 = getSDF(p1, u_sdfType, u_sdfParams);
    float d2 = getSDF(p2, u_sdfType, u_sdfParams * 0.8);
    
    // Apply boolean operation
    float result;
    if (u_booleanOp == 0) {
        // Union
        if (u_smoothFactor > 0.01) {
            result = opSmoothUnion(d1, d2, u_smoothFactor);
        } else {
            result = opUnion(d1, d2);
        }
    } else if (u_booleanOp == 1) {
        // Subtraction
        if (u_smoothFactor > 0.01) {
            result = opSmoothSubtraction(d1, d2, u_smoothFactor);
        } else {
            result = opSubtraction(d1, d2);
        }
    } else if (u_booleanOp == 2) {
        // Intersection
        if (u_smoothFactor > 0.01) {
            result = opSmoothIntersection(d1, d2, u_smoothFactor);
        } else {
            result = opIntersection(d1, d2);
        }
    } else {
        result = opUnion(d1, d2);
    }
    
    // Ground plane
    float ground = p.y + 1.5;
    return min(result, ground);
}

// Calculate normal
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

// Ray marching
float rayMarch(vec3 ro, vec3 rd) {
    float dO = 0.0;
    
    for (int i = 0; i < MAX_STEPS; i++) {
        vec3 p = ro + rd * dO;
        float dS = map(p);
        dO += dS;
        
        if (dO > MAX_DIST || abs(dS) < SURF_DIST) break;
    }
    
    return dO;
}

// Lighting
float getLight(vec3 p) {
    vec3 lightPos = vec3(2.0, 5.0, 6.0);
    vec3 l = normalize(lightPos - p);
    vec3 n = calcNormal(p);
    
    float dif = clamp(dot(n, l), 0.0, 1.0);
    
    // Shadow
    float d = rayMarch(p + n * SURF_DIST * 2.0, l);
    if (d < length(lightPos - p)) dif *= 0.1;
    
    return dif;
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
    
    // Camera setup
    float cameraDistance = 4.0;
    float cameraAngle = u_time * 0.3 + u_mouse.x * PI * 2.0;
    float cameraHeight = u_mouse.y * 2.0;
    
    vec3 ro = vec3(
        cos(cameraAngle) * cameraDistance,
        cameraHeight,
        sin(cameraAngle) * cameraDistance
    );
    vec3 ta = vec3(0.0, 0.0, 0.0);
    
    mat3 ca = camera(ro, ta, vec3(0.0, 1.0, 0.0));
    vec3 rd = ca * normalize(vec3(uv, 2.0));
    
    // Ray marching
    float t = rayMarch(ro, rd);
    
    vec3 col = vec3(0.1, 0.2, 0.4); // Background
    
    if (t < MAX_DIST) {
        vec3 p = ro + t * rd;
        float light = getLight(p);
        
        // Material color based on height and boolean operation
        vec3 materialColor;
        if (p.y > -1.4) {
            // Objects
            if (u_booleanOp == 0) {
                materialColor = vec3(0.2, 0.8, 0.3); // Green for union
            } else if (u_booleanOp == 1) {
                materialColor = vec3(0.8, 0.3, 0.2); // Red for subtraction
            } else {
                materialColor = vec3(0.3, 0.6, 0.8); // Blue for intersection
            }
        } else {
            // Ground
            materialColor = vec3(0.4, 0.4, 0.4);
        }
        
        col = materialColor * (0.3 + 0.7 * light);
        
        // Distance fog
        col = mix(col, vec3(0.1, 0.2, 0.4), smoothstep(0.0, 30.0, t));
    }
    
    // Gamma correction
    col = pow(col, vec3(0.4545));
    
    gl_FragColor = vec4(col, 1.0);
}
`;

const SDFBasicsPage: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [performance, setPerformance] = useState({ fps: 0, frameTime: 0 });
  
  // SDF parameters
  const [sdfType, setSdfType] = useState(0);
  const [param1, setParam1] = useState(0.5);
  const [param2, setParam2] = useState(0.5);
  const [param3, setParam3] = useState(0.2);
  const [booleanOp, setBooleanOp] = useState(0);
  const [smoothFactor, setSmoothFactor] = useState(0.0);
  const [objectDistance, setObjectDistance] = useState(1.5);

  const handlePerformanceUpdate = useCallback((fps: number, frameTime: number) => {
    setPerformance({ fps, frameTime });
  }, []);

  const handleReset = useCallback(() => {
    setSdfType(0);
    setParam1(0.5);
    setParam2(0.5);
    setParam3(0.2);
    setBooleanOp(0);
    setSmoothFactor(0.0);
    setObjectDistance(1.5);
  }, []);

  const sdfTypes = [
    { value: '0', label: 'Sphere' },
    { value: '1', label: 'Box' },
    { value: '2', label: 'Torus' },
    { value: '3', label: 'Cylinder' },
    { value: '4', label: 'Capsule' },
    { value: '5', label: 'Octahedron' }
  ];

  const booleanOps = [
    { value: '0', label: 'Union' },
    { value: '1', label: 'Subtraction' },
    { value: '2', label: 'Intersection' }
  ];

  const getParamLabel = (paramIndex: number): string => {
    switch (sdfType) {
      case 0: // Sphere
        return paramIndex === 1 ? 'Radius' : '';
      case 1: // Box
        return paramIndex === 1 ? 'Size' : '';
      case 2: // Torus
        return paramIndex === 1 ? 'Major Radius' : paramIndex === 2 ? 'Minor Radius' : '';
      case 3: // Cylinder
        return paramIndex === 1 ? 'Height' : paramIndex === 2 ? 'Radius' : '';
      case 4: // Capsule
        return paramIndex === 1 ? 'Height' : paramIndex === 2 ? 'Radius' : '';
      case 5: // Octahedron
        return paramIndex === 1 ? 'Size' : '';
      default:
        return '';
    }
  };

  const uniforms = {
    u_sdfType: sdfType,
    u_sdfParams: [param1, param2, param3],
    u_booleanOp: booleanOp,
    u_smoothFactor: smoothFactor,
    u_objectDistance: objectDistance,
  };

  const controlParams: ControlParam[] = [
    ...(getParamLabel(1) ? [{
      name: 'param1',
      label: getParamLabel(1),
      value: param1,
      min: 0.1,
      max: 2.0,
      step: 0.05,
      onChange: setParam1
    }] : []),
    ...(getParamLabel(2) ? [{
      name: 'param2',
      label: getParamLabel(2),
      value: param2,
      min: 0.1,
      max: 2.0,
      step: 0.05,
      onChange: setParam2
    }] : []),
    ...(getParamLabel(3) ? [{
      name: 'param3',
      label: getParamLabel(3),
      value: param3,
      min: 0.1,
      max: 1.0,
      step: 0.05,
      onChange: setParam3
    }] : []),
    {
      name: 'smoothFactor',
      label: 'Smooth Factor',
      value: smoothFactor,
      min: 0.0,
      max: 1.0,
      step: 0.05,
      onChange: setSmoothFactor
    },
    {
      name: 'objectDistance',
      label: 'Object Distance',
      value: objectDistance,
      min: 0.5,
      max: 3.0,
      step: 0.1,
      onChange: setObjectDistance
    }
  ];

  const selectParams: SelectParam[] = [
    {
      name: 'sdfType',
      label: 'SDF Type',
      value: sdfType.toString(),
      options: sdfTypes,
      onChange: (value) => setSdfType(parseInt(value))
    },
    {
      name: 'booleanOp',
      label: 'Boolean Operation',
      value: booleanOp.toString(),
      options: booleanOps,
      onChange: (value) => setBooleanOp(parseInt(value))
    }
  ];

  const sdfExamples = [
    {
      id: 'sphere',
      name: 'Sphere',
      icon: <Circle size={20} />,
      code: `float sdSphere(vec3 p, float r) {
    return length(p) - r;
}`,
      description: 'The simplest SDF - distance from point to sphere surface'
    },
    {
      id: 'box',
      name: 'Box',
      icon: <Box size={20} />,
      code: `float sdBox(vec3 p, vec3 b) {
    vec3 q = abs(p) - b;
    return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0);
}`,
      description: 'A cube defined by its half-extents'
    },
    {
      id: 'torus',
      name: 'Torus',
      icon: <Hexagon size={20} />,
      code: `float sdTorus(vec3 p, vec2 t) {
    vec2 q = vec2(length(p.xz) - t.x, p.y);
    return length(q) - t.y;
}`,
      description: 'A donut shape with major and minor radius'
    }
  ];

  const booleanOperations = [
    {
      name: 'Union',
      color: 'rgba(34, 197, 94, 0.8)', // Green
      code: `float opUnion(float d1, float d2) {
    return min(d1, d2);
}`,
      description: 'Combine two shapes - takes the minimum distance'
    },
    {
      name: 'Subtraction',
      color: 'rgba(239, 68, 68, 0.8)', // Red
      code: `float opSubtraction(float d1, float d2) {
    return max(-d1, d2);
}`,
      description: 'Cut one shape from another - inverts the first shape'
    },
    {
      name: 'Intersection',
      color: 'rgba(59, 130, 246, 0.8)', // Blue
      code: `float opIntersection(float d1, float d2) {
    return max(d1, d2);
}`,
      description: 'Keep only overlapping parts - takes the maximum distance'
    }
  ];

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">
          <Circle size={32} />
          Signed Distance Fields Basics
        </h1>
        <p className="page-subtitle">
          Learn the mathematical foundations of 3D shape definition using distance functions. 
          SDFs describe geometry implicitly through distance calculations.
        </p>
      </div>

      <div className="section">
        <h2 className="section-title">Interactive SDF Explorer</h2>
        <p className="section-description">
          Experiment with different SDF primitives and boolean operations. 
          Move your mouse to orbit the camera and see how shapes interact in real-time.
        </p>
        
        <WebGLCanvas
          fragmentShader={sdfBasicsShader}
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
          performance={performance}
          showPerformance={true}
        />
      </div>

      <div className="section">
        <h2 className="section-title">What is an SDF?</h2>
        <p className="section-description">
          A Signed Distance Field is a function that takes a 3D point and returns the shortest distance 
          to the surface of a shape. Negative values indicate points inside the shape, positive values 
          indicate points outside. This mathematical representation allows for efficient ray marching 
          and complex shape operations.
        </p>
      </div>

      <div className="section">
        <h2 className="section-title">Primitive SDFs</h2>
        <p className="section-description">
          Start with basic shapes - the building blocks of complex scenes.
        </p>
        
        <div className="demo-grid">
          {sdfExamples.map((sdf, index) => (
            <div key={index} className="demo-card">
              <h3 className="demo-title">
                {sdf.icon}
                {sdf.name}
              </h3>
              <p className="demo-description">{sdf.description}</p>
              
              <div className="code-container">
                <div className="code-header">GLSL Code</div>
                <div className="code-content">
                  <pre>{sdf.code}</pre>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="section">
        <h2 className="section-title">Boolean Operations</h2>
        <p className="section-description">
          Combine multiple SDFs to create complex shapes using boolean operations. 
          The interactive demo above shows two shapes being combined with your selected operation.
        </p>
        
        <div className="demo-grid">
          {booleanOperations.map((op, index) => (
            <div key={index} className="demo-card">
              <h3 className="demo-title">{op.name}</h3>
              <p className="demo-description">{op.description}</p>
              
              <div className="demo-preview">
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  padding: '20px'
                }}>
                  <div style={{
                    width: '60px',
                    height: '60px',
                    background: 'rgba(74, 222, 128, 0.8)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#000',
                    fontWeight: 'bold',
                    fontSize: '12px'
                  }}>
                    A
                  </div>
                  <div style={{
                    width: '60px',
                    height: '60px',
                    background: op.color,
                    borderRadius: op.name === 'Union' ? '50%' : '8px',
                    marginLeft: op.name === 'Union' ? '0' : op.name === 'Subtraction' ? '-30px' : '-20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#000',
                    fontWeight: 'bold',
                    fontSize: '12px'
                  }}>
                    B
                  </div>
                </div>
              </div>
              
              <div className="code-container">
                <div className="code-header">GLSL Code</div>
                <div className="code-content">
                  <pre>{op.code}</pre>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="section">
        <h2 className="section-title">Advanced Features</h2>
        
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">
              <Circle size={24} />
            </div>
            <h3 className="feature-title">Smooth Blending</h3>
            <p className="feature-description">
              Use the smooth factor to create organic transitions between shapes, avoiding hard edges.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <Box size={24} />
            </div>
            <h3 className="feature-title">Multiple Primitives</h3>
            <p className="feature-description">
              Experiment with spheres, boxes, tori, cylinders, capsules, and octahedrons.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <Play size={24} />
            </div>
            <h3 className="feature-title">Real-time Animation</h3>
            <p className="feature-description">
              Watch shapes rotate and interact in real-time to better understand the operations.
            </p>
          </div>
        </div>
      </div>

      <div className="section">
        <h2 className="section-title">Interactive Tips</h2>
        <div className="section-description">
          <ul style={{ paddingLeft: '1.5rem', lineHeight: '1.8' }}>
            <li><strong>SDF Type:</strong> Choose different primitive shapes to see their mathematical definitions</li>
            <li><strong>Boolean Operations:</strong> Union (green), Subtraction (red), or Intersection (blue)</li>
            <li><strong>Smooth Factor:</strong> Create organic blends between shapes instead of hard edges</li>
            <li><strong>Object Distance:</strong> Control how far apart the two shapes are positioned</li>
            <li><strong>Parameters:</strong> Each shape has unique parameters (radius, size, height, etc.)</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SDFBasicsPage;