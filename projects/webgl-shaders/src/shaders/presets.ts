import { ShaderPreset } from '../components/ShaderEditor';

export const shaderPresets: ShaderPreset[] = [
  // Basic Patterns
  {
    name: 'Gradient',
    category: 'Basic',
    fragmentShader: `
precision mediump float;

uniform vec2 u_resolution;
uniform float u_time;

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    vec3 color = vec3(st.x, st.y, abs(sin(u_time)));
    gl_FragColor = vec4(color, 1.0);
}`,
    description: 'Simple gradient with time-based color animation'
  },
  {
    name: 'Checkerboard',
    category: 'Basic',
    fragmentShader: `
precision mediump float;

uniform vec2 u_resolution;
uniform float u_time;

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    st *= 10.0; // Scale
    
    vec2 ipos = floor(st);
    float checker = mod(ipos.x + ipos.y, 2.0);
    
    vec3 color = vec3(checker);
    gl_FragColor = vec4(color, 1.0);
}`,
    description: 'Classic checkerboard pattern'
  },

  // Noise Patterns
  {
    name: 'Perlin Noise',
    category: 'Noise',
    fragmentShader: `
precision mediump float;

uniform vec2 u_resolution;
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
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    st *= 5.0;
    st += u_time * 0.1;
    
    float n = noise(st);
    vec3 color = vec3(n);
    
    gl_FragColor = vec4(color, 1.0);
}`,
    description: 'Animated Perlin noise'
  },
  {
    name: 'Fractal Brownian Motion',
    category: 'Noise',
    fragmentShader: `
precision mediump float;

uniform vec2 u_resolution;
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
    
    for (int i = 0; i < 6; i++) {
        value += amplitude * noise(st);
        st *= 2.0;
        amplitude *= 0.5;
    }
    
    return value;
}

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    st *= 3.0;
    
    float f = fbm(st + u_time * 0.05);
    
    vec3 color = vec3(0.0);
    color = mix(vec3(0.1, 0.5, 0.8), vec3(1.0, 0.8, 0.2), f);
    
    gl_FragColor = vec4(color, 1.0);
}`,
    description: 'Fractal Brownian Motion with color mapping'
  },

  // Geometric Patterns
  {
    name: 'Hexagon Grid',
    category: 'Geometric',
    fragmentShader: `
precision mediump float;

uniform vec2 u_resolution;
uniform float u_time;

vec2 hexagon(vec2 p) {
    vec2 q = vec2(p.x * 2.0 * 0.5773503, p.y + p.x * 0.5773503);
    vec2 pi = floor(q);
    vec2 pf = fract(q);
    
    float v = mod(pi.x + pi.y, 3.0);
    float ca = step(1.0, v);
    float cb = step(2.0, v);
    vec2 ma = step(pf.xy, pf.yx);
    
    float e = dot(ma, 1.0 - pf.yx + ca * (pf.x + pf.y - 1.0) + cb * (pf.yx - 2.0 * pf.xy));
    
    p = vec2(q.x + floor(0.5 + p.y / 1.5), 4.0 * p.y / 3.0) * 0.5 + 0.5;
    float f = length(p - vec2(0.5)) * 2.0;
    
    return vec2(f, e);
}

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    st = st * 2.0 - 1.0;
    st.x *= u_resolution.x / u_resolution.y;
    
    vec2 hex = hexagon(st * 10.0);
    float d = hex.x;
    float edge = 1.0 - smoothstep(0.0, 0.05, hex.y);
    
    vec3 color = vec3(0.1, 0.6, 0.9) * (1.0 - d) + edge;
    color *= 1.0 + 0.2 * sin(u_time + hex.y * 10.0);
    
    gl_FragColor = vec4(color, 1.0);
}`,
    description: 'Animated hexagonal grid pattern'
  },
  {
    name: 'Voronoi',
    category: 'Geometric',
    fragmentShader: `
precision mediump float;

uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_mouse;

vec2 random2(vec2 st) {
    st = vec2(dot(st, vec2(127.1, 311.7)),
              dot(st, vec2(269.5, 183.3)));
    return -1.0 + 2.0 * fract(sin(st) * 43758.5453123);
}

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    st.x *= u_resolution.x / u_resolution.y;
    
    vec3 color = vec3(0.0);
    
    // Scale
    st *= 5.0;
    vec2 ipos = floor(st);
    vec2 fpos = fract(st);
    
    // Minimum distance
    float minDist = 1.0;
    vec2 minPoint;
    
    for (int y = -1; y <= 1; y++) {
        for (int x = -1; x <= 1; x++) {
            vec2 neighbor = vec2(float(x), float(y));
            vec2 point = random2(ipos + neighbor);
            point = 0.5 + 0.5 * sin(u_time + 6.2831 * point);
            vec2 diff = neighbor + point - fpos;
            float dist = length(diff);
            
            if (dist < minDist) {
                minDist = dist;
                minPoint = point;
            }
        }
    }
    
    color += minDist;
    color += dot(minPoint, vec2(0.3, 0.6));
    
    gl_FragColor = vec4(color, 1.0);
}`,
    description: 'Animated Voronoi cells'
  },

  // Fractal Patterns
  {
    name: 'Mandelbrot Set',
    category: 'Fractals',
    fragmentShader: `
precision mediump float;

uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_mouse;

vec3 hsv2rgb(vec3 c) {
    vec4 K = vec4(1.0, 2.0/3.0, 1.0/3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    
    // Map to complex plane
    float zoom = 3.0 + sin(u_time * 0.1) * 2.0;
    vec2 c = (st - 0.5) * zoom;
    c.x *= u_resolution.x / u_resolution.y;
    
    // Pan with mouse
    c += u_mouse * 0.5;
    
    vec2 z = vec2(0.0);
    float iter = 0.0;
    const float maxIter = 100.0;
    
    for (float i = 0.0; i < maxIter; i++) {
        if (length(z) > 2.0) break;
        z = vec2(z.x * z.x - z.y * z.y, 2.0 * z.x * z.y) + c;
        iter = i;
    }
    
    float smooth_iter = iter - log2(log2(length(z)));
    vec3 color = hsv2rgb(vec3(smooth_iter / 20.0, 1.0, iter < maxIter ? 1.0 : 0.0));
    
    gl_FragColor = vec4(color, 1.0);
}`,
    description: 'Interactive Mandelbrot fractal explorer'
  },
  {
    name: 'Julia Set',
    category: 'Fractals',
    fragmentShader: `
precision mediump float;

uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_mouse;

vec3 hsv2rgb(vec3 c) {
    vec4 K = vec4(1.0, 2.0/3.0, 1.0/3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    
    // Map to complex plane
    vec2 z = (st - 0.5) * 4.0;
    z.x *= u_resolution.x / u_resolution.y;
    
    // Julia constant - animated
    vec2 c = vec2(0.355, 0.355) + u_mouse * 0.2;
    c += vec2(sin(u_time * 0.5), cos(u_time * 0.3)) * 0.1;
    
    float iter = 0.0;
    const float maxIter = 100.0;
    
    for (float i = 0.0; i < maxIter; i++) {
        if (length(z) > 2.0) break;
        z = vec2(z.x * z.x - z.y * z.y, 2.0 * z.x * z.y) + c;
        iter = i;
    }
    
    vec3 color = hsv2rgb(vec3(iter / 30.0 + u_time * 0.01, 1.0, iter < maxIter ? 1.0 : 0.0));
    
    gl_FragColor = vec4(color, 1.0);
}`,
    description: 'Animated Julia set fractal'
  },

  // Effects
  {
    name: 'Plasma Effect',
    category: 'Effects',
    fragmentShader: `
precision mediump float;

uniform vec2 u_resolution;
uniform float u_time;

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    
    float x = st.x * 10.0;
    float y = st.y * 10.0;
    float t = u_time;
    
    float v1 = sin(x + t);
    float v2 = sin(10.0 * (x * sin(t / 2.0) + y * cos(t / 3.0)) + t);
    
    float cx = x + 0.5 * sin(t / 5.0);
    float cy = y + 0.5 * cos(t / 3.0);
    float v3 = sin(sqrt(100.0 * (cx * cx + cy * cy) + 1.0) + t);
    
    float v = v1 + v2 + v3;
    
    vec3 color = vec3(sin(v), sin(v + 2.094), sin(v + 4.188));
    color = 0.5 + 0.5 * color;
    
    gl_FragColor = vec4(color, 1.0);
}`,
    description: 'Classic plasma effect'
  },
  {
    name: 'Metaballs',
    category: 'Effects',
    fragmentShader: `
precision mediump float;

uniform vec2 u_resolution;
uniform float u_time;

float metaball(vec2 p, vec2 center, float radius) {
    return radius / length(p - center);
}

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    st = st * 2.0 - 1.0;
    st.x *= u_resolution.x / u_resolution.y;
    
    float t = u_time;
    
    // Animated metaballs
    vec2 ball1 = vec2(sin(t * 1.1) * 0.5, cos(t * 1.3) * 0.5);
    vec2 ball2 = vec2(cos(t * 0.7) * 0.6, sin(t * 0.9) * 0.6);
    vec2 ball3 = vec2(sin(t * 1.5) * 0.4, cos(t * 1.7) * 0.4);
    
    float m = 0.0;
    m += metaball(st, ball1, 0.15);
    m += metaball(st, ball2, 0.2);
    m += metaball(st, ball3, 0.12);
    
    float threshold = 1.5;
    float edge = smoothstep(threshold - 0.1, threshold + 0.1, m);
    
    vec3 color = mix(vec3(0.1, 0.2, 0.3), vec3(0.4, 0.8, 1.0), edge);
    
    gl_FragColor = vec4(color, 1.0);
}`,
    description: 'Animated metaballs effect'
  },
  {
    name: 'Tunnel',
    category: 'Effects',
    fragmentShader: `
precision mediump float;

uniform vec2 u_resolution;
uniform float u_time;

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    st = st * 2.0 - 1.0;
    st.x *= u_resolution.x / u_resolution.y;
    
    float a = atan(st.y, st.x);
    float r = length(st);
    
    vec2 uv;
    uv.x = 0.2 / r + u_time * 0.5;
    uv.y = a / 3.1416;
    
    // Texture pattern
    vec2 uv2 = uv * vec2(10.0, 3.0);
    float pattern = abs(sin(uv2.x) * sin(uv2.y));
    
    // Distance fog
    float fog = 1.0 / (r * r * 10.0 + 1.0);
    
    vec3 color = vec3(pattern) * fog;
    color *= vec3(0.8, 0.5, 1.0);
    
    gl_FragColor = vec4(color, 1.0);
}`,
    description: 'Infinite tunnel effect'
  },

  // Ray Marching
  {
    name: 'Sphere Ray March',
    category: 'Ray Marching',
    fragmentShader: `
precision mediump float;

uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_mouse;

float sdSphere(vec3 p, float r) {
    return length(p) - r;
}

float map(vec3 p) {
    float d = sdSphere(p, 1.0);
    
    // Add more spheres
    d = min(d, sdSphere(p - vec3(2.0, 0.0, 0.0), 0.5));
    d = min(d, sdSphere(p + vec3(2.0, 0.0, 0.0), 0.5));
    
    return d;
}

vec3 calcNormal(vec3 p) {
    const float eps = 0.001;
    const vec2 h = vec2(eps, 0);
    return normalize(vec3(
        map(p + h.xyy) - map(p - h.xyy),
        map(p + h.yxy) - map(p - h.yxy),
        map(p + h.yyx) - map(p - h.yyx)
    ));
}

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    st = st * 2.0 - 1.0;
    st.x *= u_resolution.x / u_resolution.y;
    
    // Camera
    vec3 ro = vec3(0.0, 0.0, 3.0);
    ro.xz *= mat2(cos(u_time), -sin(u_time), sin(u_time), cos(u_time));
    vec3 rd = normalize(vec3(st, -1.0));
    
    // Ray marching
    float t = 0.0;
    for (int i = 0; i < 64; i++) {
        vec3 p = ro + rd * t;
        float d = map(p);
        if (d < 0.001 || t > 10.0) break;
        t += d;
    }
    
    vec3 color = vec3(0.0);
    if (t < 10.0) {
        vec3 p = ro + rd * t;
        vec3 n = calcNormal(p);
        vec3 light = normalize(vec3(1.0, 1.0, 1.0));
        
        float diff = max(dot(n, light), 0.0);
        color = vec3(diff);
        color *= vec3(0.4, 0.7, 1.0);
    }
    
    gl_FragColor = vec4(color, 1.0);
}`,
    description: 'Basic ray marching with spheres'
  }
];

// Advanced vertex shader examples
export const vertexShaderPresets = [
  {
    name: 'Wave Displacement',
    vertexShader: `
attribute vec2 a_position;
attribute vec2 a_texCoord;

uniform float u_time;
uniform vec2 u_resolution;

varying vec2 v_texCoord;

void main() {
    v_texCoord = a_texCoord;
    
    vec3 pos = vec3(a_position, 0.0);
    
    // Wave displacement
    float wave = sin(pos.x * 10.0 + u_time) * 0.1;
    pos.y += wave;
    
    gl_Position = vec4(pos, 1.0);
}`,
    description: 'Vertex displacement creating wave effect'
  },
  {
    name: 'Twist',
    vertexShader: `
attribute vec2 a_position;
attribute vec2 a_texCoord;

uniform float u_time;

varying vec2 v_texCoord;

void main() {
    v_texCoord = a_texCoord;
    
    float angle = a_position.y * 3.14159 + u_time;
    mat2 rotation = mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
    
    vec2 pos = rotation * a_position;
    
    gl_Position = vec4(pos, 0.0, 1.0);
}`,
    description: 'Twisting vertex positions'
  }
];