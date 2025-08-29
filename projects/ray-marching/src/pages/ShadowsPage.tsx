import React, { useState, useCallback } from 'react';
import { Sun, Moon, Lightbulb, Cloud } from 'lucide-react';
import WebGLCanvas from '../components/WebGLCanvas';
import ShaderControls, { ControlParam, BooleanParam, ColorParam } from '../components/ShaderControls';

const shadowsShader = `
#ifdef GL_ES
precision highp float;
#endif

uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_mouse;
uniform vec3 u_lightPos;
uniform vec3 u_lightColor;
uniform float u_lightIntensity;
uniform bool u_enableSoftShadows;
uniform bool u_enableAO;
uniform bool u_enableMultipleLights;
uniform float u_shadowSharpness;
uniform float u_aoIntensity;
uniform int u_lightCount;

varying vec2 v_texCoord;

#define PI 3.14159265359
#define MAX_STEPS 100
#define MAX_DIST 100.0
#define SURF_DIST 0.01

// Basic SDF primitives
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

// Scene SDF
float map(vec3 p) {
    // Multiple objects for shadow demonstration
    float sphere1 = sdSphere(p - vec3(0.0, 0.0, 0.0), 0.6);
    float sphere2 = sdSphere(p - vec3(sin(u_time) * 1.5, 0.5, cos(u_time) * 1.5), 0.4);
    float box1 = sdBox(p - vec3(-1.5, 0.0, 0.0), vec3(0.5, 0.8, 0.3));
    float torus1 = sdTorus(p - vec3(1.5, 0.0, 0.0), vec2(0.6, 0.2));
    
    // Ground plane
    float ground = p.y + 1.0;
    
    float objects = min(min(min(sphere1, sphere2), box1), torus1);
    return min(objects, ground);
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

// Hard shadows
float calcHardShadow(vec3 ro, vec3 rd) {
    for (float t = 0.02; t < 20.0;) {
        float h = map(ro + rd * t);
        if (h < 0.001) return 0.0;
        t += h;
    }
    return 1.0;
}

// Soft shadows
float calcSoftShadow(vec3 ro, vec3 rd, float mint, float maxt, float k) {
    float res = 1.0;
    float t = mint;
    
    for (int i = 0; i < 50; i++) {
        float h = map(ro + rd * t);
        res = min(res, k * h / t);
        t += clamp(h, 0.005, 0.50);
        if (res < -1.0 || t > maxt) break;
    }
    res = max(res, -1.0);
    
    return 0.25 * (1.0 + res) * (1.0 + res) * (2.0 - res);
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

// Lighting calculation
vec3 calcLighting(vec3 p, vec3 n, vec3 rd, vec3 lightPos, vec3 lightColor, float lightIntensity) {
    vec3 lightDir = normalize(lightPos - p);
    float lightDistance = length(lightPos - p);
    
    // Attenuation
    float attenuation = 1.0 / (1.0 + 0.1 * lightDistance + 0.01 * lightDistance * lightDistance);
    
    // Diffuse lighting
    float diffuse = max(dot(n, lightDir), 0.0);
    
    // Specular lighting
    vec3 reflectDir = reflect(-lightDir, n);
    float specular = pow(max(dot(-rd, reflectDir), 0.0), 32.0);
    
    // Shadow calculation
    float shadow = 1.0;
    if (u_enableSoftShadows) {
        shadow = calcSoftShadow(p + n * 0.001, lightDir, 0.02, lightDistance, u_shadowSharpness);
    } else {
        shadow = calcHardShadow(p + n * 0.001, lightDir);
    }
    
    // Combine lighting components
    vec3 lighting = lightColor * lightIntensity * attenuation * (
        diffuse * shadow + 
        specular * shadow * 0.5
    );
    
    return lighting;
}

// Multiple light setup
vec3 getMultipleLights(vec3 p, vec3 n, vec3 rd) {
    vec3 totalLighting = vec3(0.0);
    
    // Main light
    vec3 light1Pos = u_lightPos;
    totalLighting += calcLighting(p, n, rd, light1Pos, u_lightColor, u_lightIntensity);
    
    if (u_enableMultipleLights) {
        // Secondary light (moving)
        vec3 light2Pos = vec3(
            cos(u_time * 0.7) * 3.0,
            2.0 + sin(u_time * 0.5),
            sin(u_time * 0.7) * 3.0
        );
        vec3 light2Color = vec3(0.3, 0.5, 1.0); // Blue tint
        totalLighting += calcLighting(p, n, rd, light2Pos, light2Color, 0.6);
        
        // Fill light (subtle)
        vec3 light3Pos = vec3(-2.0, 1.0, -2.0);
        vec3 light3Color = vec3(1.0, 0.8, 0.6); // Warm tint
        totalLighting += calcLighting(p, n, rd, light3Pos, light3Color, 0.3);
    }
    
    return totalLighting;
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
    float cameraDistance = 6.0;
    float cameraAngle = u_time * 0.1 + u_mouse.x * PI * 2.0;
    float cameraHeight = u_mouse.y * 3.0 - 0.5;
    
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
    
    vec3 col = vec3(0.1, 0.15, 0.25); // Background color
    
    if (t < MAX_DIST) {
        vec3 p = ro + t * rd;
        vec3 n = calcNormal(p);
        
        // Base material color
        vec3 materialColor = vec3(0.8, 0.7, 0.6);
        if (p.y > -0.9) {
            // Different colors for different objects
            float objId = map(p);
            if (abs(objId - sdSphere(p, 0.6)) < 0.001) {
                materialColor = vec3(0.8, 0.3, 0.3); // Red sphere
            } else if (abs(objId - sdBox(p - vec3(-1.5, 0.0, 0.0), vec3(0.5, 0.8, 0.3))) < 0.001) {
                materialColor = vec3(0.3, 0.8, 0.3); // Green box
            } else if (abs(objId - sdTorus(p - vec3(1.5, 0.0, 0.0), vec2(0.6, 0.2))) < 0.001) {
                materialColor = vec3(0.3, 0.3, 0.8); // Blue torus
            } else {
                materialColor = vec3(0.8, 0.5, 0.3); // Orange moving sphere
            }
        } else {
            // Ground - checkerboard pattern
            vec2 checker = floor(p.xz);
            float checkerPattern = mod(checker.x + checker.y, 2.0);
            materialColor = mix(vec3(0.4, 0.4, 0.4), vec3(0.6, 0.6, 0.6), checkerPattern);
        }
        
        // Calculate lighting
        vec3 lighting = getMultipleLights(p, n, rd);
        
        // Ambient component
        vec3 ambient = vec3(0.1, 0.12, 0.15);
        
        // Ambient occlusion
        float ao = 1.0;
        if (u_enableAO) {
            ao = calcAO(p, n);
            ao = mix(1.0, ao, u_aoIntensity);
        }
        
        // Final color
        col = materialColor * (ambient + lighting) * ao;
        
        // Distance fog
        float fogFactor = 1.0 - exp(-0.01 * t);
        col = mix(col, vec3(0.1, 0.15, 0.25), fogFactor);
    }
    
    // Tone mapping and gamma correction
    col = col / (col + vec3(1.0));
    col = pow(col, vec3(0.4545));
    
    gl_FragColor = vec4(col, 1.0);
}
`;

