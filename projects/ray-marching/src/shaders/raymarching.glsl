// Ray marching fragment shader with interactive sphere tracing
#ifdef GL_ES
precision highp float;
#endif

uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_mouse;
uniform vec3 u_cameraPos;
uniform vec3 u_cameraTarget;
uniform float u_cameraFov;
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

// SDF for the scene
float map(vec3 p) {
    float sphere1 = sdSphere(p - vec3(0.0, 0.0, 0.0), u_objectScale);
    float box1 = sdBox(p - vec3(2.0, 0.0, 0.0), vec3(u_objectScale));
    float sphere2 = sdSphere(p - vec3(-2.0, 0.0, 0.0), u_objectScale * 0.8);
    
    // Ground plane
    float ground = p.y + 1.0;
    
    return min(min(min(sphere1, box1), sphere2), ground);
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
            // Hit surface
            return vec4(t, float(steps), 1.0, d);
        }
        
        if (t > MAX_DIST) {
            // Ray escaped
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
    
    // Camera setup
    vec3 ro = u_cameraPos;
    vec3 ta = u_cameraTarget;
    mat3 ca = camera(ro, ta, vec3(0.0, 1.0, 0.0));
    vec3 rd = ca * normalize(vec3(uv, 2.0));
    
    // Ray marching
    vec4 result = rayMarch(ro, rd);
    float t = result.x;
    float steps = result.y;
    float hit = result.z;
    
    vec3 col = vec3(0.05, 0.1, 0.2); // Background color
    
    if (hit > 0.5) {
        // We hit something
        vec3 p = ro + t * rd;
        vec3 n = calcNormal(p);
        
        // Lighting
        vec3 lightDir = normalize(u_lightPos - p);
        float diffuse = max(dot(n, lightDir), 0.0);
        
        // Shadows
        float shadow = calcShadow(p + n * 0.01, lightDir, 0.02, length(u_lightPos - p));
        
        // Ambient occlusion
        float ao = calcAO(p, n);
        
        // Final lighting
        vec3 lighting = vec3(0.1) + diffuse * shadow * vec3(1.0);
        lighting *= ao;
        
        // Material color
        vec3 materialColor = u_objectColor;
        
        // Distance from camera affects color slightly
        if (p.y > -0.9) {
            // Objects above ground
            materialColor = u_objectColor;
        } else {
            // Ground plane
            materialColor = vec3(0.3, 0.4, 0.3);
        }
        
        col = materialColor * lighting;
        
        // Show step visualization if enabled
        if (u_showSteps) {
            float stepRatio = steps / float(u_maxSteps);
            vec3 stepColor = mix(vec3(0.0, 1.0, 0.0), vec3(1.0, 0.0, 0.0), stepRatio);
            col = mix(col, stepColor, 0.3);
        }
    } else {
        // Background with step visualization
        if (u_showSteps) {
            float stepRatio = steps / float(u_maxSteps);
            col = mix(col, vec3(0.2, 0.1, 0.0), stepRatio * 0.5);
        }
    }
    
    // Gamma correction
    col = pow(col, vec3(0.4545));
    
    gl_FragColor = vec4(col, 1.0);
}