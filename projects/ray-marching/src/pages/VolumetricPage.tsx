import React, { useState, useCallback } from 'react';
import { Cloud, Wind, Sun, Droplets } from 'lucide-react';
import WebGLCanvas from '../components/WebGLCanvas';
import ShaderControls, { ControlParam, BooleanParam, ColorParam } from '../components/ShaderControls';

const volumetricShader = `
#ifdef GL_ES
precision highp float;
#endif

uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_mouse;
uniform float u_cloudDensity;
uniform float u_cloudCoverage;
uniform float u_cloudScale;
uniform float u_fogDensity;
uniform vec3 u_sunColor;
uniform vec3 u_sunDir;
uniform float u_scatteringCoeff;
uniform bool u_enableVolumetricLighting;
uniform int u_volumeSteps;
uniform float u_lightAbsorption;

varying vec2 v_texCoord;

#define PI 3.14159265359
#define MAX_STEPS 64
#define MAX_DIST 100.0
#define SURF_DIST 0.01

// Noise functions for cloud generation
float hash(float n) {
    return fract(sin(n) * 1e4);
}

float hash(vec2 p) {
    return fract(1e4 * sin(17.0 * p.x + p.y * 0.1) * (0.1 + abs(sin(p.y * 13.0 + p.x))));
}

float noise(float x) {
    float i = floor(x);
    float f = fract(x);
    float u = f * f * (3.0 - 2.0 * f);
    return mix(hash(i), hash(i + 1.0), u);
}

float noise(vec2 x) {
    vec2 i = floor(x);
    vec2 f = fract(x);
    
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

float noise(vec3 x) {
    const vec3 step = vec3(110, 241, 171);
    
    vec3 i = floor(x);
    vec3 f = fract(x);
    
    float n = dot(i, step);
    
    vec3 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(mix( hash(n + dot(step, vec3(0, 0, 0))), hash(n + dot(step, vec3(1, 0, 0))), u.x),
                   mix( hash(n + dot(step, vec3(0, 1, 0))), hash(n + dot(step, vec3(1, 1, 0))), u.x), u.y),
               mix(mix( hash(n + dot(step, vec3(0, 0, 1))), hash(n + dot(step, vec3(1, 0, 1))), u.x),
                   mix( hash(n + dot(step, vec3(0, 1, 1))), hash(n + dot(step, vec3(1, 1, 1))), u.x), u.y), u.z);
}

// Fractional Brownian Motion for cloud details
float fbm(vec3 x) {
    float v = 0.0;
    float a = 0.5;
    vec3 shift = vec3(100);
    
    for (int i = 0; i < 5; ++i) {
        v += a * noise(x);
        x = x * 2.0 + shift;
        a *= 0.5;
    }
    return v;
}

// Cloud density function
float cloudDensity(vec3 p) {
    vec3 pos = p * u_cloudScale + vec3(u_time * 0.1, 0.0, u_time * 0.05);
    
    // Base cloud shape
    float base = fbm(pos);
    
    // Add detail layers
    float detail1 = fbm(pos * 2.0) * 0.5;
    float detail2 = fbm(pos * 4.0) * 0.25;
    
    float density = base + detail1 + detail2;
    
    // Apply coverage and density controls
    density = smoothstep(u_cloudCoverage, u_cloudCoverage + 0.3, density);
    density *= u_cloudDensity;
    
    // Height-based density falloff
    float heightFalloff = smoothstep(-1.0, 3.0, p.y) * smoothstep(8.0, 5.0, p.y);
    density *= heightFalloff;
    
    return clamp(density, 0.0, 1.0);
}

// Basic SDF for ground
float sdPlane(vec3 p) {
    return p.y + 1.0;
}

float map(vec3 p) {
    return sdPlane(p);
}

// Ray marching for solid geometry
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

// Volume ray marching for clouds
vec4 volumeRayMarch(vec3 ro, vec3 rd, float maxDist) {
    vec3 color = vec3(0.0);
    float alpha = 0.0;
    
    float stepSize = maxDist / float(u_volumeSteps);
    vec3 step = rd * stepSize;
    vec3 pos = ro;
    
    for (int i = 0; i < 32; i++) {
        if (i >= u_volumeSteps) break;
        
        float density = cloudDensity(pos);
        
        if (density > 0.01) {
            // Light scattering calculation
            float scattering = 1.0;
            
            if (u_enableVolumetricLighting) {
                // Sample towards sun for scattering
                vec3 lightStep = u_sunDir * stepSize * 2.0;
                vec3 lightPos = pos;
                float lightDensity = 0.0;
                
                for (int j = 0; j < 4; j++) {
                    lightPos += lightStep;
                    lightDensity += cloudDensity(lightPos);
                }
                
                float lightAttenuation = exp(-lightDensity * u_lightAbsorption);
                
                // Henyey-Greenstein phase function approximation
                float cosAngle = dot(rd, u_sunDir);
                float phase = mix(0.5, 1.5 * max(0.0, cosAngle), 0.6);
                
                scattering = lightAttenuation * phase;
            }
            
            // Cloud color
            vec3 cloudColor = mix(vec3(0.8, 0.8, 0.9), u_sunColor, scattering * u_scatteringCoeff);
            
            // Accumulate color and alpha
            float stepAlpha = density * stepSize;
            color += cloudColor * stepAlpha * (1.0 - alpha);
            alpha += stepAlpha * (1.0 - alpha);
            
            if (alpha > 0.99) break;
        }
        
        pos += step;
        
        if (length(pos - ro) > maxDist) break;
    }
    
    return vec4(color, alpha);
}

// Fog calculation
float fogFactor(float dist) {
    return 1.0 - exp(-dist * u_fogDensity);
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
    float cameraDistance = 8.0;
    float cameraAngle = u_time * 0.05 + u_mouse.x * PI * 2.0;
    float cameraHeight = 2.0 + u_mouse.y * 4.0;
    
    vec3 ro = vec3(
        cos(cameraAngle) * cameraDistance,
        cameraHeight,
        sin(cameraAngle) * cameraDistance
    );
    vec3 ta = vec3(0.0, 2.0, 0.0);
    
    mat3 ca = camera(ro, ta, vec3(0.0, 1.0, 0.0));
    vec3 rd = ca * normalize(vec3(uv, 2.0));
    
    // Sky gradient
    float skyGradient = dot(rd, vec3(0, 1, 0));
    vec3 skyColor = mix(
        vec3(0.5, 0.7, 1.0),  // Horizon
        vec3(0.1, 0.3, 0.8),  // Zenith
        smoothstep(0.0, 0.5, skyGradient)
    );
    
    // Add sun
    float sunDot = dot(rd, normalize(u_sunDir));
    float sun = smoothstep(0.995, 0.999, sunDot);
    skyColor += u_sunColor * sun * 10.0;
    
    vec3 col = skyColor;
    
    // Ray march solid geometry
    float groundDist = rayMarch(ro, rd);
    
    vec3 finalColor = col;
    
    // Volume ray marching for clouds
    float maxCloudDist = min(groundDist, 50.0);
    vec4 clouds = volumeRayMarch(ro, rd, maxCloudDist);
    
    // Composite clouds with background
    finalColor = mix(finalColor, clouds.rgb, clouds.a);
    
    // Ground rendering
    if (groundDist < MAX_DIST) {
        vec3 groundPos = ro + rd * groundDist;
        vec3 groundColor = vec3(0.3, 0.4, 0.2);
        
        // Simple checker pattern
        vec2 checker = floor(groundPos.xz * 2.0);
        float checkerPattern = mod(checker.x + checker.y, 2.0);
        groundColor = mix(groundColor, groundColor * 1.5, checkerPattern);
        
        // Basic lighting
        float groundLight = max(0.3, dot(vec3(0, 1, 0), normalize(u_sunDir)));
        groundColor *= groundLight;
        
        // Fog on ground
        float fog = fogFactor(groundDist);
        groundColor = mix(groundColor, skyColor, fog);
        
        finalColor = mix(finalColor, groundColor, 1.0 - clouds.a);
    }
    
    // Atmospheric scattering
    float dist = length(ro);
    float scatter = exp(-dist * 0.01) * u_scatteringCoeff;
    finalColor = mix(finalColor, u_sunColor, scatter * 0.1);
    
    // Tone mapping and gamma correction
    finalColor = finalColor / (finalColor + vec3(1.0));
    finalColor = pow(finalColor, vec3(0.4545));
    
    gl_FragColor = vec4(finalColor, 1.0);
}
`;