const ShadowsPage: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [performance, setPerformance] = useState({ fps: 0, frameTime: 0 });
  
  // Lighting parameters
  const [lightPos, setLightPos] = useState<[number, number, number]>([3.0, 4.0, 2.0]);
  const [lightColor, setLightColor] = useState<[number, number, number]>([1.0, 0.9, 0.8]);
  const [lightIntensity, setLightIntensity] = useState(1.0);
  const [enableSoftShadows, setEnableSoftShadows] = useState(true);
  const [enableAO, setEnableAO] = useState(true);
  const [enableMultipleLights, setEnableMultipleLights] = useState(false);
  const [shadowSharpness, setShadowSharpness] = useState(4.0);
  const [aoIntensity, setAoIntensity] = useState(1.0);

  const handlePerformanceUpdate = useCallback((fps: number, frameTime: number) => {
    setPerformance({ fps, frameTime });
  }, []);

  const handleReset = useCallback(() => {
    setLightPos([3.0, 4.0, 2.0]);
    setLightColor([1.0, 0.9, 0.8]);
    setLightIntensity(1.0);
    setEnableSoftShadows(true);
    setEnableAO(true);
    setEnableMultipleLights(false);
    setShadowSharpness(4.0);
    setAoIntensity(1.0);
  }, []);

  const uniforms = {
    u_lightPos: lightPos,
    u_lightColor: lightColor,
    u_lightIntensity: lightIntensity,
    u_enableSoftShadows: enableSoftShadows,
    u_enableAO: enableAO,
    u_enableMultipleLights: enableMultipleLights,
    u_shadowSharpness: shadowSharpness,
    u_aoIntensity: aoIntensity,
  };

  const controlParams: ControlParam[] = [
    {
      name: 'lightIntensity',
      label: 'Light Intensity',
      value: lightIntensity,
      min: 0.0,
      max: 3.0,
      step: 0.1,
      onChange: setLightIntensity
    },
    {
      name: 'shadowSharpness',
      label: 'Shadow Sharpness',
      value: shadowSharpness,
      min: 1.0,
      max: 16.0,
      step: 1.0,
      onChange: setShadowSharpness
    },
    {
      name: 'aoIntensity',
      label: 'AO Intensity',
      value: aoIntensity,
      min: 0.0,
      max: 2.0,
      step: 0.1,
      onChange: setAoIntensity
    }
  ];

  const booleanParams: BooleanParam[] = [
    {
      name: 'enableSoftShadows',
      label: 'Soft Shadows',
      value: enableSoftShadows,
      onChange: setEnableSoftShadows
    },
    {
      name: 'enableAO',
      label: 'Ambient Occlusion',
      value: enableAO,
      onChange: setEnableAO
    },
    {
      name: 'enableMultipleLights',
      label: 'Multiple Lights',
      value: enableMultipleLights,
      onChange: setEnableMultipleLights
    }
  ];

  const colorParams: ColorParam[] = [
    {
      name: 'lightColor',
      label: 'Light Color',
      value: lightColor,
      onChange: setLightColor
    }
  ];

  const lightingTechniques = [
    {
      name: 'Hard Shadows',
      icon: <Sun size={20} />,
      description: 'Sharp, defined shadows created by binary hit testing. Fast but unrealistic.',
      code: `float calcHardShadow(vec3 ro, vec3 rd) {
    for (float t = 0.02; t < 20.0;) {
        float h = map(ro + rd * t);
        if (h < 0.001) return 0.0;
        t += h;
    }
    return 1.0;
}`,
      characteristics: 'Sharp edges, binary (on/off), computationally efficient'
    },
    {
      name: 'Soft Shadows',
      icon: <Cloud size={20} />,
      description: 'Realistic shadows with soft penumbra, created by tracking the closest approach to geometry.',
      code: `float calcSoftShadow(vec3 ro, vec3 rd, float k) {
    float res = 1.0;
    for (float t = 0.02; t < 20.0;) {
        float h = map(ro + rd * t);
        res = min(res, k * h / t);
        t += h;
    }
    return clamp(res, 0.0, 1.0);
}`,
      characteristics: 'Soft edges, gradient falloff, more realistic appearance'
    },
    {
      name: 'Ambient Occlusion',
      icon: <Moon size={20} />,
      description: 'Darkens areas where ambient light would be occluded, adding depth and contact shadows.',
      code: `float calcAO(vec3 p, vec3 n) {
    float occ = 0.0;
    for (int i = 0; i < 5; i++) {
        float hr = 0.01 + 0.12 * float(i) / 4.0;
        vec3 aopos = n * hr + p;
        float dd = map(aopos);
        occ += -(dd - hr);
    }
    return clamp(1.0 - 3.0 * occ, 0.0, 1.0);
}`,
      characteristics: 'Darkens crevices, enhances depth perception, subtle contact shadows'
    }
  ];

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">
          <Sun size={32} />
          Soft Shadows & Ambient Occlusion
        </h1>
        <p className="page-subtitle">
          Advanced lighting techniques for realistic ray marched scenes. 
          Learn how to create convincing shadows and ambient lighting effects.
        </p>
      </div>

      <div className="section">
        <h2 className="section-title">Interactive Lighting Demo</h2>
        <p className="section-description">
          Compare different shadow and lighting techniques in real-time. 
          Toggle between hard shadows, soft shadows, and ambient occlusion to see their effects.
        </p>
        
        <WebGLCanvas
          fragmentShader={shadowsShader}
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
        <h2 className="section-title">Lighting Techniques</h2>
        <p className="section-description">
          Each lighting technique serves a specific purpose in creating realistic 3D scenes.
        </p>
        
        <div className="demo-grid">
          {lightingTechniques.map((technique, index) => (
            <div key={index} className="demo-card">
              <h3 className="demo-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {technique.icon}
                {technique.name}
              </h3>
              <p className="demo-description">{technique.description}</p>
              
              <div style={{ marginBottom: '1rem' }}>
                <strong>Characteristics:</strong> {technique.characteristics}
              </div>
              
              <div className="code-container">
                <div className="code-header">GLSL Implementation</div>
                <div className="code-content">
                  <pre>{technique.code}</pre>
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
              <Sun size={24} />
            </div>
            <h3 className="feature-title">Multiple Light Sources</h3>
            <p className="feature-description">
              Enable multiple lights to see how different colored lights interact and create complex shadow patterns.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <Lightbulb size={24} />
            </div>
            <h3 className="feature-title">Light Attenuation</h3>
            <p className="feature-description">
              Realistic light falloff with distance, creating natural-looking illumination gradients.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <Cloud size={24} />
            </div>
            <h3 className="feature-title">Penumbra Control</h3>
            <p className="feature-description">
              Adjust shadow sharpness to control the size and softness of shadow penumbra regions.
            </p>
          </div>
        </div>
      </div>

      <div className="section">
        <h2 className="section-title">Understanding Shadow Quality</h2>
        
        <div className="demo-grid">
          <div className="demo-card">
            <h3 className="demo-title">Hard vs Soft Shadows</h3>
            <p className="demo-description">
              Hard shadows are computationally efficient but unrealistic. Soft shadows are more expensive but create convincing lighting effects.
            </p>
          </div>

          <div className="demo-card">
            <h3 className="demo-title">Ambient Occlusion Benefits</h3>
            <p className="demo-description">
              AO adds subtle contact shadows that ground objects in the scene and enhance the perception of depth and volume.
            </p>
          </div>

          <div className="demo-card">
            <h3 className="demo-title">Performance Considerations</h3>
            <p className="demo-description">
              Each technique has performance costs. Monitor the FPS counter to understand the impact of different settings.
            </p>
          </div>
        </div>
      </div>

      <div className="section">
        <h2 className="section-title">Interactive Tips</h2>
        <div className="section-description">
          <ul style={{ paddingLeft: '1.5rem', lineHeight: '1.8' }}>
            <li><strong>Soft Shadows Toggle:</strong> Compare hard and soft shadows to see the difference</li>
            <li><strong>Shadow Sharpness:</strong> Higher values create sharper shadow edges</li>
            <li><strong>AO Intensity:</strong> Control how dark the ambient occlusion appears</li>
            <li><strong>Multiple Lights:</strong> Enable to see complex shadow interactions</li>
            <li><strong>Light Color:</strong> Experiment with different colored lights</li>
            <li><strong>Camera Movement:</strong> Move your mouse to see shadows from different angles</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ShadowsPage;