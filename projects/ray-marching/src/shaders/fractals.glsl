// 3D Fractals fragment shader
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