const VolumetricPage: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [performance, setPerformance] = useState({ fps: 0, frameTime: 0 });
  
  // Volumetric parameters
  const [cloudDensity, setCloudDensity] = useState(0.8);
  const [cloudCoverage, setCloudCoverage] = useState(0.4);
  const [cloudScale, setCloudScale] = useState(0.3);
  const [fogDensity, setFogDensity] = useState(0.02);
  const [sunColor, setSunColor] = useState<[number, number, number]>([1.0, 0.9, 0.7]);
  const [sunDir, setSunDir] = useState<[number, number, number]>([0.3, 0.8, 0.5]);
  const [scatteringCoeff, setScatteringCoeff] = useState(0.6);
  const [enableVolumetricLighting, setEnableVolumetricLighting] = useState(true);
  const [volumeSteps, setVolumeSteps] = useState(24);
  const [lightAbsorption, setLightAbsorption] = useState(0.3);

  const handlePerformanceUpdate = useCallback((fps: number, frameTime: number) => {
    setPerformance({ fps, frameTime });
  }, []);

  const handleReset = useCallback(() => {
    setCloudDensity(0.8);
    setCloudCoverage(0.4);
    setCloudScale(0.3);
    setFogDensity(0.02);
    setSunColor([1.0, 0.9, 0.7]);
    setSunDir([0.3, 0.8, 0.5]);
    setScatteringCoeff(0.6);
    setEnableVolumetricLighting(true);
    setVolumeSteps(24);
    setLightAbsorption(0.3);
  }, []);

  const uniforms = {
    u_cloudDensity: cloudDensity,
    u_cloudCoverage: cloudCoverage,
    u_cloudScale: cloudScale,
    u_fogDensity: fogDensity,
    u_sunColor: sunColor,
    u_sunDir: sunDir,
    u_scatteringCoeff: scatteringCoeff,
    u_enableVolumetricLighting: enableVolumetricLighting,
    u_volumeSteps: volumeSteps,
    u_lightAbsorption: lightAbsorption,
  };

  const controlParams: ControlParam[] = [
    {
      name: 'cloudDensity',
      label: 'Cloud Density',
      value: cloudDensity,
      min: 0.0,
      max: 2.0,
      step: 0.1,
      onChange: setCloudDensity
    },
    {
      name: 'cloudCoverage',
      label: 'Cloud Coverage',
      value: cloudCoverage,
      min: 0.0,
      max: 1.0,
      step: 0.05,
      onChange: setCloudCoverage
    },
    {
      name: 'cloudScale',
      label: 'Cloud Scale',
      value: cloudScale,
      min: 0.1,
      max: 1.0,
      step: 0.05,
      onChange: setCloudScale
    },
    {
      name: 'fogDensity',
      label: 'Fog Density',
      value: fogDensity,
      min: 0.0,
      max: 0.1,
      step: 0.005,
      onChange: setFogDensity
    },
    {
      name: 'scatteringCoeff',
      label: 'Light Scattering',
      value: scatteringCoeff,
      min: 0.0,
      max: 2.0,
      step: 0.1,
      onChange: setScatteringCoeff
    },
    {
      name: 'volumeSteps',
      label: 'Volume Steps',
      value: volumeSteps,
      min: 8,
      max: 32,
      step: 2,
      onChange: setVolumeSteps
    },
    {
      name: 'lightAbsorption',
      label: 'Light Absorption',
      value: lightAbsorption,
      min: 0.0,
      max: 1.0,
      step: 0.05,
      onChange: setLightAbsorption
    }
  ];

  const booleanParams: BooleanParam[] = [
    {
      name: 'enableVolumetricLighting',
      label: 'Volumetric Lighting',
      value: enableVolumetricLighting,
      onChange: setEnableVolumetricLighting
    }
  ];

  const colorParams: ColorParam[] = [
    {
      name: 'sunColor',
      label: 'Sun Color',
      value: sunColor,
      onChange: setSunColor
    }
  ];

  const volumetricTechniques = [
    {
      name: 'Volume Ray Marching',
      icon: <Cloud size={20} />,
      description: 'March through 3D space sampling density at regular intervals to render participating media.',
      characteristics: 'Accurate light interaction, expensive computation, realistic appearance'
    },
    {
      name: 'Light Scattering',
      icon: <Sun size={20} />,
      description: 'Calculate how light bounces and scatters through volumetric media like clouds and fog.',
      characteristics: 'Adds realism, creates god rays, computationally intensive'
    },
    {
      name: 'Density Fields',
      icon: <Wind size={20} />,
      description: 'Use noise functions to create natural-looking density variations in volumetric media.',
      characteristics: 'Procedural generation, infinite variation, performance-friendly'
    },
    {
      name: 'Atmospheric Effects',
      icon: <Droplets size={20} />,
      description: 'Simulate atmospheric phenomena like fog, haze, and aerial perspective.',
      characteristics: 'Enhances depth perception, adds atmospheric mood, simple implementation'
    }
  ];

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">
          <Cloud size={32} />
          Volumetric Rendering
        </h1>
        <p className="page-subtitle">
          Render clouds, fog, and participating media using volume ray marching techniques. 
          Experience realistic atmospheric effects and light scattering.
        </p>
      </div>

      <div className="section">
        <h2 className="section-title">Interactive Volumetric Demo</h2>
        <p className="section-description">
          Explore procedural clouds with realistic lighting. Adjust density, coverage, and scattering 
          to see how volumetric media interacts with light in real-time.
        </p>
        
        <WebGLCanvas
          fragmentShader={volumetricShader}
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
        <h2 className="section-title">Volumetric Techniques</h2>
        <p className="section-description">
          Different approaches to rendering volumetric media, each with specific use cases and performance characteristics.
        </p>
        
        <div className="demo-grid">
          {volumetricTechniques.map((technique, index) => (
            <div key={index} className="demo-card">
              <h3 className="demo-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {technique.icon}
                {technique.name}
              </h3>
              <p className="demo-description">{technique.description}</p>
              <div style={{ marginTop: '1rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                <strong>Characteristics:</strong> {technique.characteristics}
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
              <Cloud size={24} />
            </div>
            <h3 className="feature-title">Procedural Clouds</h3>
            <p className="feature-description">
              Generated using fractal noise (FBM) for natural, ever-changing cloud formations.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <Sun size={24} />
            </div>
            <h3 className="feature-title">Light Scattering</h3>
            <p className="feature-description">
              Realistic light interaction using phase functions and multiple scattering approximations.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <Wind size={24} />
            </div>
            <h3 className="feature-title">Atmospheric Perspective</h3>
            <p className="feature-description">
              Distance fog and atmospheric scattering enhance depth perception and realism.
            </p>
          </div>
        </div>
      </div>

      <div className="section">
        <h2 className="section-title">Understanding Volume Rendering</h2>
        
        <div className="demo-grid">
          <div className="demo-card">
            <h3 className="demo-title">Ray Marching vs Traditional</h3>
            <p className="demo-description">
              Unlike surface rendering, volume rendering requires sampling throughout 3D space, 
              making it computationally intensive but visually rich.
            </p>
          </div>

          <div className="demo-card">
            <h3 className="demo-title">Light Transport</h3>
            <p className="demo-description">
              Volumetric media absorbs, scatters, and emits light. Understanding these interactions 
              is key to realistic atmospheric rendering.
            </p>
          </div>

          <div className="demo-card">
            <h3 className="demo-title">Performance Trade-offs</h3>
            <p className="demo-description">
              Volume steps directly impact quality and performance. Find the balance between 
              visual fidelity and frame rate for your application.
            </p>
          </div>
        </div>
      </div>

      <div className="section">
        <h2 className="section-title">Interactive Tips</h2>
        <div className="section-description">
          <ul style={{ paddingLeft: '1.5rem', lineHeight: '1.8' }}>
            <li><strong>Cloud Density:</strong> Controls overall opacity of the clouds</li>
            <li><strong>Cloud Coverage:</strong> Adjusts how much of the sky is covered by clouds</li>
            <li><strong>Volume Steps:</strong> Higher values give better quality but reduce performance</li>
            <li><strong>Light Scattering:</strong> Controls how much light bounces through the volume</li>
            <li><strong>Volumetric Lighting:</strong> Toggle realistic light scattering calculations</li>
            <li><strong>Camera Movement:</strong> Fly through the clouds by moving your mouse</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default VolumetricPage;